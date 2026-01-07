'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import type { ExportOptions, ExportFormat } from '@/types/export';

interface UseTransactionExportReturn {
  exporting: boolean;
  exportCSV: (options: ExportOptions) => Promise<void>;
  exportPDF: (options: ExportOptions) => Promise<void>;
  exportJSON: (options: ExportOptions) => Promise<void>;
}

export function useTransactionExport(): UseTransactionExportReturn {
  const [exporting, setExporting] = useState(false);

  const exportCSV = async (options: ExportOptions) => {
    try {
      setExporting(true);

      const response = await fetch('/api/transactions/export/csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = options.filename || `transactions-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('CSV exported successfully');
    } catch (error) {
      toast.error('Failed to export CSV');
      console.error('CSV export error:', error);
      throw error;
    } finally {
      setExporting(false);
    }
  };

  const exportPDF = async (options: ExportOptions) => {
    try {
      setExporting(true);

      const response = await fetch('/api/transactions/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // For now, we'll handle PDF generation differently
      toast.info('PDF export will be available soon');
    } catch (error) {
      toast.error('Failed to export PDF');
      console.error('PDF export error:', error);
      throw error;
    } finally {
      setExporting(false);
    }
  };

  const exportJSON = async (options: ExportOptions) => {
    try {
      setExporting(true);

      const response = await fetch(`/api/transactions?${buildQueryParams(options)}`);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

      const data = await response.json();
      const json = JSON.stringify(data.transactions, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = options.filename || `transactions-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('JSON exported successfully');
    } catch (error) {
      toast.error('Failed to export JSON');
      console.error('JSON export error:', error);
      throw error;
    } finally {
      setExporting(false);
    }
  };

  return {
    exporting,
    exportCSV,
    exportPDF,
    exportJSON,
  };
}

function buildQueryParams(options: ExportOptions): string {
  const params = new URLSearchParams();
  
  if (options.filters?.type) {
    params.append('type', options.filters.type.join(','));
  }
  if (options.filters?.status) {
    params.append('status', options.filters.status.join(','));
  }
  if (options.dateRange) {
    params.append('startDate', options.dateRange.start.toISOString());
    params.append('endDate', options.dateRange.end.toISOString());
  }
  
  return params.toString();
}
