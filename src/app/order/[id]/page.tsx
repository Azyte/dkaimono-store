'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatIDR, formatDate, getStatusLabel } from '@/lib/utils';
import type { Order } from '@/types/database';

interface Props {
  params: Promise<{ id: string }>;
}

const STATUS_STEPS = [
  { key: 'awaiting_payment', label: 'Payment', icon: '💳' },
  { key: 'paid', label: 'Paid', icon: '✅' },
  { key: 'processing', label: 'Processing', icon: '⚙️' },
  { key: 'completed', label: 'Complete', icon: '🎉' },
];

const STATUS_ORDER = ['pending', 'awaiting_payment', 'paid', 'processing', 'completed'];

export default function OrderStatusPage({ params }: Props) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Initial fetch
    const fetchOrder = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*, game:games(name, slug, icon_url), product:products(name, denomination, unit)')
        .eq('id', id)
        .single();

      if (data) setOrder(data as unknown as Order);
      setLoading(false);
    };

    fetchOrder();

    // Realtime subscription for status updates
    const channel = supabase
      .channel(`order-${id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${id}` },
        (payload: any) => {
          setOrder((prev) => prev ? { ...prev, ...payload.new } as Order : null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  if (loading) {
    return (
      <div className="page-content">
        <div className="container" style={{ maxWidth: 700, margin: '0 auto' }}>
          <div className="page-loading">
            <div className="spinner spinner-lg" />
            <p className="page-loading-text">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page-content">
        <div className="container" style={{ maxWidth: 700, margin: '0 auto' }}>
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <div className="empty-state-title">Order Not Found</div>
            <div className="empty-state-text">This order doesn&apos;t exist or you don&apos;t have access.</div>
            <Link href="/" className="btn btn-primary" style={{ marginTop: 16 }}>Back Home</Link>
          </div>
        </div>
      </div>
    );
  }

  const currentStepIndex = STATUS_ORDER.indexOf(order.status);
  const isFailed = ['failed', 'expired', 'cancelled', 'refunded'].includes(order.status);

  return (
    <div className="page-content">
      <div className="container" style={{ maxWidth: 700, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: '3rem', marginBottom: 8 }}>
            {order.status === 'completed' ? '🎉' : isFailed ? '❌' : '⏳'}
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>
            {order.status === 'completed'
              ? 'Top-Up Successful!'
              : isFailed
              ? `Order ${getStatusLabel(order.status)}`
              : 'Processing Your Order'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Order #{order.order_number}
          </p>
        </div>

        {/* Status Steps */}
        {!isFailed && (
          <div className="status-steps">
            {STATUS_STEPS.map((s, i) => {
              const stepIndex = STATUS_ORDER.indexOf(s.key);
              const isCompleted = currentStepIndex > stepIndex;
              const isActive = currentStepIndex === stepIndex;

              return (
                <div key={s.key} className={`status-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                  <div className="status-step-dot">{isCompleted ? '✓' : s.icon}</div>
                  <span className="status-step-label">{s.label}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Order Details Card */}
        <div className="checkout-summary" style={{ marginTop: 24 }}>
          <div className="checkout-row">
            <span className="checkout-row-label">Game</span>
            <span className="checkout-row-value">{(order.game as unknown as { name: string })?.name || 'N/A'}</span>
          </div>
          <div className="checkout-row">
            <span className="checkout-row-label">Package</span>
            <span className="checkout-row-value">{(order.product as unknown as { name: string })?.name || 'N/A'}</span>
          </div>
          <div className="checkout-row">
            <span className="checkout-row-label">Account ID</span>
            <span className="checkout-row-value">
              {order.game_user_id}
              {order.game_server_id ? ` (${order.game_server_id})` : ''}
            </span>
          </div>
          {order.game_username && (
            <div className="checkout-row">
              <span className="checkout-row-label">Username</span>
              <span className="checkout-row-value">{order.game_username}</span>
            </div>
          )}
          <div className="checkout-row">
            <span className="checkout-row-label">Status</span>
            <span className={`status-badge status-${order.status}`}>{getStatusLabel(order.status)}</span>
          </div>

          <div className="checkout-divider" />

          <div className="checkout-row">
            <span className="checkout-row-label">Subtotal</span>
            <span className="checkout-row-value">{formatIDR(order.subtotal_idr)}</span>
          </div>
          {order.discount_idr > 0 && (
            <div className="checkout-row" style={{ color: 'var(--color-success)' }}>
              <span className="checkout-row-label">Discount</span>
              <span className="checkout-row-value">-{formatIDR(order.discount_idr)}</span>
            </div>
          )}
          <div className="checkout-divider" />
          <div className="checkout-row checkout-total">
            <span className="checkout-row-label">Total Paid</span>
            <span className="checkout-row-value">{formatIDR(order.total_idr)}</span>
          </div>
          <div className="checkout-row">
            <span className="checkout-row-label">Date</span>
            <span className="checkout-row-value" style={{ fontSize: '0.85rem' }}>{formatDate(order.created_at)}</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'center' }}>
          <Link href="/" className="btn btn-primary">Top Up Again</Link>
          <Link href="/history" className="btn btn-secondary">Order History</Link>
        </div>
      </div>
    </div>
  );
}
