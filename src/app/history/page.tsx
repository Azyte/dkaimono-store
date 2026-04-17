'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatIDR, timeAgo, getStatusLabel } from '@/lib/utils';
import type { Order } from '@/types/database';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login?redirect=/history';
        return;
      }

      const { data } = await supabase
        .from('orders')
        .select('*, game:games(name, slug, icon_url), product:products(name, denomination, unit)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (data) setOrders(data as unknown as Order[]);
      setLoading(false);
    };

    fetchOrders();
  }, []);

  return (
    <div className="page-content">
      <div className="container" style={{ maxWidth: 800, margin: '0 auto' }}>
        <div className="section-header">
          <div>
            <h1 className="section-title">📦 Order History</h1>
            <p className="section-subtitle">Track and manage your top-up orders</p>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton skeleton-card" style={{ height: 100 }} />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <div className="empty-state-title">No orders yet</div>
            <div className="empty-state-text">Start your first top-up to see your order history here.</div>
            <Link href="/" className="btn btn-primary" style={{ marginTop: 16 }}>Browse Games</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {orders.map((order: Order) => {
              const game = order.game as unknown as { name: string; icon_url: string; slug: string } | null;
              const product = order.product as unknown as { name: string; denomination: number; unit: string } | null;

              return (
                <Link href={`/order/${order.id}`} key={order.id}>
                  <div className="card card-interactive" style={{ padding: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
                    <img
                      src={game?.icon_url || `https://ui-avatars.com/api/?name=G&size=48&background=6C5CE7&color=fff`}
                      alt={game?.name || 'Game'}
                      style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', objectFit: 'cover', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{game?.name || 'Unknown Game'}</span>
                        <span className={`status-badge status-${order.status}`}>{getStatusLabel(order.status)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                          {product?.name || 'N/A'} • #{order.order_number}
                        </span>
                        <span style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.85rem' }}>
                          {formatIDR(order.total_idr)}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{timeAgo(order.created_at)}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
