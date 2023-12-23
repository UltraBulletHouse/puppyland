import { LitElement, PropertyValueMap, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { sharedStyles } from '../styles/shared-styles';
import { Coords } from '../types/geolocation';
import { consume } from '@lit/context';
import { userPosContext } from '../contexts/userPosContext';

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
        <sl-spinner id="spinner"></sl-spinner>

<sl-button @click=${this.watchUserPosEvent}>Find your location</sl-button>
      </div>
    `;
  }
}
