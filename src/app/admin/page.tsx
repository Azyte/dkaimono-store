'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatIDR } from '@/lib/utils';
import type { Order, Game, Product } from '@/types/database';

const SIDEBAR_LINKS = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/orders', label: 'Orders', icon: '📦' },
  { href: '/admin/games', label: 'Games', icon: '🎮' },
  { href: '/admin/products', label: 'Products', icon: '💎' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/promos', label: 'Promos', icon: '🎫' },
];

interface DashboardStats {
  totalRevenue: number;
  todayRevenue: number;
  totalOrders: number;
  todayOrders: number;
  totalUsers: number;
  totalGames: number;
}

export default function AdminDashboard() {
  const pathname = usePathname();
  const supabase = createClient();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topProducts, setTopProducts] = useState<(Product & { game?: Game })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      const [
        { count: totalOrders },
        { count: todayOrders },
        { count: totalUsers },
        { count: totalGames },
        { data: allCompleted },
        { data: todayCompleted },
        { data: recent },
        { data: products },
      ] = await Promise.all([
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', todayISO),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('games').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('total_idr').eq('status', 'completed'),
        supabase.from('orders').select('total_idr').eq('status', 'completed').gte('created_at', todayISO),
        supabase.from('orders')
          .select('*, game:games(name, icon_url), product:products(name)')
          .order('created_at', { ascending: false })
          .limit(10),
        supabase.from('products')
          .select('*, game:games(name)')
          .order('total_sold', { ascending: false })
          .limit(5),
      ]);

      const totalRevenue = (allCompleted || []).reduce((sum: number, o: { total_idr?: number }) => sum + (o.total_idr || 0), 0);
      const todayRevenueVal = (todayCompleted || []).reduce((sum: number, o: { total_idr?: number }) => sum + (o.total_idr || 0), 0);

      setStats({
        totalRevenue,
        todayRevenue: todayRevenueVal,
        totalOrders: totalOrders || 0,
        todayOrders: todayOrders || 0,
        totalUsers: totalUsers || 0,
        totalGames: totalGames || 0,
      });

      setRecentOrders((recent || []) as unknown as Order[]);
      setTopProducts((products || []) as unknown as (Product & { game?: Game })[]);
      setLoading(false);
    };

    fetchDashboard();
  }, []);

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, paddingLeft: 14 }}>
          Admin Panel
        </div>
        {SIDEBAR_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`admin-sidebar-link ${pathname === link.href ? 'active' : ''}`}
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
        <div style={{ height: 1, background: 'var(--border-color)', margin: '12px 0' }} />
        <Link href="/" className="admin-sidebar-link">
          <span>🏠</span>
          <span>Back to Store</span>
        </Link>
      </aside>

      {/* Main Content */}
      <div className="admin-content">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 24 }}>📊 Dashboard Overview</h1>

        {loading ? (
          <div className="admin-stats">
            {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton" style={{ height: 100 }} />)}
          </div>
        ) : stats && (
          <>
            {/* Stats Cards */}
            <div className="admin-stats">
              <div className="stat-card">
                <div className="stat-label">Total Revenue</div>
                <div className="stat-value">{formatIDR(stats.totalRevenue)}</div>
                <div className="stat-change positive">Today: {formatIDR(stats.todayRevenue)}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total Orders</div>
                <div className="stat-value">{stats.totalOrders.toLocaleString()}</div>
                <div className="stat-change positive">Today: {stats.todayOrders}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total Users</div>
                <div className="stat-value">{stats.totalUsers.toLocaleString()}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Active Games</div>
                <div className="stat-value">{stats.totalGames}</div>
              </div>
            </div>

            {/* Two Column Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginTop: 24 }}>
              {/* Recent Orders */}
              <div>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>📦 Recent Orders</h2>
                <div className="data-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Game</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => {
                        const game = order.game as unknown as { name: string } | null;
                        return (
                          <tr key={order.id}>
                            <td style={{ fontWeight: 500, fontSize: '0.8rem' }}>#{order.order_number}</td>
                            <td style={{ fontSize: '0.83rem' }}>{game?.name || 'N/A'}</td>
                            <td style={{ fontWeight: 600, fontSize: '0.83rem' }}>{formatIDR(order.total_idr)}</td>
                            <td><span className={`status-badge status-${order.status}`}>{order.status}</span></td>
                          </tr>
                        );
                      })}
                      {recentOrders.length === 0 && (
                        <tr><td colSpan={4} style={{ textAlign: 'center', padding: 24, color: 'var(--text-tertiary)' }}>No orders yet</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top Products */}
              <div>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>🏆 Top Products</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {topProducts.map((product, i: number) => {
                    const game = product.game as unknown as { name: string } | null;
                    return (
                      <div key={product.id} className="card" style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{
                          width: 28, height: 28, borderRadius: '50%', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                          fontSize: '0.8rem',
                          background: i === 0 ? 'linear-gradient(135deg, #FFD700, #FFA500)' :
                            i === 1 ? 'linear-gradient(135deg, #C0C0C0, #A0A0A0)' :
                            i === 2 ? 'linear-gradient(135deg, #CD7F32, #8B4513)' :
                            'var(--bg-surface-elevated)',
                          color: i < 3 ? 'white' : 'var(--text-secondary)',
                        }}>
                          {i + 1}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.83rem' }}>{product.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{game?.name || ''} • {product.total_sold} sold</div>
                        </div>
                        <span style={{ fontWeight: 600, fontSize: '0.83rem', color: 'var(--color-primary)' }}>
                          {formatIDR(product.price_idr)}
                        </span>
                      </div>
                    );
                  })}
                  {topProducts.length === 0 && (
                    <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-tertiary)' }}>No data yet</div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
