import {
  leadsStore,
  participantsStore,
  enrollmentsStore,
  paymentsStore,
  supportTicketsStore,
  auditLogsStore,
} from './store';
import type { Lead, Enrollment, Payment, SupportTicket } from './types';

// Workflow events that trigger automations
export const WorkflowEvents = {
  LEAD_CREATED: 'lead_created',
  LEAD_CONVERTED: 'lead_converted',
  PAYMENT_COMPLETED: 'payment_completed',
  ENROLLMENT_COMPLETED: 'enrollment_completed',
  TICKET_CREATED: 'ticket_created',
  TICKET_ESCALATED: 'ticket_escalated',
} as const;

// Automation notifications log
const notificationLog: Array<{
  id: string;
  timestamp: Date;
  event: string;
  message: string;
  entityType: string;
  entityId: string;
}> = [];

export const getNotificationLog = () => [...notificationLog];

// Add notification to log
function logNotification(event: string, message: string, entityType: string, entityId: string) {
  notificationLog.push({
    id: `notif-${Date.now()}`,
    timestamp: new Date(),
    event,
    message,
    entityType,
    entityId,
  });
  // Keep only last 100 notifications
  if (notificationLog.length > 100) {
    notificationLog.shift();
  }
}

// Workflow 1: Auto-create participant when lead is converted on payment
export function handlePaymentCompleted(payment: Payment) {
  const participant = participantsStore.getAll().find(p => p.leadId && leadsStore.getById(p.leadId)?.email === 'participant-email');
  
  // Check if participant already exists for this payment
  const existingParticipant = participantsStore.getAll().find(p => {
    const paymentData = paymentsStore.getAll().find(pay => pay.id === payment.id);
    return paymentData && p.id === paymentData.participantId;
  });

  if (!existingParticipant && payment.status === 'completed') {
    logNotification(
      WorkflowEvents.PAYMENT_COMPLETED,
      'Payment completed - Lead can now be converted to Participant',
      'payment',
      payment.id
    );
  }
}

// Workflow 2: Auto-generate certificate when enrollment is completed
export function handleEnrollmentCompleted(enrollment: Enrollment) {
  if (enrollment.completionStatus === 'completed') {
    const participant = participantsStore.getById(enrollment.participantId);
    if (participant && !participant.certificateIssued) {
      // Auto-issue certificate
      participantsStore.update(participant.id, { certificateIssued: true });
      
      logNotification(
        WorkflowEvents.ENROLLMENT_COMPLETED,
        `Certificate automatically generated for ${participant.name}. Notification email sent.`,
        'participant',
        participant.id
      );

      auditLogsStore.log(
        'system',
        'certificate_issued',
        'participant',
        participant.id,
        {
          method: 'auto_issued_on_completion',
          timestamp: new Date(),
        }
      );
    }
  }
}

// Workflow 3: Session reminder triggers (simulated)
export function checkAndTriggerSessionReminders() {
  const enrollments = enrollmentsStore.getAll();
  const reminders: Array<{ participantId: string; message: string }> = [];

  enrollments.forEach((enrollment) => {
    if (enrollment.completionStatus === 'in_progress') {
      const participant = participantsStore.getById(enrollment.participantId);
      if (participant) {
        reminders.push({
          participantId: participant.id,
          message: `Reminder: Your upcoming session for ${enrollment.programId} starts soon! Join us to continue your learning journey.`,
        });

        logNotification(
          'session_reminder',
          `Reminder sent to ${participant.name} for upcoming session`,
          'enrollment',
          enrollment.id
        );
      }
    }
  });

  return reminders;
}

// Workflow 4: Auto-trigger ticket escalation workflow
export function handleTicketEscalation(ticket: SupportTicket) {
  if (ticket.status === 'escalated') {
    const linkedEntity = ticket.linkedEntityType === 'participant'
      ? participantsStore.getById(ticket.linkedEntityId)
      : leadsStore.getById(ticket.linkedEntityId);

    if (linkedEntity) {
      logNotification(
        WorkflowEvents.TICKET_ESCALATED,
        `Support ticket escalated for ${ticket.linkedEntityName}. Manager notified. Priority: High`,
        'support_ticket',
        ticket.id
      );

      auditLogsStore.log(
        'system',
        'ticket_escalated',
        'support_ticket',
        ticket.id,
        {
          escalationLevel: 'manager',
          reason: ticket.issueType,
          timestamp: new Date(),
        }
      );
    }
  }
}

// Workflow 5: Lead to Participant conversion on payment
export function convertLeadToParticipant(leadId: string, paymentId: string) {
  const lead = leadsStore.getById(leadId);
  const payment = paymentsStore.getAll().find(p => p.id === paymentId);

  if (lead && payment && payment.status === 'completed') {
    // Create participant from lead
    const newParticipant = participantsStore.create({
      leadId,
      uniqueId: `P-${Date.now().toString().slice(-6)}`,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      programEnrolled: lead.programInterest,
      cohort: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      progressStatus: 'not_started',
      certificateIssued: false,
      enrollmentDate: new Date(),
    });

    // Update lead status to converted
    leadsStore.update(leadId, { status: 'converted' });

    logNotification(
      WorkflowEvents.LEAD_CONVERTED,
      `Lead ${lead.name} converted to Participant ${newParticipant.uniqueId}. Welcome email sent.`,
      'lead',
      leadId
    );

    auditLogsStore.log(
      'system',
      'lead_converted',
      'lead',
      leadId,
      {
        newParticipantId: newParticipant.id,
        paymentId,
        timestamp: new Date(),
      }
    );

    return newParticipant;
  }

  return null;
}

// Workflow 6: Auto-escalate unresolved tickets after 48 hours
export function checkAndEscalateOldTickets() {
  const tickets = supportTicketsStore.getAll();
  const escalatedTickets: string[] = [];

  tickets.forEach((ticket) => {
    if (ticket.status !== 'resolved') {
      const hoursSinceCreation = (Date.now() - new Date(ticket.createdAt).getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceCreation > 48 && ticket.status !== 'escalated') {
        supportTicketsStore.update(ticket.id, { status: 'escalated' });
        escalatedTickets.push(ticket.id);

        logNotification(
          'auto_escalation',
          `Ticket for ${ticket.linkedEntityName} auto-escalated after 48 hours without resolution`,
          'support_ticket',
          ticket.id
        );

        auditLogsStore.log(
          'system',
          'auto_escalated',
          'support_ticket',
          ticket.id,
          {
            reason: 'unresolved_after_48_hours',
            timestamp: new Date(),
          }
        );
      }
    }
  });

  return escalatedTickets;
}

// Workflow 7: Send bulk reminders for upcoming cohort start dates
export function sendUpcomingCohortReminders() {
  const participants = participantsStore.getAll();
  const reminders: Array<{ participantId: string; message: string }> = [];

  participants.forEach((participant) => {
    if (participant.progressStatus === 'not_started') {
      const daysSinceEnrollment = (Date.now() - new Date(participant.enrollmentDate).getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceEnrollment >= 1 && daysSinceEnrollment < 7) {
        reminders.push({
          participantId: participant.id,
          message: `Your ${participant.programEnrolled} cohort (${participant.cohort}) starts soon! Complete any remaining prerequisites and join us.`,
        });

        logNotification(
          'cohort_reminder',
          `Cohort start reminder sent to ${participant.name} for ${participant.cohort}`,
          'participant',
          participant.id
        );
      }
    }
  });

  return reminders;
}

// Workflow 8: WhatsApp notification for important updates
export function sendWhatsAppNotification(leadId: string | undefined, message: string) {
  if (!leadId) return false;
  
  const lead = leadsStore.getById(leadId);
  if (lead && lead.source === 'whatsapp') {
    logNotification(
      'whatsapp_notification',
      `WhatsApp message sent to ${lead.name}: "${message}"`,
      'lead',
      leadId
    );
    return true;
  }
  return false;
}

// Execute all scheduled workflows
export function executeAllWorkflows() {
  const results = {
    escalatedTickets: checkAndEscalateOldTickets(),
    sessionReminders: checkAndTriggerSessionReminders(),
    cohortReminders: sendUpcomingCohortReminders(),
    timestamp: new Date(),
  };

  return results;
}

// Get workflow status and recent automations
export function getWorkflowStatus() {
  return {
    recentNotifications: notificationLog.slice(-10),
    totalNotifications: notificationLog.length,
    automationEnabled: true,
    lastExecuted: new Date(),
    workflows: [
      {
        name: 'Lead to Participant Conversion',
        description: 'Converts leads to participants when payment is completed',
        enabled: true,
      },
      {
        name: 'Auto Certificate Generation',
        description: 'Automatically generates certificates when enrollment is completed',
        enabled: true,
      },
      {
        name: 'Session Reminders',
        description: 'Sends reminders to participants about upcoming sessions',
        enabled: true,
      },
      {
        name: 'Ticket Escalation',
        description: 'Auto-escalates unresolved tickets after 48 hours',
        enabled: true,
      },
      {
        name: 'Cohort Start Reminders',
        description: 'Sends reminders to newly enrolled participants about cohort start',
        enabled: true,
      },
      {
        name: 'WhatsApp Notifications',
        description: 'Sends WhatsApp notifications for important updates',
        enabled: true,
      },
    ],
  };
}
