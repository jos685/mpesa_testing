import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const { phone, amount } = await req.json()

  const shortcode = process.env.MPESA_SHORTCODE!
  const passkey = process.env.MPESA_PASSKEY!
  const consumerKey = process.env.MPESA_CONSUMER_KEY!
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET!
  const mpesaBaseUrl = process.env.MPESA_BASE_URL! 

  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14)
  const password = Buffer.from(shortcode + passkey + timestamp).toString('base64')

  const auth = await fetch(`${mpesaBaseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64'),
    },
  })
  const { access_token } = await auth.json()

  const response = await fetch(`${mpesaBaseUrl}/mpesa/stkpush/v1/processrequest`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerBuyGoodsOnline',
      Amount: amount,
      PartyA: phone,
      PartyB: shortcode,
      PhoneNumber: phone,
      CallBackURL: `${process.env.BASE_URL}/api/callback`,
      AccountReference: 'EPIC_SOFTWARES',
      TransactionDesc: 'Epic Softwares Support',
    }),
  })

  const data = await response.json()

  // Save to Supabase immediately
  await supabase.from('mpesa_callback').insert({
    phone_number: phone,
    amount: amount,
    merchant_request_id: data.MerchantRequestID,
    checkout_request_id: data.CheckoutRequestID,
    result_code: null,
    result_desc: 'Pending',
  })

  return NextResponse.json({ message: data.ResponseDescription || 'STK push sent' }, { status: 200 })
}
