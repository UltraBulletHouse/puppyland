import L from 'leaflet';

import { ClosestDogHouse, DogHouse } from '../types/dogHouses';

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

export const generateDogHouseIcon = () => {
  const cssStyleWrapper = `
  display: flex;
  justify-content: center;
  align-items: center;
  height: 20px;
    width: 20px;
  background-color: var(--sl-color-orange-400);
  opacity: 0.7;
  border-radius: 50%;
  `;
  const cssStyleIcon = `
  font-size: 16px;
  color: var(--sl-color-orange-800);
  `;

  const dogHouseIcon = L.divIcon({
    html: `<div style="${cssStyleWrapper}"><sl-icon name="house-door-fill" style="${cssStyleIcon}"></sl-icon></div>`,
    className: '',
  });

  return dogHouseIcon;
};

export const getClosestDogHouse = (
  lat: number,
  lng: number,
  dogHouses?: DogHouse[]
): DogHouse | null => {
  if (!dogHouses || dogHouses?.length === 0) return null;

  const userPos = new L.LatLng(lat, lng);

  const closestDogHouse = dogHouses.reduce(
    (closestDH: ClosestDogHouse, dogHouse) => {
      const doghousePos = new L.LatLng(dogHouse.lat, dogHouse.lng);
      const diff = userPos.distanceTo(doghousePos);
      const previousDiff = closestDH.diff;
      if (diff <= 20 && previousDiff > diff) {
        return { dogHouse, diff };
      }
      return closestDH;
    },
    { dogHouse: null, diff: 99999 }
  );

  return closestDogHouse.dogHouse;
};
