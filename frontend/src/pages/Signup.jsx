import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Banner from '../components/ui/Banner';
import Card from '../components/ui/Card';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const result = await signup(form.name, form.email, form.password);
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
        <h1 className="font-display text-2xl font-bold text-ink">Create your account</h1>
        <p className="mt-1 text-sm text-ink/60">Start tracking in under a minute — no credit card, no spam.</p>

        {error && (
          <Banner tone="error" className="mt-4">
            {error}
          </Banner>
        )}

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
          <Input label="Name" name="name" autoComplete="name" required value={form.name} onChange={handleChange} />
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
            autoComplete="new-password"
            required
            minLength={8}
            hint="At least 8 characters."
            value={form.password}
            onChange={handleChange}
          />
          <Button type="submit" loading={submitting} className="mt-2 w-full">
            Create account
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-ink/70">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary underline">
            Log in
          </Link>
        </p>
      </Card>
    </div>
  );
}
