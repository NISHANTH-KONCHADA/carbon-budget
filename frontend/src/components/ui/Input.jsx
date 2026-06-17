import React, { useId } from 'react';

export default function Input({ label, error, hint, type = 'text', className = '', ...rest }) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block font-display text-sm font-semibold text-ink">
        {label}
      </label>
      <input
        id={id}
        type={type}
        aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
        aria-invalid={error ? 'true' : undefined}
        className={`w-full rounded-card border bg-white px-3.5 py-2.5 text-ink placeholder:text-ink/40 ${
          error ? 'border-alert' : 'border-line'
        }`}
        {...rest}
      />
      {hint && !error && (
        <p id={hintId} className="mt-1 text-xs text-ink/60">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-xs font-medium text-alert">
          {error}
        </p>
      )}
    </div>
  );
}
