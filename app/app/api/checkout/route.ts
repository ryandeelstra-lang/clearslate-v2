import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import fs from 'fs'
import path from 'path'
import type { ClearanceAccount } from '../../../../core/clearance/types'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia'
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const token = formData.get('token') as string
    const method = formData.get('method') as 'one_time' | 'plan'

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 })
    }

    // Load account
    const dataPath = path.join(process.cwd(), '..', 'data', 'ryan-account.json')
    if (!fs.existsSync(dataPath)) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    const account: ClearanceAccount = JSON.parse(fs.readFileSync(dataPath, 'utf8'))

    // Verify token
    if (account.offerToken !== token) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 })
    }

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000'

    // Create Stripe checkout session
    if (method === 'one_time') {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Clear ${account.originalCreditor} Account`,
                description: `Pay $${(account.clearingAmountCents / 100).toFixed(2)} to clear $${(account.balanceCents / 100).toFixed(2)} balance`,
              },
              unit_amount: account.clearingAmountCents,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/offer/${token}`,
        metadata: {
          account_id: account.id,
          method: 'one_time',
          clearing_amount_cents: account.clearingAmountCents.toString(),
          original_balance_cents: account.balanceCents.toString(),
        },
      })

      return NextResponse.redirect(session.url!)
    } else {
      // Payment plan (3 months)
      const monthlyAmount = Math.round(account.clearingAmountCents / 3)

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${account.originalCreditor} Payment Plan`,
                description: `3 monthly payments to clear account`,
              },
              unit_amount: monthlyAmount,
              recurring: {
                interval: 'month',
                interval_count: 1,
              },
            },
            quantity: 1,
          },
        ],
        subscription_data: {
          metadata: {
            account_id: account.id,
            total_payments: '3',
            clearing_on_completion: 'true',
            original_balance_cents: account.balanceCents.toString(),
          },
        },
        success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}&plan=true`,
        cancel_url: `${baseUrl}/offer/${token}`,
      })

      return NextResponse.redirect(session.url!)
    }
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
