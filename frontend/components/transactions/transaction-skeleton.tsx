'use client';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface TransactionSkeletonProps {
  count?: number;
}

export function TransactionSkeleton({ count = 3 }: TransactionSkeletonProps) {
  return (
    <>
      {[...Array(count)].map((_, index) => (
        <Card key={index} className="p-6">
          <div className="flex items-start justify-between gap-4">
            {/* Left Section */}
            <div className="flex items-start gap-4 flex-1">
              {/* Icon Skeleton */}
              <Skeleton className="h-12 w-12 rounded-xl" />

              {/* Info Skeleton */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-4 w-full max-w-md" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex flex-col items-end gap-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-20" />
              <div className="flex gap-1">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </>
  );
}
