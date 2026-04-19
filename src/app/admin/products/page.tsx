'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatIDR, timeAgo } from '@/lib/utils';
import type { Game, Product } from '@/types/database';

const SIDEBAR_LINKS = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/orders', label: 'Orders', icon: '📦' },
  { href: '/admin/games', label: 'Games', icon: '🎮' },
  { href: '/admin/products', label: 'Products', icon: '💎' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/promos', label: 'Promos', icon: '🎫' },
];

export default function AdminProductsPage() {
  const pathname = usePathname();
  const supabase = createClient();
  const [products, setProducts] = useState<(Product & { game?: Game })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('products')
        .select('*, game:games(name)')
        .order('game_id')
        .order('sort_order', { ascending: true });
      setProducts((data || []) as unknown as (Product & { game?: Game })[]);
      setLoading(false);
    };
    fetch();
  }, []);

  const toggleActive = async (id: string, isActive: boolean) => {
    await supabase.from('products').update({ is_active: !isActive } as any).eq('id', id);
    setProducts((prev: (Product & { game?: Game })[]) => prev.map((p: Product & { game?: Game }) => p.id === id ? { ...p, is_active: !isActive } : p));
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, paddingLeft: 14 }}>Admin Panel</div>
        {SIDEBAR_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className={`admin-sidebar-link ${pathname === link.href ? 'active' : ''}`}>
            <span>{link.icon}</span><span>{link.label}</span>
          </Link>
        ))}
        <div style={{ height: 1, background: 'var(--border-color)', margin: '12px 0' }} />
        <Link href="/" className="admin-sidebar-link"><span>🏠</span><span>Back to Store</span></Link>
      </aside>

      <div className="admin-content">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 24 }}>💎 Product Management</h1>

        {loading ? <div className="skeleton" style={{ height: 400 }} /> : (
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Game</th>
                  <th>Denomination</th>
                  <th>Price</th>
                  <th>Sold</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product: Product & { game?: Game }) => {
                  const game = product.game as unknown as { name: string } | null;
                  return (
                    <tr key={product.id}>
                      <td style={{ fontWeight: 500 }}>{product.name}</td>
                      <td style={{ fontSize: '0.83rem' }}>{game?.name || 'N/A'}</td>
                      <td>{product.denomination} {product.unit}</td>
                      <td style={{ fontWeight: 600 }}>
                        {formatIDR(product.price_idr)}
                        {product.original_price_idr && (
                          <span style={{ color: 'var(--text-tertiary)', textDecoration: 'line-through', fontSize: '0.72rem', marginLeft: 4 }}>
                            {formatIDR(product.original_price_idr)}
                          </span>
                        )}
                      </td>
                      <td>{product.total_sold}</td>
                      <td>
                        <span className={`status-badge ${product.is_active ? 'status-success' : 'status-failed'}`}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-ghost btn-sm" onClick={() => toggleActive(product.id, product.is_active)}>
                          {product.is_active ? '🔴 Disable' : '🟢 Enable'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
