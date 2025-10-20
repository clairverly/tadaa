import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, Upload, Loader2, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import { simulateBillScan, ScannedBillData } from '@/lib/bill-ocr';
import { Badge } from '@/components/ui/badge';

interface BillScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBillScanned: (billData: ScannedBillData) => void;
}

export function BillScannerDialog({ open, onOpenChange, onBillScanned }: BillScannerDialogProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scannedData, setScannedData] = useState<ScannedBillData | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setScannedData(null);
    }
  };

  const handleScan = async () => {
    if (!selectedFile) return;

    setIsScanning(true);
    try {
      const data = await simulateBillScan(selectedFile);
      setScannedData(data);
    } catch (error) {
      console.error('Scan failed:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleUseBillData = () => {
    if (scannedData) {
      onBillScanned(scannedData);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setScannedData(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    onOpenChange(false);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.75) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.9) return <CheckCircle className="h-4 w-4 text-green-600" />;
    return <AlertCircle className="h-4 w-4 text-yellow-600" />;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Scan Bill
          </DialogTitle>
          <DialogDescription>
            Upload a photo of your bill to automatically extract information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert className="bg-blue-50 border-blue-200">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 text-sm">
              Demo Mode: This simulates AI-powered OCR. In production, this would use real document scanning services.
            </AlertDescription>
          </Alert>

          {!previewUrl ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="bill-upload"
              />
              <label htmlFor="bill-upload" className="cursor-pointer">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-2">Click to upload a bill image</p>
                <p className="text-xs text-gray-400">PNG, JPG, PDF up to 10MB</p>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden border">
                <img
                  src={previewUrl}
                  alt="Bill preview"
                  className="w-full h-48 object-cover"
                />
              </div>

              {scannedData ? (
                <div className="space-y-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-green-900 flex items-center gap-2">
                      {getConfidenceIcon(scannedData.confidence)}
                      Bill Information Extracted
                    </h4>
                    <Badge variant="outline" className={getConfidenceColor(scannedData.confidence)}>
                      {(scannedData.confidence * 100).toFixed(0)}% confidence
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-md">
                      <p className="text-xs text-gray-500 mb-1">Bill Name</p>
                      <p className="font-medium text-gray-900">{scannedData.name}</p>
                    </div>

                    <div className="bg-white p-3 rounded-md">
                      <p className="text-xs text-gray-500 mb-1">Amount</p>
                      <p className="font-medium text-gray-900">${scannedData.amount.toFixed(2)}</p>
                    </div>

                    <div className="bg-white p-3 rounded-md">
                      <p className="text-xs text-gray-500 mb-1">Category</p>
                      <p className="font-medium text-gray-900 capitalize">{scannedData.category.replace('-', ' ')}</p>
                    </div>

                    <div className="bg-white p-3 rounded-md">
                      <p className="text-xs text-gray-500 mb-1">Recurrence</p>
                      <p className="font-medium text-gray-900 capitalize">{scannedData.recurrence.replace('-', ' ')}</p>
                    </div>

                    <div className="bg-white p-3 rounded-md col-span-2">
                      <p className="text-xs text-gray-500 mb-1">Due Date</p>
                      <p className="font-medium text-gray-900">{new Date(scannedData.dueDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 mt-2">
                    You can review and edit this information before saving
                  </p>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedFile(null);
                    if (previewUrl) {
                      URL.revokeObjectURL(previewUrl);
                      setPreviewUrl(null);
                    }
                  }}
                  className="w-full"
                >
                  Choose Different Image
                </Button>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {!scannedData ? (
            <Button
              onClick={handleScan}
              disabled={!selectedFile || isScanning}
            >
              {isScanning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Scanning Bill...
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-2" />
                  Scan Bill
                </>
              )}
            </Button>
          ) : (
            <Button onClick={handleUseBillData}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Use This Information
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}