import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Banner from '../components/ui/Banner';
import Card from '../components/ui/Card';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const result = await login(form.email, form.password);
    setSubmitting(false);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-10">
      <Card>
        <h1 className="font-display text-2xl font-bold text-ink">Welcome back</h1>
        <p className="mt-1 text-sm text-ink/60">Log in to see your footprint and today's insights.</p>

        {error && (
          <Banner tone="error" className="mt-4">
            {error}
          </Banner>
        )}

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={handleChange}
          />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={form.password}
            onChange={handleChange}
          />
          <Button type="submit" loading={submitting} className="mt-2 w-full">
            Log in
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-ink/70">
          New here?{' '}
          <Link to="/signup" className="font-semibold text-primary underline">
            Create an account
          </Link>
        </p>
      </Card>
    </div>
  );
}
