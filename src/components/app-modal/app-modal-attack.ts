import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { sharedStyles } from '../../styles/shared-styles';
import { AttackResult } from '../../types/doghouse';
import { sendEvent } from '../../utils/eventUtils';
import './app-modal';

/**
 * @fires attackModal
 */
@customElement('app-modal-attack')
export class AppModalAttack extends LitElement {
  static styles = [
    sharedStyles,
    css`
      #container {
        height: 100%;
      }
    `,
  ];

  @property({ type: Object })
  attackResult: AttackResult | null = null;

  @property({ type: Boolean })
  open: boolean = false;

  closeModal = () => {
    sendEvent(this, 'attackModal');
  };

  render() {
    const modalTemplate = this.attackResult
      ? html` <style>
            #attack-modal {
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              height: 100%;
              width: 100%;
            }
          </style>
          <div id="attack-modal">
            <h3>Congratulation!!!</h3>
            <p>You dealt ${this.attackResult?.damageDealt} damages!</p>
            <p>You gained ${this.attackResult?.experienceGained} experience!</p>
            <p>
              Doghouse is ${this.attackResult?.isDoghouseDestroyed ? 'destroyed' : 'not destroyed'}
            </p>
            <sl-button @click=${this.closeModal}>Close</sl-button>
          </div>`
      : html`
          <style>
            #attack-modal {
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              height: 100%;
              width: 100%;
            }
          </style>
          <div id="attack-modal">
            <sl-spinner style="font-size: 80px;"></sl-spinner>
          </div>
        `;

    return html`<app-modal
      modalId="attack-doghouse"
      .open=${this.open}
      .element=${modalTemplate}
    ></app-modal>`;
  }
}
