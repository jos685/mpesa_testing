// app/api/stk-push/route.ts
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { phone, amount } = await req.json()

  const shortcode = process.env.MPESA_SHORTCODE!
  const passkey = process.env.MPESA_PASSKEY!
  const consumerKey = process.env.MPESA_CONSUMER_KEY!
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET!

  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14)
  const password = Buffer.from(shortcode + passkey + timestamp).toString('base64')

  const auth = await fetch(`https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials`, {
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64'),
    },
  })
  const { access_token } = await auth.json()

  const response = await fetch(`https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phone,
      PartyB: shortcode,
      PhoneNumber: phone,
      CallBackURL: 'https://example.com/api/callback', // optional
      AccountReference: 'EPICSOFT',
      TransactionDesc: 'M-Pesa Demo Payment',
    }),
  })

  const data = await response.json()
  return NextResponse.json({ message: data.ResponseDescription || 'Done' }, { status: 200 })
}
