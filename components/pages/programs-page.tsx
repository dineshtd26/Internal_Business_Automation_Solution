'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { programsStore } from '@/lib/store';
import type { Program } from '@/lib/types';

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>(programsStore.getAll());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    schedule: '',
    capacity: 30,
  });

  const handleAddProgram = () => {
    if (!formData.title || !formData.price) {
      alert('Please fill in required fields');
      return;
    }
    const newProgram = programsStore.create({
      title: formData.title,
      description: formData.description,
      price: formData.price,
      schedule: formData.schedule,
      capacity: formData.capacity,
    });
    setPrograms([...programs, newProgram]);
    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleUpdateProgram = () => {
    if (!editingProgram) return;
    if (!formData.title || !formData.price) {
      alert('Please fill in required fields');
      return;
    }
    const updated = programsStore.update(editingProgram.id, {
      title: formData.title,
      description: formData.description,
      price: formData.price,
      schedule: formData.schedule,
      capacity: formData.capacity,
    });
    if (updated) {
      setPrograms(programs.map(p => p.id === editingProgram.id ? updated : p));
      resetForm();
      setIsEditDialogOpen(false);
      setEditingProgram(null);
    }
  };

  const handleDeleteProgram = (id: string) => {
    if (confirm('Are you sure you want to delete this program?')) {
      programsStore.delete(id);
      setPrograms(programs.filter(p => p.id !== id));
    }
  };

  const handleEditProgram = (program: Program) => {
    setEditingProgram(program);
    setFormData({
      title: program.title,
      description: program.description,
      price: program.price,
      schedule: program.schedule,
      capacity: program.capacity,
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: 0,
      schedule: '',
      capacity: 30,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg text-muted-foreground">Manage your training programs</h3>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingProgram(null); }} size="lg">+ Create Program</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Program</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Program Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Leadership Essentials"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Program description"
                  className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    placeholder="30"
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="schedule">Schedule</Label>
                <Input
                  id="schedule"
                  value={formData.schedule}
                  onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                  placeholder="e.g., Monthly cohorts"
                  className="mt-1"
                />
              </div>
              <Button onClick={handleAddProgram} className="w-full">Create Program</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {programs.map((program) => (
          <Card key={program.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="line-clamp-2">{program.title}</CardTitle>
              <CardDescription className="line-clamp-2">{program.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Price:</span>
                  <span className="font-semibold">₹{program.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Schedule:</span>
                  <span className="text-sm">{program.schedule}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Capacity:</span>
                  <span className="text-sm">{program.enrolledCount} / {program.capacity}</span>
                </div>
                <div className="pt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(program.enrolledCount / program.capacity) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditProgram(program)}
                  className="flex-1"
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive flex-1 bg-transparent"
                  onClick={() => handleDeleteProgram(program.id)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {programs.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">No programs created yet</p>
              <p className="text-sm text-muted-foreground mt-2">Create your first program to get started</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table View */}
      {programs.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">All Programs</h3>
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Enrolled</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {programs.map((program) => (
                  <TableRow key={program.id}>
                    <TableCell className="font-medium">{program.title}</TableCell>
                    <TableCell>₹{program.price.toLocaleString()}</TableCell>
                    <TableCell className="text-sm">{program.schedule}</TableCell>
                    <TableCell className="text-sm">{program.enrolledCount} / {program.capacity}</TableCell>
                    <TableCell className="space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditProgram(program)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleDeleteProgram(program.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      {editingProgram && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Program</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Program Title *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-price">Price *</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-capacity">Capacity</Label>
                  <Input
                    id="edit-capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    className="mt-1"
                  />
                </div>
              </div>
              <Button onClick={handleUpdateProgram} className="w-full">Update Program</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
