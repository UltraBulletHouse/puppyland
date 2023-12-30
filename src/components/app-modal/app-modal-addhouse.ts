import { consume } from '@lit/context';
import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/components/input/input.js';

import { API_DOGHOUSE_UPDATE } from '../../constants/apiConstants';
import { accessTokenContext } from '../../contexts/userFirebaseContext';
import { CreateResult, UpdateDoghouseResponse } from '../../types/doghouse';
import { apiCall } from '../../utils/apiUtils';
import { sendEvent } from '../../utils/eventUtils';
import './app-modal';

/**
 * @fires addhouseModal
 */
@customElement('app-modal-addhouse')
export class AppModalAddhouse extends LitElement {
  @consume({ context: accessTokenContext, subscribe: true })
  @property({ attribute: false })
  accessToken: string | null = null;

  @property({ type: Boolean })
  open: boolean = false;

  @property({ type: Object })
  addDoghouseResponse: CreateResult | null = null;

  @state()
  newName: string | null = null;

  closeModal = () => {
    sendEvent(this, 'addhouseModal');
  };

  onChangeName = (event: Event) => {
    const newName = (event.target as HTMLInputElement)?.value;
    this.newName = newName;
  };

  saveNewName = async () => {
    const doghouseId = this.addDoghouseResponse?.id;
    if (!this.accessToken || !doghouseId) return;

    const doghouseResponse = await apiCall(this.accessToken).patch<UpdateDoghouseResponse>(
      API_DOGHOUSE_UPDATE,
      {
        doghouseId,
        name: this.newName,
      }
    );

    console.log('doghouseResponse', doghouseResponse);
    // this.newName = dogInfoResponse.data.name;

    this.closeModal();
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
          width: 100%;
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
          value=${this.addDoghouseResponse?.name ?? ''}
          @sl-input=${this.onChangeName}
          pill
          clearable
        ></sl-input>
        <sl-button id="doghouse-name-save-btn" @click=${this.saveNewName} pill
          >Save new name & close</sl-button
        >
        <sl-button @click=${this.closeModal} pill>Close with default name</sl-button>
      </div>`;

    return html`<app-modal
      modalId="add-doghouse"
      .open=${this.open}
      .element=${modalTemplate}
    ></app-modal>`;
  }
}
