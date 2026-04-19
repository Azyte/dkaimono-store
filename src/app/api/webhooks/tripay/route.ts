import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-callback-signature');
    
    // Tripay Configuration
    const privateKey = process.env.TRIPAY_PRIVATE_KEY || '';
    
    // Verify Signature
    const expectedSignature = crypto
      .createHmac('sha256', privateKey)
      .update(rawBody)
      .digest('hex');

    if (signature !== expectedSignature) {
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 403 });
    }

    const payload = JSON.parse(rawBody);

    // Filter event type
    if (payload.event === 'payment_status') {
      const { reference, status } = payload;
      
      const adminClient = await createAdminSupabaseClient();
      
      // Update transaction status
      const { data: transaction, error } = await adminClient
        .from('transactions')
        .update({ status: status.toLowerCase() })
        .eq('gateway_ref', reference)
        .select('*')
        .single();
        
      if (error || !transaction) {
        return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 });
      }

      // If Paid, process auto-topup to Supplier (Digiflazz H2H Mock)
      if (status.toUpperCase() === 'PAID') {
        await adminClient.from('orders').update({
          status: 'processing',
          paid_at: new Date().toISOString()
        }).eq('id', transaction.order_id);

        // H2H trigger mock (In real app, fetch from Supplier API here)
        console.log(`[H2H] Triggering auto top-up to Digiflazz for order ${transaction.order_id}`);
        
        // Mock successful delivery
        setTimeout(async () => {
          const client3 = await createAdminSupabaseClient();
          await client3.from('orders').update({
            status: 'completed',
            completed_at: new Date().toISOString()
          }).eq('id', transaction.order_id);
        }, 5000);
      }
    }

    return NextResponse.json({ success: true, message: 'Webhook processed' });
    
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
