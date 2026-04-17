'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/types/database';

export function Header() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [user, setUser] = useState<Profile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const saved = localStorage.getItem('dkaimono-theme') as 'light' | 'dark' | null;
    if (saved) setTheme(saved);

    supabase.auth.getUser().then(async ({ data: { user: authUser } }) => {
      if (authUser) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();
        if (data) setUser(data as Profile);
      }
    });
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('dkaimono-theme', newTheme);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = '/';
  };

  return (
    <header className="header">
      <div className="header-inner">
        <Link href="/" className="header-logo">
          <div className="header-logo-icon">dK</div>
          <span>dKaimono</span>
        </Link>

        <div className="header-search">
          <span className="header-search-icon">🔍</span>
          <input type="text" placeholder="Search games..." id="header-search-input" />
        </div>

        <nav className="header-nav">
          <Link href="/" className="header-nav-link">Home</Link>
          {user && <Link href="/history" className="header-nav-link">Orders</Link>}
          {user?.role === 'admin' && <Link href="/admin" className="header-nav-link">Admin</Link>}
        </nav>

        <div className="header-actions">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            id="theme-toggle-btn"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setMenuOpen(!menuOpen)}
                id="user-menu-btn"
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <span style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: '0.7rem', fontWeight: 700,
                }}>
                  {(user.full_name || user.email).charAt(0).toUpperCase()}
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                  {user.full_name || user.email.split('@')[0]}
                </span>
              </button>
              {menuOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: '100%', marginTop: 8,
                  background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)', padding: 8, minWidth: 180,
                  boxShadow: 'var(--shadow-lg)', zIndex: 100,
                }}>
                  <Link href="/history" className="header-nav-link" style={{ display: 'block', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}
                    onClick={() => setMenuOpen(false)}>📦 Order History</Link>
                  {user.role === 'admin' && (
                    <Link href="/admin" className="header-nav-link" style={{ display: 'block', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}
                      onClick={() => setMenuOpen(false)}>⚙️ Admin Panel</Link>
                  )}
                  <div style={{ height: 1, background: 'var(--border-color)', margin: '4px 0' }} />
                  <button onClick={handleLogout} className="header-nav-link"
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="btn btn-primary btn-sm" id="login-btn">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
