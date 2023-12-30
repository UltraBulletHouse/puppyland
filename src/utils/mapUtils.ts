import L from 'leaflet';

import { AppMap } from '../components/app-map/app-map';
import { Doghouse } from '../types/doghouse';
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
    transition: all .5s ease-in-out;
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
      <div class="doghouse-marker" style="${cssStyleWrapper}">
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
  dogId?: string
): Doghouse[] | null => {
  const CLOSEST_DISTANCE = 20;

  if (!doghouses || doghouses?.length === 0) return null;
  const userPosition = new L.LatLng(userPos.lat, userPos.lng);

  const closestDogHouses = doghouses.reduce((closestDH: Doghouse[], doghouse) => {
    if (dogId === doghouse.dogId) return closestDH;

    const doghousePos = new L.LatLng(doghouse.lat, doghouse.lng);
    const diff = userPosition.distanceTo(doghousePos);
    if (diff <= CLOSEST_DISTANCE) {
      return [...closestDH, doghouse];
    }
    return closestDH;
  }, []);

  return closestDogHouses;
};

export const handleZoom = (element: AppMap) => {
  if (!element.map) return;
  const currentZoom = element.map.getZoom();
  const marks = element.shadowRoot?.querySelectorAll('.doghouse-marker');

  if (currentZoom <= 12) {
    marks?.forEach((item) => {
      (item as HTMLElement).style.scale = '0.5';
    });
  } else if (currentZoom > 12 && currentZoom <= 14) {
    marks?.forEach((item) => {
      (item as HTMLElement).style.scale = '0.7';
    });
  } else if (currentZoom > 14) {
    marks?.forEach((item) => {
      (item as HTMLElement).style.scale = '1';
    });
  }
};
