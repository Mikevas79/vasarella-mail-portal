import { useState } from 'react';

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onVerify2fa: (code: string) => Promise<void>;
  requires2fa: boolean;
  loading: boolean;
  error: string | null;
}

export function LoginForm({ onLogin, onVerify2fa, requires2fa, loading, error }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (requires2fa) {
      await onVerify2fa(code);
      return;
    }

    await onLogin(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <h2>{requires2fa ? 'Two-Factor Authentication' : 'Login'}</h2>

      {error && <div className="error-message">{error}</div>}

      {!requires2fa ? (
        <>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="test@vasarella.com"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              disabled={loading}
              required
            />
          </div>
        </>
      ) : (
        <div className="form-group">
          <label htmlFor="code">2FA Code or Backup Code:</label>
          <input
            id="code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456 or ABCD-EFGH"
            disabled={loading}
            required
            autoFocus
          />
        </div>
      )}

      <button type="submit" disabled={loading}>
        {loading ? 'Please wait...' : requires2fa ? 'Verify' : 'Login'}
      </button>
    </form>
  );
}
