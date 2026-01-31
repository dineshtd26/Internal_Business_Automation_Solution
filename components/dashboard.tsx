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
    <div className="flex h-screen bg-background text-foreground">
      {/* Modern Sidebar */}
      <aside className="w-72 border-r border-sidebar-border bg-sidebar flex flex-col shadow-lg">
        <div className="p-8 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sidebar-primary to-accent flex items-center justify-center text-sidebar-primary-foreground font-bold text-lg">
              IL
            </div>
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground">Iron Lady</h1>
              <p className="text-xs text-sidebar-accent-foreground opacity-75">Hub</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {visibleNavItems.map((item) => (
            <Button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              variant={currentPage === item.id ? 'default' : 'ghost'}
              className={`w-full justify-start gap-3 text-sm font-medium transition-all ${
                currentPage === item.id
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:bg-opacity-20'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Button>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border space-y-3 bg-black bg-opacity-20">
          <div className="px-3 py-3 rounded-lg bg-sidebar-accent bg-opacity-10">
            <p className="font-semibold text-sidebar-foreground text-sm">{userName}</p>
            <p className="text-xs text-sidebar-accent-foreground capitalize mt-1">{userRole.replace('_', ' ')}</p>
          </div>
          <Button
            onClick={onLogout}
            variant="outline"
            className="w-full text-sidebar-foreground border-sidebar-border hover:bg-sidebar-accent hover:bg-opacity-20 bg-transparent"
            size="sm"
          >
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Modern Header */}
        <header className="border-b border-border bg-card shadow-sm px-8 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground capitalize">
              {navItems.find(i => i.id === currentPage)?.label}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Manage and track all operations</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="gap-2 hover:bg-accent hover:text-accent-foreground bg-transparent"
            >
              <span>↻</span>
              Refresh
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="px-3">
                  ⋯
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="cursor-pointer">Export Data</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">Audit Logs</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">Settings</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-background">
          <div className="p-8">
            {currentPage === 'leads' && <LeadsPage key={refreshTrigger} />}
            {currentPage === 'participants' && <ParticipantsPage key={refreshTrigger} />}
            {currentPage === 'programs' && <ProgramsPage key={refreshTrigger} />}
            {currentPage === 'enrollments' && <EnrollmentsPage key={refreshTrigger} />}
            {currentPage === 'payments' && <PaymentsPage key={refreshTrigger} />}
            {currentPage === 'support' && <SupportPage key={refreshTrigger} />}
            {currentPage === 'workflows' && <WorkflowsPage key={refreshTrigger} />}
          </div>
        </main>
      </div>
    </div>
  );
}
