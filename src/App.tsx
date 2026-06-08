import { useState, useCallback } from 'react';
import { AddressList } from './components/AddressList';
import { MapView } from './components/MapView';
import { useGeolocation } from './hooks/useGeolocation';
import { useGeocoder } from './hooks/useGeocoder';
import { addresses as rawAddresses } from './data/addresses';
import './App.css';

export default function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { location: userLocation } = useGeolocation();
  const addresses = useGeocoder(rawAddresses);

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  return (
    <div className="app">
      <AddressList
        addresses={addresses}
        selectedId={selectedId}
        userLocation={userLocation}
        onSelect={handleSelect}
      />
      <MapView
        addresses={addresses}
        userLocation={userLocation}
        selectedId={selectedId}
        onSelect={handleSelect}
      />
    </div>
  );
}
