import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth';
import './AuthLayout.css';

export function AuthLayout() {
  const token = useAuthStore((state) => state.token);
  if (token) return <Navigate to="/" replace />;

  return (
    <main className="auth-layout">
      <section className="auth-intro" aria-labelledby="brand-title">
        <span className="brand">Words</span>
        <div>
          <p className="eyebrow">English → Ukrainian</p>
          <h1 id="brand-title">A few new words. A little more confidence.</h1>
          <p className="intro-description">
            Learn English words, practise with lessons, and make progress one
            day at a time.
          </p>
        </div>
        <p className="intro-footer">Your next chapter starts with a word.</p>
      </section>
      <section className="auth-content" aria-label="Account access">
        <div className="auth-card">
          <Outlet />
        </div>
      </section>
    </main>
  );
}
