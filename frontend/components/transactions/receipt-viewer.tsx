'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Download, Printer, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import type { Receipt } from '@/types/receipt';

interface ReceiptViewerProps {
  transactionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReceiptViewer({ transactionId, open, onOpenChange }: ReceiptViewerProps) {
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && transactionId) {
      generateOrFetchReceipt();
    }
  }, [open, transactionId]);

  const generateOrFetchReceipt = async () => {
    try {
      setLoading(true);
      
      // First try to fetch existing receipt
      let response = await fetch(`/api/transactions/receipt?transactionId=${transactionId}`);
      
      if (response.status === 404) {
        // Generate new receipt if not exists
        response = await fetch('/api/transactions/receipt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactionId }),
        });
      }

      const data = await response.json();
      setReceipt(data.receipt);
    } catch (error) {
      toast.error('Failed to load receipt');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    toast.info('PDF download will be available soon');
  };

  if (loading || !receipt) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Transaction Receipt</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-6 bg-muted/30 rounded-lg">
          {/* Receipt Header */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">AJO Platform</h2>
            <p className="text-sm text-muted-foreground">Transaction Receipt</p>
            <p className="text-xs text-muted-foreground">Receipt #{receipt.receiptNumber}</p>
          </div>

          <Separator />

          {/* Transaction Details */}
          <div className="space-y-4">
            <ReceiptRow label="Date" value={new Date(receipt.generatedAt).toLocaleString()} />
            <ReceiptRow label="Amount" value={`${receipt.transaction.amount} ${receipt.transaction.currency}`} />
            <ReceiptRow label="Type" value={receipt.transaction.type} />
            <ReceiptRow label="Status" value={receipt.transaction.status} />
            <ReceiptRow label="From" value={receipt.metadata.recipientAddress} />
            <ReceiptRow label="Pool" value={receipt.transaction.poolName} />
          </div>

          <Separator />

          {/* Transaction Hash */}
          <div>
            <p className="text-sm font-medium mb-2">Transaction Hash</p>
            <code className="block p-3 bg-background rounded text-xs break-all font-mono">
              {receipt.transaction.hash}
            </code>
          </div>

          {/* QR Code Placeholder */}
          <div className="flex justify-center">
            <div className="w-32 h-32 bg-background rounded flex items-center justify-center">
              <p className="text-xs text-muted-foreground text-center">QR Code</p>
            </div>
          </div>

          <Separator />

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground">
            <p>This is a computer-generated receipt.</p>
            <p>View on Block Explorer: {receipt.metadata.blockExplorer}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" className="flex-1" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button variant="outline" className="flex-1" asChild>
            <a
              href={`${receipt.metadata.blockExplorer}/tx/${receipt.transaction.hash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View on Explorer
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}