import L from 'leaflet';

import { AppMap } from '../components/app-map/app-map';
import { Doghouse } from '../types/doghouse';
import { Coords } from '../types/geolocation';
import { CanvasMarkerImg } from '../types/map';

//TODO: Sprawdzic i usunąć co nie uzywane

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

interface DrawMarker {
  self: AppMap;
  coords: Coords;
  canvasMarkerImg: CanvasMarkerImg;
  popupContent: any;
}

export const drawMarker = ({ self, coords, popupContent, canvasMarkerImg }: DrawMarker) => {
  // const ctx = (self.map?.options as any).renderer._container
  // if (ctx) {
  //   const mapCtx = ctx.getContext('2d');
  //   // console.log(mapCtx);
  //   mapCtx.clearRect(0,0,1000,1000);
  // }
// console.log('DRAW MARKER');
  const marker = (L as any).canvasMarker(L.latLng(coords.lat, coords.lng), {
    radius: canvasMarkerImg.radius ?? 30, // WAZNE zeby nie bylo artefaktow
    img: {
      url: canvasMarkerImg.url,
      size: canvasMarkerImg.size ?? [40, 40],
      rotate: canvasMarkerImg.rotate ?? 0,
      offset: canvasMarkerImg.offset ?? { x: 10, y: 0 },
    },
  });

  marker.addTo(self.map).bindPopup(popupContent, {
    minWidth: 108,
  });
};
