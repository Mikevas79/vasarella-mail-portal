import { useEffect, useState } from 'react';

interface Domain {
  id: number;
  name: string;
}

interface MailUser {
  id: number;
  domain_id: number;
  email: string;
  maildir: string;
  active: number;
}

export function AdminPanel() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [users, setUsers] = useState<MailUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [active, setActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [domainsRes, usersRes] = await Promise.all([
        fetch('/api/admin/domains', { credentials: 'include' }),
        fetch('/api/admin/users', { credentials: 'include' }),
      ]);

      if (!domainsRes.ok || !usersRes.ok) {
        throw new Error('Failed to load admin data');
      }

      const domainsData = (await domainsRes.json()) as { domains: Domain[] };
      const usersData = (await usersRes.json()) as { users: MailUser[] };

      setDomains(domainsData.domains);
      setUsers(usersData.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!email || !password) {
      setMessage({ type: 'error', text: 'Email and password are required' });
      return;
    }

    if (password.length < 12) {
      setMessage({ type: 'error', text: 'Password must be at least 12 characters' });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, active }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'User created successfully' });
        setEmail('');
        setPassword('');
        setActive(true);
        // Reload user list
        loadData();
      } else {
        const errorData = (await response.json()) as { error: string };
        const errorMessage = errorData.error || 'Failed to create user';
        setMessage({ type: 'error', text: errorMessage });
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to create user',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="admin-panel"><p>Loading...</p></div>;
  }

  if (error) {
    return (
      <div className="admin-panel">
        <div className="message error">{error}</div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <h2>Admin Panel</h2>

      {/* Domains List */}
      <div className="admin-section">
        <h3>Available Domains</h3>
        {domains.length > 0 ? (
          <ul className="domains-list">
            {domains.map((domain) => (
              <li key={domain.id}>{domain.name}</li>
            ))}
          </ul>
        ) : (
          <p>No active domains available</p>
        )}
      </div>

      {/* Create User Form */}
      <div className="admin-section">
        <h3>Create New Mailbox User</h3>
        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}
        <form onSubmit={handleCreateUser} className="create-user-form">
          <div className="form-group">
            <label htmlFor="email">Email Address:</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
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
              disabled={submitting}
              required
              minLength={12}
            />
            <small>Minimum 12 characters</small>
          </div>
          <div className="form-group">
            <label htmlFor="active">
              <input
                id="active"
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                disabled={submitting}
              />
              Active
            </label>
          </div>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create User'}
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="admin-section">
        <h3>Existing Mailbox Users</h3>
        {users.length > 0 ? (
          <div className="table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Maildir</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.email}</td>
                    <td>{user.maildir}</td>
                    <td>{user.active ? 'Active' : 'Inactive'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No mailbox users found</p>
        )}
      </div>
    </div>
  );
}
