import { css } from 'lit';

import { sharedStyles } from '../../styles/shared-styles';

export const AppMapStyles = [
  sharedStyles,
  css`
    #container {
      height: 100%;
      animation: blur 2s ease 0s 1;
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
    .leaflet-popup-content-wrapper {
      border: 1px solid var(--color-primary);
    }
    .leaflet-popup-tip {
      border-right: 1px solid var(--color-primary);
      border-bottom: 1px solid var(--color-primary);
    }
    .leaflet-popup-content {
      height: 160px;
    }
    .leaflet-marker-icon {
      pointer-events: none !important;
    }
    .leaflet-container {
      font-family: inherit !important;
    }
    .leaflet-touch .leaflet-control-layers,
    .leaflet-touch .leaflet-bar {
      border: none !important;
      box-shadow: none !important;
    }
    .leaflet-control-zoom-in {
      height: 34px !important;
      width: 34px !important;
      border-top-right-radius: 14px !important;
      border-top-left-radius: 14px !important;
      border-top: 1px solid var(--color-primary);
      border-left: 1px solid var(--color-primary);
      border-right: 1px solid var(--color-primary);
      box-shadow: rgba(0, 0, 0, 0.17) 0px 0px 12px 0px;
    }
    .leaflet-control-zoom-out {
      height: 34px !important;
      width: 34px !important;
      border-bottom-right-radius: 14px !important;
      border-bottom-left-radius: 14px !important;
      border-bottom: 1px solid var(--color-primary) !important;
      border-left: 1px solid var(--color-primary);
      border-right: 1px solid var(--color-primary);
      box-shadow: rgba(0, 0, 0, 0.17) 0px 0px 12px 0px;
    }
    #controls {
      position: relative;
      display: flex;
      align-items: end;
      justify-content: space-between;
      bottom: 80px;
      padding: 0 10px;
      z-index: 1000;
      pointer-events: none;
    }
    #left-side,
    #center-position,
    #add-doghouse {
      pointer-events: all;
    }
    #add-doghouse-btn::part(base),
    #add-doghouse-btn::part(base):hover,
    #add-doghouse-btn::part(base):active {
      border-color: var(--color-primary);
      color: var(--color-primary);
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
    /*    #add-doghouse-btn::part(base) {
    } */
    #add-doghouse-icon {
      font-size: 20px;
    }
    #add-doghouse-badge {
      transform: translateX(-41px);
    }
    #add-doghouse-badge::part(base) {
      background-color: var(--color-primary);
    }
    /*    #center-position-btn::part(base) {
    } */
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

    @keyframes blur {
      0% {
        -webkit-filter: blur(40px);
        -moz-filter: blur(40px);
        -o-filter: blur(40px);
        -ms-filter: blur(40px);
      }
      100% {
        -webkit-filter: blur(0px);
        -moz-filter: blur(0px);
        -o-filter: blur(0px);
        -ms-filter: blur(0px);
      }
    }
  `,
];
