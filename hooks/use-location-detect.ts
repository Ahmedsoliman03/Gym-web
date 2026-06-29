'use client';

import { useState, useCallback } from 'react';
import { useLocale } from 'next-intl';

export interface LocationResult {
  governorate: string;
  city: string;
  area: string;
  road: string;
  building: string;
  postcode: string;
  display_name: string;
}

export type LocationStatus = 'idle' | 'loading' | 'success' | 'error';

export interface UseLocationDetectReturn {
  status: LocationStatus;
  error: string | null;
  detect: () => void;
}

export function useLocationDetect(
  onSuccess: (result: LocationResult) => void
): UseLocationDetectReturn {
  const locale = useLocale();
  const [status, setStatus] = useState<LocationStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const detect = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const params = new URLSearchParams({
            lat: String(latitude),
            lon: String(longitude),
            lang: locale,
          });

          const res = await fetch(`/api/location?${params}`);
          if (!res.ok) {
            throw new Error(`API error: ${res.status}`);
          }

          const data: LocationResult = await res.json();
          setStatus('success');
          onSuccess(data);
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : 'Failed to fetch location.';
          setError(message);
          setStatus('error');
        }
      },
      (geoError) => {
        const messages: Record<number, string> = {
          1: 'Location permission denied. Please allow access and try again.',
          2: 'Location unavailable. Please try again.',
          3: 'Location request timed out. Please try again.',
        };
        setError(messages[geoError.code] ?? 'Unknown geolocation error.');
        setStatus('error');
      },
      { timeout: 10_000, maximumAge: 60_000 }
    );
  }, [locale, onSuccess]);

  return { status, error, detect };
}
