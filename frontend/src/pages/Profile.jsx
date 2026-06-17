import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-ink">Profile</h1>

      <Card className="mt-6">
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-ink/50">Name</dt>
            <dd className="font-medium text-ink">{user.name}</dd>
          </div>
          <div>
            <dt className="text-ink/50">Email</dt>
            <dd className="font-medium text-ink">{user.email}</dd>
          </div>
          <div>
            <dt className="text-ink/50">Region</dt>
            <dd className="font-medium text-ink">{user.region}</dd>
          </div>
          <div>
            <dt className="text-ink/50">Daily budget</dt>
            <dd className="font-mono font-medium text-ink">{user.dailyBudgetKg} kg CO2e</dd>
          </div>
          <div>
            <dt className="text-ink/50">Member since</dt>
            <dd className="font-medium text-ink">{new Date(user.createdAt).toLocaleDateString()}</dd>
          </div>
        </dl>

        <Button variant="danger" onClick={handleLogout} className="mt-6 w-full">
          Log out
        </Button>
      </Card>
    </div>
  );
}
