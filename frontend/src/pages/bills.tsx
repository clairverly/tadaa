import { useState, useEffect } from 'react';
import { Plus, Search, FileText, Scan } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { BillFormDialog } from '@/components/bills/bill-form-dialog';
import { BillScannerDialog } from '@/components/bills/bill-scanner-dialog';
import { BillCard } from '@/components/bills/bill-card';
import { billStorage } from '@/lib/storage';
import { Bill, BillStatus } from '@/types';
import { ScannedBillData } from '@/lib/bill-ocr';
import { showSuccess } from '@/utils/toast';
import { getNextRecurringDate } from '@/lib/utils/date';

export default function Bills() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [filteredBills, setFilteredBills] = useState<Bill[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<BillStatus | 'all'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [scannedBillData, setScannedBillData] = useState<ScannedBillData | null>(null);
  const [deletingBill, setDeletingBill] = useState<Bill | null>(null);

  useEffect(() => {
    loadBills();
  }, []);

  useEffect(() => {
    filterBills();
  }, [bills, searchTerm, statusFilter]);

  const loadBills = () => {
    const allBills = billStorage.getAll();
    setBills(allBills);
  };

  const filterBills = () => {
    let filtered = [...bills];

    if (searchTerm) {
      filtered = filtered.filter(bill =>
        bill.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(bill => bill.status === statusFilter);
    }

    setFilteredBills(filtered);
  };

  const handleSaveBill = (bill: Bill) => {
    if (editingBill) {
      billStorage.update(bill.id, bill);
    } else {
      billStorage.add(bill);
    }
    loadBills();
    setEditingBill(null);
    setScannedBillData(null);
  };

  const handleEditBill = (bill: Bill) => {
    setEditingBill(bill);
    setScannedBillData(null);
    setIsFormOpen(true);
  };

  const handleDeleteBill = (bill: Bill) => {
    setDeletingBill(bill);
  };

  const confirmDelete = () => {
    if (deletingBill) {
      billStorage.delete(deletingBill.id);
      showSuccess('Bill deleted successfully');
      loadBills();
      setDeletingBill(null);
    }
  };

  const handleMarkPaid = (bill: Bill) => {
    const paymentRecord = {
      id: `payment-${Date.now()}`,
      date: new Date().toISOString(),
      amount: bill.amount,
      status: 'success' as const,
    };

    const updates: Partial<Bill> = {
      status: 'paid',
      paymentHistory: [...bill.paymentHistory, paymentRecord],
    };

    if (bill.recurrence !== 'one-time') {
      const nextDueDate = getNextRecurringDate(bill.dueDate, bill.recurrence);
      const nextBill: Bill = {
        ...bill,
        id: `bill-${Date.now()}`,
        dueDate: nextDueDate,
        status: 'upcoming',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      billStorage.add(nextBill);
    }

    billStorage.update(bill.id, updates);
    showSuccess('Bill marked as paid');
    loadBills();
  };

  const handleAddNew = () => {
    setEditingBill(null);
    setScannedBillData(null);
    setIsFormOpen(true);
  };

  const handleScanBill = () => {
    setIsScannerOpen(true);
  };

  const handleBillScanned = (billData: ScannedBillData) => {
    setScannedBillData(billData);
    setEditingBill(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bills</h1>
          <p className="text-gray-500 mt-1">Track and manage your bills</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleScanBill} variant="outline" className="shadow-lg">
            <Scan className="h-4 w-4 mr-2" />
            Scan Bill
          </Button>
          <Button onClick={handleAddNew} className="shadow-lg">
            <Plus className="h-4 w-4 mr-2" />
            Add Bill
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search bills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as BillStatus | 'all')}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Bills</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bills Grid */}
      {filteredBills.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 mb-6">
            <FileText className="h-12 w-12 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchTerm || statusFilter !== 'all' 
              ? 'No bills match your filters' 
              : 'No bills yet'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Add your first bill to get started tracking your payments'}
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <div className="flex gap-3 justify-center">
              <Button onClick={handleScanBill} variant="outline" size="lg" className="shadow-lg">
                <Scan className="h-5 w-5 mr-2" />
                Scan a Bill
              </Button>
              <Button onClick={handleAddNew} size="lg" className="shadow-lg">
                <Plus className="h-5 w-5 mr-2" />
                Add Manually
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredBills.map(bill => (
            <BillCard
              key={bill.id}
              bill={bill}
              onEdit={handleEditBill}
              onDelete={handleDeleteBill}
              onMarkPaid={handleMarkPaid}
            />
          ))}
        </div>
      )}

      {/* Scanner Dialog */}
      <BillScannerDialog
        open={isScannerOpen}
        onOpenChange={setIsScannerOpen}
        onBillScanned={handleBillScanned}
      />

      {/* Form Dialog */}
      <BillFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        bill={editingBill}
        scannedData={scannedBillData}
        onSave={handleSaveBill}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingBill} onOpenChange={() => setDeletingBill(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bill</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingBill?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}