import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from './features/auth/AuthLayout';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { RequireAuth } from './features/auth/RequireAuth';
import { AppLayout } from './components/AppLayout';
import { HomePage } from './features/home/HomePage';
import { LessonPage } from './features/lessons/LessonPage';
import { LessonsPage } from './features/lessons/LessonsPage';
import { LessonWordsPage } from './features/words/LessonWordsPage';
import { TopicPage } from './features/topics/TopicPage';
import { TopicsPage } from './features/topics/TopicsPage';

export const router = createBrowserRouter([
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <HomePage /> },
          { path: '/topics', element: <TopicsPage /> },
          { path: '/topics/:topicId', element: <TopicPage /> },
          { path: '/lessons', element: <LessonsPage /> },
          { path: '/lessons/:lessonId', element: <LessonPage /> },
          { path: '/lessons/:lessonId/words', element: <LessonWordsPage /> },
        ],
      },
    ],
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
