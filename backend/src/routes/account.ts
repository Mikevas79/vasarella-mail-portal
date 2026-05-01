import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import * as plist from 'plist';
import { findMailUserById, updateMailUserPassword } from '../db/mailUsers';
import { verifyDovecotPassword } from '../utils/verifyDovecotPassword';

const router = Router();

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.user?.id) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  next();
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
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const verification = await verifyDovecotPassword(currentPassword, user.password);
  if (!verification.success) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  const dovecotHash = newHash.replace('$2b$', '$2y$');
  const storedPassword = `{BLF-CRYPT}${dovecotHash}`;

  const updated = await updateMailUserPassword(user.id, storedPassword);
  if (!updated) {
    return res.status(500).json({ error: 'Failed to update password' });
  }

  res.json({ message: 'Password changed successfully' });
});

const iosProfileHandler = async (req: Request, res: Response) => {
  const email = req.session.user!.email;

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

  const xml = plist.build(profile);

  res.setHeader('Content-Type', 'application/x-apple-aspen-config');
  res.setHeader('Content-Disposition', 'inline; filename="vasarella-mail.mobileconfig"');
  res.send(xml);
};

router.get('/ios-profile', requireAuth, iosProfileHandler);
router.get('/ios-profile.mobileconfig', requireAuth, iosProfileHandler);

export default router;
