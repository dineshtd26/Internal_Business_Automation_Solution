'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supportTicketsStore, participantsStore, leadsStore } from '@/lib/store';
import type { SupportTicket } from '@/lib/types';

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>(supportTicketsStore.getAll());
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [formData, setFormData] = useState({
    linkedEntityType: 'participant' as const,
    linkedEntityId: '',
    issueType: 'technical' as const,
  });

  const participants = participantsStore.getAll();
  const leads = leadsStore.getAll();

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const matchStatus = !filterStatus || t.status === filterStatus;
      const matchType = !filterType || t.issueType === filterType;
      return matchStatus && matchType;
    });
  }, [tickets, filterStatus, filterType]);

  const handleAddTicket = () => {
    if (!formData.linkedEntityId) {
      alert('Please select an entity');
      return;
    }

    let linkedEntityName = '';
    if (formData.linkedEntityType === 'participant') {
      const participant = participants.find(p => p.id === formData.linkedEntityId);
      linkedEntityName = participant?.name || 'Unknown';
    } else {
      const lead = leads.find(l => l.id === formData.linkedEntityId);
      linkedEntityName = lead?.name || 'Unknown';
    }

    const newTicket = supportTicketsStore.create({
      linkedEntityType: formData.linkedEntityType,
      linkedEntityId: formData.linkedEntityId,
      linkedEntityName,
      issueType: formData.issueType,
      status: 'open',
      resolutionNotes: '',
    });
    setTickets([...tickets, newTicket]);
    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleStatusChange = (id: string, newStatus: 'open' | 'in_progress' | 'resolved' | 'escalated') => {
    const updated = supportTicketsStore.update(id, { status: newStatus });
    if (updated) {
      setTickets(tickets.map(t => t.id === id ? updated : t));
    }
  };

  const handleAddResolutionNotes = (ticketId: string, notes: string) => {
    const updated = supportTicketsStore.update(ticketId, {
      resolutionNotes: notes,
      status: 'resolved',
    });
    if (updated) {
      setTickets(tickets.map(t => t.id === ticketId ? updated : t));
      setIsDetailDialogOpen(false);
      setResolutionNotes('');
      alert('Ticket resolved successfully');
    }
  };

  const handleDeleteTicket = (id: string) => {
    if (confirm('Are you sure you want to delete this ticket?')) {
      supportTicketsStore.delete(id);
      setTickets(tickets.filter(t => t.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      linkedEntityType: 'participant',
      linkedEntityId: '',
      issueType: 'technical',
    });
  };

  const statusBadgeColor = {
    open: 'bg-red-100 text-red-800',
    in_progress: 'bg-blue-100 text-blue-800',
    resolved: 'bg-green-100 text-green-800',
    escalated: 'bg-purple-100 text-purple-800',
  };

  const typeLabels = {
    technical: '🔧 Technical',
    billing: '💳 Billing',
    enrollment: '📋 Enrollment',
    general: '❓ General',
  };

  const openTicketsCount = tickets.filter(t => t.status === 'open').length;
  const inProgressCount = tickets.filter(t => t.status === 'in_progress').length;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-48">
          <Label htmlFor="filter-status" className="text-sm font-medium">Filter by Status</Label>
          <select
            id="filter-status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full mt-2 px-3 py-2 border border-input rounded-md bg-background"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="escalated">Escalated</option>
          </select>
        </div>
        <div className="flex-1 min-w-48">
          <Label htmlFor="filter-type" className="text-sm font-medium">Filter by Issue Type</Label>
          <select
            id="filter-type"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full mt-2 px-3 py-2 border border-input rounded-md bg-background"
          >
            <option value="">All Types</option>
            <option value="technical">Technical</option>
            <option value="billing">Billing</option>
            <option value="enrollment">Enrollment</option>
            <option value="general">General</option>
          </select>
        </div>
        <div className="flex items-end">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); }} size="lg">+ New Ticket</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Support Ticket</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="entity-type">Entity Type</Label>
                  <select
                    id="entity-type"
                    value={formData.linkedEntityType}
                    onChange={(e) => {
                      setFormData({ ...formData, linkedEntityType: e.target.value as any, linkedEntityId: '' });
                    }}
                    className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="participant">Participant</option>
                    <option value="lead">Lead</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="entity">Select {formData.linkedEntityType === 'participant' ? 'Participant' : 'Lead'} *</Label>
                  <select
                    id="entity"
                    value={formData.linkedEntityId}
                    onChange={(e) => setFormData({ ...formData, linkedEntityId: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="">Select an entity...</option>
                    {formData.linkedEntityType === 'participant'
                      ? participants.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))
                      : leads.map(l => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="issue-type">Issue Type</Label>
                  <select
                    id="issue-type"
                    value={formData.issueType}
                    onChange={(e) => setFormData({ ...formData, issueType: e.target.value as any })}
                    className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="technical">Technical</option>
                    <option value="billing">Billing</option>
                    <option value="enrollment">Enrollment</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <Button onClick={handleAddTicket} className="w-full">Create Ticket</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Tickets</p>
          <p className="text-2xl font-bold">{tickets.length}</p>
        </div>
        <div className="border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Open</p>
          <p className="text-2xl font-bold text-red-600">{openTicketsCount}</p>
        </div>
        <div className="border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">In Progress</p>
          <p className="text-2xl font-bold text-blue-600">{inProgressCount}</p>
        </div>
        <div className="border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Resolved</p>
          <p className="text-2xl font-bold text-green-600">{tickets.filter(t => t.status === 'resolved').length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Created</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Issue Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No support tickets found
                </TableCell>
              </TableRow>
            ) : (
              filteredTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="text-sm">{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{ticket.linkedEntityName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{typeLabels[ticket.issueType]}</Badge>
                  </TableCell>
                  <TableCell>
                    <select
                      value={ticket.status}
                      onChange={(e) => handleStatusChange(ticket.id, e.target.value as any)}
                      className={`px-2 py-1 rounded text-sm border-0 ${statusBadgeColor[ticket.status]}`}
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="escalated">Escalated</option>
                    </select>
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setResolutionNotes(ticket.resolutionNotes);
                        setIsDetailDialogOpen(true);
                      }}
                    >
                      Details
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDeleteTicket(ticket.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Details Dialog */}
      {selectedTicket && (
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Ticket Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Entity</p>
                  <p className="font-medium">{selectedTicket.linkedEntityName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium">{typeLabels[selectedTicket.issueType]}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-medium capitalize">{selectedTicket.status}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p className="font-medium">{new Date(selectedTicket.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Resolution Notes</Label>
                <textarea
                  id="notes"
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Add resolution notes and mark as resolved"
                  className="w-full mt-2 px-3 py-2 border border-input rounded-md bg-background"
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleAddResolutionNotes(selectedTicket.id, resolutionNotes)}
                  className="flex-1"
                  disabled={!resolutionNotes.trim()}
                >
                  Resolve Ticket
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsDetailDialogOpen(false)}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
