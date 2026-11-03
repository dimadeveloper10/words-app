import { Link } from 'react-router-dom';
import { getApiErrorMessage } from '../../lib/api';
import { AuthField } from './AuthField';
import { useAuthForm } from './useAuthForm';
import './AuthPage.css';

export function LoginPage() {
  const { form, mutation, onSubmit } = useAuthForm('login');
  const { errors, isSubmitting } = form.formState;
  const pending = isSubmitting || mutation.isPending;

  return (
    <>
      <header className="auth-heading">
        <h2>Welcome back</h2>
        <p>Sign in to continue learning.</p>
      </header>
      <form
        className="auth-form"
        noValidate
        onSubmit={(event) => void onSubmit(event)}
        aria-busy={pending}
      >
        <AuthField
          id="login-email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          disabled={pending}
          error={errors.email?.message}
          {...form.register('email')}
        />
        <AuthField
          id="login-password"
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          minLength={8}
          required
          disabled={pending}
          error={errors.password?.message}
          {...form.register('password')}
        />
        {mutation.isError && (
          <p className="field-error" role="alert">
            {getApiErrorMessage(
              mutation.error,
              'Sign in failed. Please try again.',
            )}
          </p>
        )}
        <button className="auth-submit" type="submit" disabled={pending}>
          {pending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="auth-footer">
        Don’t have an account? <Link to="/register">Create account</Link>
      </p>
    </>
  );
}
