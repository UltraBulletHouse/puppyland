import { LitElement, css, html } from 'lit';
import '../components/walkthrough/walkthrough-overlay';
import { apiCall } from '../utils/apiUtils';
import { API_DOGHOUSES_BOOTSTRAP } from '../constants/apiConstants';
import { getUserPosition } from '../utils/geolocationUtils';
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
        // Trigger bootstrap once on first map enter (not tied to walkthrough lifecycle)
        const sessionKey = 'puppyland_bootstrap_called';
        if (!sessionStorage.getItem(sessionKey)) {
          try {
            getUserPosition(
              (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                apiCall().post(API_DOGHOUSES_BOOTSTRAP, { lat, lng }).catch(() => {});
                sessionStorage.setItem(sessionKey, '1');
              },
              () => {}
            );
          } catch {}
        }

        // Show walkthrough for first-time users
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
    // Close UI immediately and persist flag

    this._showWalkthrough = false;
    this.requestUpdate();
    try {
      await idbSet('hasSeenMapWalkthrough', true);
    } catch {}

    // Fire-and-forget bootstrap of system doghouses near user
    try {
      getUserPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          // Do not block UI: call endpoint without awaiting the result
          apiCall()
            .post(API_DOGHOUSES_BOOTSTRAP, { lat, lng })
            .catch(() => {});

          // Refresh nearby doghouses shortly after to include newly created ones
          const appMap = this.renderRoot?.querySelector('app-map') as any;
          if (appMap?.getDoghousesList) {
            setTimeout(() => appMap.getDoghousesList?.(), 1200);
            setTimeout(() => appMap.getDoghousesList?.(), 3000);
          }
        },
        () => {}
      );
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
