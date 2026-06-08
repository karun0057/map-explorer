import { GeocodedAddress } from '../types';
import './AddressCard.css';

interface Props {
  address: GeocodedAddress;
  index: number;
  isSelected: boolean;
  onClick: (id: string) => void;
}

export function AddressCard({ address, index, isSelected, onClick }: Props) {
  const fullAddress = `${address.street}, ${address.city}, ${address.state} ${address.zip}`;

  return (
    <div
      className={`address-card ${isSelected ? 'address-card--selected' : ''}`}
      onClick={() => onClick(address.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick(address.id)}
    >
      <div className="address-card__counter">#{index}</div>
      <div className="address-card__body">
        <div className="address-card__name">{address.name}</div>
        <div className="address-card__address">{fullAddress}</div>
        <div className="address-card__status">
          {address.status === 'loading' && <span className="badge badge--loading">Locating…</span>}
          {address.status === 'error' && <span className="badge badge--error">Not found</span>}
          {address.status === 'resolved' && <span className="badge badge--ok">On map</span>}
        </div>
      </div>
    </div>
  );
}
