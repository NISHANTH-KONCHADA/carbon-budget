import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../ui/Spinner';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) return <Spinner label="Loading your account" />;
  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
}
