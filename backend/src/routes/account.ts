import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { findMailUserById, updateMailUserPassword } from '../db/mailUsers';
import { verifyDovecotPassword } from '../utils/verifyDovecotPassword';

const router = Router();

router.post('/change-password', async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }

  if (typeof newPassword !== 'string' || newPassword.length < 12) {
    return res.status(400).json({ error: 'New password must be at least 12 characters' });
  }

  if (!req.session.user?.id) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const user = await findMailUserById(req.session.user.id);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const verification = await verifyDovecotPassword(currentPassword, user.password);
  if (!verification.success) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  const storedPassword = `{BLF-CRYPT}${newHash}`;

  const updated = await updateMailUserPassword(user.id, storedPassword);
  if (!updated) {
    return res.status(500).json({ error: 'Failed to update password' });
  }

  res.json({ message: 'Password changed successfully' });
});

export default router;
