import { createBrowserRouter, Navigate } from 'react-router-dom';

import { AppLayout } from '@/components/AppLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PublicOnlyRoute } from '@/components/PublicOnlyRoute';
import { LoginPage } from '@/features/auth/LoginPage';
import { RegisterPage } from '@/features/auth/RegisterPage';
import { TopicsPage } from '@/features/topics/TopicsPage';
import { UsersPage } from '@/features/users/UsersPage';
import { WordsPage } from '@/features/words/WordsPage.tsx';

export const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/users" replace /> },
          { path: '/users', element: <UsersPage /> },
          { path: '/words', element: <WordsPage /> },
          { path: '/topics', element: <TopicsPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
