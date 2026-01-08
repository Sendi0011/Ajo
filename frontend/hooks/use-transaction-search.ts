'use client';

import { useState, useEffect } from 'react';
import { useDebounce } from './use-debounce';
import type { TransactionSearchResult } from '@/types/transaction';

interface UseTransactionSearchParams {
  userAddress?: string;
  limit?: number;
}

interface UseTransactionSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  results: TransactionSearchResult[];
  loading: boolean;
  error: string | null;
}

