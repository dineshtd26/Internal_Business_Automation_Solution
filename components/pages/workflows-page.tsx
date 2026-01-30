'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  getWorkflowStatus,
  getNotificationLog,
  executeAllWorkflows,
  checkAndEscalateOldTickets,
  checkAndTriggerSessionReminders,
  sendUpcomingCohortReminders,
} from '@/lib/workflows';

export default function WorkflowsPage() {
  const [workflowStatus, setWorkflowStatus] = useState(getWorkflowStatus());
  const [notificationLog, setNotificationLog] = useState(getNotificationLog());
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setWorkflowStatus(getWorkflowStatus());
      setNotificationLog(getNotificationLog());
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleExecuteWorkflows = () => {
    const results = executeAllWorkflows();
    setWorkflowStatus(getWorkflowStatus());
    setNotificationLog(getNotificationLog());
    alert(`Workflows executed successfully!\n\nEscalated Tickets: ${results.escalatedTickets.length}\nSession Reminders: ${results.sessionReminders.length}\nCohort Reminders: ${results.cohortReminders.length}`);
  };

  const eventColors: Record<string, string> = {
    'lead_converted': 'bg-blue-100 text-blue-800',
    'payment_completed': 'bg-green-100 text-green-800',
    'enrollment_completed': 'bg-purple-100 text-purple-800',
    'session_reminder': 'bg-yellow-100 text-yellow-800',
    'ticket_escalated': 'bg-red-100 text-red-800',
    'auto_escalation': 'bg-orange-100 text-orange-800',
    'cohort_reminder': 'bg-teal-100 text-teal-800',
    'whatsapp_notification': 'bg-green-100 text-green-800',
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg text-muted-foreground">Monitor and manage automated workflows</h3>
        </div>
        <div className="flex gap-2">
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            onClick={() => setAutoRefresh(!autoRefresh)}
            size="sm"
          >
            {autoRefresh ? '🔄 Auto-Refresh ON' : '⏸ Auto-Refresh OFF'}
          </Button>
          <Button
            onClick={handleExecuteWorkflows}
            size="lg"
          >
            ⚡ Execute All Workflows
          </Button>
        </div>
      </div>

      {/* Workflow Status Summary */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Automations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{workflowStatus.workflows.length}</p>
            <p className="text-xs text-muted-foreground mt-1">All Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recent Events</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{workflowStatus.totalNotifications}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Triggered</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className="bg-green-100 text-green-800 text-lg py-1 px-2">Active</Badge>
            <p className="text-xs text-muted-foreground mt-2">All systems operational</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Last Executed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-semibold">{workflowStatus.lastExecuted.toLocaleTimeString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Just now</p>
          </CardContent>
        </Card>
      </div>

      {/* Available Workflows */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Active Workflows</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workflowStatus.workflows.map((workflow, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">{workflow.name}</CardTitle>
                    <CardDescription className="mt-1">{workflow.description}</CardDescription>
                  </div>
                  {workflow.enabled && (
                    <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Automation Events */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Recent Automation Events</h3>
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Event Type</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Entity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notificationLog.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No automation events triggered yet. Run workflows to see activity.
                  </TableCell>
                </TableRow>
              ) : (
                notificationLog
                  .slice()
                  .reverse()
                  .map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell className="text-sm font-mono">{notification.timestamp.toLocaleTimeString()}</TableCell>
                      <TableCell>
                        <Badge
                          className={eventColors[notification.event] || 'bg-gray-100 text-gray-800'}
                        >
                          {notification.event.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm max-w-md truncate">{notification.message}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {notification.entityType} - {notification.entityId.substring(0, 8)}...
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Workflow Documentation */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-base">Automated Workflows Documentation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="font-semibold">Lead to Participant Conversion</p>
            <p className="text-muted-foreground">When a lead makes a payment, they are automatically converted to a participant with a unique ID and enrolled in their interested program.</p>
          </div>
          <div>
            <p className="font-semibold">Auto Certificate Generation</p>
            <p className="text-muted-foreground">When an enrollment status changes to "Completed", a certificate is automatically generated and a notification email is sent to the participant.</p>
          </div>
          <div>
            <p className="font-semibold">Session & Cohort Reminders</p>
            <p className="text-muted-foreground">Participants receive automated reminders about upcoming sessions and cohort start dates. WhatsApp notifications are sent for leads acquired via WhatsApp.</p>
          </div>
          <div>
            <p className="font-semibold">Ticket Escalation Workflow</p>
            <p className="text-muted-foreground">Support tickets that remain unresolved for more than 48 hours are automatically escalated to management for priority handling.</p>
          </div>
          <div>
            <p className="font-semibold">Multi-Channel Notifications</p>
            <p className="text-muted-foreground">The system supports Email and WhatsApp notifications based on the source of the lead or user preferences.</p>
          </div>
        </CardContent>
      </Card>

      {/* Manual Workflow Triggers */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Manual Workflow Triggers</h3>
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center bg-transparent"
            onClick={() => {
              const escalated = checkAndEscalateOldTickets();
              setNotificationLog(getNotificationLog());
              alert(`${escalated.length} ticket(s) escalated`);
            }}
          >
            <span className="text-2xl">🚨</span>
            <span>Check Ticket Escalation</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center bg-transparent"
            onClick={() => {
              const reminders = checkAndTriggerSessionReminders();
              setNotificationLog(getNotificationLog());
              alert(`${reminders.length} session reminder(s) sent`);
            }}
          >
            <span className="text-2xl">📅</span>
            <span>Send Session Reminders</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center bg-transparent"
            onClick={() => {
              const reminders = sendUpcomingCohortReminders();
              setNotificationLog(getNotificationLog());
              alert(`${reminders.length} cohort reminder(s) sent`);
            }}
          >
            <span className="text-2xl">🎓</span>
            <span>Send Cohort Reminders</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center bg-transparent"
            onClick={() => {
              setWorkflowStatus(getWorkflowStatus());
              setNotificationLog(getNotificationLog());
              alert('Workflow status refreshed');
            }}
          >
            <span className="text-2xl">🔄</span>
            <span>Refresh Status</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
