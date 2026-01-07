'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Filter, X, Calendar } from 'lucide-react';
import { DateRangePicker } from './date-range-picker';
import type { FilterOptions, TransactionType, TransactionStatus, TransactionCategory, DatePreset } from '@/types/transaction';

interface TransactionFiltersProps {
  filters: FilterOptions;
  onChange: (filters: FilterOptions) => void;
}

const TRANSACTION_TYPES: TransactionType[] = [
  'CONTRIBUTION',
  'PAYOUT',
  'WITHDRAWAL',
  'EMERGENCY',
  'FEE',
  'REFUND',
  'TRANSFER',
];

const TRANSACTION_STATUSES: TransactionStatus[] = [
  'PENDING',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
  'REVERTED',
];

const TRANSACTION_CATEGORIES: TransactionCategory[] = [
  'SAVINGS',
  'EMERGENCY',
  'WITHDRAWAL',
  'INVESTMENT',
  'FEE',
  'OTHER',
];

export function TransactionFilters({ filters, onChange }: TransactionFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeFilterCount = [
    filters.type?.length,
    filters.status?.length,
    filters.category?.length,
    filters.dateRange ? 1 : 0,
    filters.isBookmarked ? 1 : 0,
  ].filter(Boolean).length;

  const handleTypeToggle = (type: TransactionType) => {
    const currentTypes = filters.type || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter((t) => t !== type)
      : [...currentTypes, type];

    onChange({
      ...filters,
      type: newTypes.length > 0 ? newTypes : undefined,
    });
  };

  const handleStatusToggle = (status: TransactionStatus) => {
    const currentStatuses = filters.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter((s) => s !== status)
      : [...currentStatuses, status];

    onChange({
      ...filters,
      status: newStatuses.length > 0 ? newStatuses : undefined,
    });
  };

  const handleCategoryToggle = (category: TransactionCategory) => {
    const currentCategories = filters.category || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter((c) => c !== category)
      : [...currentCategories, category];

    onChange({
      ...filters,
      category: newCategories.length > 0 ? newCategories : undefined,
    });
  };

  const clearFilters = () => {
    onChange({});
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Filters</h4>
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                >
                  Clear all
                </Button>
              )}
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <DateRangePicker
                value={filters.dateRange}
                onChange={(range) => onChange({ ...filters, dateRange: range })}
              />
            </div>

            {/* Transaction Type */}
            <div className="space-y-2">
              <Label>Type</Label>
              <div className="grid grid-cols-2 gap-2">
                {TRANSACTION_TYPES.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type}`}
                      checked={filters.type?.includes(type)}
                      onCheckedChange={() => handleTypeToggle(type)}
                    />
                    <Label
                      htmlFor={`type-${type}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {type}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="grid grid-cols-2 gap-2">
                {TRANSACTION_STATUSES.map((status) => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status}`}
                      checked={filters.status?.includes(status)}
                      onCheckedChange={() => handleStatusToggle(status)}
                    />
                    <Label
                      htmlFor={`status-${status}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {status}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Category</Label>
              <div className="grid grid-cols-2 gap-2">
                {TRANSACTION_CATEGORIES.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category}`}
                      checked={filters.category?.includes(category)}
                      onCheckedChange={() => handleCategoryToggle(category)}
                    />
                    <Label
                      htmlFor={`category-${category}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Bookmarked Only */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="bookmarked"
                checked={filters.isBookmarked}
                onCheckedChange={(checked) =>
                  onChange({ ...filters, isBookmarked: checked as boolean })
                }
              />
              <Label htmlFor="bookmarked" className="cursor-pointer">
                Show bookmarked only
              </Label>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filter Badges */}
      {filters.type?.map((type) => (
        <Badge key={type} variant="secondary">
          {type}
          <button
            className="ml-1"
            onClick={() => handleTypeToggle(type)}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {filters.status?.map((status) => (
        <Badge key={status} variant="secondary">
          {status}
          <button
            className="ml-1"
            onClick={() => handleStatusToggle(status)}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {filters.dateRange && (
        <Badge variant="secondary">
          <Calendar className="h-3 w-3 mr-1" />
          Date Range
          <button
            className="ml-1"
            onClick={() => onChange({ ...filters, dateRange: undefined })}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
    </div>
  );
}