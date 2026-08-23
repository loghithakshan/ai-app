import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { title, amount } = await req.json();

    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      );
    }

    const origin = req.headers.get('origin');

    // Create Checkout Sessions from body params.
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: title,
              description: `NeuroBloom Cognitive Booster: ${title}`,
            },
            unit_amount: Math.round(amount * 100), // convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/settings?success=true`,
      cancel_url: `${origin}/settings?canceled=true`,
      metadata: {
        item_title: title,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    console.error('Stripe Checkout Error:', err);
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
