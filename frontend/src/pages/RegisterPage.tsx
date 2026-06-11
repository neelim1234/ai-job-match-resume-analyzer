import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await register(fullName, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">⚡</div>
          <h1>Create your account</h1>
          <p>Start optimizing your resume with AI</p>
        </div>

        {error && <div className="error-banner" role="alert">{error}</div>}

        <form id="register-form" onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="full-name">Full Name</label>
            <input
              id="full-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jane Smith"
              required
              autoComplete="name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              required
              autoComplete="new-password"
            />
          </div>
          <button id="register-btn" type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? <span className="spinner-sm" /> : 'Create Account →'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login">Sign in →</Link>
        </p>
      </div>
    </div>
  );
}
