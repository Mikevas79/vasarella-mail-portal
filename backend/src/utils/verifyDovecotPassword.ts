import bcrypt from 'bcrypt';

export interface VerifyDovecotPasswordResult {
  success: boolean;
  unsupported: boolean;
}

export async function verifyDovecotPassword(
  plainPassword: string,
  storedHash: string
): Promise<VerifyDovecotPasswordResult> {
  if (storedHash.startsWith('{BLF-CRYPT}')) {
    const strippedHash = storedHash.replace('{BLF-CRYPT}', '');
    const success = await bcrypt.compare(plainPassword, strippedHash);
    return { success, unsupported: false };
  }

  if (storedHash.startsWith('{SHA512-CRYPT}')) {
    return { success: false, unsupported: true };
  }

  if (storedHash.startsWith('{')) {
    return { success: false, unsupported: true };
  }

  return { success: false, unsupported: true };
}
