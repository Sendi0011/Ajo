'use client';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Activity, DollarSign, CheckCircle2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useTransactionStats } from '@/hooks/useTransactionStats';
import type { FilterOptions } from '@/types/transaction';

interface TransactionStatsProps {
  filters?: FilterOptions;
  userAddress?: string;
}

export function TransactionStats({ filters, userAddress }: TransactionStatsProps) {
  const { stats, loading, error } = useTransactionStats({ filters, userAddress });

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-16" />
          </Card>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Volume"
        value={`${parseFloat(stats.totalVolume).toFixed(4)} ETH`}
        subtitle={stats.totalVolumeUSD !== '0' ? `$${parseFloat(stats.totalVolumeUSD).toFixed(2)}` : undefined}
        icon={<TrendingUp className="h-4 w-4" />}
        trend="+12.5%"
        trendUp={true}
      />
      
      <StatCard
        title="Total Transactions"
        value={stats.totalTransactions.toLocaleString()}
        subtitle={`${stats.recentActivity.last24h} in last 24h`}
        icon={<Activity className="h-4 w-4" />}
      />
      
      <StatCard
        title="Success Rate"
        value={`${stats.successRate}%`}
        subtitle={`${stats.byStatus.COMPLETED || 0} completed`}
        icon={<CheckCircle2 className="h-4 w-4" />}
        trend={parseFloat(stats.successRate) > 95 ? '+2.1%' : undefined}
        trendUp={parseFloat(stats.successRate) > 95}
      />
      
      <StatCard
        title="Average Amount"
        value={`${parseFloat(stats.averageAmount).toFixed(4)} ETH`}
        icon={<DollarSign className="h-4 w-4" />}
      />
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}

function StatCard({ title, value, subtitle, icon, trend, trendUp }: StatCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="text-muted-foreground">{icon}</div>
      </div>
      
      <div className="space-y-1">
        <p className="text-2xl font-bold">{value}</p>
        
        <div className="flex items-center gap-2">
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          
          {trend && (
            <div className={`flex items-center text-xs ${
              trendUp ? 'text-primary' : 'text-destructive'
            }`}>
              {trendUp ? (
                <ArrowUpRight className="h-3 w-3 mr-0.5" />
              ) : (
                <ArrowDownRight className="h-3 w-3 mr-0.5" />
              )}
              {trend}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}