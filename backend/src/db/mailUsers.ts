import bcrypt from 'bcrypt';
import { pool } from '../config/database';
import { MailUser, PublicMailUser } from '../types/mailUser';

export async function findMailUserByEmail(email: string): Promise<MailUser | null> {
  const [rows] = await pool.execute(
    'SELECT id, domain_id, email, password, maildir FROM users WHERE email = ? AND active = 1 LIMIT 1',
    [email]
  );

  const result = rows as MailUser[];
  return result.length > 0 ? result[0] : null;
}

export async function findMailUserById(id: number): Promise<MailUser | null> {
  const [rows] = await pool.execute(
    'SELECT id, domain_id, email, password, maildir FROM users WHERE id = ? AND active = 1 LIMIT 1',
    [id]
  );

  const result = rows as MailUser[];
  return result.length > 0 ? result[0] : null;
}

export async function updateMailUserPassword(id: number, password: string): Promise<boolean> {
  const [result] = await pool.execute(
    'UPDATE users SET password = ? WHERE id = ? AND active = 1',
    [password, id]
  );

  const info = result as { affectedRows?: number };
  return !!info.affectedRows;
}

export async function getActiveDomains(): Promise<{ id: number; name: string }[]> {
  const [rows] = await pool.execute(
    'SELECT id, name FROM domains WHERE active = 1'
  );

  return rows as { id: number; name: string }[];
}

export async function getAllUsers(): Promise<PublicMailUser[]> {
  const [rows] = await pool.execute(
    'SELECT id, domain_id, email, maildir, active FROM users'
  );

  return (rows as MailUser[]).map(mailUserWithoutPassword);
}

export async function createMailUser(email: string, password: string, active: boolean): Promise<PublicMailUser> {
  const [localPart, domain] = email.split('@');

  // Check for duplicate email
  const [existing] = await pool.execute(
    'SELECT id FROM users WHERE email = ?',
    [email]
  );
  if ((existing as any[]).length > 0) {
    throw new Error('Email already exists');
  }

  // Validate domain exists and is active
  const [domainRows] = await pool.execute(
    'SELECT id FROM domains WHERE name = ? AND active = 1',
    [domain]
  );
  if ((domainRows as any[]).length === 0) {
    throw new Error('Domain not found or inactive');
  }

  const domainId = (domainRows as { id: number }[])[0].id;

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  const storedPassword = `{BLF-CRYPT}${hashedPassword}`;

  // Create maildir
  const maildir = `${domain}/${localPart}/`;

  // Insert user
  const [result] = await pool.execute(
    'INSERT INTO users (domain_id, email, password, maildir, active) VALUES (?, ?, ?, ?, ?)',
    [domainId, email, storedPassword, maildir, active]
  );

  const insertId = (result as { insertId: number }).insertId;

  return {
    id: insertId,
    domain_id: domainId,
    email,
    maildir,
    active,
  };
}

export function mailUserWithoutPassword(user: MailUser): PublicMailUser {
  const { password, ...publicUser } = user;
  return publicUser;
}
