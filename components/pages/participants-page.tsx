'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { participantsStore, leadsStore } from '@/lib/store';
import type { Participant } from '@/lib/types';

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[]>(participantsStore.getAll());
  const [filterProgram, setFilterProgram] = useState('');
  const [filterProgress, setFilterProgress] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    programEnrolled: 'Leadership Essentials',
    cohort: '',
    progressStatus: 'not_started' as const,
  });

  const filteredParticipants = useMemo(() => {
    return participants.filter(p => {
      const matchProgram = !filterProgram || p.programEnrolled === filterProgram;
      const matchProgress = !filterProgress || p.progressStatus === filterProgress;
      return matchProgram && matchProgress;
    });
  }, [participants, filterProgram, filterProgress]);

  const handleAddParticipant = () => {
    if (!formData.name || !formData.email) {
      alert('Please fill in required fields');
      return;
    }
    const newParticipant = participantsStore.create({
      leadId: '',
      uniqueId: `P-${Date.now().toString().slice(-6)}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      programEnrolled: formData.programEnrolled,
      cohort: formData.cohort,
      progressStatus: formData.progressStatus,
      certificateIssued: false,
      enrollmentDate: new Date(),
    });
    setParticipants([...participants, newParticipant]);
    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleUpdateParticipant = () => {
    if (!editingParticipant) return;
    if (!formData.name || !formData.email) {
      alert('Please fill in required fields');
      return;
    }
    const updated = participantsStore.update(editingParticipant.id, {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      programEnrolled: formData.programEnrolled,
      cohort: formData.cohort,
      progressStatus: formData.progressStatus,
    });
    if (updated) {
      setParticipants(participants.map(p => p.id === editingParticipant.id ? updated : p));
      resetForm();
      setIsEditDialogOpen(false);
      setEditingParticipant(null);
    }
  };

  const handleDeleteParticipant = (id: string) => {
    if (confirm('Are you sure you want to delete this participant?')) {
      participantsStore.delete(id);
      setParticipants(participants.filter(p => p.id !== id));
    }
  };

  const handleEditParticipant = (participant: Participant) => {
    setEditingParticipant(participant);
    setFormData({
      name: participant.name,
      email: participant.email,
      phone: participant.phone,
      programEnrolled: participant.programEnrolled,
      cohort: participant.cohort,
      progressStatus: participant.progressStatus,
    });
    setIsEditDialogOpen(true);
  };

  const handleProgressChange = (id: string, newProgress: 'not_started' | 'in_progress' | 'completed') => {
    const updated = participantsStore.update(id, { progressStatus: newProgress });
    if (updated) {
      setParticipants(participants.map(p => p.id === id ? updated : p));
    }
  };

  const handleIssueCertificate = (id: string) => {
    const updated = participantsStore.update(id, { certificateIssued: true });
    if (updated) {
      setParticipants(participants.map(p => p.id === id ? updated : p));
      alert('Certificate generated and notification sent to participant');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      programEnrolled: 'Leadership Essentials',
      cohort: '',
      progressStatus: 'not_started',
    });
  };

  const programs = ['Leadership Essentials', 'Business Development', 'Tech Innovation'];
  const progressBadgeColor = {
    not_started: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
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
          <Label htmlFor="filter-progress" className="text-sm font-medium">Filter by Progress</Label>
          <select
            id="filter-progress"
            value={filterProgress}
            onChange={(e) => setFilterProgress(e.target.value)}
            className="w-full mt-2 px-3 py-2 border border-input rounded-md bg-background"
          >
            <option value="">All Progress</option>
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div className="flex items-end">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setEditingParticipant(null); }} size="lg">+ Add Participant</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Participant</DialogTitle>
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
                  <Label htmlFor="program">Program Enrolled</Label>
                  <select
                    id="program"
                    value={formData.programEnrolled}
                    onChange={(e) => setFormData({ ...formData, programEnrolled: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                  >
                    {programs.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="cohort">Cohort</Label>
                  <Input
                    id="cohort"
                    value={formData.cohort}
                    onChange={(e) => setFormData({ ...formData, cohort: e.target.value })}
                    placeholder="e.g., Jan 2024"
                    className="mt-1"
                  />
                </div>
                <Button onClick={handleAddParticipant} className="w-full">Add Participant</Button>
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
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Program</TableHead>
              <TableHead>Cohort</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Certificate</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredParticipants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No participants found
                </TableCell>
              </TableRow>
            ) : (
              filteredParticipants.map((participant) => (
                <TableRow key={participant.id}>
                  <TableCell className="font-mono text-sm">{participant.uniqueId}</TableCell>
                  <TableCell className="font-medium">{participant.name}</TableCell>
                  <TableCell className="text-sm">{participant.email}</TableCell>
                  <TableCell className="text-sm">{participant.programEnrolled}</TableCell>
                  <TableCell className="text-sm">{participant.cohort}</TableCell>
                  <TableCell>
                    <select
                      value={participant.progressStatus}
                      onChange={(e) => handleProgressChange(participant.id, e.target.value as any)}
                      className={`px-2 py-1 rounded text-sm border-0 ${progressBadgeColor[participant.progressStatus]}`}
                    >
                      <option value="not_started">Not Started</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </TableCell>
                  <TableCell>
                    {participant.certificateIssued ? (
                      <Badge className="bg-green-100 text-green-800">✓ Issued</Badge>
                    ) : participant.progressStatus === 'completed' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleIssueCertificate(participant.id)}
                      >
                        Generate
                      </Button>
                    ) : (
                      <Badge variant="outline">Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditParticipant(participant)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDeleteParticipant(participant.id)}
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
      {editingParticipant && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Participant</DialogTitle>
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
              <Button onClick={handleUpdateParticipant} className="w-full">Update Participant</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Participants</p>
          <p className="text-2xl font-bold">{participants.length}</p>
        </div>
        <div className="border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">In Progress</p>
          <p className="text-2xl font-bold">{participants.filter(p => p.progressStatus === 'in_progress').length}</p>
        </div>
        <div className="border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="text-2xl font-bold">{participants.filter(p => p.progressStatus === 'completed').length}</p>
        </div>
      </div>
    </div>
  );
}
