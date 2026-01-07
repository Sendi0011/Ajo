'use client';

import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import { addDays, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, subMonths } from 'date-fns';
import type { DateRange } from '@/types/transaction';

interface DateRangePickerProps {
  value?: DateRange;
  onChange: (range?: DateRange) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const presets = [
    {
      label: 'Today',
      getValue: () => ({
        start: new Date(),
        end: new Date(),
      }),
    },
    {
      label: 'Yesterday',
      getValue: () => ({
        start: subDays(new Date(), 1),
        end: subDays(new Date(), 1),
      }),
    },
    {
      label: 'Last 7 days',
      getValue: () => ({
        start: subDays(new Date(), 7),
        end: new Date(),
      }),
    },
    {
      label: 'Last 30 days',
      getValue: () => ({
        start: subDays(new Date(), 30),
        end: new Date(),
      }),
    },
    {
      label: 'This month',
      getValue: () => ({
        start: startOfMonth(new Date()),
        end: new Date(),
      }),
    },
    {
      label: 'Last month',
      getValue: () => {
        const lastMonth = subMonths(new Date(), 1);
        return {
          start: startOfMonth(lastMonth),
          end: endOfMonth(lastMonth),
        };
      },
    },
    {
      label: 'This year',
      getValue: () => ({
        start: startOfYear(new Date()),
        end: new Date(),
      }),
    },
  ];

  const formatDateRange = (range?: DateRange) => {
    if (!range) return 'Select date range';
    
    const startDate = new Date(range.start);
    const endDate = new Date(range.end);
    
    return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
  };

  const handlePresetClick = (preset: any) => {
    onChange(preset.getValue());
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-left font-normal">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDateRange(value)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          {/* Presets */}
          <div className="flex flex-col gap-1 p-3 border-r">
            <div className="text-sm font-medium mb-2">Quick Select</div>
            {presets.map((preset) => (
              <Button
                key={preset.label}
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => handlePresetClick(preset)}
              >
                {preset.label}
              </Button>
            ))}
            {value && (
              <Button
                variant="ghost"
                size="sm"
                className="justify-start text-destructive"
                onClick={() => {
                  onChange(undefined);
                  setIsOpen(false);
                }}
              >
                Clear
              </Button>
            )}
          </div>
          
          {/* Calendar */}
          <div className="p-3">
            <Calendar
              mode="range"
              selected={value ? { from: new Date(value.start), to: new Date(value.end) } : undefined}
              onSelect={(range) => {
                if (range?.from && range?.to) {
                  onChange({ start: range.from, end: range.to });
                }
              }}
              numberOfMonths={2}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
