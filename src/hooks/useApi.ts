"use client";

import { useState } from 'react';

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = async (url: string, options?: RequestInit) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errData = await response.text();
        throw new Error(errData || "Request failed");
      }

      return await response.json();
    } catch (err: any) {
      console.error(`API Error on ${url}:`, err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    get: (url: string) => request(url),
    post: (url: string, data: any) => request(url, { method: 'POST', body: JSON.stringify(data) }),
    patch: (url: string, data: any) => request(url, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (url: string) => request(url, { method: 'DELETE' }),
  };
}
