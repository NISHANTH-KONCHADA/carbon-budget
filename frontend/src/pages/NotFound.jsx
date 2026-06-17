import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <p className="font-mono text-sm text-ink/50">404</p>
      <h1 className="mt-2 font-display text-2xl font-bold text-ink">Page not found</h1>
      <p className="mt-2 text-sm text-ink/60">The page you're looking for doesn't exist or may have moved.</p>
      <Button as={Link} to="/" className="mt-6">
        Back home
      </Button>
    </div>
  );
}
