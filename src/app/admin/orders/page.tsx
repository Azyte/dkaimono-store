'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatIDR, timeAgo, getStatusLabel, getPaymentMethodLabel } from '@/lib/utils';
import type { Order } from '@/types/database';

const SIDEBAR_LINKS = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/orders', label: 'Orders', icon: '📦' },
  { href: '/admin/games', label: 'Games', icon: '🎮' },
  { href: '/admin/products', label: 'Products', icon: '💎' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/promos', label: 'Promos', icon: '🎫' },
  { href: '/admin/supplier-sync', label: 'API Sync', icon: '🔄' },
];

export default function AdminOrdersPage() {
  const pathname = usePathname();
  const supabase = createClient();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const fetchOrders = async () => {
      let query = supabase
        .from('orders')
        .select('*, game:games(name, icon_url), product:products(name)')
        .order('created_at', { ascending: false })
        .limit(100);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data } = await query;
      setOrders((data || []) as unknown as Order[]);
      setLoading(false);
    };

    fetchOrders();
  }, [statusFilter]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    const updateData: Record<string, unknown> = { status: newStatus };
    if (newStatus === 'completed') updateData.completed_at = new Date().toISOString();
    if (newStatus === 'failed') updateData.failed_at = new Date().toISOString();
    if (newStatus === 'cancelled') updateData.cancelled_at = new Date().toISOString();

    await supabase.from('orders').update(updateData).eq('id', orderId);
    setOrders((prev: Order[]) => prev.map((o: Order) => o.id === orderId ? { ...o, status: newStatus as Order['status'] } : o));
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, paddingLeft: 14 }}>
          Admin Panel
        </div>
        {SIDEBAR_LINKS.map((link) => (
          <Link key={link.href} href={link.href}
            className={`admin-sidebar-link ${pathname === link.href ? 'active' : ''}`}>
            <span>{link.icon}</span><span>{link.label}</span>
          </Link>
        ))}
        <div style={{ height: 1, background: 'var(--border-color)', margin: '12px 0' }} />
        <Link href="/" className="admin-sidebar-link"><span>🏠</span><span>Back to Store</span></Link>
      </aside>

      <div className="admin-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>📦 Order Management</h1>
        </div>

        {/* Filters */}
        <div className="category-tabs" style={{ marginBottom: 20 }}>
          {['all', 'pending', 'awaiting_payment', 'paid', 'processing', 'completed', 'failed'].map((s) => (
            <button key={s} className={`category-tab ${statusFilter === s ? 'active' : ''}`}
              onClick={() => { setStatusFilter(s); setLoading(true); }}>
              {s === 'all' ? 'All' : getStatusLabel(s)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="skeleton" style={{ height: 400 }} />
        ) : (
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Game</th>
                  <th>Account</th>
                  <th>Product</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order: Order) => {
                  const game = order.game as unknown as { name: string } | null;
                  const product = order.product as unknown as { name: string } | null;
                  return (
                    <tr key={order.id}>
                      <td style={{ fontWeight: 500, fontSize: '0.78rem' }}>#{order.order_number}</td>
                      <td style={{ fontSize: '0.83rem' }}>{game?.name || 'N/A'}</td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {order.game_user_id}{order.game_server_id ? ` (${order.game_server_id})` : ''}
                      </td>
                      <td style={{ fontSize: '0.83rem' }}>{product?.name || 'N/A'}</td>
                      <td style={{ fontWeight: 600, fontSize: '0.83rem' }}>{formatIDR(order.total_idr)}</td>
                      <td style={{ fontSize: '0.78rem' }}>{order.payment_method ? getPaymentMethodLabel(order.payment_method) : '-'}</td>
                      <td><span className={`status-badge status-${order.status}`}>{getStatusLabel(order.status)}</span></td>
                      <td style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{timeAgo(order.created_at)}</td>
                      <td>
                        <select
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => e.target.value && handleUpdateStatus(order.id, e.target.value)}
                          defaultValue=""
                          style={{
                            padding: '4px 8px', fontSize: '0.72rem', borderRadius: 'var(--radius-sm)',
                            background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)',
                            color: 'var(--text-primary)', cursor: 'pointer',
                          }}
                        >
                          <option value="">Update...</option>
                          <option value="completed">✅ Complete</option>
                          <option value="failed">❌ Failed</option>
                          <option value="cancelled">🚫 Cancel</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
                {orders.length === 0 && (
                  <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>No orders found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
