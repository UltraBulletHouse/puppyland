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

export const generateDogHouseIcon = (isClosest?: boolean) => {
  const cssStyle = `
  font-size: 20px;
  color: var(--sl-color-primary-600);
  background: ${isClosest ? '#e1ff00b3' : '#15803d20'};
  border-radius: 50%;
`;
  const dogHouseIcon = L.divIcon({
    html: `<sl-icon name="house" style="${cssStyle}"></sl-icon>`,
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
