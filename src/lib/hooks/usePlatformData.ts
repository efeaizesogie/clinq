'use client';

import { useState, useEffect, useRef } from 'react';
import type { PlatformData } from '@/lib/types';

interface UsePlatformDataReturn {
    data: PlatformData | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

// In-memory cache shared across all hook instances in the same page session
let cachedData: PlatformData | null = null;
let fetchPromise: Promise<PlatformData> | null = null;

async function fetchPlatformData(): Promise<PlatformData> {
    const res = await fetch('/api/platform-data', { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`Failed to fetch platform data: ${res.status}`);
    return res.json();
}

export function usePlatformData(): UsePlatformDataReturn {
    const [data, setData] = useState<PlatformData | null>(cachedData);
    const [isLoading, setIsLoading] = useState(!cachedData);
    const [error, setError] = useState<string | null>(null);
    const mountedRef = useRef(true);

    const load = async (force = false) => {
        // If cached and not forced, skip
        if (cachedData && !force) {
            setData(cachedData);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // De-duplicate concurrent fetches
            if (!fetchPromise || force) {
                fetchPromise = fetchPlatformData();
            }

            const result = await fetchPromise;
            cachedData = result;
            fetchPromise = null;

            if (mountedRef.current) {
                setData(result);
                setIsLoading(false);
            }
        } catch (err: any) {
            fetchPromise = null;
            if (mountedRef.current) {
                setError(err.message || 'Unknown error');
                setIsLoading(false);
            }
        }
    };

    useEffect(() => {
        mountedRef.current = true;
        load();
        return () => { mountedRef.current = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const refetch = () => load(true);

    return { data, isLoading, error, refetch };
}
