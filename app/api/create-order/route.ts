import Razorpay from 'razorpay'
import { NextResponse } from 'next/server'

// Prices live server-side only — never trust an amount from the browser
const PRICES: Record<string, number> = {
  strategy_session: 549,
  internship_cohort: 1750,
  placement_cohort: 2500,
  resource_pack: 299,
  internship_program: 999,
}

export async function POST(req: Request) {
  try {
    const { product } = await req.json()
    const amount = PRICES[product as string]
    if (!amount) return NextResponse.json({ error: 'Unknown product' }, { status: 400 })

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    })

    return NextResponse.json({ orderId: order.id, amount: order.amount, key: process.env.RAZORPAY_KEY_ID })
  } catch {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
