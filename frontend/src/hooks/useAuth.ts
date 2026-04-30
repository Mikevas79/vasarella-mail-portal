import { useState, useCallback } from 'react';
import { User, LoginResponse, AuthError } from '../types/auth';

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  requires2fa: boolean;
  login: (email: string, password: string) => Promise<void>;
  verify2fa: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requires2fa, setRequires2fa] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError((data as AuthError).error || 'Login failed');
        return;
      }

      if (data.requires2fa) {
        setRequires2fa(true);
        setUser(null);
        return;
      }

      setUser((data as LoginResponse).user);
      setRequires2fa(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const verify2fa = useCallback(async (code: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError((data as AuthError).error || 'Invalid 2FA code');
        return;
      }

      setUser((data as LoginResponse).user);
      setRequires2fa(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        setError('Logout failed');
        return;
      }

      setUser(null);
      setRequires2fa(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        setUser(null);
        return;
      }

      const data = (await response.json()) as { user: User };
      setUser(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    error,
    requires2fa,
    login,
    verify2fa,
    logout,
    checkAuth,
  };
}
