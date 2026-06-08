import { useState, useEffect } from 'react';
import { Address, GeocodedAddress } from '../types';

const DELAY_MS = 1100; // Nominatim rate limit: 1 req/sec

async function geocodeAddress(address: Address): Promise<GeocodedAddress> {
  if (address.latLng) {
    return { ...address, status: 'resolved', latLng: address.latLng };
  }

  const query = `${address.street}, ${address.city}, ${address.state} ${address.zip}, USA`;
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;

  const res = await fetch(url, {
    headers: { 'Accept-Language': 'en', 'User-Agent': 'MapExplorerApp/1.0' },
  });

  if (!res.ok) throw new Error('Nominatim request failed');

  const data = await res.json();
  if (!data.length) throw new Error('No results');

  return {
    ...address,
    status: 'resolved',
    latLng: { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) },
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useGeocoder(addresses: Address[]): GeocodedAddress[] {
  const [geocoded, setGeocoded] = useState<GeocodedAddress[]>(() =>
    addresses.map((a) => ({ ...a, status: 'loading', latLng: null }))
  );

  useEffect(() => {
    if (!addresses.length) return;

    let cancelled = false;

    (async () => {
      for (let i = 0; i < addresses.length; i++) {
        if (cancelled) break;

        try {
          const result = await geocodeAddress(addresses[i]);
          if (!cancelled) {
            setGeocoded((prev) =>
              prev.map((g) => (g.id === result.id ? result : g))
            );
          }
        } catch {
          if (!cancelled) {
            setGeocoded((prev) =>
              prev.map((g) =>
                g.id === addresses[i].id ? { ...g, status: 'error' } : g
              )
            );
          }
        }

        if (i < addresses.length - 1) await sleep(DELAY_MS);
      }
    })();

    return () => { cancelled = true; };
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  return geocoded;
}
