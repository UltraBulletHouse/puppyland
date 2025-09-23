import { consume } from '@lit/context';
import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { userPosContext } from '../contexts/userPosContext';
import { t } from '../i18n';
import { sharedStyles } from '../styles/shared-styles';
import { Coords } from '../types/geolocation';
import { sendEvent } from '../utils/eventUtils';

/**
 * @fires watchUserPos
 */
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
        background: var(--app-bg);
      }
      #map-icon {
        font-size: 80px;
        margin-bottom: 40px;
      }
      #find-loc-hint {
        margin-top: 40px;
      }
      #find-loc-btn {
        margin-top: 10px;
      }
    `,
  ];

  @consume({ context: userPosContext, subscribe: true })
  @property({ attribute: false })
  userPos: Coords | null = null;

  watchUserPosEvent = () => {
    sendEvent(this, 'watchUserPos');
  };

  render() {
    return html`
      <div id="container">
        <sl-icon id="map-icon" name="map" label="Map"></sl-icon>
        <div id="find-loc-hint" data-autofit>${t('turnOnGpsWait')}</div>
        <div data-autofit>${t('clickButtonBelow')}</div>
        <sl-button
          ?hidden=${Boolean(this.userPos)}
          id="find-loc-btn"
          @click=${this.watchUserPosEvent}
          >${t('findPosition')}</sl-button
        >
      </div>
    `;
  }
}
