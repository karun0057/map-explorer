import { useState, useEffect } from 'react';
import { LatLng } from '../types';

interface GeolocationState {
  location: LatLng | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({ location: null, error: 'Geolocation not supported', loading: false });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          location: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          error: null,
          loading: false,
        });
      },
      () => {
        // Fall back to center of USA
        setState({
          location: { lat: 39.5, lng: -98.35 },
          error: 'Location access denied — showing USA center',
          loading: false,
        });
      },
      { timeout: 8000 }
    );
  }, []);

  return state;
}
