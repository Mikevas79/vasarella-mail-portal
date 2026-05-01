import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import * as plist from 'plist';
import { findMailUserById, updateMailUserPassword } from '../db/mailUsers';
import { verifyDovecotPassword } from '../utils/verifyDovecotPassword';

const router = Router();
const TOKEN_TTL_MS = 5 * 60 * 1000;
const TOKEN_SECRET = process.env.SESSION_SECRET || 'dev-secret-key-change-in-production';

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.user?.id) return res.status(401).json({ error: 'Not authenticated' });
  next();
}

function signProfileToken(email: string) {
  const payload = Buffer.from(JSON.stringify({ email, exp: Date.now() + TOKEN_TTL_MS })).toString('base64url');
  const sig = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifyProfileToken(token?: string) {
  if (!token || !token.includes('.')) return null;
  const [payload, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64url');

  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;

  const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { email: string; exp: number };
  if (!data.email || Date.now() > data.exp) return null;

  return data.email;
}

function sendIosProfile(email: string, res: Response) {
  const profile = {
    PayloadContent: [
      {
        EmailAccountDescription: 'Vasarella Mail',
        EmailAccountName: email,
        EmailAccountType: 'EmailTypeIMAP',
        EmailAddress: email,
        IncomingMailServerAuthentication: 'EmailAuthPassword',
        IncomingMailServerHostName: 'mail.vasarella.com',
        IncomingMailServerPortNumber: 993,
        IncomingMailServerUseSSL: true,
        IncomingMailServerUsername: email,
        OutgoingMailServerAuthentication: 'EmailAuthPassword',
        OutgoingMailServerHostName: 'mail.vasarella.com',
        OutgoingMailServerPortNumber: 587,
        OutgoingMailServerUseSSL: true,
        OutgoingMailServerUsername: email,
        OutgoingPasswordSameAsIncomingPassword: true,
        PayloadDescription: 'Configures Vasarella Mail account',
        PayloadDisplayName: 'Vasarella Mail',
        PayloadIdentifier: `com.vasarella.mail.${email}`,
        PayloadType: 'com.apple.mail.managed',
        PayloadUUID: crypto.randomUUID(),
        PayloadVersion: 1,
      },
    ],
    PayloadDisplayName: 'Vasarella Mail Setup',
    PayloadIdentifier: `com.vasarella.mailprofile.${email}`,
    PayloadRemovalDisallowed: false,
    PayloadType: 'Configuration',
    PayloadUUID: crypto.randomUUID(),
    PayloadVersion: 1,
  };

  res.setHeader('Content-Type', 'application/x-apple-aspen-config');
  res.setHeader('Content-Disposition', 'inline; filename="vasarella-mail.mobileconfig"');
  res.send(plist.build(profile));
}

router.post('/change-password', requireAuth, async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }

  if (typeof newPassword !== 'string' || newPassword.length < 12) {
    return res.status(400).json({ error: 'New password must be at least 12 characters' });
  }

  const user = await findMailUserById(req.session.user!.id);
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });

  const verification = await verifyDovecotPassword(currentPassword, user.password);
  if (!verification.success) return res.status(401).json({ error: 'Invalid email or password' });

  const newHash = await bcrypt.hash(newPassword, 10);
  const storedPassword = `{BLF-CRYPT}${newHash.replace('$2b$', '$2y$')}`;

  const updated = await updateMailUserPassword(user.id, storedPassword);
  if (!updated) return res.status(500).json({ error: 'Failed to update password' });

  res.json({ message: 'Password changed successfully' });
});

router.get('/ios-profile-link', requireAuth, (req: Request, res: Response) => {
  const token = signProfileToken(req.session.user!.email);
  res.json({ url: `/api/account/ios-profile.mobileconfig?token=${encodeURIComponent(token)}` });
});

router.get('/ios-profile.mobileconfig', (req: Request, res: Response) => {
  const email = verifyProfileToken(String(req.query.token || ''));
  if (!email) return res.status(401).json({ error: 'Invalid or expired profile link' });
  sendIosProfile(email, res);
});

export default router;
