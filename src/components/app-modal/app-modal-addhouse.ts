import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { sendEvent } from '../../utils/eventUtils';
import './app-modal';

/**
 * @fires addhouseModal
 */
@customElement('app-modal-addhouse')
export class AppModalAddhouse extends LitElement {
  @property({ type: Boolean })
  open: boolean = false;

  closeModal = () => {
    sendEvent(this, 'addhouseModal');
  };

  render() {
    const modalTemplate = html` <style>
        #add-dh-modal {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100%;
          width: 100%;
        }
      </style>
      <div id="add-dh-modal">
        <h3>Congratulation!!!</h3>
        <p>Your doghouse is built!</p>
        <sl-button @click=${this.closeModal}>Close</sl-button>
      </div>`;

    return html`<app-modal
      modalId="add-doghouse"
      .open=${this.open}
      .element=${modalTemplate}
    ></app-modal>`;
  }
}
