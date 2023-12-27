import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/components/input/input.js';

import { sendEvent } from '../../utils/eventUtils';
import './app-modal';

/**
 * @fires addhouseModal
 */
@customElement('app-modal-addhouse')
export class AppModalAddhouse extends LitElement {
  @property({ type: Boolean })
  open: boolean = false;

  @property({ type: String })
  addDoghouseResponse: string | null = null;

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
        #doghouse-name-input {
          margin-bottom: 20px;
        }
        #doghouse-name-save-btn {
          margin-bottom: 20px;
        }
      </style>
      <div id="add-dh-modal">
        <h3>Congratulation!!!</h3>
        <p>Your doghouse is built!</p>
        <sl-input
          id="doghouse-name-input"
          placeholder="New name for your doghouse"
          value=${this.addDoghouseResponse ?? ''}
        ></sl-input>
        <sl-button id="doghouse-name-save-btn" pill>Save name</sl-button>
        <sl-button @click=${this.closeModal} pill>Close</sl-button>
      </div>`;

    return html`<app-modal
      modalId="add-doghouse"
      .open=${this.open}
      .element=${modalTemplate}
    ></app-modal>`;
  }
}
