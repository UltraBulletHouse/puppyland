import L from 'leaflet';

import { Doghouse } from '../types/doghouse';

export declare const generatePulsatingMarker: (L: any, radius: number, color: string) => any;
export declare const generateDoghouseIcon: () => L.DivIcon;
export declare const getClosestDoghouse: (
  lat: number,
  lng: number,
  doghouses?: Doghouse[]
) => Doghouse | null;
