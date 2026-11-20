import type { JSX } from 'react';
import { Link } from 'react-router-dom';
import { getApiErrorMessage } from '../../lib/api';
import { AuthField } from './components/AuthField';
import { useRegisterForm } from './useRegisterForm';
import './AuthPage.css';

export function RegisterPage(): JSX.Element {
  const { form, mutation, onSubmit } = useRegisterForm();
  const { errors, isSubmitting } = form.formState;
  const pending = isSubmitting || mutation.isPending;

  return (
    <>
      <header className="auth-page__heading">
        <h2 className="auth-page__title">Create your account</h2>
        <p className="auth-page__subtitle">
          Start building your English vocabulary.
        </p>
      </header>
      <form
        className="auth-page__form"
        noValidate
        onSubmit={(event) => void onSubmit(event)}
        aria-busy={pending}
      >
        <AuthField
          id="register-name"
          label="Name (optional)"
          autoComplete="name"
          placeholder="Your name"
          disabled={pending}
          error={errors.name?.message}
          {...form.register('name')}
        />
        <AuthField
          id="register-email"
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
          id="register-password"
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="Create a password"
          minLength={8}
          hint="Use at least 8 characters."
          required
          disabled={pending}
          error={errors.password?.message}
          {...form.register('password')}
        />
        {mutation.isError && (
          <p className="form-error" role="alert">
            {getApiErrorMessage(
              mutation.error,
              'Registration failed. Please try again.',
            )}
          </p>
        )}
        <button
          className="button button--primary"
          type="submit"
          disabled={pending}
        >
          {pending ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="auth-page__footer">
        Already have an account?{' '}
        <Link className="auth-page__footer-link" to="/login">
          Sign in
        </Link>
      </p>
    </>
  );
}
