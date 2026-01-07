'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  ExternalLink,
  Copy,
  Download,
  Edit,
  Save,
  X,
  Tag as TagIcon,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Transaction } from '@/types/transaction';

interface TransactionDetailModalProps {
  transactionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
}

export function TransactionDetailModal({
  transactionId,
  open,
  onOpenChange,
  onUpdate,
}: TransactionDetailModalProps) {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (open && transactionId) {
      fetchTransaction();
    }
  }, [open, transactionId]);

  const fetchTransaction = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/transactions/${transactionId}`);
      const data = await res.json();
      setTransaction(data.transaction);
      setNotes(data.transaction.notes || '');
      setIsBookmarked(data.transaction.isBookmarked);
    } catch (error) {
      toast.error('Failed to load transaction details');
    } finally {
      setLoading(false);
    }
  };

  const copyHash = () => {
    if (transaction) {
      navigator.clipboard.writeText(transaction.hash);
      toast.success('Transaction hash copied to clipboard');
    }
  };

  const saveNotes = async () => {
    try {
      const res = await fetch(`/api/transactions/${transactionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });

      if (res.ok) {
        toast.success('Notes saved');
        setEditingNotes(false);
        onUpdate?.();
      }
    } catch (error) {
      toast.error('Failed to save notes');
    }
  };

  const toggleBookmark = async () => {
    try {
      const res = await fetch(`/api/transactions/${transactionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_bookmarked: !isBookmarked }),
      });

      if (res.ok) {
        setIsBookmarked(!isBookmarked);
        toast.success(isBookmarked ? 'Bookmark removed' : 'Bookmarked');
        onUpdate?.();
      }
    } catch (error) {
      toast.error('Failed to update bookmark');
    }
  };

  if (loading || !transaction) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Amount & Status Header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-3xl font-bold">
                {parseFloat(transaction.amount).toFixed(6)} {transaction.currency}
              </p>
              {transaction.amountUSD && (
                <p className="text-lg text-muted-foreground">
                  ≈ ${parseFloat(transaction.amountUSD).toFixed(2)} USD
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2 items-end">
              <Badge className={getStatusColorClass(transaction.status)}>
                {transaction.status}
              </Badge>
              <Badge variant="outline">{transaction.type}</Badge>
            </div>
          </div>

          <Separator />

          {/* User & Pool Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">From</p>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={transaction.userAvatar || undefined} />
                  <AvatarFallback>
                    {transaction.userName?.[0] || transaction.userAddress.slice(2, 4).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {transaction.userName || `${transaction.userAddress.slice(0, 6)}...${transaction.userAddress.slice(-4)}`}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Pool</p>
              <p className="font-medium">{transaction.poolName}</p>
              <p className="text-xs text-muted-foreground capitalize">{transaction.poolType}</p>
            </div>
          </div>

          <Separator />

          {/* Transaction Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <DetailItem label="Category" value={transaction.category} />
            <DetailItem 
              label="Date" 
              value={new Date(transaction.timestamp).toLocaleString()} 
            />
            <DetailItem 
              label="Block Number" 
              value={transaction.blockNumber?.toString() || 'N/A'} 
            />
            <DetailItem 
              label="Gas Fee" 
              value={transaction.gasFee ? `${transaction.gasFee} ETH` : 'N/A'} 
            />
            {transaction.confirmedAt && (
              <DetailItem 
                label="Confirmed At" 
                value={new Date(transaction.confirmedAt).toLocaleString()} 
              />
            )}
          </div>

          <Separator />

          {/* Transaction Hash */}
          <div>
            <Label className="text-sm font-medium mb-2">Transaction Hash</Label>
            <div className="flex items-center gap-2 mt-2">
              <code className="flex-1 p-3 bg-muted rounded-lg text-xs break-all font-mono">
                {transaction.hash}
              </code>
              <Button size="icon" variant="outline" onClick={copyHash}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline" asChild>
                <a
                  href={`https://basescan.org/tx/${transaction.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          {/* Tags */}
          {transaction.tags.length > 0 && (
            <div>
              <Label className="text-sm font-medium mb-2">Tags</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {transaction.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    <TagIcon className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Notes Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">Notes</Label>
              {!editingNotes && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingNotes(true)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
            {editingNotes ? (
              <div className="space-y-2">
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this transaction..."
                  rows={4}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={saveNotes}>
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingNotes(false);
                      setNotes(transaction.notes || '');
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                {notes || 'No notes added'}
              </p>
            )}
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={toggleBookmark}>
              {isBookmarked ? (
                <>
                  <BookmarkCheck className="mr-2 h-4 w-4" />
                  Bookmarked
                </>
              ) : (
                <>
                  <Bookmark className="mr-2 h-4 w-4" />
                  Bookmark
                </>
              )}
            </Button>
            <Button variant="outline" className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Generate Receipt
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium mt-1">{value}</p>
    </div>
  );
}

function getStatusColorClass(status: string) {
  switch (status) {
    case 'COMPLETED':
      return 'bg-primary/10 text-primary border-primary/20';
    case 'PENDING':
    case 'PROCESSING':
      return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-500/20';
    case 'FAILED':
    case 'CANCELLED':
    case 'REVERTED':
      return 'bg-destructive/10 text-destructive border-destructive/20';
    default:
      return 'bg-muted text-muted-foreground';
  }
}