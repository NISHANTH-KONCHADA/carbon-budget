import React from 'react';

const VARIANTS = {
  primary: 'bg-primary text-white hover:bg-primary-dark focus-visible:bg-primary-dark',
  secondary: 'bg-white text-primary border border-primary hover:bg-primary/5',
  ghost: 'bg-transparent text-ink hover:bg-ink/5',
  danger: 'bg-alert text-white hover:bg-alert/90',
};

export default function Button({
  children,
  variant = 'primary',
  type = 'button',
  disabled = false,
  loading = false,
  className = '',
  as: Tag = 'button',
  ...rest
}) {
  const isNativeButton = Tag === 'button';

  return (
    <Tag
      type={isNativeButton ? type : undefined}
      disabled={isNativeButton ? disabled || loading : undefined}
      aria-busy={loading || undefined}
      aria-disabled={!isNativeButton && (disabled || loading) ? 'true' : undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-card px-4 py-2.5 font-display text-sm font-semibold tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {loading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
      )}
      {children}
    </Tag>
  );
}
