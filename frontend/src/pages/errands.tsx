import { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ErrandFormDialog } from '@/components/errands/errand-form-dialog';
import { ErrandCard } from '@/components/errands/errand-card';
import { errandStorage } from '@/lib/storage';
import { Errand, ErrandStatus, ErrandCategory, ErrandPriority } from '@/types';
import { showSuccess } from '@/utils/toast';

export default function Errands() {
  const [errands, setErrands] = useState<Errand[]>([]);
  const [filteredErrands, setFilteredErrands] = useState<Errand[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ErrandStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<ErrandCategory | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<ErrandPriority | 'all'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingErrand, setEditingErrand] = useState<Errand | null>(null);
  const [deletingErrand, setDeletingErrand] = useState<Errand | null>(null);

  useEffect(() => {
    loadErrands();
  }, []);

  useEffect(() => {
    filterErrands();
  }, [errands, searchTerm, statusFilter, categoryFilter, priorityFilter]);

  const loadErrands = () => {
    const allErrands = errandStorage.getAll();
    setErrands(allErrands);
  };

  const filterErrands = () => {
    let filtered = [...errands];

    if (searchTerm) {
      filtered = filtered.filter(errand =>
        errand.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        errand.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(errand => errand.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(errand => errand.type === categoryFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(errand => errand.priority === priorityFilter);
    }

    setFilteredErrands(filtered);
  };

  const handleSaveErrand = (errand: Errand) => {
    if (editingErrand) {
      errandStorage.update(errand.id, errand);
    } else {
      errandStorage.add(errand);
    }
    loadErrands();
    setEditingErrand(null);
  };

  const handleEditErrand = (errand: Errand) => {
    setEditingErrand(errand);
    setIsFormOpen(true);
  };

  const handleDeleteErrand = (errand: Errand) => {
    if (errand.status !== 'pending') {
      showSuccess('Only pending errands can be cancelled');
      return;
    }
    setDeletingErrand(errand);
  };

  const confirmDelete = () => {
    if (deletingErrand) {
      errandStorage.delete(deletingErrand.id);
      showSuccess('Errand cancelled successfully');
      loadErrands();
      setDeletingErrand(null);
    }
  };

  const handleAddNew = () => {
    setEditingErrand(null);
    setIsFormOpen(true);
  };

  const pendingErrands = errands.filter(e => e.status === 'pending');
  const inProgressErrands = errands.filter(e => e.status === 'in-progress');
  const doneErrands = errands.filter(e => e.status === 'done');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-500 mt-1">Request and track your household tasks</p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search errands..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as ErrandCategory | 'all')}>
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="home-maintenance">Home Maintenance</SelectItem>
            <SelectItem value="cleaning">Cleaning</SelectItem>
            <SelectItem value="gardening">Gardening</SelectItem>
            <SelectItem value="groceries">Groceries</SelectItem>
            <SelectItem value="delivery">Delivery</SelectItem>
            <SelectItem value="pharmacy">Pharmacy</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as ErrandPriority | 'all')}>
          <SelectTrigger>
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ErrandStatus | 'all')}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs View */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All ({errands.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingErrands.length})</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress ({inProgressErrands.length})</TabsTrigger>
          <TabsTrigger value="done">Done ({doneErrands.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {filteredErrands.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                {searchTerm || categoryFilter !== 'all' || priorityFilter !== 'all' || statusFilter !== 'all'
                  ? 'No errands match your filters'
                  : 'No errands yet. Request your first errand to get started!'}
              </p>
              {!searchTerm && categoryFilter === 'all' && priorityFilter === 'all' && statusFilter === 'all' && (
                <Button onClick={handleAddNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Task
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredErrands.map(errand => (
                <ErrandCard
                  key={errand.id}
                  errand={errand}
                  onEdit={handleEditErrand}
                  onDelete={handleDeleteErrand}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          {pendingErrands.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No pending errands</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingErrands.map(errand => (
                <ErrandCard
                  key={errand.id}
                  errand={errand}
                  onEdit={handleEditErrand}
                  onDelete={handleDeleteErrand}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="in-progress" className="mt-6">
          {inProgressErrands.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No errands in progress</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {inProgressErrands.map(errand => (
                <ErrandCard
                  key={errand.id}
                  errand={errand}
                  onEdit={handleEditErrand}
                  onDelete={handleDeleteErrand}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="done" className="mt-6">
          {doneErrands.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No completed errands</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {doneErrands.map(errand => (
                <ErrandCard
                  key={errand.id}
                  errand={errand}
                  onEdit={handleEditErrand}
                  onDelete={handleDeleteErrand}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Form Dialog */}
      <ErrandFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        errand={editingErrand}
        onSave={handleSaveErrand}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingErrand} onOpenChange={() => setDeletingErrand(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Errand</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this errand? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Errand</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Cancel Errand
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}