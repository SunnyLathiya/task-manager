import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { authApi } from '@/src/lib/api.client';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      router.push('/dashboard');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        const res = await authApi.login({ email, password });
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        router.push('/dashboard');
      } else {
        await authApi.register({ email, password });
        setIsLogin(true);
        setSuccess('Account created! Please login with your new credentials.');
        setEmail('');
        setPassword('');
      }
    } catch (err: any) {
      const message = err.message === 'INVALID_CREDENTIALS' 
        ? 'Incorrect email or password. Please try again.'
        : err.message === 'USER_ALREADY_EXISTS'
        ? 'An account with this email already exists.'
        : 'Something went wrong. Please check your connection.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <Head>
        <title>Taskly | Premium Task Management</title>
      </Head>

      <main className="auth-wrapper">
        <div className="brand-section">
          <h1 className="logo-text gradient-text">Taskly.</h1>
          <p className="brand-subtext">Elevate your productivity with our high-performance task engine.</p>
        </div>

        <div className="auth-card glass">
          <div className="auth-header">
            <h2>{isLogin ? 'Welcome Back' : 'Get Started'}</h2>
            <p>{isLogin ? 'Enter your credentials to continue' : 'Join our premium community today'}</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                className="input-field" 
                placeholder="name@company.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                className="input-field" 
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary auth-submit" disabled={loading}>
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="auth-footer">
            <span>{isLogin ? "Don't have an account?" : "Already have an account?"}</span>
            <button onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }} className="toggle-btn">
              {isLogin ? 'Register Now' : 'Sign In'}
            </button>
          </div>
        </div>
      </main>

      <style jsx>{`
        .container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 20px;
        }
        .auth-wrapper {
          width: 100%;
          max-width: 480px;
          display: flex;
          flex-direction: column;
          gap: 40px;
        }
        .brand-section {
          text-align: center;
        }
        .logo-text {
          font-size: 3.5rem;
          font-weight: 800;
          letter-spacing: -2px;
          margin-bottom: 12px;
        }
        .brand-subtext {
          color: var(--text-muted);
          font-size: 1.1rem;
        }
        .auth-card {
          padding: 40px;
          border-radius: 24px;
        }
        .auth-header {
          margin-bottom: 32px;
        }
        .auth-header h2 {
          font-size: 1.8rem;
          margin-bottom: 8px;
        }
        .auth-header p {
          color: var(--text-muted);
          font-size: 0.95rem;
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .form-group label {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-muted);
          margin-left: 4px;
        }
        .auth-submit {
          width: 100%;
          margin-top: 10px;
          font-size: 1rem;
        }
        .auth-footer {
          margin-top: 24px;
          text-align: center;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .auth-footer span {
          color: var(--text-muted);
        }
        .toggle-btn {
          color: var(--accent-secondary);
          font-weight: 600;
        }
        .error-message {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          padding: 12px;
          border-radius: 10px;
          font-size: 0.85rem;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }
        .success-message {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          padding: 12px;
          border-radius: 10px;
          font-size: 0.85rem;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }
      `}</style>
    </div>
  );
}
