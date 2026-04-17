import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { game_id, product_id, game_user_id, game_server_id, game_username, payment_method, promo_code, user_id } = body;

    if (!game_id || !product_id || !game_user_id || !payment_method) {
      return NextResponse.json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'Missing required fields' },
      }, { status: 400 });
    }

    const supabase = await createAdminSupabaseClient();

    // Get product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', product_id)
      .eq('is_active', true)
      .single();

    if (productError || !product) {
      return NextResponse.json({
        success: false,
        error: { code: 'INVALID_PRODUCT', message: 'Product not found or inactive' },
      }, { status: 400 });
    }

    // Anti-duplicate: check for recent identical order
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: recentOrders } = await supabase
      .from('orders')
      .select('id')
      .eq('game_user_id', game_user_id)
      .eq('product_id', product_id)
      .in('status', ['pending', 'awaiting_payment', 'paid', 'processing'])
      .gte('created_at', fiveMinAgo);

    if (recentOrders && recentOrders.length > 0) {
      return NextResponse.json({
        success: false,
        error: { code: 'DUPLICATE_ORDER', message: 'A similar order was recently created. Please wait before ordering again.' },
      }, { status: 429 });
    }

    // Calculate pricing
    const subtotal = product.price_idr;
    let discount = 0;
    let promoId = null;

    if (promo_code) {
      const { data: promo } = await supabase
        .from('promos')
        .select('*')
        .eq('code', promo_code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (promo) {
        const now = new Date();
        const startsAt = new Date(promo.starts_at);
        const expiresAt = promo.expires_at ? new Date(promo.expires_at) : null;

        if (now >= startsAt && (!expiresAt || now <= expiresAt)) {
          if (!promo.usage_limit || promo.used_count < promo.usage_limit) {
            if (subtotal >= promo.min_order_idr) {
              if (promo.type === 'percentage') {
                discount = Math.floor(subtotal * promo.value / 100);
                if (promo.max_discount_idr && discount > promo.max_discount_idr) {
                  discount = promo.max_discount_idr;
                }
              } else {
                discount = promo.value;
              }
              discount = Math.min(discount, subtotal);
              promoId = promo.id;
            }
          }
        }
      }
    }

    const total = subtotal - discount;

    // Generate order number
    const { data: orderNumResult } = await supabase.rpc('generate_order_number' as never);
    const orderNumber = (orderNumResult as unknown as string) || `DKM-${Date.now()}`;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: user_id || null,
        game_id,
        product_id,
        game_user_id,
        game_server_id: game_server_id || null,
        game_username: game_username || null,
        quantity: 1,
        unit_price_idr: product.price_idr,
        subtotal_idr: subtotal,
        discount_idr: discount,
        total_idr: total,
        promo_id: promoId,
        promo_code: promo_code?.toUpperCase() || null,
        status: 'awaiting_payment',
        payment_method: payment_method,
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
        user_agent: request.headers.get('user-agent') || null,
      } as Record<string, unknown>)
      .select()
      .single();

    if (orderError) {
      console.error('Order creation failed:', orderError);
      return NextResponse.json({
        success: false,
        error: { code: 'ORDER_FAILED', message: 'Failed to create order' },
      }, { status: 500 });
    }

    // Create transaction with idempotency key
    const idempotencyKey = `${order.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    await supabase.from('transactions').insert({
      order_id: order.id,
      type: 'payment',
      amount_idr: total,
      payment_method: payment_method,
      payment_gateway: 'mock',
      status: 'pending',
      idempotency_key: idempotencyKey,
    } as Record<string, unknown>);

    // Update promo usage
    if (promoId) {
      await supabase.from('promos').update({
        used_count: (await supabase.from('promos').select('used_count').eq('id', promoId).single()).data?.used_count + 1,
      } as Record<string, unknown>).eq('id', promoId);
    }

    // Simulate mock payment processing (auto-complete after 5s)
    setTimeout(async () => {
      const adminClient = await createAdminSupabaseClient();
      await adminClient.from('orders').update({
        status: 'paid',
        paid_at: new Date().toISOString(),
      } as Record<string, unknown>).eq('id', order.id);

      // After payment, simulate delivery
      setTimeout(async () => {
        const adminClient2 = await createAdminSupabaseClient();
        await adminClient2.from('orders').update({
          status: 'processing',
          processing_at: new Date().toISOString(),
        } as Record<string, unknown>).eq('id', order.id);

        setTimeout(async () => {
          const adminClient3 = await createAdminSupabaseClient();
          await adminClient3.from('orders').update({
            status: 'completed',
            completed_at: new Date().toISOString(),
          } as Record<string, unknown>).eq('id', order.id);

          // Update transaction
          await adminClient3.from('transactions').update({
            status: 'success',
            verified_at: new Date().toISOString(),
          } as Record<string, unknown>).eq('order_id', order.id);

          // Update product stats
          await adminClient3.from('products').update({
            total_sold: product.total_sold + 1,
          } as Record<string, unknown>).eq('id', product.id);

          // Update game stats
          const { data: gameData } = await adminClient3.from('games').select('total_orders').eq('id', game_id).single();
          if (gameData) {
            await adminClient3.from('games').update({
              total_orders: gameData.total_orders + 1,
            } as Record<string, unknown>).eq('id', game_id);
          }
        }, 3000);
      }, 2000);
    }, 5000);

    return NextResponse.json({
      success: true,
      data: { id: order.id, order_number: order.order_number },
    });
  } catch (error) {
    console.error('Order error:', error);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL', message: 'Internal server error' },
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      }, { status: 401 });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const { data: orders, count } = await supabase
      .from('orders')
      .select('*, game:games(name, slug, icon_url), product:products(name, denomination, unit)', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    return NextResponse.json({
      success: true,
      data: orders,
      meta: { page, limit, total: count },
    });
  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL', message: 'Internal server error' },
    }, { status: 500 });
  }
}
