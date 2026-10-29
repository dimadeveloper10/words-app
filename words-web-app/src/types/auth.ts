export interface User {
  id: string;
  email: string;
  role: 'superadmin' | 'admin' | 'user';
  name: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResult {
  accessToken: string;
  user: User;
}
