import { LatLng } from '../types';

const EARTH_RADIUS_KM = 6371;

export function haversine(a: LatLng, b: LatLng): { km: number; miles: number } {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h =
    sinDLat * sinDLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinDLng * sinDLng;
  const km = 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
  return { km: Math.round(km * 10) / 10, miles: Math.round(km * 0.621371 * 10) / 10 };
}
