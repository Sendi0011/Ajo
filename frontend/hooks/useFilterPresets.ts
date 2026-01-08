'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { FilterPreset, FilterPresetInput } from '@/types/filter-preset';

interface UseFilterPresetsParams {
  userAddress: string;
  autoFetch?: boolean;
}

interface UseFilterPresetsReturn {
  presets: FilterPreset[];
  loading: boolean;
  error: string | null;
  createPreset: (preset: FilterPresetInput) => Promise<void>;
  deletePreset: (id: string) => Promise<void>;
  updatePreset: (id: string, preset: Partial<FilterPresetInput>) => Promise<void>;
  setDefaultPreset: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useFilterPresets({
  userAddress,
  autoFetch = true,
}: UseFilterPresetsParams): UseFilterPresetsReturn {
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPresets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/transactions/filter-presets?userAddress=${userAddress}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch filter presets');
      }

      const data = await response.json();
      setPresets(data.presets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Filter presets fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [userAddress]);

  useEffect(() => {
    if (autoFetch && userAddress) {
      fetchPresets();
    }
  }, [fetchPresets, autoFetch, userAddress]);

  const createPreset = async (preset: FilterPresetInput) => {
    try {
      const response = await fetch('/api/transactions/filter-presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress,
          ...preset,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create preset');
      }

      toast.success('Filter preset created');
      await fetchPresets();
    } catch (error) {
      toast.error('Failed to create preset');
      throw error;
    }
  };

  const deletePreset = async (id: string) => {
    try {
      const response = await fetch(`/api/transactions/filter-presets/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete preset');
      }

      toast.success('Filter preset deleted');
      await fetchPresets();
    } catch (error) {
      toast.error('Failed to delete preset');
      throw error;
    }
  };

  const updatePreset = async (id: string, preset: Partial<FilterPresetInput>) => {
    try {
      const response = await fetch(`/api/transactions/filter-presets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preset),
      });

      if (!response.ok) {
        throw new Error('Failed to update preset');
      }

      toast.success('Filter preset updated');
      await fetchPresets();
    } catch (error) {
      toast.error('Failed to update preset');
      throw error;
    }
  };

  const setDefaultPreset = async (id: string) => {
    try {
      const response = await fetch(`/api/transactions/filter-presets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to set default preset');
      }

      toast.success('Default preset set');
      await fetchPresets();
    } catch (error) {
      toast.error('Failed to set default preset');
      throw error;
    }
  };

  return {
    presets,
    loading,
    error,
    createPreset,
    deletePreset,
    updatePreset,
    setDefaultPreset,
    refetch: fetchPresets,
  };
}
