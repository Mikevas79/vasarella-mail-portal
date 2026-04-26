import bcrypt from 'bcrypt';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
}

// Mock user with pre-hashed password
// Password: "password123"
const mockPasswordHash = '$2b$10$9jR7AbsAhGEU3Id/3HKIiOdMPrBxi6BXxxS8XBO63mkN/a8TNUaeK';

const mockUser: User = {
  id: '1',
  email: 'admin@vasarella.com',
  passwordHash: mockPasswordHash,
};

export const users: Map<string, User> = new Map([['1', mockUser]]);

export async function findUserByEmail(email: string): Promise<User | undefined> {
  for (const user of users.values()) {
    if (user.email === email) {
      return user;
    }
  }
  return undefined;
}

export function userWithoutPassword(user: User): Omit<User, 'passwordHash'> {
  const { passwordHash, ...userWithout } = user;
  return userWithout;
}
