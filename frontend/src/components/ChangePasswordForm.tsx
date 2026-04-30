import { useState } from 'react';
import { User } from '../types/auth';

interface ChangePasswordFormProps {
  user: User;
}

export function ChangePasswordForm({ user: _user }: ChangePasswordFormProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword.length < 12) {
      setMessage({ type: 'error', text: 'New password must be at least 12 characters' });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/account/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Password changed successfully' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || 'Could not change password';
        setMessage({ type: 'error', text: errorMessage });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Could not change password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-form">
      <h3>Change Password</h3>
      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="currentPassword">Current Password:</label>
          <input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={loading}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="newPassword">New Password:</label>
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={loading}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmNewPassword">Confirm New Password:</label>
          <input
            id="confirmNewPassword"
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            disabled={loading}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Changing...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
}
