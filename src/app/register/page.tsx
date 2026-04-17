'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 1500);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎉</div>
          <h1 className="auth-title">Welcome to dKaimono!</h1>
          <p className="auth-subtitle">Your account has been created successfully. Redirecting...</p>
        </div>
      </div>
    );
  }

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
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join dKaimono for instant game top-ups</p>

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              type="text"
              className="form-input"
              placeholder="Your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              className="form-input"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {error && <div className="form-error" style={{ marginBottom: 12 }}>❌ {error}</div>}

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}
            id="register-submit" style={{ width: '100%' }}>
            {loading ? <><span className="spinner" /> Creating account...</> : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account? <Link href="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
