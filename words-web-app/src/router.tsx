import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from './features/auth/AuthLayout';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { RequireAuth } from './features/auth/RequireAuth';
import { HomePage } from './features/home/HomePage';

export const router = createBrowserRouter([
  {
    element: <RequireAuth />,
    children: [{ path: '/', element: <HomePage /> }],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
