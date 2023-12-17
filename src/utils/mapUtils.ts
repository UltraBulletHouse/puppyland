import L from 'leaflet';

import { ClosestDoghouse, Doghouse } from '../types/doghouse';
import { Coords } from '../types/geolocation';

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

export const generateDoghouseIcon = ({
  isOwn,
  isClose,
}: {
  isOwn?: boolean;
  isClose?: boolean;
}) => {
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
    color: ${
      isOwn
        ? 'var(--sl-color-green-700)'
        : isClose
          ? 'var(--sl-color-red-500)'
          : 'var(--sl-color-orange-900)'
    };
  `;

  const doghouseIcon = L.divIcon({
    html: `
      <div style="${cssStyleWrapper}">
        <sl-icon name="house-door-fill" style="${cssStyleIcon}">
      </sl-icon></div>
    `,
    className: '',
  });

  return doghouseIcon;
};

export const getClosestDoghouses = (
  userPos: Coords,
  doghouses: Doghouse[],
  userId?: string
): Doghouse[] | null => {
  const CLOSEST_DISTANCE = 20;
  if (!doghouses || doghouses?.length === 0) return null;
  const userPosition = new L.LatLng(userPos.lat, userPos.lng);

  const closestDogHouses = doghouses.reduce((closestDH: Doghouse[], doghouse) => {
    if (userId === doghouse.userId) return closestDH;

    const doghousePos = new L.LatLng(doghouse.lat, doghouse.lng);
    const diff = userPosition.distanceTo(doghousePos);
    if (diff <= CLOSEST_DISTANCE) {
      return [...closestDH, doghouse];
    }
    return closestDH;
  }, []);

  return closestDogHouses;
};
