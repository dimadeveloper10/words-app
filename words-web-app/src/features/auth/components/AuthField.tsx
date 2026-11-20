import type { ComponentPropsWithRef, JSX } from 'react';
import './AuthField.css';

interface AuthFieldProps extends ComponentPropsWithRef<'input'> {
  id: string;
  label: string;
  error?: string;
  hint?: string;
}

export function AuthField({
  id,
  label,
  error,
  hint,
  ...props
}: AuthFieldProps): JSX.Element {
  return (
    <div className="auth-field">
      <label className="auth-field__label" htmlFor={id}>
        {label}
      </label>
      <input
        {...props}
        className="auth-field__input"
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error || hint ? `${id}-description` : undefined}
      />
      {(error || hint) && (
        <p
          id={`${id}-description`}
          className={error ? 'form-error' : 'auth-field__hint'}
          role={error ? 'alert' : undefined}
        >
          {error || hint}
        </p>
      )}
    </div>
  );
}
