'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function NotificationSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="divide-y">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="flex items-start gap-4 p-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}