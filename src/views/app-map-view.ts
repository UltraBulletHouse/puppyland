import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import '../components/app-map/app-map';
import { sharedStyles } from '../styles/shared-styles';
import { Coords } from '../types/geolocation';

@customElement('app-map-view')
export class AppMapView extends LitElement {
  static styles = [
    sharedStyles,
    css`
      #container {
        height: 100%;
        background: var(--color-white);
      }
    `,
  ];

  @property({ type: Object })
  centerCoords: Coords | null = null;

  render() {
    return html`
      <div id="container">
        <app-map .centerCoords=${this.centerCoords}></app-map>
      </div>
    `;
  }
}
