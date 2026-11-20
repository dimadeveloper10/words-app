import type { JSX } from 'react';
import { Link } from 'react-router-dom';
import { getApiErrorMessage } from '../../lib/api';
import { AuthField } from './components/AuthField';
import { useLoginForm } from './useLoginForm';
import './AuthPage.css';

export function LoginPage(): JSX.Element {
  const { form, mutation, onSubmit } = useLoginForm();
  const { errors, isSubmitting } = form.formState;
  const pending = isSubmitting || mutation.isPending;

  return (
    <>
      <header className="auth-page__heading">
        <h2 className="auth-page__title">Welcome back</h2>
        <p className="auth-page__subtitle">Sign in to continue learning.</p>
      </header>
      <form
        className="auth-page__form"
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
          <p className="form-error" role="alert">
            {getApiErrorMessage(
              mutation.error,
              'Sign in failed. Please try again.',
            )}
          </p>
        )}
        <button
          className="button button--primary"
          type="submit"
          disabled={pending}
        >
          {pending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="auth-page__footer">
        Don’t have an account?{' '}
        <Link className="auth-page__footer-link" to="/register">
          Create account
        </Link>
      </p>
    </>
  );
}
