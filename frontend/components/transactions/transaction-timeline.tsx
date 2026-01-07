'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowUpRight, ArrowDownLeft, CheckCircle2, Clock, XCircle } from 'lucide-react';
import type { Transaction } from '@/types/transaction';
import { formatDistanceToNow } from 'date-fns';

interface TransactionTimelineProps {
  transactions: Transaction[];
}

export function TransactionTimeline({ transactions }: TransactionTimelineProps) {
  // Group transactions by date
  const groupedTransactions = groupTransactionsByDate(transactions);

  return (
    <div className="space-y-8">
      {Object.entries(groupedTransactions).map(([date, txs]) => (
        <div key={date}>
          {/* Date Header */}
          <div className="flex items-center gap-4 mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground">{date}</h3>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Timeline Items */}
          <div className="space-y-4">
            {txs.map((tx, index) => (
              <TimelineItem
                key={tx.id}
                transaction={tx}
                isLast={index === txs.length - 1}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TimelineItem({ transaction, isLast }: { transaction: Transaction; isLast: boolean }) {
  const getIcon = () => {
    switch (transaction.status) {
      case 'COMPLETED':
        return <CheckCircle2 className="h-5 w-5 text-primary" />;
      case 'PENDING':
      case 'PROCESSING':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'FAILED':
      case 'CANCELLED':
      case 'REVERTED':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getTypeIcon = () => {
    switch (transaction.type) {
      case 'CONTRIBUTION':
      case 'PAYOUT':
        return <ArrowUpRight className="h-4 w-4" />;
      case 'WITHDRAWAL':
      case 'EMERGENCY':
        return <ArrowDownLeft className="h-4 w-4" />;
      default:
        return <ArrowUpRight className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex gap-4">
      {/* Timeline Line */}
      <div className="flex flex-col items-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-border bg-background">
          {getIcon()}
        </div>
        {!isLast && <div className="w-px flex-1 bg-border my-1" />}
      </div>

      {/* Content */}
      <Card className="flex-1 p-4 mb-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Transaction Info */}
          <div className="flex items-start gap-3 flex-1">
            {/* Type Icon */}
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
              transaction.type === 'CONTRIBUTION' ? 'bg-primary/10 text-primary' :
              transaction.type === 'PAYOUT' ? 'bg-accent/10 text-accent' :
              'bg-muted text-muted-foreground'
            }`}>
              {getTypeIcon()}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold capitalize">{transaction.type.toLowerCase()}</h4>
                <Badge variant="secondary" className="text-xs">
                  {transaction.status}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground mb-2">
                {transaction.description || 'No description'}
              </p>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={transaction.userAvatar || undefined} />
                  <AvatarFallback>
                    {transaction.userName?.[0] || transaction.userAddress.slice(2, 4).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span>
                  {transaction.userName || `${transaction.userAddress.slice(0, 6)}...${transaction.userAddress.slice(-4)}`}
                </span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(transaction.timestamp), { addSuffix: true })}</span>
              </div>
            </div>
          </div>

          {/* Right: Amount */}
          <div className="text-right">
            <p className="text-lg font-bold whitespace-nowrap">
              {parseFloat(transaction.amount).toFixed(4)} {transaction.currency}
            </p>
            {transaction.amountUSD && (
              <p className="text-xs text-muted-foreground">
                ${parseFloat(transaction.amountUSD).toFixed(2)}
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

function groupTransactionsByDate(transactions: Transaction[]) {
  const grouped: Record<string, Transaction[]> = {};

  transactions.forEach((tx) => {
    const date = new Date(tx.timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let dateKey: string;
    
    if (date.toDateString() === today.toDateString()) {
      dateKey = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateKey = 'Yesterday';
    } else {
      dateKey = date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }

    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(tx);
  });

  return grouped;
}