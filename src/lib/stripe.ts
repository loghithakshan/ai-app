import Stripe from 'stripe';

/**
 * Lazy-initialized Stripe client to prevent build-time environment variable errors.
 * This ensures the client is only created when first accessed at runtime.
 */
const stripeProxy = new Proxy({} as Stripe, {
  get: (target, prop, receiver) => {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    
    if (!apiKey) {
      console.warn("STRIPE_SECRET_KEY is missing. Checkout functionality will be unavailable.");
      return null;
    }

    const stripe = new Stripe(apiKey, {
      apiVersion: '2025-01-27' as NonNullable<ConstructorParameters<typeof Stripe>[1]>['apiVersion'],
      appInfo: {
        name: 'NeuroBloom',
        version: '0.1.0',
      },
    });

    return Reflect.get(stripe, prop, receiver);
  }
});

export const stripe = stripeProxy;
