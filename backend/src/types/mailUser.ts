export interface MailUser {
  id: number;
  domain_id: number;
  email: string;
  password: string;
  maildir: string;
  active?: boolean;
  twofa_enabled?: boolean;
  twofa_secret?: string | null;
}

export type PublicMailUser = Omit<MailUser, 'password' | 'twofa_secret'>;
