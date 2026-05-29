import Stripe from 'stripe'
import { env } from '../config/env'

if (!env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required to use payments')
}

export const stripe = new Stripe(env.STRIPE_SECRET_KEY)
