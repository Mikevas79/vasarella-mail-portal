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

export function mailUserWithoutPassword(user: MailUser): PublicMailUser {
  const { password, ...publicUser } = user;
  return publicUser;
}
