export type Role = 'superadmin' | 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  role: Role;
  name: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResult {
  accessToken: string;
  user: User;
}
