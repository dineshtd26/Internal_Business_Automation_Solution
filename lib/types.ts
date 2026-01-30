export type UserRole = 'admin' | 'program_manager' | 'support_agent';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: 'web' | 'whatsapp';
  programInterest: string;
  status: 'new' | 'contacted' | 'converted';
  callNotes: string;
  createdAt: Date;
}

export interface Participant {
  id: string;
  leadId: string;
  uniqueId: string;
  name: string;
  email: string;
  phone: string;
  programEnrolled: string;
  cohort: string;
  progressStatus: 'not_started' | 'in_progress' | 'completed';
  certificateIssued: boolean;
  enrollmentDate: Date;
}

export interface Program {
  id: string;
  title: string;
  description: string;
  price: number;
  schedule: string;
  capacity: number;
  enrolledCount: number;
  createdAt: Date;
}

export interface Enrollment {
  id: string;
  participantId: string;
  programId: string;
  paymentStatus: 'pending' | 'completed' | 'refunded';
  enrollmentDate: Date;
  completionStatus: 'not_started' | 'in_progress' | 'completed';
}

export interface Payment {
  id: string;
  participantId: string;
  amount: number;
  method: 'credit_card' | 'bank_transfer' | 'upi' | 'cash';
  paymentDate: Date;
  transactionId: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface SupportTicket {
  id: string;
  linkedEntityType: 'participant' | 'lead';
  linkedEntityId: string;
  linkedEntityName: string;
  issueType: 'technical' | 'billing' | 'enrollment' | 'general';
  status: 'open' | 'in_progress' | 'resolved' | 'escalated';
  resolutionNotes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  changes: Record<string, any>;
  createdAt: Date;
}
