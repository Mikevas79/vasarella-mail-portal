import { useState } from 'react';
import axios from 'axios';
import { User } from '../types/auth';

interface UserProfileProps {
  user: User;
  onLogout: () => Promise<void>;
  loading: boolean;
}

export function UserProfile({ user, onLogout, loading }: UserProfileProps) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [twofaEnabled, setTwofaEnabled] = useState<boolean>((user as any).twofa_enabled || false);

  const startSetup = async () => {
    const res = await axios.post('/api/2fa/setup/start', {}, { withCredentials: true });
    setQrCode(res.data.qrCodeDataUrl);
    setSecret(res.data.secret);
    setMessage('');
  };

  const verifySetup = async () => {
    try {
      const res = await axios.post(
        '/api/2fa/setup/verify',
        { code },
        { withCredentials: true }
      );
      setBackupCodes(res.data.backupCodes);
      setQrCode(null);
      setSecret(null);
      setCode('');
      setTwofaEnabled(true);
      setMessage('2FA enabled!');
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Invalid code');
    }
  };

  const disable2FA = async () => {
    await axios.post('/api/2fa/disable', {}, { withCredentials: true });
    setTwofaEnabled(false);
    setBackupCodes([]);
    setMessage('2FA disabled');
  };

  const regenerateBackupCodes = async () => {
    const res = await axios.post(
      '/api/2fa/backup-codes/regenerate',
      {},
      { withCredentials: true }
    );
    setBackupCodes(res.data.backupCodes);
  };

  return (
    <div className="user-profile">
      <h2>Vasarella Mail Portal</h2>

      <p className="user-email">
        Logged in as: <strong>{user.email}</strong>
      </p>

      <button onClick={onLogout} disabled={loading}>
        {loading ? 'Logging out...' : 'Logout'}
      </button>

      <hr />

      <h3>Account Security</h3>

      {!twofaEnabled && !qrCode && (
        <button onClick={startSetup}>Enable 2FA</button>
      )}

      {qrCode && (
        <div>
          <p>Scan this QR code with Google Authenticator / Authy:</p>
          <img src={qrCode} alt="2FA QR Code" style={{ width: 200 }} />
          <p>Or enter manually: <strong>{secret}</strong></p>

          <input
            type="text"
            placeholder="Enter 6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button onClick={verifySetup}>Verify</button>
        </div>
      )}

      {twofaEnabled && (
        <div>
          <p style={{ color: 'green' }}>2FA is enabled</p>

          <button onClick={disable2FA}>Disable 2FA</button>
          <button onClick={regenerateBackupCodes}>Regenerate Backup Codes</button>
        </div>
      )}

      {backupCodes.length > 0 && (
        <div>
          <h4>Backup Codes (save these!)</h4>
          <ul>
            {backupCodes.map((c, i) => (
              <li key={i}><code>{c}</code></li>
            ))}
          </ul>
        </div>
      )}

      {message && <p>{message}</p>}
    </div>
  );
}
