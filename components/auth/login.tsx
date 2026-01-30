'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { UserRole } from '@/lib/types';

interface LoginProps {
  onLogin: (role: UserRole, name: string) => void;
}

const DEMO_USERS = [
  { name: 'Admin User', role: 'admin' as UserRole, description: 'Full system access' },
  { name: 'Program Manager', role: 'program_manager' as UserRole, description: 'Manage programs and enrollments' },
  { name: 'Support Agent', role: 'support_agent' as UserRole, description: 'Handle support tickets' },
];

export default function Login({ onLogin }: LoginProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [userName, setUserName] = useState('');
  const [showCustomName, setShowCustomName] = useState(false);

  const handleQuickLogin = (role: UserRole, defaultName: string) => {
    onLogin(role, defaultName);
  };

  const handleCustomLogin = () => {
    if (selectedRole && userName.trim()) {
      onLogin(selectedRole, userName);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center">Iron Lady Operations Hub</CardTitle>
          <CardDescription className="text-center pt-2">Select your role to access the dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            {DEMO_USERS.map((user) => (
              <Button
                key={user.role}
                onClick={() => handleQuickLogin(user.role, user.name)}
                variant="outline"
                className="w-full h-auto py-4 px-4 flex flex-col items-start justify-start hover:bg-blue-50 border-2"
              >
                <div className="font-semibold text-base">{user.name}</div>
                <div className="text-sm text-muted-foreground">{user.description}</div>
              </Button>
            ))}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-muted-foreground">or</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Custom User Name</Label>
              <Input
                type="text"
                placeholder="Enter your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Select Role</Label>
              <select
                value={selectedRole || ''}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="w-full mt-2 px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="">Choose a role...</option>
                {DEMO_USERS.map((user) => (
                  <option key={user.role} value={user.role}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            <Button
              onClick={handleCustomLogin}
              disabled={!selectedRole || !userName.trim()}
              className="w-full"
              size="lg"
            >
              Sign In
            </Button>
          </div>

          <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-muted-foreground">
              <strong>Demo Mode:</strong> Click any role above to quickly log in, or customize your user details and sign in with the form above.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
