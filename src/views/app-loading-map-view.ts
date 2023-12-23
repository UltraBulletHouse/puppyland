import { consume } from '@lit/context';
import { LitElement, PropertyValueMap, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { userPosContext } from '../contexts/userPosContext';
import { sharedStyles } from '../styles/shared-styles';
import { Coords } from '../types/geolocation';

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
      #find-loc-hint{
        margin-top: 40px;
      }
      #find-loc-btn{
        margin-top: 10px;
      }
    `,
  ];

  @consume({ context: userPosContext, subscribe: true })
  @property({ attribute: false })
  userPos: Coords | null = null;

  protected updated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    console.log(this.userPos, _changedProperties);
  }

  watchUserPosEvent = () => {
    const options: CustomEventInit = {
      detail: true,
      bubbles: true,
      composed: true,
    };
    this.dispatchEvent(new CustomEvent('watchUserPosEvent', options));
  };

  render() {
    return html`
      <div id="container">
        <sl-icon id="map-icon" name="map" label="Map"></sl-icon>
        <div id="find-loc-hint">Please turn on location <sl-icon name="geo-alt"></sl-icon></div> and click button below
        <sl-button  ?hidden=${Boolean(this.userPos)} id="find-loc-btn" @click=${this.watchUserPosEvent}>Find your position</sl-button>
      </div>
    `;
  }
}
