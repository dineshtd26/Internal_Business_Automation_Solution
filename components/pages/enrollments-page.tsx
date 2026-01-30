'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { enrollmentsStore, participantsStore, programsStore, paymentsStore } from '@/lib/store';
import type { Enrollment } from '@/lib/types';

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>(enrollmentsStore.getAll());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    participantId: '',
    programId: '',
    paymentStatus: 'pending' as const,
  });

  const participants = participantsStore.getAll();
  const programs = programsStore.getAll();

  const handleAddEnrollment = () => {
    if (!formData.participantId || !formData.programId) {
      alert('Please select participant and program');
      return;
    }

    // Check if already enrolled
    const alreadyEnrolled = enrollments.some(
      e => e.participantId === formData.participantId && e.programId === formData.programId
    );
    if (alreadyEnrolled) {
      alert('This participant is already enrolled in this program');
      return;
    }

    const newEnrollment = enrollmentsStore.create({
      participantId: formData.participantId,
      programId: formData.programId,
      paymentStatus: formData.paymentStatus,
      enrollmentDate: new Date(),
      completionStatus: 'not_started',
    });
    setEnrollments([...enrollments, newEnrollment]);
    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleDeleteEnrollment = (id: string) => {
    if (confirm('Are you sure you want to delete this enrollment?')) {
      enrollmentsStore.delete(id);
      setEnrollments(enrollments.filter(e => e.id !== id));
    }
  };

  const handlePaymentStatusChange = (id: string, newStatus: 'pending' | 'completed' | 'refunded') => {
    const updated = enrollmentsStore.update(id, { paymentStatus: newStatus });
    if (updated) {
      setEnrollments(enrollments.map(e => e.id === id ? updated : e));
    }
  };

  const handleCompletionStatusChange = (id: string, newStatus: 'not_started' | 'in_progress' | 'completed') => {
    const updated = enrollmentsStore.update(id, { completionStatus: newStatus });
    if (updated) {
      setEnrollments(enrollments.map(e => e.id === id ? updated : e));
    }
  };

  const resetForm = () => {
    setFormData({
      participantId: '',
      programId: '',
      paymentStatus: 'pending',
    });
  };

  const paymentBadgeColor = {
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    refunded: 'bg-red-100 text-red-800',
  };

  const completionBadgeColor = {
    not_started: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
  };

  const getParticipantName = (id: string) => {
    return participants.find(p => p.id === id)?.name || 'Unknown';
  };

  const getProgramTitle = (id: string) => {
    return programs.find(p => p.id === id)?.title || 'Unknown';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg text-muted-foreground">Manage participant enrollments and payments</h3>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); }} size="lg">+ New Enrollment</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Enrollment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="participant">Select Participant *</Label>
                <select
                  id="participant"
                  value={formData.participantId}
                  onChange={(e) => setFormData({ ...formData, participantId: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="">Choose a participant...</option>
                  {participants.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.uniqueId})</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="program">Select Program *</Label>
                <select
                  id="program"
                  value={formData.programId}
                  onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="">Choose a program...</option>
                  {programs.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="payment">Payment Status</Label>
                <select
                  id="payment"
                  value={formData.paymentStatus}
                  onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as any })}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
              <Button onClick={handleAddEnrollment} className="w-full">Create Enrollment</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Participant</TableHead>
              <TableHead>Program</TableHead>
              <TableHead>Enrollment Date</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Completion Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enrollments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No enrollments found. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              enrollments.map((enrollment) => (
                <TableRow key={enrollment.id}>
                  <TableCell className="font-medium">{getParticipantName(enrollment.participantId)}</TableCell>
                  <TableCell className="text-sm">{getProgramTitle(enrollment.programId)}</TableCell>
                  <TableCell className="text-sm">{new Date(enrollment.enrollmentDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <select
                      value={enrollment.paymentStatus}
                      onChange={(e) => handlePaymentStatusChange(enrollment.id, e.target.value as any)}
                      className={`px-2 py-1 rounded text-sm border-0 ${paymentBadgeColor[enrollment.paymentStatus]}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </TableCell>
                  <TableCell>
                    <select
                      value={enrollment.completionStatus}
                      onChange={(e) => handleCompletionStatusChange(enrollment.id, e.target.value as any)}
                      className={`px-2 py-1 rounded text-sm border-0 ${completionBadgeColor[enrollment.completionStatus]}`}
                    >
                      <option value="not_started">Not Started</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDeleteEnrollment(enrollment.id)}
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mt-6">
        <div className="border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Enrollments</p>
          <p className="text-2xl font-bold">{enrollments.length}</p>
        </div>
        <div className="border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Payments Pending</p>
          <p className="text-2xl font-bold">{enrollments.filter(e => e.paymentStatus === 'pending').length}</p>
        </div>
        <div className="border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Payments Completed</p>
          <p className="text-2xl font-bold">{enrollments.filter(e => e.paymentStatus === 'completed').length}</p>
        </div>
        <div className="border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">In Progress</p>
          <p className="text-2xl font-bold">{enrollments.filter(e => e.completionStatus === 'in_progress').length}</p>
        </div>
      </div>
    </div>
  );
}
