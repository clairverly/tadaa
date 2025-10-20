import { useState, useEffect } from 'react';
import { Plus, Search, FileText, Scan, ArrowLeft, Zap, Home, Shield, CreditCard, Wifi, DollarSign, Mail, HandCoins, Umbrella, ParkingCircle, Building2, Syringe, Warehouse, IdCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { BillFormDialog } from '@/components/bills/bill-form-dialog';
import { BillScannerDialog } from '@/components/bills/bill-scanner-dialog';
import { EmailIntegrationDialog } from '@/components/bills/email-integration-dialog';
import { BillCard } from '@/components/bills/bill-card';
import { billStorage } from '@/lib/storage';
import { Bill, BillStatus, BillCategory } from '@/types';
import { ScannedBillData } from '@/lib/bill-ocr';
import { showSuccess } from '@/utils/toast';

const billCategories = [
  { 
    id: 'utilities', 
    name: 'Utilities', 
    icon: Zap, 
    color: 'bg-amber-100',
    iconColor: 'text-amber-700',
    borderColor: 'border-amber-200'
  },
  { 
    id: 'credit-card', 
    name: 'Credit Cards', 
    icon: CreditCard, 
    color: 'bg-blue-100',
    iconColor: 'text-blue-700',
    borderColor: 'border-blue-200'
  },
  { 
    id: 'rent', 
    name: 'Rent & Housing', 
    icon: Home, 
    color: 'bg-emerald-100',
    iconColor: 'text-emerald-700',
    borderColor: 'border-emerald-200'
  },
  { 
    id: 'insurance', 
    name: 'Insurance', 
    icon: Umbrella, 
    color: 'bg-purple-100',
    iconColor: 'text-purple-700',
    borderColor: 'border-purple-200'
  },
  { 
    id: 'subscription', 
    name: 'Subscriptions', 
    icon: Wifi, 
    color: 'bg-cyan-100',
    iconColor: 'text-cyan-700',
    borderColor: 'border-cyan-200'
  },
  { 
    id: 'other', 
    name: 'General', 
    icon: Mail, 
    color: 'bg-gray-100',
    iconColor: 'text-gray-700',
    borderColor: 'border-gray-200'
  },
];

export default function Bills() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [filteredBills, setFilteredBills] = useState<Bill[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<BillStatus | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<BillCategory | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isEmailIntegrationOpen, setIsEmailIntegrationOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [scannedBillData, setScannedBillData] = useState<ScannedBillData | null>(null);
  const [deletingBill, setDeletingBill] = useState<Bill | null>(null);

  useEffect(() => {
    loadBills();
  }, []);

  useEffect(() => {
    filterBills();
  }, [bills, searchTerm, statusFilter, selectedCategory]);

  const loadBills = () => {
    const allBills = billStorage.getAll();
    setBills(allBills);
  };

  const filterBills = () => {
    let filtered = [...bills];

    if (selectedCategory) {
      filtered = filtered.filter(bill => bill.category === selectedCategory);
    }

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

  const handleCategorySelect = (categoryId: BillCategory) => {
    setSelectedCategory(categoryId);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSearchTerm('');
    setStatusFilter('all');
  };

  const getCategoryBills = (categoryId: BillCategory) => {
    return bills.filter(bill => bill.category === categoryId);
  };

  // Category View
  if (!selectedCategory) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Pay Bills</h1>
            <p className="text-gray-500">Select a category to manage your bills</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setIsEmailIntegrationOpen(true)}
            className="flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            Email Integration
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3">
          <Button 
            onClick={handleScanBill} 
            className="flex-1 bg-gray-900 hover:bg-gray-800 text-white shadow-md"
          >
            <Scan className="h-5 w-5 mr-2" />
            Scan Bill
          </Button>
          <Button 
            onClick={handleAddNew}
            className="flex-1 bg-gray-900 hover:bg-gray-800 text-white shadow-md"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Bill
          </Button>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 gap-4">
          {billCategories.map((category) => {
            const CategoryIcon = category.icon;
            const categoryBillCount = getCategoryBills(category.id as BillCategory).length;
            
            return (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id as BillCategory)}
                className={`bg-white border-2 ${category.borderColor} rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 active:scale-98`}
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className={`w-20 h-20 rounded-xl ${category.color} border ${category.borderColor} flex items-center justify-center`}>
                    <CategoryIcon className={`h-10 w-10 ${category.iconColor}`} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{category.name}</p>
                    {categoryBillCount > 0 && (
                      <p className="text-xs text-gray-500 mt-1">{categoryBillCount} bill{categoryBillCount !== 1 ? 's' : ''}</p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Scanner Dialog */}
        <BillScannerDialog
          open={isScannerOpen}
          onOpenChange={setIsScannerOpen}
          onBillScanned={handleBillScanned}
        />

        {/* Email Integration Dialog */}
        <EmailIntegrationDialog
          open={isEmailIntegrationOpen}
          onOpenChange={setIsEmailIntegrationOpen}
        />

        {/* Form Dialog */}
        <BillFormDialog
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          bill={editingBill}
          scannedData={scannedBillData}
          onSave={handleSaveBill}
          defaultCategory={null}
        />
      </div>
    );
  }

  // Bills List View
  const selectedCategoryData = billCategories.find(c => c.id === selectedCategory);
  const CategoryIcon = selectedCategoryData?.icon || FileText;

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackToCategories}
          className="hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${selectedCategoryData?.color} border ${selectedCategoryData?.borderColor}`}>
              <CategoryIcon className={`h-6 w-6 ${selectedCategoryData?.iconColor}`} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{selectedCategoryData?.name}</h1>
              <p className="text-gray-500 text-sm">{filteredBills.length} bill{filteredBills.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleScanBill} variant="outline">
            <Scan className="h-4 w-4 mr-2" />
            Scan
          </Button>
          <Button onClick={handleAddNew}>
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
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bills Grid */}
      {filteredBills.length === 0 ? (
        <div className="text-center py-16">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-xl ${selectedCategoryData?.color} border-2 ${selectedCategoryData?.borderColor} mb-6`}>
            <CategoryIcon className={`h-12 w-12 ${selectedCategoryData?.iconColor}`} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchTerm || statusFilter !== 'all' 
              ? 'No bills match your filters' 
              : `No ${selectedCategoryData?.name} bills yet`}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Add your first bill to get started'}
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <div className="flex gap-3 justify-center">
              <Button onClick={handleScanBill} variant="outline" size="lg">
                <Scan className="h-5 w-5 mr-2" />
                Scan a Bill
              </Button>
              <Button onClick={handleAddNew} size="lg">
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

      {/* Email Integration Dialog */}
      <EmailIntegrationDialog
        open={isEmailIntegrationOpen}
        onOpenChange={setIsEmailIntegrationOpen}
      />

      {/* Form Dialog */}
      <BillFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        bill={editingBill}
        scannedData={scannedBillData}
        onSave={handleSaveBill}
        defaultCategory={selectedCategory}
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