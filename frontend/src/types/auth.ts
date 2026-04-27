export interface User {
  id: string;
  email: string;
  isAdmin?: boolean;
}

export interface LoginResponse {
  message: string;
  user: User;
}

export interface AuthError {
  error: string;
}