/ ============================================================================
// COMMIT 35: 
// FILE: hooks/useBulkActions.ts
// ============================================================================

'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import type { BulkActionRequest, BulkActionResponse } from '@/types/bulk-actions';

interface UseBulkActionsReturn {
  processing: boolean;
  executeBulkAction: (request: BulkActionRequest) => Promise<BulkActionResponse>;
}

