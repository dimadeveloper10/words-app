import type { JSX } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../../stores/auth';
import './AuthLayout.css';

export function AuthLayout(): JSX.Element {
  const token = useAuthStore((state) => state.token);
  if (token) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="auth-layout">
      <section className="auth-layout__intro" aria-labelledby="brand-title">
        <span className="brand">Words</span>
        <div>
          <p className="auth-layout__eyebrow">English → Ukrainian</p>
          <h1 id="brand-title" className="auth-layout__title">
            A few new words. A little more confidence.
          </h1>
          <p className="auth-layout__description">
            Learn English words, practise with lessons, and make progress one
            day at a time.
          </p>
        </div>
        <p className="auth-layout__footer">
          Your next chapter starts with a word.
        </p>
      </section>
      <section className="auth-layout__content" aria-label="Account access">
        <div className="auth-layout__card">
          <Outlet />
        </div>
      </section>
    </main>
  );
}
