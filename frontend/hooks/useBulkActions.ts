'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import type { BulkActionRequest, BulkActionResponse } from '@/types/bulk-actions';

interface UseBulkActionsReturn {
  processing: boolean;
  executeBulkAction: (request: BulkActionRequest) => Promise<BulkActionResponse>;
}

export function useBulkActions(): UseBulkActionsReturn {
  const [processing, setProcessing] = useState(false);

  const executeBulkAction = async (request: BulkActionRequest): Promise<BulkActionResponse> => {
    try {
      setProcessing(true);

      const response = await fetch('/api/transactions/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Bulk action failed');
      }

      const data: BulkActionResponse = await response.json();

      if (data.success) {
        if (data.failureCount > 0) {
          toast.warning(
            `${data.successCount} succeeded, ${data.failureCount} failed`
          );
        } else {
          toast.success(`Successfully processed ${data.successCount} transactions`);
        }
      }

      return data;
    } catch (error) {
      toast.error('Bulk action failed');
      console.error('Bulk action error:', error);
      throw error;
    } finally {
      setProcessing(false);
    }
  };

  return {
    processing,
    executeBulkAction,
  };
}