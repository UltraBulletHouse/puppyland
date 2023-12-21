import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import { sharedStyles } from '../styles/shared-styles';

@customElement('app-loading-map-view')
export class AppLoadingMapView extends LitElement {
  static styles = [
    sharedStyles,
    css`
      #container {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        height: 100%;
      }
      #map-icon {
        font-size: 80px;
        margin-bottom: 40px;
      }
      #spinner {
        font-size: 80px;
      }
    `,
  ];

  render() {
    return html`
      <div id="container">
        <sl-icon id="map-icon" name="map" label="Map"></sl-icon>
        <sl-spinner id="spinner"></sl-spinner>
      </div>
    `;
  }
}
