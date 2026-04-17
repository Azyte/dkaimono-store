'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { timeAgo } from '@/lib/utils';
import type { Profile } from '@/types/database';

const SIDEBAR_LINKS = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/orders', label: 'Orders', icon: '📦' },
  { href: '/admin/games', label: 'Games', icon: '🎮' },
  { href: '/admin/products', label: 'Products', icon: '💎' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/promos', label: 'Promos', icon: '🎫' },
];

export default function AdminUsersPage() {
  const pathname = usePathname();
  const supabase = createClient();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      setUsers((data || []) as Profile[]);
      setLoading(false);
    };
    fetch();
  }, []);

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    setUsers((prev: Profile[]) => prev.map((u: Profile) => u.id === userId ? { ...u, role: newRole as Profile['role'] } : u));
  };

  const toggleBan = async (userId: string, isBanned: boolean) => {
    await supabase.from('profiles').update({ is_banned: !isBanned }).eq('id', userId);
    setUsers((prev: Profile[]) => prev.map((u: Profile) => u.id === userId ? { ...u, is_banned: !isBanned } : u));
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
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 24 }}>👥 User Management</h1>

        {loading ? <div className="skeleton" style={{ height: 400 }} /> : (
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Orders</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: Profile) => (
                  <tr key={user.id}>
                    <td style={{ fontWeight: 500 }}>{user.full_name || 'No name'}</td>
                    <td style={{ fontSize: '0.83rem' }}>{user.email}</td>
                    <td>
                      <span className={`status-badge ${user.role === 'admin' ? 'status-processing' : 'status-pending'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>{user.order_count}</td>
                    <td>
                      {user.is_banned
                        ? <span className="status-badge status-failed">Banned</span>
                        : <span className="status-badge status-success">Active</span>
                      }
                    </td>
                    <td style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{timeAgo(user.created_at)}</td>
                    <td style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => toggleRole(user.id, user.role)}
                        title={user.role === 'admin' ? 'Demote to user' : 'Promote to admin'}>
                        {user.role === 'admin' ? '👤' : '⭐'}
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => toggleBan(user.id, user.is_banned)}
                        title={user.is_banned ? 'Unban' : 'Ban'}>
                        {user.is_banned ? '✅' : '🚫'}
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
