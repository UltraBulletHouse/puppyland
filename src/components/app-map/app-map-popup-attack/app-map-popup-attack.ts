import { consume } from '@lit/context';
import { LitElement, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { customElement } from 'lit/decorators/custom-element.js';
import { createRef, ref } from 'lit/directives/ref.js';

import '@shoelace-style/shoelace/dist/components/card/card.js';

import { API_DOGHOUSE_ATTACK } from '../../../constants/apiConstants';
import { updateDogInfoEvent } from '../../../contexts/dogInfoContext';
import { accessTokenContext } from '../../../contexts/userFirebaseContext';
import { AttackDoghouseResponse, AttackResult } from '../../../types/doghouse';
import { apiCall } from '../../../utils/apiUtils';
import '../../app-modal/app-modal';
import { AppModal } from '../../app-modal/app-modal';

@customElement('app-map-popup-attack')
export class AppMapPopupAttack extends LitElement {
  @consume({ context: accessTokenContext, subscribe: true })
  @property({ attribute: false })
  accessToken: string | null = null;

  @property({ type: String })
  dogId?: string;

  @property({ type: String })
  doghouseId?: string;

  @property({ type: String })
  doghouseName?: string;

  @state()
  attackResult: AttackResult | null = null;

  modalRef = createRef();

  closeModal = () => {
    const modal = this.modalRef.value as AppModal;
    modal.closeModal();
  };

  async attackDoghouse() {
    this.attackResult = null;

    if (!this.accessToken || !this.doghouseId || !this.dogId) return;

    (this.modalRef.value as AppModal).openModal();

    const attackDoghouseResponse = await apiCall(this.accessToken).patch<AttackDoghouseResponse>(
      API_DOGHOUSE_ATTACK,
      { doghouseId: this.doghouseId, dogId: this.dogId }
    );

    const dogInfoResponse = attackDoghouseResponse?.data?.dog;
    const attackResult = attackDoghouseResponse?.data?.attackResult;
    console.log(attackResult);

    this.attackResult = attackResult;
    if (!attackResult) {
      this.closeModal();
    }

    if (dogInfoResponse) {
      updateDogInfoEvent(this, dogInfoResponse);
    }
  }

  protected createRenderRoot() {
    return this;
  }

  render() {
    //TODO: modal = osobny component
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

    return html` <div>
      <sl-card class="card-overview">
        <strong>${this.doghouseName}</strong>
        <div slot="footer">
          <sl-button id="attack-btn" @click=${this.attackDoghouse}>Attack</sl-button>
        </div>
      </sl-card>

      <app-modal ${ref(this.modalRef)} .element=${modalTemplate}></app-modal>
    </div>`;
  }
}
