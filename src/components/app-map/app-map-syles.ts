import { css } from 'lit';

import { sharedStyles } from '../../styles/shared-styles';

export const AppMapStyles = [
  sharedStyles,
  css`
    #container {
      height: 100%;
    }
    #map {
      height: 100%;
      width: 100%;
      overflow: hidden;
    }
    .leaflet-top,
    .leaflet-bottom {
      z-index: 400;
    }
    .leaflet-control-attribution.leaflet-control {
      pointer-events: none;
    }
    .map-layer,
    .leaflet-tile-container {
      filter: grayscale(1);
    }
    .leaflet-touch .leaflet-control-layers,
    .leaflet-touch .leaflet-bar {
      box-shadow: 0px 0px 12px 0px #0000002b;
    }
    #controls {
      position: relative;
      display: flex;
      align-items: end;
      justify-content: space-between;
      height: 60px;
      bottom: 85px;
      padding: 0 10px;
      z-index: 9999;
    }
    #add-doghouse-btn::part(base) {
      border-color: var(--sl-color-green-300);
    }
    #add-doghouse-btn::part(base):hover {
      border-color: var(--sl-color-green-300);
    }
    #add-doghouse-btn::part(base):active {
      border-color: var(--sl-color-green-300);
    }
    #attack-doghouse-btn::part(base) {
      border-color: var(--sl-color-red-300);
    }
    #attack-doghouse-btn::part(base):hover {
      border-color: var(--sl-color-red-300);
    }
    #attack-doghouse-btn::part(base):active {
      border-color: var(--sl-color-red-300);
    }
    #pulse {
      display: block;
      border-radius: 50%;
      cursor: pointer;
      animation: pulse 4s infinite;
    }
    .control-counter {
      font-size: 16px;
      display: flex;
      justify-content: center;
      background: #ffffff;
      border-radius: 15px;
    }

    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0;
      }
      70% {
        box-shadow: 0 0 0 10px rgba(0, 0, 0, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
      }
    }
  `,
];
