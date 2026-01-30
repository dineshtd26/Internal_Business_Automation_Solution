'use client';

import { useState } from 'react';
import Dashboard from '@/components/dashboard';
import Login from '@/components/auth/login';
import type { UserRole } from '@/lib/types';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userName, setUserName] = useState('');

  const handleLogin = (role: UserRole, name: string) => {
    setUserRole(role);
    setUserName(name);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setUserName('');
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Dashboard 
      userRole={userRole!} 
      userName={userName}
      onLogout={handleLogout}
    />
  );
}
