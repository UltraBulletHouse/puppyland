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
    #add-doghouse-btn::part(base),
    #add-doghouse-btn::part(base):hover,
    #add-doghouse-btn::part(base):active {
      border-color: var(--color-orange);
      color: var(--color-orange);
    }
    #center-position-btn::part(base),
    #center-position-btn::part(base):hover,
    #center-position-btn::part(base):active {
      border-color: var(--color-blue);
      color: var(--color-blue);
    }
    #center-position-btn::part(base),
    #add-doghouse-btn::part(base) {
      box-shadow: rgba(0, 0, 0, 0.17) 0px 0px 15px 0px;
    }
    #dog-posibilities {
      font-size: 18px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      background: #ffffff;
      border-radius: 15px;
      padding: 8px;
      border: 1px solid var(--color-green);
      box-shadow: rgba(0, 0, 0, 0.17) 0px 0px 15px 0px;
    }
    #house-add-icon {
      font-size: 20px;
    }
    #center-position {
      margin-top: 10px;
    }
    #center-position-icon {
      font-size: 24px;
      margin-top: 11px;
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
