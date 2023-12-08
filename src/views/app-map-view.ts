import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import '../components/app-map';
import { sharedStyles } from '../styles/shared-styles';

@customElement('app-map-view')
export class AppMapView extends LitElement {
  static styles = [
    sharedStyles,
    css`
      #container {
        height: 100%;
      }
    `,
  ];

  render() {
    return html`
      <div id="container">
        <app-map></app-map>
      </div>
    `;
  }
}
