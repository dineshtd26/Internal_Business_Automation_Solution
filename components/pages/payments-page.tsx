'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { paymentsStore, participantsStore } from '@/lib/store';
import type { Payment } from '@/lib/types';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>(paymentsStore.getAll());
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMethod, setFilterMethod] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    participantId: '',
    amount: 0,
    method: 'credit_card' as const,
    transactionId: '',
  });

  const participants = participantsStore.getAll();

  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const matchStatus = !filterStatus || p.status === filterStatus;
      const matchMethod = !filterMethod || p.method === filterMethod;
      return matchStatus && matchMethod;
    });
  }, [payments, filterStatus, filterMethod]);

  const handleAddPayment = () => {
    if (!formData.participantId || !formData.amount || formData.amount <= 0) {
      alert('Please fill in all required fields with valid amount');
      return;
    }
    const newPayment = paymentsStore.create({
      participantId: formData.participantId,
      amount: formData.amount,
      method: formData.method,
      paymentDate: new Date(),
      transactionId: formData.transactionId || `TXN-${Date.now()}`,
      status: 'completed',
    });
    setPayments([...payments, newPayment]);
    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleDeletePayment = (id: string) => {
    if (confirm('Are you sure you want to delete this payment record?')) {
      paymentsStore.delete(id);
      setPayments(payments.filter(p => p.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      participantId: '',
      amount: 0,
      method: 'credit_card',
      transactionId: '',
    });
  };

  const getParticipantName = (id: string) => {
    return participants.find(p => p.id === id)?.name || 'Unknown';
  };

  const statusBadgeColor = {
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  };

  const methodLabels = {
    credit_card: '💳 Credit Card',
    bank_transfer: '🏦 Bank Transfer',
    upi: '📱 UPI',
    cash: '💵 Cash',
  };

  const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const completedAmount = filteredPayments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);

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
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <div className="flex-1 min-w-48">
          <Label htmlFor="filter-method" className="text-sm font-medium">Filter by Method</Label>
          <select
            id="filter-method"
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="w-full mt-2 px-3 py-2 border border-input rounded-md bg-background"
          >
            <option value="">All Methods</option>
            <option value="credit_card">Credit Card</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="upi">UPI</option>
            <option value="cash">Cash</option>
          </select>
        </div>
        <div className="flex items-end gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); }} size="lg">+ Record Payment</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Record New Payment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="participant">Participant *</Label>
                  <select
                    id="participant"
                    value={formData.participantId}
                    onChange={(e) => setFormData({ ...formData, participantId: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="">Select participant...</option>
                    {participants.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                    placeholder="0.00"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="method">Payment Method</Label>
                  <select
                    id="method"
                    value={formData.method}
                    onChange={(e) => setFormData({ ...formData, method: e.target.value as any })}
                    className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="credit_card">Credit Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="upi">UPI</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="txn">Transaction ID (Optional)</Label>
                  <Input
                    id="txn"
                    value={formData.transactionId}
                    onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                    placeholder="e.g., TXN-2024-001"
                    className="mt-1"
                  />
                </div>
                <Button onClick={handleAddPayment} className="w-full">Record Payment</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              const csv = [
                ['Date', 'Participant', 'Amount', 'Method', 'Transaction ID', 'Status'],
                ...filteredPayments.map(p => [
                  new Date(p.paymentDate).toLocaleDateString(),
                  getParticipantName(p.participantId),
                  p.amount,
                  p.method,
                  p.transactionId,
                  p.status,
                ]),
              ]
                .map(row => row.join(','))
                .join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `payments-${Date.now()}.csv`;
              a.click();
            }}
          >
            📥 Export CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Payments</p>
          <p className="text-2xl font-bold">₹{totalAmount.toLocaleString()}</p>
        </div>
        <div className="border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="text-2xl font-bold">₹{completedAmount.toLocaleString()}</p>
        </div>
        <div className="border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Transactions</p>
          <p className="text-2xl font-bold">{filteredPayments.length}</p>
        </div>
        <div className="border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold">₹{filteredPayments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Participant</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No payments found
                </TableCell>
              </TableRow>
            ) : (
              filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="text-sm">{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{getParticipantName(payment.participantId)}</TableCell>
                  <TableCell className="font-semibold">₹{payment.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{methodLabels[payment.method]}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{payment.transactionId}</TableCell>
                  <TableCell>
                    <Badge className={statusBadgeColor[payment.status]}>
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDeletePayment(payment.id)}
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
    </div>
  );
}
