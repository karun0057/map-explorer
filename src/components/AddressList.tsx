import { GeocodedAddress, LatLng } from '../types';
import { AddressCard } from './AddressCard';
import './AddressList.css';

interface Props {
  addresses: GeocodedAddress[];
  selectedId: string | null;
  userLocation: LatLng | null;
  onSelect: (id: string) => void;
}

export function AddressList({ addresses, selectedId, userLocation, onSelect }: Props) {
  const resolved = addresses.filter((a) => a.status === 'resolved').length;
  const isUserSelected = selectedId === '__user__';

  return (
    <aside className="address-list">
      <div className="address-list__header">
        <h1 className="address-list__title">My Location Explorer</h1>
        <p className="address-list__subtitle">
          {resolved} of {addresses.length} locations loaded
        </p>
        <div className="address-list__progress">
          <div
            className="address-list__progress-bar"
            style={{ width: `${(resolved / addresses.length) * 100}%` }}
          />
        </div>
      </div>
      <div className="address-list__scroll">
        {/* Your Location card — always first */}
        <div
          className={`address-card address-card--user ${isUserSelected ? 'address-card--selected' : ''}`}
          onClick={() => onSelect('__user__')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onSelect('__user__')}
        >
          <div className="address-card__indicator" />
          <div className="address-card__body">
            <div className="address-card__name">📍 Your Location</div>
            <div className="address-card__address">
              {userLocation
                ? `${userLocation.lat.toFixed(5)}, ${userLocation.lng.toFixed(5)}`
                : 'Detecting…'}
            </div>
            <div className="address-card__status">
              {userLocation
                ? <span className="badge badge--user">Current location</span>
                : <span className="badge badge--loading">Locating…</span>}
            </div>
          </div>
        </div>

        {addresses.map((address, index) => (
          <AddressCard
            key={address.id}
            address={address}
            index={index + 1}
            isSelected={address.id === selectedId}
            onClick={onSelect}
          />
        ))}
      </div>
    </aside>
  );
}
