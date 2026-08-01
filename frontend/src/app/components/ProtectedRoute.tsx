import { Navigate } from 'react-router-dom';
import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;

  const isAllowed = Boolean(token && user && (user.role === 'admin' || user.role === 'researcher'));

  if (!isAllowed) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
