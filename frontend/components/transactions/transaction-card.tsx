'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowUpRight,
  ArrowDownLeft,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  MoreVertical,
  FileText,
  Tag,
  MessageSquare,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TransactionDetailModal } from './transaction-detail-modal';
import type { Transaction } from '@/types/transaction';
import { formatDistanceToNow } from 'date-fns';

interface TransactionCardProps {
  transaction: Transaction;
  onUpdate?: () => void;
}

export function TransactionCard({ transaction, onUpdate }: TransactionCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(transaction.isBookmarked);
  const [showDetail, setShowDetail] = useState(false);

  const getTypeIcon = () => {
    switch (transaction.type) {
      case 'CONTRIBUTION':
      case 'PAYOUT':
        return <ArrowUpRight className="h-5 w-5" />;
      case 'WITHDRAWAL':
      case 'EMERGENCY':
        return <ArrowDownLeft className="h-5 w-5" />;
      default:
        return <ArrowUpRight className="h-5 w-5" />;
    }
  };

  const getStatusColor = () => {
    switch (transaction.status) {
      case 'COMPLETED':
        return 'bg-primary/10 text-primary';
      case 'PENDING':
      case 'PROCESSING':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-500';
      case 'FAILED':
      case 'CANCELLED':
      case 'REVERTED':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeColor = () => {
    switch (transaction.type) {
      case 'CONTRIBUTION':
        return 'bg-primary/10 text-primary';
      case 'PAYOUT':
        return 'bg-accent/10 text-accent';
      case 'WITHDRAWAL':
      case 'EMERGENCY':
        return 'bg-orange-500/10 text-orange-600 dark:text-orange-500';
      case 'FEE':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const toggleBookmark = async () => {
    try {
      const response = await fetch(`/api/transactions/${transaction.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_bookmarked: !isBookmarked }),
      });

      if (response.ok) {
        setIsBookmarked(!isBookmarked);
        onUpdate?.();
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  };

  return (
    <>
      <Card className="p-6 hover:bg-muted/30 transition-colors cursor-pointer group">
        <div className="flex items-start justify-between gap-4">
          {/* Left Section: Icon + Info */}
          <div className="flex items-start gap-4 flex-1" onClick={() => setShowDetail(true)}>
            {/* Icon */}
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${getTypeColor()}`}>
              {getTypeIcon()}
            </div>

            {/* Transaction Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-semibold capitalize">{transaction.type.toLowerCase()}</h3>
                <Badge variant="secondary" className={getStatusColor()}>
                  {transaction.status}
                </Badge>
                {transaction.tags.length > 0 && (
                  <div className="flex gap-1">
                    {transaction.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                    {transaction.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{transaction.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-2">
                {transaction.description || 'No description'}
              </p>

              {/* Pool & User Info */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={transaction.userAvatar || undefined} />
                    <AvatarFallback>{transaction.userName?.[0] || transaction.userAddress.slice(2, 4).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span>{transaction.userName || `${transaction.userAddress.slice(0, 6)}...${transaction.userAddress.slice(-4)}`}</span>
                </div>
                <span>•</span>
                <span>{transaction.poolName}</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(transaction.timestamp), { addSuffix: true })}</span>
              </div>

              {/* Notes indicator */}
              {transaction.notes && (
                <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                  <MessageSquare className="h-3 w-3" />
                  <span>Has notes</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Section: Amount + Actions */}
          <div className="flex flex-col items-end gap-2">
            <div className="text-right">
              <p className="text-xl font-bold">
                {parseFloat(transaction.amount).toFixed(4)} {transaction.currency}
              </p>
              {transaction.amountUSD && (
                <p className="text-sm text-muted-foreground">
                  ${parseFloat(transaction.amountUSD).toFixed(2)}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleBookmark();
                }}
              >
                {isBookmarked ? (
                  <BookmarkCheck className="h-4 w-4 text-primary" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                asChild
                onClick={(e) => e.stopPropagation()}
              >
                <a
                  href={`https://basescan.org/tx/${transaction.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowDetail(true)}>
                    <FileText className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Receipt
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </Card>

      {/* Detail Modal */}
      <TransactionDetailModal
        transactionId={transaction.id}
        open={showDetail}
        onOpenChange={setShowDetail}
        onUpdate={onUpdate}
      />
    </>
  );
}