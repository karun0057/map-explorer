export interface LatLng {
  lat: number;
  lng: number;
}

export interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  latLng?: LatLng;
}

export type GeoStatus = 'idle' | 'loading' | 'resolved' | 'error';

export interface GeocodedAddress extends Address {
  status: GeoStatus;
  latLng: LatLng | null;
}
