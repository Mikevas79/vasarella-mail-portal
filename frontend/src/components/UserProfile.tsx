import { User } from '../types/auth';

interface UserProfileProps {
  user: User;
  onLogout: () => Promise<void>;
  loading: boolean;
}

export function UserProfile({ user, onLogout, loading }: UserProfileProps) {
  return (
    <div className="user-profile">
      <h2>Vasarella Mail Portal</h2>
      <p className="user-email">Logged in as: <strong>{user.email}</strong></p>
      <button onClick={onLogout} disabled={loading}>
        {loading ? 'Logging out...' : 'Logout'}
      </button>
    </div>
  );
}