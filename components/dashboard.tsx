'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { initializeStore } from '@/lib/store';
import type { UserRole } from '@/lib/types';
import LeadsPage from '@/components/pages/leads-page';
import ParticipantsPage from '@/components/pages/participants-page';
import ProgramsPage from '@/components/pages/programs-page';
import EnrollmentsPage from '@/components/pages/enrollments-page';
import PaymentsPage from '@/components/pages/payments-page';
import SupportPage from '@/components/pages/support-page';
import WorkflowsPage from '@/components/pages/workflows-page';

type PageType = 'leads' | 'participants' | 'programs' | 'enrollments' | 'payments' | 'support' | 'workflows';

interface DashboardProps {
  userRole: UserRole;
  userName: string;
  onLogout: () => void;
}

export default function Dashboard({ userRole, userName, onLogout }: DashboardProps) {
  const [currentPage, setCurrentPage] = useState<PageType>('leads');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    initializeStore();
  }, []);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const navItems = [
    { id: 'leads' as PageType, label: 'Leads', icon: '👥', roles: ['admin', 'program_manager'] },
    { id: 'participants' as PageType, label: 'Participants', icon: '📋', roles: ['admin', 'program_manager'] },
    { id: 'programs' as PageType, label: 'Programs', icon: '📚', roles: ['admin', 'program_manager'] },
    { id: 'enrollments' as PageType, label: 'Enrollments', icon: '✅', roles: ['admin', 'program_manager'] },
    { id: 'payments' as PageType, label: 'Payments', icon: '💳', roles: ['admin', 'program_manager'] },
    { id: 'support' as PageType, label: 'Support Tickets', icon: '🆘', roles: ['admin', 'support_agent'] },
    { id: 'workflows' as PageType, label: 'Workflows', icon: '⚡', roles: ['admin'] },
  ];

  const visibleNavItems = navItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-slate-50 flex flex-col">
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold text-blue-900">Iron Lady</h1>
          <p className="text-sm text-muted-foreground">Operations Hub</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {visibleNavItems.map((item) => (
            <Button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              variant={currentPage === item.id ? 'default' : 'ghost'}
              className="w-full justify-start gap-3 text-base"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Button>
          ))}
        </nav>

        <div className="p-4 border-t border-border space-y-3">
          <div className="px-3 py-2 text-sm">
            <p className="font-medium text-foreground">{userName}</p>
            <p className="text-xs text-muted-foreground capitalize">{userRole.replace('_', ' ')}</p>
          </div>
          <Button
            onClick={onLogout}
            variant="outline"
            className="w-full bg-transparent"
            size="sm"
          >
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-border bg-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground capitalize">
              {navItems.find(i => i.id === currentPage)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
            >
              🔄 Refresh
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">⋮</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Export Data</DropdownMenuItem>
                <DropdownMenuItem>Audit Logs</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {currentPage === 'leads' && <LeadsPage key={refreshTrigger} />}
          {currentPage === 'participants' && <ParticipantsPage key={refreshTrigger} />}
          {currentPage === 'programs' && <ProgramsPage key={refreshTrigger} />}
          {currentPage === 'enrollments' && <EnrollmentsPage key={refreshTrigger} />}
          {currentPage === 'payments' && <PaymentsPage key={refreshTrigger} />}
          {currentPage === 'support' && <SupportPage key={refreshTrigger} />}
          {currentPage === 'workflows' && <WorkflowsPage key={refreshTrigger} />}
        </main>
      </div>
    </div>
  );
}
