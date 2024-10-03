import { Stripe } from 'stripe'
import config from '../app/config'

export const stripe = new Stripe(config.stripe_secret_key as string, {
  apiVersion: '2024-09-30.acacia',
})
