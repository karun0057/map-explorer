import { LatLng } from '../types';

export function googleMapsDirectionsUrl(destination: LatLng): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}`;
}
