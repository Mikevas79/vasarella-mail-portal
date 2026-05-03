import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { requireAdmin } from '../middleware/admin';
import {
  getActiveDomains,
  getAllUsers,
  createMailUser,
  setMailUserActive,
  deleteMailUser,
} from '../db/mailUsers';

const router = Router();

// Apply admin middleware to all routes
router.use(requireAdmin);

// GET /api/admin/domains
router.get('/domains', async (req: Request, res: Response) => {
  try {
    const domains = await getActiveDomains();
    res.json({ domains });
  } catch (error) {
    console.error('Error fetching domains:', error);
    res.status(500).json({ error: 'Failed to fetch domains' });
  }
});

// GET /api/admin/users
router.get('/users', async (req: Request, res: Response) => {
  try {
    const users = await getAllUsers();
    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST /api/admin/users
router.post('/users', async (req: Request, res: Response) => {
  const { email, password, active } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (typeof password !== 'string' || password.length < 12) {
    return res.status(400).json({ error: 'Password must be at least 12 characters' });
  }

  const normalizedEmail = email.toLowerCase();
  const [localPart, domain] = normalizedEmail.split('@');

  if (!localPart || !domain) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    const user = await createMailUser(normalizedEmail, password, active !== false);
    res.status(201).json({ user });
  } catch (error: any) {
    if (error.message === 'Email already exists') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    if (error.message === 'Domain not found or inactive') {
      return res.status(400).json({ error: 'Domain not found or inactive' });
    }
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PATCH /api/admin/users/:id/active
router.patch('/users/:id/active', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { active } = req.body;

  if (!id || Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid user id' });
  }

  try {
    const updated = await setMailUserActive(id, !!active);

    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating user active status:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!id || Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid user id' });
  }

  try {
    const deleted = await deleteMailUser(id);

    if (!deleted) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
