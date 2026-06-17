import React, { useId } from 'react';

export default function Select({ label, options, error, className = '', ...rest }) {
  const id = useId();
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block font-display text-sm font-semibold text-ink">
        {label}
      </label>
      <select
        id={id}
        aria-describedby={errorId}
        aria-invalid={error ? 'true' : undefined}
        className={`w-full rounded-card border bg-white px-3.5 py-2.5 text-ink ${error ? 'border-alert' : 'border-line'}`}
        {...rest}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-xs font-medium text-alert">
          {error}
        </p>
      )}
    </div>
  );
}
