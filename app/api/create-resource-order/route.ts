import Razorpay from 'razorpay'
import { NextResponse } from 'next/server'

console.log('[create-resource-order] RAZORPAY_KEY_ID prefix:', process.env.RAZORPAY_KEY_ID?.slice(0, 8) ?? 'NOT SET')
console.log('[create-resource-order] RAZORPAY_KEY_SECRET prefix:', process.env.RAZORPAY_KEY_SECRET?.slice(0, 8) ?? 'NOT SET')

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST() {
  try {
    const order = await razorpay.orders.create({
      amount: 199 * 100,
      currency: 'INR',
      receipt: `resource_${Date.now()}`,
    })
    return NextResponse.json({ orderId: order.id, amount: order.amount })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
