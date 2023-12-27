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
      bottom: 134px;
      padding: 0 10px;
      z-index: 1000;
      pointer-events: none;
    }
    #dog-posibilities,
    #center-position,
    #add-doghouse {
      pointer-events: all;
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
    #dog-posibilities {
      font-size: 18px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      background: #ffffff;
      border-radius: 15px;
      padding: 8px;
    }
    #center-position {
      margin-top: 10px;
    }
    .control-counter {
      display: flex;
      align-items: center;
    }
    .control-counter sl-icon {
      margin-right: 6px;
    }
    #pulse {
      display: block;
      border-radius: 50%;
      cursor: pointer;
      animation: pulse 4s infinite;
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
