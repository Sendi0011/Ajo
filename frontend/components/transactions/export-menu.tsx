'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Download, FileText, FileSpreadsheet, Receipt, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { FilterOptions, ExportColumn } from '@/types/transaction';

interface ExportMenuProps {
  filters?: FilterOptions;
  userAddress?: string;
}

const DEFAULT_COLUMNS: ExportColumn[] = [
  { key: 'timestamp', label: 'Date', enabled: true },
  { key: 'type', label: 'Type', enabled: true },
  { key: 'status', label: 'Status', enabled: true },
  { key: 'amount', label: 'Amount', enabled: true },
  { key: 'currency', label: 'Currency', enabled: true },
  { key: 'poolName', label: 'Pool', enabled: true },
  { key: 'description', label: 'Description', enabled: false },
  { key: 'hash', label: 'Transaction Hash', enabled: false },
  { key: 'blockNumber', label: 'Block Number', enabled: false },
  { key: 'gasFee', label: 'Gas Fee', enabled: false },
  { key: 'userAddress', label: 'User Address', enabled: false },
  { key: 'userName', label: 'User Name', enabled: false },
];

export function ExportMenu({ filters, userAddress }: ExportMenuProps) {
  const [exporting, setExporting] = useState(false);
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<ExportColumn[]>(DEFAULT_COLUMNS);

  const handleExportCSV = async (columns?: ExportColumn[]) => {
    try {
      setExporting(true);
      
      const response = await fetch('/api/transactions/export/csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filters: {
            ...filters,
            ...(userAddress && { userAddress }),
          },
          columns: columns || selectedColumns.filter(c => c.enabled),
        }),
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('CSV exported successfully');
    } catch (error) {
      toast.error('Failed to export CSV');
      console.error('Export error:', error);
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setExporting(true);
      
      const response = await fetch('/api/transactions/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filters: {
            ...filters,
            ...(userAddress && { userAddress }),
          },
          includeCharts: true,
        }),
      });

      if (!response.ok) throw new Error('Export failed');

      const data = await response.json();
      
      // For now, we'll handle PDF generation client-side
      toast.info('PDF generation will be available soon');
    } catch (error) {
      toast.error('Failed to export PDF');
      console.error('Export error:', error);
    } finally {
      setExporting(false);
    }
  };

  const handleGenerateTaxReport = async () => {
    try {
      if (!userAddress) {
        toast.error('User address required for tax report');
        return;
      }

      setExporting(true);
      
      const currentYear = new Date().getFullYear();
      
      const response = await fetch('/api/transactions/tax-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress,
          year: currentYear,
          period: 'yearly',
        }),
      });

      if (!response.ok) throw new Error('Tax report generation failed');

      const data = await response.json();
      toast.success('Tax report generated successfully');
    } catch (error) {
      toast.error('Failed to generate tax report');
      console.error('Tax report error:', error);
    } finally {
      setExporting(false);
    }
  };

  const toggleColumn = (key: string) => {
    setSelectedColumns(cols =>
      cols.map(col =>
        col.key === key ? { ...col, enabled: !col.enabled } : col
      )
    );
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={exporting}>
            {exporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => handleExportCSV()}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export as CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowColumnPicker(true)}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            CSV with Custom Columns
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportPDF}>
            <FileText className="mr-2 h-4 w-4" />
            Export as PDF
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleGenerateTaxReport}>
            <Receipt className="mr-2 h-4 w-4" />
            Generate Tax Report
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Column Picker Dialog */}
      <Dialog open={showColumnPicker} onOpenChange={setShowColumnPicker}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Columns to Export</DialogTitle>
            <DialogDescription>
              Choose which columns you want to include in the CSV export
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {selectedColumns.map((column) => (
                <div key={column.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={column.key}
                    checked={column.enabled}
                    onCheckedChange={() => toggleColumn(column.key)}
                  />
                  <Label
                    htmlFor={column.key}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {column.label}
                  </Label>
                </div>
              ))}
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowColumnPicker(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  handleExportCSV(selectedColumns);
                  setShowColumnPicker(false);
                }}
                disabled={!selectedColumns.some(c => c.enabled)}
              >
                Export CSV
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}