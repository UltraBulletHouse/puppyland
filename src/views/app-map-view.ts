import { LitElement, css, html } from 'lit';
import '../components/walkthrough/walkthrough-overlay';
import { idbGet, idbSet } from '../utils/idb';
import { customElement, property } from 'lit/decorators.js';

import '../components/app-map/app-map';
import { sharedStyles } from '../styles/shared-styles';
import { Doghouse } from '../types/doghouse';

@customElement('app-map-view')
export class AppMapView extends LitElement {
  private _showWalkthrough = false;

  async firstUpdated() {
    try {
      const flag = await idbGet<boolean>('hasSeenMapWalkthrough');
      if (!flag?.value) {
        this._showWalkthrough = true;
        this.requestUpdate();
      }
    } catch (e) {
      // Fallback: show once if idb fails
      this._showWalkthrough = true;
      this.requestUpdate();
    }
  }

  private async _closeWalkthrough() {
    this._showWalkthrough = false;
    this.requestUpdate();
    try {
      await idbSet('hasSeenMapWalkthrough', true);
    } catch {}
  }
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
        ${this._showWalkthrough
          ? html`<walkthrough-overlay open @close=${this._closeWalkthrough}></walkthrough-overlay>`
          : null}
      </div>
    `;
  }
}
