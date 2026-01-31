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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-card to-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
      </div>

      <div className="relative w-full max-w-2xl">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding */}
          <div className="hidden md:flex flex-col justify-center space-y-8">
            <div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-2xl mb-6 shadow-lg">
                IL
              </div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Iron Lady</h1>
              <p className="text-xl text-muted-foreground">Operations Hub</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary bg-opacity-10 flex items-center justify-center text-primary font-bold">✓</div>
                <div>
                  <h3 className="font-semibold text-foreground">Complete Control</h3>
                  <p className="text-sm text-muted-foreground">Manage all operations from one dashboard</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-accent bg-opacity-10 flex items-center justify-center text-accent font-bold">✓</div>
                <div>
                  <h3 className="font-semibold text-foreground">Real-time Tracking</h3>
                  <p className="text-sm text-muted-foreground">Monitor all activities and metrics live</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-secondary bg-opacity-10 flex items-center justify-center text-secondary font-bold">✓</div>
                <div>
                  <h3 className="font-semibold text-foreground">Smart Automation</h3>
                  <p className="text-sm text-muted-foreground">Automated workflows for efficiency</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <Card className="shadow-2xl border-0">
            <CardHeader className="space-y-3 pb-8">
              <CardTitle className="text-2xl font-bold">Access Dashboard</CardTitle>
              <CardDescription>Select your role to get started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                {DEMO_USERS.map((user) => (
                  <button
                    key={user.role}
                    onClick={() => handleQuickLogin(user.role, user.name)}
                    className="w-full group relative overflow-hidden rounded-xl p-4 text-left transition-all duration-300 border border-border hover:border-primary hover:shadow-md bg-card hover:bg-primary hover:bg-opacity-5"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
                    <div className="relative">
                      <div className="font-semibold text-foreground group-hover:text-primary transition-colors">{user.name}</div>
                      <div className="text-sm text-muted-foreground group-hover:text-foreground transition-colors mt-1">{user.description}</div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-card text-muted-foreground font-medium">or customize</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold text-foreground">Your Name</Label>
                  <Input
                    type="text"
                    placeholder="Enter your name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="mt-2 border-border bg-background"
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold text-foreground">Select Role</Label>
                  <select
                    value={selectedRole || ''}
                    onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                    className="w-full mt-2 px-4 py-2.5 border border-border rounded-lg bg-background text-foreground transition-all hover:border-primary"
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
                  className="w-full bg-gradient-to-r from-primary to-accent text-white font-semibold py-6 hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                  size="lg"
                >
                  Sign In
                </Button>
              </div>

              <div className="p-4 bg-primary bg-opacity-5 rounded-lg border border-primary border-opacity-20">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">Demo Mode Enabled.</span> Click any role card to quickly access the dashboard, or enter custom details above.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
