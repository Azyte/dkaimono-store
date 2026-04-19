'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

import { Suspense } from 'react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      router.push(redirect);
      router.refresh();
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <span style={{
            display: 'inline-flex', width: 48, height: 48, borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            alignItems: 'center', justifyContent: 'center', color: 'white',
            fontSize: '1.2rem', fontWeight: 900, marginBottom: 12,
          }}>dK</span>
        </div>
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to your dKaimono account</p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="form-error" style={{ marginBottom: 12 }}>❌ {error}</div>}

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}
            id="login-submit" style={{ width: '100%' }}>
            {loading ? <><span className="spinner" /> Signing in...</> : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer-text">
          Don&apos;t have an account? <Link href="/register">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><span className="spinner" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
