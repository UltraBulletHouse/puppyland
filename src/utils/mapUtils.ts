import L from 'leaflet';

import { ClosestDoghouse, Doghouse } from '../types/doghouse';

export const generatePulsatingMarker = (L: any, radius: number, color: string) => {
  const cssStyle = `
    width: ${radius}px;
    height: ${radius}px;
    background: ${color};
    color: ${color};
    box-shadow: 0 0 0 ${color};
  `;
  return L.divIcon({
    html: `<span style="${cssStyle}" id="pulse"/>`,
    className: '',
  });
};

export const generateDoghouseIcon = () => {
  const cssStyleWrapper = `
    display: flex;
    justify-content: center;
    align-items: center;
    height: 20px;
    width: 20px;
    opacity: 0.9;
    border-radius: 50%;
    background: rgb(253,119,29);
    background: linear-gradient(90deg, rgb(255 102 0) 0%, rgba(252,176,69,1) 100%);
  `;
  const cssStyleIcon = `
    font-size: 14px;
    color: var(--sl-color-orange-900);
  `;

  const doghouseIcon = L.divIcon({
    html: `<div style="${cssStyleWrapper}"><sl-icon name="house-door-fill" style="${cssStyleIcon}"></sl-icon></div>`,
    className: '',
  });

  return doghouseIcon;
};

export const getClosestDoghouse = (
  lat: number,
  lng: number,
  doghouses?: Doghouse[]
): Doghouse | null => {
  if (!doghouses || doghouses?.length === 0) return null;

  const userPos = new L.LatLng(lat, lng);

  const closestDogHouse = doghouses.reduce(
    (closestDH: ClosestDoghouse, doghouse) => {
      const doghousePos = new L.LatLng(doghouse.lat, doghouse.lng);
      const diff = userPos.distanceTo(doghousePos);
      const previousDiff = closestDH.diff;
      if (diff <= 20 && previousDiff > diff) {
        return { doghouse, diff };
      }
      return closestDH;
    },
    { doghouse: null, diff: 99999 }
  );

  return closestDogHouse.doghouse;
};
