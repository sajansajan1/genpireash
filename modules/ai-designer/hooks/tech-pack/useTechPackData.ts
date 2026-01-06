/**
 * useTechPackData Hook
 * Manages tech pack data fetching and updates
 */

import { useState, useEffect, useCallback } from 'react';
import { techPackApi } from '../../services/techPackApi';
import type { TechPackData, TechPackContent, UseTechPackDataReturn } from '../../types/techPack';

export function useTechPackData(productId: string | null): UseTechPackDataReturn {
  const [techPack, setTechPack] = useState<TechPackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tech pack data
  const fetchTechPack = useCallback(async () => {
    if (!productId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await techPackApi.getTechPack(productId);
      setTechPack(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load tech pack';
      setError(errorMessage);
      console.error('Error fetching tech pack:', err);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  // Initial fetch
  useEffect(() => {
    fetchTechPack();
  }, [fetchTechPack]);

  // Refresh function
  const refresh = useCallback(async () => {
    await fetchTechPack();
  }, [fetchTechPack]);

  // Update function
  const update = useCallback(
    async (updates: Partial<TechPackContent>): Promise<boolean> => {
      if (!productId || !techPack) {
        return false;
      }

      try {
        const result = await techPackApi.updateTechPack(productId, updates);

        if (result.success) {
          // Optimistically update local state
          setTechPack((prev) =>
            prev
              ? {
                  ...prev,
                  tech_pack_data: {
                    ...prev.tech_pack_data,
                    ...updates,
                  },
                }
              : null
          );

          return true;
        }

        return false;
      } catch (err) {
        console.error('Error updating tech pack:', err);
        return false;
      }
    },
    [productId, techPack]
  );

  return {
    techPack,
    loading,
    error,
    refresh,
    update,
  };
}
