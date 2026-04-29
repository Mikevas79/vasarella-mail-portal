import bcrypt from 'bcrypt';
import crypt from 'unix-crypt-td-js';

export interface VerifyDovecotPasswordResult {
  success: boolean;
  unsupported: boolean;
}

export async function verifyDovecotPassword(
  plainPassword: string,
  storedHash: string
): Promise<VerifyDovecotPasswordResult> {
  if (storedHash.startsWith('{BLF-CRYPT}')) {
    let strippedHash = storedHash.replace('{BLF-CRYPT}', '');

    // Dovecot BLF-CRYPT commonly uses $2y$.
    // Node bcrypt expects $2b$.
    if (strippedHash.startsWith('$2y$')) {
      strippedHash = '$2b$' + strippedHash.slice(4);
    }

    const success = await bcrypt.compare(plainPassword, strippedHash);
    return { success, unsupported: false };
  }

  if (storedHash.startsWith('{SHA512-CRYPT}')) {
    const strippedHash = storedHash.replace('{SHA512-CRYPT}', '');
    const success = crypt(plainPassword, strippedHash) === strippedHash;
    return { success, unsupported: false };
  }

  return { success: false, unsupported: true };
}
