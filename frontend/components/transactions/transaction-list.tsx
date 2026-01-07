'use client';

import { useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { TransactionCard } from './transaction-card';
import { TransactionFilters } from './transaction-filters';
import { TransactionSearch } from './transaction-search';
import { TransactionStats } from './transaction-stats';
import { ExportMenu } from './export-menu';
import { TransactionSkeleton } from './transaction-skeleton';
import { TransactionEmpty } from './transaction-empty';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { FilterOptions, SortOption } from '@/types/transaction';

interface TransactionListProps {
  userAddress?: string;
  poolId?: string;
  showStats?: boolean;
  showFilters?: boolean;
}

export function TransactionList({
  userAddress,
  poolId,
  showStats = true,
  showFilters = true,
}: TransactionListProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    ...(poolId && { poolId: [poolId] }),
  });
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>({
    field: 'timestamp',
    direction: 'desc',
  });

  const {
    transactions,
    loading,
    error,
    pagination,
    refetch,
  } = useTransactions({
    filters,
    page,
    limit: 20,
    sortBy,
    userAddress,
  });

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page on filter change
  };

  const handleSearch = (query: string) => {
    setFilters({ ...filters, searchQuery: query });
    setPage(1);
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load transactions</p>
        <Button onClick={() => refetch()} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {showStats && <TransactionStats filters={filters} userAddress={userAddress} />}

      {/* Search and Export Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <TransactionSearch onSearch={handleSearch} />
        <ExportMenu filters={filters} userAddress={userAddress} />
      </div>

      {/* Filters */}
      {showFilters && (
        <TransactionFilters
          filters={filters}
          onChange={handleFilterChange}
        />
      )}

      {/* Transaction List */}
      <div className="space-y-4">
        {loading ? (
          <TransactionSkeleton count={5} />
        ) : transactions.length === 0 ? (
          <TransactionEmpty />
        ) : (
          <>
            {transactions.map((tx) => (
              <TransactionCard key={tx.id} transaction={tx} onUpdate={refetch} />
            ))}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <div className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={!pagination.hasPrev}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={!pagination.hasNext}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}