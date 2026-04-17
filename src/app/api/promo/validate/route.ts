import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, game_id, amount } = body;

    if (!code || !amount) {
      return NextResponse.json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'code and amount are required' },
      }, { status: 400 });
    }

    const supabase = await createAdminSupabaseClient();

    const { data: promo } = await supabase
      .from('promos')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (!promo) {
      return NextResponse.json({
        success: false,
        error: { code: 'INVALID_PROMO', message: 'Promo code not found or expired' },
      }, { status: 404 });
    }

    const now = new Date();
    const startsAt = new Date(promo.starts_at);
    const expiresAt = promo.expires_at ? new Date(promo.expires_at) : null;

    if (now < startsAt) {
      return NextResponse.json({
        success: false,
        error: { code: 'PROMO_NOT_STARTED', message: 'This promo has not started yet' },
      }, { status: 400 });
    }

    if (expiresAt && now > expiresAt) {
      return NextResponse.json({
        success: false,
        error: { code: 'PROMO_EXPIRED', message: 'This promo code has expired' },
      }, { status: 400 });
    }

    if (promo.usage_limit && promo.used_count >= promo.usage_limit) {
      return NextResponse.json({
        success: false,
        error: { code: 'PROMO_EXHAUSTED', message: 'This promo code has been fully redeemed' },
      }, { status: 400 });
    }

    if (promo.game_id && promo.game_id !== game_id) {
      return NextResponse.json({
        success: false,
        error: { code: 'PROMO_WRONG_GAME', message: 'This promo code is not valid for this game' },
      }, { status: 400 });
    }

    if (amount < promo.min_order_idr) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'MIN_ORDER',
          message: `Minimum order of Rp${promo.min_order_idr.toLocaleString('id-ID')} required`,
        },
      }, { status: 400 });
    }

    // Calculate discount
    let discount = 0;
    if (promo.type === 'percentage') {
      discount = Math.floor(amount * promo.value / 100);
      if (promo.max_discount_idr && discount > promo.max_discount_idr) {
        discount = promo.max_discount_idr;
      }
    } else {
      discount = promo.value;
    }
    discount = Math.min(discount, amount);

    return NextResponse.json({
      success: true,
      data: {
        code: promo.code,
        name: promo.name,
        type: promo.type,
        value: promo.value,
        discount,
        final_amount: amount - discount,
      },
    });
  } catch (error) {
    console.error('Promo validation error:', error);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL', message: 'Failed to validate promo code' },
    }, { status: 500 });
  }
}
