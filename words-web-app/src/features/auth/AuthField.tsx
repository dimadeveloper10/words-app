import type { ComponentPropsWithRef } from 'react';

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
}: AuthFieldProps) {
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <input
        {...props}
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error || hint ? `${id}-description` : undefined}
      />
      {(error || hint) && (
        <p
          id={`${id}-description`}
          className={error ? 'field-error' : 'field-hint'}
          role={error ? 'alert' : undefined}
        >
          {error || hint}
        </p>
      )}
    </div>
  );
}
