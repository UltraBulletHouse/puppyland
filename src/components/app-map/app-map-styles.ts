import { css } from 'lit';

import { sharedStyles } from '../../styles/shared-styles';

export const AppMapStyles = [
  sharedStyles,
  css`
    #container {
      position: relative;
      height: 100%;
      animation: blur 1s ease 0s 1;
    }
    .level-up-modal-wrapper {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      z-index: 9999;
    }

    .level-up-modal-wrapper level-up-modal {
      pointer-events: auto;
    }
    #map {
      height: 100%;
      width: 100%;
      overflow: hidden;
    }
    #info-box {
      position: absolute;
      right: 5px;
      top: 21px;
      z-index: 1000;
      display: inline-flex;
      align-items: center;
      height: auto;
      width: auto;
      padding: 6px 12px;
      background: var(--lav-100);
      border-radius: 999px;
      border: 2px solid var(--lav);
      color: var(--lav);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }
    #info-box-line {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-weight: 800;
    }
    #info-box-icon {
      font-size: 14px;
      padding: 2px;
      border-radius: var(--border-radius-circle);
      background: color-mix(in srgb, var(--lav-100) 80%, #fff 20%);
      color: var(--lav);
    }
    .leaflet-bottom {
      bottom: 7px;
    }
    .leaflet-top,
    .leaflet-bottom {
      z-index: 400;
    }
    .leaflet-control-attribution.leaflet-control {
      pointer-events: none;
    }
    .leaflet-tile-container {
      filter: grayscale(88%) brightness(91%) contrast(88%) sepia(71%) hue-rotate(91deg)
        saturate(48%);
    }
    .leaflet-container img.leaflet-tile.leaflet-tile-loaded {
      mix-blend-mode: plus-lighter;
      background: #022a02;
      filter: grayscale(0%) hue-rotate(9deg) saturate(96%) brightness(97%) contrast(102%);
    }
    .leaflet-touch .leaflet-control-layers,
    .leaflet-touch .leaflet-bar {
      box-shadow: 0px 0px 12px 0px #0000002b;
    }
    .leaflet-popup-content-wrapper {
      background-color: var(--color-surface-strong);
    }
    .leaflet-popup-tip {
      background-color: var(--color-surface-strong);
    }
    .leaflet-popup-content {
      height: 150px;
      margin: 8px;
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
    .leaflet-touch .leaflet-bar a {
      line-height: 32px;
    }
    .leaflet-control-zoom-in {
      height: 34px !important;
      width: 34px !important;
      border-top-right-radius: 20px !important;
      border-top-left-radius: 20px !important;
      border-top: none !important;
      border-left: 1px solid var(--color-primary-medium);
      border-right: 1px solid var(--color-primary-medium);
      box-shadow: rgba(0, 0, 0, 0.17) 0px 0px 12px 0px;
      background-color: var(--color-surface) !important;
    }
    .leaflet-control-zoom-out {
      height: 34px !important;
      width: 34px !important;
      border-bottom-right-radius: 20px !important;
      border-bottom-left-radius: 20px !important;
      border-bottom: none !important;
      border-left: 1px solid var(--color-primary-medium);
      border-right: 1px solid var(--color-primary-medium);
      box-shadow: rgba(0, 0, 0, 0.17) 0px 0px 12px 0px;
      background-color: var(--color-surface) !important;
    }
    .help-btn {
      position: fixed;
      left: 10px;
      top: calc(10px + 34px + 34px + 8px);
      /* below Leaflet zoom in/out which are 34px each with 10px margin + small gap */
      height: 34px;
      width: 34px;
      border-radius: 20px;
      border: none;
      outline: none;
      background: var(--color-surface);
      color: var(--color-primary);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-shadow: rgba(0, 0, 0, 0.17) 0px 0px 12px 0px;
      z-index: 10000;
      pointer-events: all;
    }
    .help-btn .help-icon {
      font-weight: 900;
      font-size: 18px;
      line-height: 1;
    }
    @media (max-width: 360px) {
      .help-btn { top: calc(10px + 34px + 34px + 4px); }
    }

    .leaflet-control-zoom a,
    .leaflet-bar,
    .leaflet-bar a {
      border: none !important;
      outline: none !important;
      box-shadow: none !important;
    }
    .leaflet-control-zoom a:focus,
    .leaflet-control-zoom a:focus-visible,
    .leaflet-bar a:focus,
    .leaflet-bar a:focus-visible {
      outline: none !important;
      box-shadow: none !important;
    }
    .help-btn:focus,
    .help-btn:focus-visible {
      outline: none !important;
      box-shadow: none !important;
    }

    #controls {
      position: relative;
      display: flex;
      align-items: end;
      justify-content: space-between;
      bottom: 96px;
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
      border-color: var(--wood);
      color: var(--wood);
      background: color-mix(in srgb, var(--wood) 10%, #fff);
    }
    /* Use cool accent for recenter button to distinguish from primary add button */
    #center-position-btn::part(base),
    #center-position-btn::part(base):hover,
    #center-position-btn::part(base):active {
      border-color: var(--sky);
      color: var(--sky);
      background: color-mix(in srgb, var(--sky) 8%, #fff);
    }
    #center-position-btn::part(base),
    #add-doghouse-btn::part(base) {
      box-shadow: rgba(0, 0, 0, 0.17) 0px 0px 15px 0px;
    }
    /*    #add-doghouse-btn::part(base) {
    } */
    #add-doghouse-icon {
      font-size: 20px;
      color: var(--wood);
    }
    #add-doghouse-badge {
      transform: translateX(-41px);
    }
    #add-doghouse-badge::part(base) {
      background-color: var(--wood);
      color: #fff;
      border-color: var(--wood);
    }
    /*    #center-position-btn::part(base) {
    } */
    #center-position {
      margin-top: 10px;
    }
    #center-position-icon {
      font-size: 24px;
      margin-top: 11px;
      color: var(--sky);
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
      border-radius: var(--border-radius-circle);
      cursor: pointer;
      animation: pulse 4s infinite;
    }
    #geolocation-overlay {
      display: flex;
      justify-content: center;
      align-items: center;
      position: absolute;
      top: 0;
      left: 0;
      height: 100vh;
      width: 100vw;
      background-color: color-mix(in srgb, var(--color-primary-medium) 70%, transparent);
      z-index: 1001;
      pointer-events: none;
    }
    #geolocation-position {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    #geolocation-position {
      pointer-events: all;
      cursor: pointer;
    }
    #geolocation-position-icon {
      font-size: 64px;
      color: var(--color-primary);
    }
    #geolocation-position-text {
      color: var(--color-black);
      margin-top: 20px;
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
