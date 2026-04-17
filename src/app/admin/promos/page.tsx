'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatIDR, timeAgo } from '@/lib/utils';
import type { Promo } from '@/types/database';

const SIDEBAR_LINKS = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/orders', label: 'Orders', icon: '📦' },
  { href: '/admin/games', label: 'Games', icon: '🎮' },
  { href: '/admin/products', label: 'Products', icon: '💎' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/promos', label: 'Promos', icon: '🎫' },
];

export default function AdminPromosPage() {
  const pathname = usePathname();
  const supabase = createClient();
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('promos').select('*').order('created_at', { ascending: false });
      setPromos((data || []) as Promo[]);
      setLoading(false);
    };
    fetch();
  }, []);

  const toggleActive = async (id: string, isActive: boolean) => {
    await supabase.from('promos').update({ is_active: !isActive }).eq('id', id);
    setPromos((prev: Promo[]) => prev.map((p: Promo) => p.id === id ? { ...p, is_active: !isActive } : p));
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
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 24 }}>🎫 Promo Management</h1>

        {loading ? <div className="skeleton" style={{ height: 400 }} /> : (
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Value</th>
                  <th>Usage</th>
                  <th>Expires</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {promos.map((promo: Promo) => (
                  <tr key={promo.id}>
                    <td style={{ fontWeight: 700, fontFamily: 'monospace', letterSpacing: 1 }}>{promo.code}</td>
                    <td>{promo.name}</td>
                    <td><span className="status-badge status-processing">{promo.type.replace('_', ' ')}</span></td>
                    <td style={{ fontWeight: 600 }}>
                      {promo.type === 'percentage' ? `${promo.value}%` : formatIDR(promo.value)}
                    </td>
                    <td>
                      {promo.used_count}{promo.usage_limit ? ` / ${promo.usage_limit}` : ' / ∞'}
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                      {promo.expires_at ? timeAgo(promo.expires_at) : 'Never'}
                    </td>
                    <td>
                      <span className={`status-badge ${promo.is_active ? 'status-success' : 'status-failed'}`}>
                        {promo.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => toggleActive(promo.id, promo.is_active)}>
                        {promo.is_active ? '🔴' : '🟢'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
