import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import '../components/app-map/app-map';
import { sharedStyles } from '../styles/shared-styles';
import { Doghouse } from '../types/doghouse';

@customElement('app-map-view')
export class AppMapView extends LitElement {
  static styles = [
    sharedStyles,
    css`
      #container {
        height: 100%;
        background: var(--app-bg);
      }
    `,
  ];

  @property({ attribute: false })
  focusTarget: Doghouse | null = null;

  render() {
    return html`
      <div id="container">
        <app-map .focusTarget=${this.focusTarget}></app-map>
      </div>
    `;
  }
}
