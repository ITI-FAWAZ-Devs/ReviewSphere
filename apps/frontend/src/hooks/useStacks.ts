import { useState, useEffect } from 'react';
import axios from '@/lib/axios';

export interface Stack {
  id: string;
  name: string;
  description?: string;
}

export function useStacks() {
  const [stacks, setStacks] = useState<Stack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStacks = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await axios.get<Stack[]>('/stacks');
        setStacks(data);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Failed to load stacks');
      } finally {
        setLoading(false);
      }
    };

    fetchStacks();
  }, []);

  return { stacks, loading, error };
}
