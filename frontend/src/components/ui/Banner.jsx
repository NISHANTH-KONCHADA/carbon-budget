import React from 'react';

const TONE_STYLES = {
  error: 'bg-alert-light text-alert border-alert/30',
  success: 'bg-primary/10 text-primary-dark border-primary/30',
  info: 'bg-slate/10 text-slate border-slate/30',
};

export default function Banner({ tone = 'info', children, className = '' }) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`rounded-card border px-4 py-3 text-sm font-medium ${TONE_STYLES[tone]} ${className}`}
    >
      {children}
    </div>
  );
}
