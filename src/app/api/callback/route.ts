import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const body = await req.json()
  console.log('✅ Callback hit')
  console.log('📨 Received:', JSON.stringify(body, null, 2))

  const result = body?.Body?.stkCallback
  if (!result) return NextResponse.json({ error: 'Invalid callback' }, { status: 400 })

  const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = result

  let amount: number | null = null
  let phone: string | null = null

  if (CallbackMetadata?.Item) {
    for (const item of CallbackMetadata.Item) {
      if (item.Name === 'Amount') amount = item.Value
      if (item.Name === 'PhoneNumber') phone = item.Value
    }
  }

  const { error } = await supabase
    .from('mpesa_callback')
    .update({
      result_code: ResultCode,
      result_desc: ResultDesc,
      amount: amount ?? undefined,
      phone_number: phone ?? undefined,
    })
    .eq('checkout_request_id', CheckoutRequestID)

  if (error) {
    console.error('❌ Supabase update error:', error)
    return NextResponse.json({ error: 'Failed to update record' }, { status: 500 })
  }

  return NextResponse.json({ status: 'Callback updated successfully' })
}
