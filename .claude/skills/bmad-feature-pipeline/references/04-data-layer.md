# Stage 4: Data Layer

**Purpose:** Create the database schema, migrations, and data structure for the feature. This is the foundation all other layers depend on — get it right before touching API or UI code.

**Best practices:** All work in this stage must comply with `{project-root}/.claude/rules/best-practices.md` and the Supabase conventions in `CLAUDE.md`.

---

## Collaboration Model

**Plan first:** Present the complete data layer plan — tables, columns, types, RLS policies, relationships — before writing any SQL. Get sign-off.

---

## Planning

Based on the architecture document from Stage 3, design:

- **Tables** — name, columns, types, constraints, defaults, indexes
- **Relationships** — foreign keys, junction tables for many-to-many
- **RLS policies** — one policy per operation (select/insert/update/delete) per role (anon/authenticated), following the principle of least privilege
- **Enums or lookup tables** — for constrained value sets
- **Triggers or functions** — only where the business logic requires it at the DB level

Present the plan as a clear table/schema diagram in markdown. Explain each design decision that isn't obvious.

---

## Migration File

Once approved, write the SQL migration file to `{project-root}/supabase/migrations/` following the naming convention: `YYYYMMDDHHmmss_short_description.sql`.

Migration requirements:
- All SQL in lowercase
- Enable RLS on every new table: `alter table {table} enable row level security`
- Granular RLS policies — one per operation per role
- Thorough inline comments explaining each policy and constraint
- Idempotent where possible (use `if not exists`)

---

## Review

After writing the migration, present a summary of what was created:
- Tables and their purpose
- RLS policy matrix (role × operation → allowed/denied)
- Any triggers or functions added

Ask the developer to confirm the schema matches the business rules before proceeding.

---

## Sidecar Update

Update the sidecar changelog for Stage 4:
- Status: completed
- Migration file path
- Tables created
- RLS decisions noted

---

## Progression

When the developer approves, load `./references/05-api-layer.md`.
