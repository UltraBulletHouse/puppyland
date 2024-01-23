import { consume } from '@lit/context';
import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { customElement } from 'lit/decorators/custom-element.js';

import '@shoelace-style/shoelace/dist/components/card/card.js';

import { accessTokenContext } from '../../../contexts/userFirebaseContext';

@customElement('app-map-popup')
export class AppMapPopup extends LitElement {
  @consume({ context: accessTokenContext, subscribe: true })
  @property({ attribute: false })
  accessToken: string | null = null;

  @property({ type: String })
  dhId?: string;

  @property({ type: String })
  dhName?: string;

  @property({ type: String })
  dhHp?: string;

  @property({ type: String })
  dhMaxHp?: string;

  protected createRenderRoot() {
    return this;
  }

  render() {
    return html`<style>
        #popup-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
        }
        #dog-icon {
          display: flex;
          justify-content: center;
          font-size: 40px;
          margin-bottom: 10px;
        }
      </style>
      <div id="popup-container">
        <div id="dog-icon">
          <svg-icon name="dogFace"></svg-icon>
        </div>
        <strong>${decodeURIComponent(this.dhName ?? '')}</strong>
        <p>HP: ${this.dhHp}/${this.dhMaxHp}</p>
      </div> `;
  }
}
