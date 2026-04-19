'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { timeAgo } from '@/lib/utils';
import type { Game } from '@/types/database';

const SIDEBAR_LINKS = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/orders', label: 'Orders', icon: '📦' },
  { href: '/admin/games', label: 'Games', icon: '🎮' },
  { href: '/admin/products', label: 'Products', icon: '💎' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/promos', label: 'Promos', icon: '🎫' },
];

export default function AdminGamesPage() {
  const pathname = usePathname();
  const supabase = createClient();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('games').select('*').order('sort_order');
      setGames((data || []) as Game[]);
      setLoading(false);
    };
    fetch();
  }, []);

  const toggleActive = async (id: string, isActive: boolean) => {
    await supabase.from('games').update({ is_active: !isActive } as any).eq('id', id);
    setGames((prev: Game[]) => prev.map((g: Game) => g.id === id ? { ...g, is_active: !isActive } : g));
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
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 24 }}>🎮 Game Management</h1>

        {loading ? <div className="skeleton" style={{ height: 400 }} /> : (
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Game</th>
                  <th>Publisher</th>
                  <th>Category</th>
                  <th>Validation</th>
                  <th>Orders</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {games.map((game: Game) => (
                  <tr key={game.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <img src={game.icon_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(game.name)}&size=32&background=6C5CE7&color=fff`}
                          alt="" style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)' }} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{game.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>/{game.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.83rem' }}>{game.publisher}</td>
                    <td><span className="status-badge status-processing">{game.category.replace('_', ' ')}</span></td>
                    <td><span className="status-badge status-pending">{game.validation_mode}</span></td>
                    <td>{game.total_orders}</td>
                    <td>
                      <span className={`status-badge ${game.is_active ? 'status-success' : 'status-failed'}`}>
                        {game.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => toggleActive(game.id, game.is_active)}>
                        {game.is_active ? '🔴' : '🟢'}
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
