---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: []
session_topic: 'When and how to decide whether to add a NoSQL database alongside PostgreSQL — especially for analytics, caching, and fast I/O use cases'
session_goals: 'Decision framework/checklist for NoSQL justification; NoSQL options comparison by use case; architecture patterns for Postgres + NoSQL together'
selected_approach: 'ai-recommended'
techniques_used: ['Constraint Mapping', 'Six Thinking Hats', 'Decision Tree Mapping']
ideas_generated: 24
session_active: false
workflow_completed: true
---

# PostgreSQL + NoSQL Decision Framework
## Brainstorming Session — 2026-06-05

**Stack context:** TypeScript · Bun · ElysiaJS · Drizzle ORM

---

## The Core Principle

> NoSQL is additive, never a replacement. Postgres is the hub — the source of truth for transactional, relational, consistent data. Every other database is a specialist attached to it, added only when a specific access pattern is fundamentally mismatched with Postgres.

---

## Part 1 — Postgres Constraint Map

These are the real, internal limitations of Postgres that signal when a specialist is needed. Each has a measurable threshold.

### Storage & Write Constraints

**The OLAP/OLTP Storage War**
Postgres is row-oriented — optimized for transactions. Analytical queries that scan and aggregate millions of rows fight the storage format. Every analytics query secretly does a full row scan even when you only need 2 columns. The constraint isn't "Postgres is slow" — it's that you're running two fundamentally different workload shapes on one storage model.
- _Signal:_ Analytics queries compete with transactional writes for I/O; reports take > 2s under normal load.

**The WAL Firehose**
Every write in Postgres goes through the Write-Ahead Log (WAL) — inserts, updates, deletes, even VACUUM. WAL is the single serialization point. The real throughput ceiling isn't CPU or memory — it's how fast your disk can fsync.
- _Signal:_ > 5,000–20,000 sustained writes/sec; WAL write latency > 5ms p99.

**The MVCC Dead Tuple Accumulation**
Every UPDATE creates a new row version and marks the old one dead. At high write rates on hot rows, dead tuples accumulate faster than autovacuum can clean them. The table physically bloats; queries slow because they scan dead tuples.
- _Signal:_ `pg_stat_user_tables.n_dead_tup` grows continuously; autovacuum runs permanently but never catches up.

**The Index Write Amplification**
Every index multiplies write cost. A table with 8 indexes means every INSERT touches 9 data structures. At high write rates, index maintenance dominates. B-tree page splits acquire locks that block all writes to that index temporarily.
- _Signal:_ Index bloat growing faster than table size; high `wal_buffers` usage.

**The Checkpoint I/O Spike**
Postgres periodically writes all dirty pages to disk in a checkpoint. During a checkpoint, disk I/O spikes. This creates a predictable sawtooth pattern in latency graphs — everything is fine, then latency spikes 3–10x, repeating every checkpoint interval.
- _Signal:_ Sawtooth pattern in APM latency. Visible in `pg_stat_bgwriter`.

### Connection & Concurrency Constraints

**The Process-Per-Connection Tax**
Postgres spawns a separate OS process per connection — not a thread. Each process consumes ~5–10MB RAM. At 500 connections: 5GB just on connection overhead before a single query runs. Forces PgBouncer, which adds latency and complexity but doesn't eliminate the ceiling.
- _Signal:_ > 200–500 connections without a pooler; serverless/microservice architecture where each function opens its own connection.

**The Hot Row Lock Contention**
A single frequently-updated row — a counter, a balance, a queue status — becomes a serialization bottleneck. Each UPDATE acquires a row-level exclusive lock. Transactions queue.
- _Signal:_ `pg_stat_activity` shows many transactions in Lock wait state on the same relation.

**The Replication Lag Cliff**
Postgres streaming replication is asynchronous by default. Under high write load, replicas fall behind. If you route reads to replicas, you're serving stale data. At > 60s lag, replicas are essentially useless for read scaling.
- _Signal:_ Read replica consistently behind; users see stale data after writes.

### Query & Schema Constraints

**The JOIN Fan-out at Scale**
Complex JOINs across large tables force hash joins that spill to disk when they exceed `work_mem`. One spilling query on a shared server degrades every other query simultaneously.
- _Signal:_ `EXPLAIN ANALYZE` shows large `loops` values; frequent `work_mem` pressure.

**The Schema Migration Lock**
`ALTER TABLE` on large tables takes an ACCESS EXCLUSIVE lock — nothing reads or writes until it finishes. Every schema change in a growing Postgres database becomes a deployment risk.
- _Signal:_ Tables > 50M rows; teams slow down deployments to avoid migration risk.

**The Full-Text Search Quality Gap**
Postgres `tsvector` has no ranking model, no fuzzy matching, no synonym expansion. At 1M+ documents, query time grows; search results lack the quality users expect from modern applications.
- _Signal:_ Search queries > 200ms; users complain search "doesn't work" (typos, partial words fail).

**The Graph Traversal Wall**
Recursive CTEs work for depth-2 graphs on small datasets. At depth-4+ on 10M nodes, query time goes exponential.
- _Signal:_ A query that works fine in staging (10k nodes) destroys production (1M nodes).

### Special Case: Video/Audio Streaming

Video and audio streaming is a distinct category — the constraint isn't Postgres performance, it's a category error.

- Raw video/audio binary data **never belongs in any database** — Postgres, MongoDB, or otherwise
- The "database" for video is **object storage** (S3, MinIO, Cloudflare R2)
- Postgres holds only metadata: title, duration, URL, owner, permissions, status
- Live stream ephemeral state (is it live? current segment? viewer count) → Redis
- Transcoding pipeline → message queue (BullMQ / Redis Streams)
- Segment delivery to viewers → CDN, not your origin server

---

## Part 2 — The Mitigation Ladder

Before adding any NoSQL database, exhaust this ladder in order:

```
1. MEASURE       → Is this actually a problem at current scale?
                   Profile before optimizing. Don't add complexity speculatively.

2. TUNE Postgres → Indexes, query plans, config params (work_mem, shared_buffers,
                   checkpoint_timeout, autovacuum_vacuum_cost_delay), batching

3. EXTEND        → Stay in one database:
                   TimescaleDB (time-series), pg_trgm (fuzzy search),
                   Apache AGE (graph), JSONB + GIN (documents),
                   Partitioning, Unlogged tables, Materialized views

4. ADD replicas  → Read replica for read-heavy workloads.
                   Often the right answer before any NoSQL.

5. ADD NoSQL     → Only when steps 1–4 are exhausted AND the constraint
                   is real at current or near-term projected scale.

6. NEVER         → Replace Postgres as source of truth.
                   Postgres holds the authoritative record.
```

### Per-Constraint Mitigation Path

| Constraint | Step 1–2 | Step 3 | Step 5 (NoSQL) |
|---|---|---|---|
| Analytics slow | Materialized views, partial indexes | TimescaleDB columnar | ClickHouse |
| High write throughput | Batch inserts, COPY, WAL tuning | Partitioning, unlogged tables | Cassandra / ClickHouse |
| Session / cache data | Indexes on session_id, cleanup jobs | pg_partman | Redis |
| Hot row contention | Counter sharding, SKIP LOCKED | Advisory locks | Redis INCR |
| Full-text search | tsvector + GIN, pg_trgm | pg_trgm fuzzy | Typesense / Elasticsearch |
| Connection exhaustion | Tune max_connections | PgBouncer transaction mode | Move hot reads to Redis |
| Variable schema | JSONB + GIN index | Partial JSONB indexes | MongoDB (if > 60% queries on JSONB) |
| Time-series growth | Time partitioning, DROP partitions | TimescaleDB | InfluxDB / VictoriaMetrics |
| Graph traversal | Recursive CTEs | Apache AGE extension | Neo4j |

---

## Part 3 — NoSQL Tool Comparison

### Redis — The Universal First Addition

**Built for:** Sub-millisecond access to hot, ephemeral, or frequently-mutated data

| Use case | Pattern |
|---|---|
| Session storage / JWT blacklists | Hash with TTL |
| Rate limiting | INCR + EXPIRE (atomic) |
| Presence / online status | Key with TTL, refreshed on heartbeat |
| Leaderboards / rankings | Sorted Set (ZRANGEBYSCORE) |
| Pub/sub notifications | PUBLISH / SUBSCRIBE |
| Job queues | Redis Streams + BullMQ |
| Cache DB query results | String / Hash with TTL |
| Real-time counters | INCR, flushed to Postgres periodically |
| Distributed locks | SET NX EX (Redlock pattern) |

**Never use for:** Source of truth, complex queries, data larger than RAM, relational data.

**The signal:** You need < 1ms response time, OR data is inherently ephemeral (TTL-native), OR you need atomic increment across multiple server instances, OR you need pub/sub fan-out.

---

### ClickHouse — The Analytics Engine

**Built for:** Analytical queries over billions of rows at interactive speed. Columnar storage compresses 10:1 typically.

| Use case | Why ClickHouse |
|---|---|
| Analytics dashboards | Scans 1B rows/sec per core |
| Audit logs / event history | Append-only, no updates needed |
| Business intelligence | SUM, COUNT, AVG over huge datasets |
| Time-range aggregations | "Revenue last 30 days by product" |
| User behavior / funnels | Clickstreams, cohorts |
| Ad impressions / click tracking | High write volume + fast aggregation reads |

**Never use for:** Transactional workloads, low-latency point lookups, frequent row updates, datasets < 1M rows.

**The signal:** Analytics queries hit > 10M rows, run under OLTP load, and need < 2s response. Or writing > 50k events/sec into an append-only log.

**Write pattern with Postgres:**
```
User action → Postgres (transaction) → background job → ClickHouse (event log)
Never write to ClickHouse inside a Postgres transaction.
```

---

### Cassandra / ScyllaDB — The Write Firehose

**Built for:** Massive write throughput, geo-distributed, no single point of failure. ScyllaDB is Cassandra-compatible but ~10x faster (C++ vs JVM).

| Use case | Why Cassandra |
|---|---|
| IoT sensor data | Millions of writes/sec across nodes |
| Time-series per-device | Partition by device_id, cluster by timestamp |
| Chat message history | Partition by conversation_id |
| Activity feeds at massive scale | Partitioned by user_id |
| Geo-distributed writes | Multi-region, local write acceptance |
| Always-on requirement | No master, survives node failures |

**Never use for:** Ad-hoc queries (must know access patterns at schema design time), aggregations (use ClickHouse), ACID transactions, datasets < 100k writes/sec, small teams.

**Honest take:** Most products never need Cassandra. If ClickHouse handles your write volume, use that — simpler ops, better query support.

---

### MongoDB — The Document Store

**Built for:** Flexible document storage where schema evolves frequently or data is naturally hierarchical.

| Use case | Why MongoDB |
|---|---|
| Product catalog (variable attributes) | Phone has 40 attrs, t-shirt has 8 different ones |
| CMS / content management | Articles with different block types |
| User-generated forms / surveys | Unknown schema at design time |
| Geospatial queries | Built-in 2dsphere index, $near |
| Atlas Search | Lucene-based search built in |

**Never use for:** Relational data with complex joins, financial/transactional data, analytics, when Postgres JSONB covers the use case.

**The hard truth:** For most TypeScript/Bun backends, Postgres JSONB replaces 80% of MongoDB use cases. MongoDB adds value only when the entire domain is document-centric and joins are rare. Try JSONB first.

**Signal to move to MongoDB:** > 60% of queries filter/sort on variable-schema fields, OR schema migrations blocked by JSONB structure changes, OR document nesting depth > 3 levels with complex query patterns.

---

### Typesense / Elasticsearch / Meilisearch — Search Engines

| | Elasticsearch | Typesense | Meilisearch |
|---|---|---|---|
| Scale | Billions of docs | Millions of docs | Millions of docs |
| Ops complexity | High | Low | Low |
| Query power | Highest | Medium | Medium |
| Typo tolerance | Manual config | Native | Native |
| Best for | Enterprise + log analytics | Product search, SaaS | Consumer search UX |

**Use when:** Users expect typo-tolerant, instant, ranked search results. Or search corpus > 1M documents and tsvector queries > 200ms. Or product needs faceted filtering.

**Never as source of truth:** Always sync from Postgres. Search index is a read projection.

---

### TimescaleDB — Time-Series Inside Postgres

**This is a Postgres extension, not a separate database.** Zero architecture change — you keep Drizzle ORM, your queries, your tooling. It adds:
- Automatic time-based chunk partitioning
- Columnar compression (up to 95% space reduction)
- Continuous aggregates (auto-refreshing materialized views)
- Data retention policies (auto-drop old chunks)

**Use when:** Timestamp-centric data growing unboundedly, data retention policies needed, time-range queries slow on > 50M rows.

**Always try TimescaleDB before InfluxDB** — same SQL, same Drizzle, same everything.

---

### The Decision Matrix

```
WHAT YOU NEED                  → USE THIS            → NOT THIS
──────────────────────────────────────────────────────────────────────
Cache / ephemeral / TTL        → Redis                MongoDB, Cassandra
Counters / rate limiting       → Redis                Postgres (lock contention)
Job queues                     → Redis + BullMQ       Postgres polling
Leaderboards                   → Redis Sorted Set     Postgres ORDER BY at scale

Analytics / OLAP               → ClickHouse           MongoDB, Cassandra
Audit logs / append-only       → ClickHouse           Postgres (bloat risk)
Ad-click firehose              → ClickHouse           Cassandra (overkill)

Massive write throughput       → Cassandra/ScyllaDB   ClickHouse (no row updates)
Multi-region writes            → Cassandra            Everything else
Chat history at scale          → Cassandra            MongoDB

Variable schema                → Postgres JSONB first  MongoDB (try JSONB first)
  (if JSONB breaks)            → MongoDB              Cassandra

Full-text search (< 100k)      → Postgres tsvector    Typesense (over-engineering)
Full-text search (> 100k)      → Typesense            Postgres tsvector (UX quality)
Enterprise search / logs       → Elasticsearch        Typesense

Time-series (stay SQL)         → TimescaleDB          InfluxDB (try first)
Pure metrics at scale          → VictoriaMetrics      TimescaleDB

Graph traversal (< 3 hops)     → Postgres recursive CTE  Neo4j (over-engineering)
Graph traversal (> 3 hops)     → Neo4j                Postgres

Binary / media files           → Object storage (S3)  Any database
```

---

## Part 4 — When to Add Each Tool (The Decision Timeline)

The moment-based framework: add each tool only when the specific signal appears.

### The Realistic Path for 90% of Products

```
Product launch
│
├── Day 1
│   Postgres only. Resist everything else.
│   Premature infrastructure is the #1 cause of over-engineered early-stage products.
│
├── First file upload feature
│   → Object storage (S3 / MinIO / Cloudflare R2)
│   Signal: Any user-generated file. This is a prerequisite, not a scaling decision.
│   Never store binary files in any database.
│
├── First real-time feature (WebSocket, notifications, live counts)
│   → Redis
│   Signal: Presence, pub/sub, or ephemeral state needed across multiple server instances.
│   Redis is the most universal addition — nearly every production app needs it.
│
├── First background job with retry logic
│   → Redis Streams + BullMQ (you already have Redis)
│   Signal: You catch yourself doing setTimeout inside a request handler,
│   or a third-party API call (email, Stripe) is blocking response time.
│
├── Postgres reads > 70% CPU at peak
│   → Read replica FIRST, before any NoSQL
│   Signal: Most of the load is reads. A replica is zero new technology.
│   Only after replica is saturated do you look at NoSQL for reads.
│
├── Analytics queries slow under OLTP load
│   → ClickHouse
│   Signal: GROUP BY queries over > 10M rows take > 2s under normal traffic.
│   Or analytics and transactions visibly compete for Postgres I/O.
│
├── Search UX complaints OR search queries > 200–300ms
│   → Typesense (simple) or Elasticsearch (enterprise)
│   Signal: Typo-tolerant search needed, OR faceted filtering requested,
│   OR product team says "search doesn't work."
│
├── Timestamp data > 50M rows, growing fast
│   → TimescaleDB extension (zero architecture change)
│   Signal: Time-range queries slowing, table size growing unboundedly,
│   data retention policies needed.
│
└── Sustained write volume > 50k–100k writes/sec, multi-region needed
    → Evaluate Cassandra / ScyllaDB
    Signal: Rare. ClickHouse usually handles this first.
    Cassandra adds significant operational burden — justify carefully.
```

### Stage Map

| Stage | Users | Stack |
|---|---|---|
| Stage 1 | 0 – 100k | Postgres only + TimescaleDB if time-series data exists |
| Stage 2 | 100k – 1M | + Redis (sessions, cache, queues, presence) |
| Stage 3 | 1M+ | + ClickHouse (analytics) and/or Typesense (search) |
| Stage 4 | Hyper-scale | Evaluate Cassandra only if write volume exceeds ClickHouse capacity |

---

## Part 5 — The Decision Checklist

Use this checklist before adding any NoSQL database:

```
□ Have I measured the actual bottleneck in production (not staging)?
□ Have I tuned Postgres config (work_mem, shared_buffers, checkpoint params)?
□ Have I added appropriate indexes and analyzed query plans?
□ Have I considered a Postgres extension (TimescaleDB, pg_trgm, AGE, JSONB+GIN)?
□ Have I added a read replica before reaching for NoSQL?
□ Is the access pattern fundamentally mismatched with relational storage?
□ Is this problem real at current scale, or projected for future scale?
□ Do I have the operational capacity to manage another database?
□ Is the team familiar with the NoSQL tool's consistency model?
□ Have I modeled the dual-write / sync pattern between Postgres and the new DB?
```

**If all boxes checked and the constraint is real → add the specialist.**
**If any box is unchecked → exhaust that step first.**

---

## Part 6 — Key Insights from the Session

**Insight 1: The category error**
Most "should I use NoSQL?" questions are really "should I use a specialist for this specific access pattern?" The answer is almost always: try Postgres extensions first, then add a specialist only for the specific workload that breaks.

**Insight 2: Video/audio streaming is not a database problem**
Binary media never belongs in any database. The "database" for video is object storage + CDN. Postgres holds metadata only. This is a prerequisite, not a scaling decision.

**Insight 3: Redis is nearly universal**
The moment you have multiple server instances, real-time features, or rate limiting, Redis becomes load-bearing. It's not a "scale" addition — it's an architecture foundation from day one of having real users.

**Insight 4: TimescaleDB is the free upgrade**
For time-series data, TimescaleDB is a Postgres extension — same SQL, same Drizzle ORM, same migrations. It should always be the first step before considering InfluxDB or VictoriaMetrics.

**Insight 5: Read replica before NoSQL**
When Postgres reads are the bottleneck, a read replica is almost always the right first step. It's zero new technology, zero new consistency concerns, and often eliminates the need for a separate caching layer.

**Insight 6: Cassandra is for a different league**
Most products never need Cassandra. It solves problems at Twitter/Netflix scale. ClickHouse handles most write-volume problems with far less operational burden.

---

## Session Metadata

- **Techniques used:** Constraint Mapping · Six Thinking Hats · Decision Tree Mapping
- **Constraints mapped:** 24
- **Tools compared:** Redis, ClickHouse, Cassandra/ScyllaDB, MongoDB, Typesense, Elasticsearch, TimescaleDB, Object Storage, Neo4j
- **Session date:** 2026-06-05
