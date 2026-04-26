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

export function mailUserWithoutPassword(user: MailUser): PublicMailUser {
  const { password, ...publicUser } = user;
  return publicUser;
}
