'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { leadsStore } from '@/lib/store';
import type { Lead } from '@/lib/types';

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(leadsStore.getAll());
  const [filterProgram, setFilterProgram] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    source: 'web' as const,
    programInterest: 'Leadership Essentials',
    callNotes: '',
  });

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchProgram = !filterProgram || lead.programInterest === filterProgram;
      const matchStatus = !filterStatus || lead.status === filterStatus;
      return matchProgram && matchStatus;
    });
  }, [leads, filterProgram, filterStatus]);

  const handleAddLead = () => {
    if (!formData.name || !formData.email) {
      alert('Please fill in required fields');
      return;
    }
    const newLead = leadsStore.create({
      ...formData,
      status: 'new',
      callNotes: formData.callNotes,
    });
    setLeads([...leads, newLead]);
    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleUpdateLead = () => {
    if (!editingLead) return;
    if (!formData.name || !formData.email) {
      alert('Please fill in required fields');
      return;
    }
    const updated = leadsStore.update(editingLead.id, {
      ...formData,
      callNotes: formData.callNotes,
    });
    if (updated) {
      setLeads(leads.map(l => l.id === editingLead.id ? updated : l));
      resetForm();
      setIsEditDialogOpen(false);
      setEditingLead(null);
    }
  };

  const handleDeleteLead = (id: string) => {
    if (confirm('Are you sure you want to delete this lead?')) {
      leadsStore.delete(id);
      setLeads(leads.filter(l => l.id !== id));
    }
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setFormData({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      source: lead.source,
      programInterest: lead.programInterest,
      callNotes: lead.callNotes,
    });
    setIsEditDialogOpen(true);
  };

  const handleStatusChange = (id: string, newStatus: 'new' | 'contacted' | 'converted') => {
    const updated = leadsStore.update(id, { status: newStatus });
    if (updated) {
      setLeads(leads.map(l => l.id === id ? updated : l));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      source: 'web',
      programInterest: 'Leadership Essentials',
      callNotes: '',
    });
  };

  const programs = ['Leadership Essentials', 'Business Development', 'Tech Innovation'];
  const statusBadgeColor = {
    new: 'bg-blue-100 text-blue-800',
    contacted: 'bg-yellow-100 text-yellow-800',
    converted: 'bg-green-100 text-green-800',
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-48">
          <Label htmlFor="filter-program" className="text-sm font-medium">Filter by Program</Label>
          <select
            id="filter-program"
            value={filterProgram}
            onChange={(e) => setFilterProgram(e.target.value)}
            className="w-full mt-2 px-3 py-2 border border-input rounded-md bg-background"
          >
            <option value="">All Programs</option>
            {programs.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-48">
          <Label htmlFor="filter-status" className="text-sm font-medium">Filter by Status</Label>
          <select
            id="filter-status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full mt-2 px-3 py-2 border border-input rounded-md bg-background"
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="converted">Converted</option>
          </select>
        </div>
        <div className="flex items-end">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setEditingLead(null); }} size="lg">+ Add New Lead</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Lead</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Full name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Email address"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Phone number"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="source">Source</Label>
                  <select
                    id="source"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value as 'web' | 'whatsapp' })}
                    className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="web">Web Form</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="program">Program Interest</Label>
                  <select
                    id="program"
                    value={formData.programInterest}
                    onChange={(e) => setFormData({ ...formData, programInterest: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                  >
                    {programs.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="notes">Call Notes</Label>
                  <textarea
                    id="notes"
                    value={formData.callNotes}
                    onChange={(e) => setFormData({ ...formData, callNotes: e.target.value })}
                    placeholder="Add any notes from calls or interactions"
                    className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                    rows={3}
                  />
                </div>
                <Button onClick={handleAddLead} className="w-full">Add Lead</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Program</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No leads found
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell className="text-sm">{lead.email}</TableCell>
                  <TableCell className="text-sm">{lead.phone}</TableCell>
                  <TableCell className="text-sm">{lead.programInterest}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{lead.source === 'web' ? '🌐 Web' : '📱 WhatsApp'}</Badge>
                  </TableCell>
                  <TableCell>
                    <select
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead.id, e.target.value as any)}
                      className={`px-2 py-1 rounded text-sm border-0 ${statusBadgeColor[lead.status]}`}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="converted">Converted</option>
                    </select>
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditLead(lead)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDeleteLead(lead.id)}
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

      {/* Edit Dialog */}
      {editingLead && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Lead</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-notes">Call Notes</Label>
                <textarea
                  id="edit-notes"
                  value={formData.callNotes}
                  onChange={(e) => setFormData({ ...formData, callNotes: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                  rows={3}
                />
              </div>
              <Button onClick={handleUpdateLead} className="w-full">Update Lead</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Leads</p>
          <p className="text-2xl font-bold">{leads.length}</p>
        </div>
        <div className="border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">New Leads</p>
          <p className="text-2xl font-bold">{leads.filter(l => l.status === 'new').length}</p>
        </div>
        <div className="border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Converted</p>
          <p className="text-2xl font-bold">{leads.filter(l => l.status === 'converted').length}</p>
        </div>
      </div>
    </div>
  );
}
