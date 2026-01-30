import type { Lead, Participant, Program, Enrollment, Payment, SupportTicket, AuditLog } from './types';

// Mock data store - in production would use a database
let leads: Lead[] = [];
let participants: Participant[] = [];
let programs: Program[] = [];
let enrollments: Enrollment[] = [];
let payments: Payment[] = [];
let supportTickets: SupportTicket[] = [];
let auditLogs: AuditLog[] = [];

// Initialize with sample data
export function initializeStore() {
  programs = [
    {
      id: '1',
      title: 'Leadership Essentials',
      description: 'A comprehensive program for developing leadership skills',
      price: 5000,
      schedule: 'Monthly cohorts',
      capacity: 30,
      enrolledCount: 12,
      createdAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      title: 'Business Development',
      description: 'Master business growth strategies',
      price: 7500,
      schedule: 'Quarterly cohorts',
      capacity: 20,
      enrolledCount: 8,
      createdAt: new Date('2024-02-01'),
    },
    {
      id: '3',
      title: 'Tech Innovation',
      description: 'Latest tech trends and applications',
      price: 6000,
      schedule: 'Bi-weekly sessions',
      capacity: 25,
      enrolledCount: 15,
      createdAt: new Date('2024-03-10'),
    },
  ];

  leads = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      phone: '+91-9876543210',
      source: 'web',
      programInterest: 'Leadership Essentials',
      status: 'new',
      callNotes: '',
      createdAt: new Date('2024-12-20'),
    },
    {
      id: '2',
      name: 'Rajesh Kumar',
      email: 'rajesh@example.com',
      phone: '+91-9876543211',
      source: 'whatsapp',
      programInterest: 'Business Development',
      status: 'contacted',
      callNotes: 'Interested, follow up next week',
      createdAt: new Date('2024-12-19'),
    },
  ];

  participants = [
    {
      id: '1',
      leadId: '1',
      uniqueId: 'P-2024-001',
      name: 'Priya Sharma',
      email: 'priya@example.com',
      phone: '+91-9876543212',
      programEnrolled: 'Leadership Essentials',
      cohort: 'Jan 2024',
      progressStatus: 'in_progress',
      certificateIssued: false,
      enrollmentDate: new Date('2024-01-10'),
    },
  ];

  payments = [
    {
      id: '1',
      participantId: '1',
      amount: 5000,
      method: 'credit_card',
      paymentDate: new Date('2024-01-09'),
      transactionId: 'TXN-2024-001',
      status: 'completed',
    },
  ];

  supportTickets = [
    {
      id: '1',
      linkedEntityType: 'participant',
      linkedEntityId: '1',
      linkedEntityName: 'Priya Sharma',
      issueType: 'technical',
      status: 'open',
      resolutionNotes: '',
      createdAt: new Date('2024-12-18'),
      updatedAt: new Date('2024-12-18'),
    },
  ];
}

// Leads operations
export const leadsStore = {
  getAll: () => [...leads],
  getById: (id: string) => leads.find(l => l.id === id),
  create: (lead: Omit<Lead, 'id' | 'createdAt'>) => {
    const newLead: Lead = {
      ...lead,
      id: `lead-${Date.now()}`,
      createdAt: new Date(),
    };
    leads.push(newLead);
    return newLead;
  },
  update: (id: string, updates: Partial<Lead>) => {
    const index = leads.findIndex(l => l.id === id);
    if (index !== -1) {
      leads[index] = { ...leads[index], ...updates };
      return leads[index];
    }
    return null;
  },
  delete: (id: string) => {
    leads = leads.filter(l => l.id !== id);
  },
};

// Participants operations
export const participantsStore = {
  getAll: () => [...participants],
  getById: (id: string) => participants.find(p => p.id === id),
  create: (participant: Omit<Participant, 'id'>) => {
    const newParticipant: Participant = {
      ...participant,
      id: `participant-${Date.now()}`,
    };
    participants.push(newParticipant);
    return newParticipant;
  },
  update: (id: string, updates: Partial<Participant>) => {
    const index = participants.findIndex(p => p.id === id);
    if (index !== -1) {
      participants[index] = { ...participants[index], ...updates };
      return participants[index];
    }
    return null;
  },
  delete: (id: string) => {
    participants = participants.filter(p => p.id !== id);
  },
};

// Programs operations
export const programsStore = {
  getAll: () => [...programs],
  getById: (id: string) => programs.find(p => p.id === id),
  create: (program: Omit<Program, 'id' | 'createdAt' | 'enrolledCount'>) => {
    const newProgram: Program = {
      ...program,
      id: `program-${Date.now()}`,
      createdAt: new Date(),
      enrolledCount: 0,
    };
    programs.push(newProgram);
    return newProgram;
  },
  update: (id: string, updates: Partial<Program>) => {
    const index = programs.findIndex(p => p.id === id);
    if (index !== -1) {
      programs[index] = { ...programs[index], ...updates };
      return programs[index];
    }
    return null;
  },
  delete: (id: string) => {
    programs = programs.filter(p => p.id !== id);
  },
};

// Enrollments operations
export const enrollmentsStore = {
  getAll: () => [...enrollments],
  getByProgramId: (programId: string) => enrollments.filter(e => e.programId === programId),
  getByParticipantId: (participantId: string) => enrollments.filter(e => e.participantId === participantId),
  create: (enrollment: Omit<Enrollment, 'id'>) => {
    const newEnrollment: Enrollment = {
      ...enrollment,
      id: `enrollment-${Date.now()}`,
    };
    enrollments.push(newEnrollment);
    return newEnrollment;
  },
  update: (id: string, updates: Partial<Enrollment>) => {
    const index = enrollments.findIndex(e => e.id === id);
    if (index !== -1) {
      enrollments[index] = { ...enrollments[index], ...updates };
      return enrollments[index];
    }
    return null;
  },
  delete: (id: string) => {
    enrollments = enrollments.filter(e => e.id !== id);
  },
};

// Payments operations
export const paymentsStore = {
  getAll: () => [...payments],
  getByParticipantId: (participantId: string) => payments.filter(p => p.participantId === participantId),
  create: (payment: Omit<Payment, 'id'>) => {
    const newPayment: Payment = {
      ...payment,
      id: `payment-${Date.now()}`,
    };
    payments.push(newPayment);
    return newPayment;
  },
  update: (id: string, updates: Partial<Payment>) => {
    const index = payments.findIndex(p => p.id === id);
    if (index !== -1) {
      payments[index] = { ...payments[index], ...updates };
      return payments[index];
    }
    return null;
  },
  delete: (id: string) => {
    payments = payments.filter(p => p.id !== id);
  },
};

// Support Tickets operations
export const supportTicketsStore = {
  getAll: () => [...supportTickets],
  getById: (id: string) => supportTickets.find(t => t.id === id),
  create: (ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const newTicket: SupportTicket = {
      ...ticket,
      id: `ticket-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    supportTickets.push(newTicket);
    return newTicket;
  },
  update: (id: string, updates: Partial<SupportTicket>) => {
    const index = supportTickets.findIndex(t => t.id === id);
    if (index !== -1) {
      supportTickets[index] = {
        ...supportTickets[index],
        ...updates,
        updatedAt: new Date(),
      };
      return supportTickets[index];
    }
    return null;
  },
  delete: (id: string) => {
    supportTickets = supportTickets.filter(t => t.id !== id);
  },
};

// Audit Logs operations
export const auditLogsStore = {
  getAll: () => [...auditLogs],
  log: (userId: string, action: string, entityType: string, entityId: string, changes: Record<string, any>) => {
    auditLogs.push({
      id: `log-${Date.now()}`,
      userId,
      action,
      entityType,
      entityId,
      changes,
      createdAt: new Date(),
    });
  },
};
