export interface MailUser {
  id: number;
  domain_id: number;
  email: string;
  password: string;
  maildir: string;
}

export type PublicMailUser = Omit<MailUser, 'password'>;
