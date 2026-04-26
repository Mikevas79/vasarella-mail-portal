export interface User {
  id: string;
  email: string;
}

export interface LoginResponse {
  message: string;
  user: User;
}

export interface AuthError {
  error: string;
}