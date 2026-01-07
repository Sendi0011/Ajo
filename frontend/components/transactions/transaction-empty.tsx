'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ArrowRight } from 'lucide-react';

interface TransactionEmptyProps {
  title?: string;
  description?: string;
  showAction?: boolean;
}

export function TransactionEmpty({
  title = 'No transactions yet',
  description = 'When you make transactions, they will appear here.',
  showAction = false,
}: TransactionEmptyProps) {
  return (
    <Card className="p-12">
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        {/* Icon */}
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <FileText className="h-10 w-10 text-muted-foreground" />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            {description}
          </p>
        </div>

        {/* Optional Action */}
        {showAction && (
          <Button>
            View All Pools
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </Card>
  );
}
