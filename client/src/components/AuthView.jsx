import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const AuthView = () => {
  const { login, register } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const result = await login(email, password);
        if (!result.success) {
          setError(result.error || 'Invalid credentials.');
        }
      } else {
        const result = await register(email, password);
        if (result.success) {
          setSuccess('Registration successful! You can now log in.');
          setIsLogin(true);
          setPassword('');
          setConfirmPassword('');
        } else {
          setError(result.error || 'Registration failed.');
        }
      }
    } catch (e) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {/* Calligraphic/Branding Top */}
        <div className="auth-header">
          <div className="auth-logo-arabic">مَدَنِيَّمْ</div>
          <h2 className="auth-title">Madaneeyam Project</h2>
          <p className="auth-subtitle">Islamic Literature File Management Platform</p>
        </div>

        {/* Tab Toggle */}
        <div className="auth-tabs">
          <button 
            type="button" 
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
          >
            Sign In
          </button>
          <button 
            type="button" 
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
          >
            Register
          </button>
        </div>

        {/* Auth Forms */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div className="auth-alert error">
              <i className="fa-solid fa-triangle-exclamation"></i>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="auth-alert success">
              <i className="fa-solid fa-circle-check"></i>
              <span>{success}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="email-input">Email Address</label>
            <div className="auth-input-wrapper">
              <i className="fa-solid fa-envelope auth-input-icon"></i>
              <input
                id="email-input"
                type="email"
                className="auth-input"
                placeholder="yourname@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password-input">Password</label>
            <div className="auth-input-wrapper">
              <i className="fa-solid fa-lock auth-input-icon"></i>
              <input
                id="password-input"
                type="password"
                className="auth-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {!isLogin && (
            <div className="form-group">
              <label className="form-label" htmlFor="confirm-password-input">Confirm Password</label>
              <div className="auth-input-wrapper">
                <i className="fa-solid fa-shield-halved auth-input-icon"></i>
                <input
                  id="confirm-password-input"
                  type="password"
                  className="auth-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary auth-submit-btn" 
            disabled={loading}
          >
            {loading ? (
              <i className="fa-solid fa-circle-notch fa-spin"></i>
            ) : isLogin ? (
              'Access Dashboard'
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Footer Guidance */}
        <div className="auth-footer">
          <i className="fa-solid fa-circle-info" style={{ marginRight: '6px', color: 'var(--color-gold)' }}></i>
          <span>
            {isLogin 
              ? "Use your assigned credentials to proofread or review." 
              : "Registered users get read-only access by default."}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
