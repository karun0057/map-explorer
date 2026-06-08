import { useEffect, useRef, memo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GeocodedAddress, LatLng } from '../types';
import { haversine } from '../utils/haversine';
import { googleMapsDirectionsUrl } from '../utils/directions';
import './MapView.css';

// Fix Leaflet default icon paths broken by bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function makeIcon(selected: boolean) {
  return L.divIcon({
    className: '',
    html: `<div class="map-marker ${selected ? 'map-marker--selected' : ''}"></div>`,
    iconSize: selected ? [32, 32] : [22, 22],
    iconAnchor: selected ? [16, 16] : [11, 11],
    popupAnchor: [0, selected ? -18 : -13],
  });
}

function userIcon() {
  return L.divIcon({
    className: '',
    html: `<div class="map-marker-user"><div class="map-marker-user__pulse"></div></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -12],
  });
}

function FlyToUser({ userLocation }: { userLocation: LatLng | null }) {
  const map = useMap();
  const flew = useRef(false);

  useEffect(() => {
    if (!userLocation || flew.current) return;
    flew.current = true;
    map.flyTo([userLocation.lat, userLocation.lng], 13, { duration: 1.2 });
  }, [userLocation, map]);

  return null;
}

interface FlyToProps {
  selectedId: string | null;
  addresses: GeocodedAddress[];
}

interface FlyToSelectedProps extends FlyToProps {
  userLocation: LatLng | null;
}

function FlyToSelected({ selectedId, addresses, userLocation }: FlyToSelectedProps) {
  const map = useMap();
  const prevId = useRef<string | null>(null);

  useEffect(() => {
    if (!selectedId || selectedId === prevId.current) return;
    prevId.current = selectedId;

    if (selectedId === '__user__' && userLocation) {
      map.flyTo([userLocation.lat, userLocation.lng], 13, { duration: 0.8 });
      return;
    }

    const addr = addresses.find((a) => a.id === selectedId);
    if (addr?.latLng) {
      map.flyTo([addr.latLng.lat, addr.latLng.lng], 14, { duration: 0.8 });
    }
  }, [selectedId, addresses, userLocation, map]);

  return null;
}

interface Props {
  addresses: GeocodedAddress[];
  userLocation: LatLng | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export const MapView = memo(function MapView({ addresses, userLocation, selectedId, onSelect }: Props) {
  const popupRefs = useRef<Record<string, L.Popup | null>>({});

  return (
    <div className="map-view">
      <MapContainer
        center={[39.5, -98.35]}
        zoom={4}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FlyToUser userLocation={userLocation} />
        <FlyToSelected selectedId={selectedId} addresses={addresses} userLocation={userLocation} />

        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={userIcon()}
            ref={(marker) => { if (marker && selectedId === '__user__') marker.openPopup(); }}
            eventHandlers={{ click: () => onSelect('__user__') }}
          >
            <Popup>
              <div className="map-popup">
                <div className="map-popup__name">📍 Your Location</div>
                <div className="map-popup__address">
                  {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {addresses
          .filter((a) => a.status === 'resolved' && a.latLng)
          .map((addr) => {
            const isSelected = addr.id === selectedId;
            const dist = userLocation && addr.latLng
              ? haversine(userLocation, addr.latLng!)
              : null;

            return (
              <Marker
                key={addr.id}
                position={[addr.latLng!.lat, addr.latLng!.lng]}
                icon={makeIcon(isSelected)}
                eventHandlers={{ click: () => onSelect(addr.id) }}
                ref={(marker) => {
                  if (marker && isSelected) {
                    marker.openPopup();
                  }
                }}
              >
                <Popup
                  ref={(popup) => { popupRefs.current[addr.id] = popup; }}
                >
                  <div className="map-popup">
                    <div className="map-popup__name">{addr.name}</div>
                    <div className="map-popup__address">
                      {addr.street}, {addr.city}, {addr.state} {addr.zip}
                    </div>
                    {dist && (
                      <div className="map-popup__distance">
                        📍 {dist.km} km &nbsp;·&nbsp; {dist.miles} mi from you
                      </div>
                    )}
                    {addr.latLng && (
                      <a
                        className="map-popup__directions"
                        href={googleMapsDirectionsUrl(addr.latLng)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Get Directions →
                      </a>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>
    </div>
  );
});
