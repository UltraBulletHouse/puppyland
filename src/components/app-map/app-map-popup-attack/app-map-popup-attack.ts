import { consume } from '@lit/context';
import { LitElement, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { customElement } from 'lit/decorators/custom-element.js';

import '@shoelace-style/shoelace/dist/components/card/card.js';

import { API_DOGHOUSE_ATTACK } from '../../../constants/apiConstants';
import { updateDogInfoEvent } from '../../../contexts/dogInfoContext';
import { accessTokenContext } from '../../../contexts/userFirebaseContext';
import { AttackDoghouseResponse, AttackResult } from '../../../types/doghouse';
import { apiCall } from '../../../utils/apiUtils';
import '../../app-modal/app-modal-attack';

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

  @property({ type: String })
  dhHp?: string;

  @property({ type: String })
  dhMaxHp?: string;

  @state()
  attackResult: AttackResult | null = null;

  @state()
  isOpen: boolean = false;

  closeModal = () => {
    this.isOpen = false;
  };

  async attackDoghouse() {
    this.attackResult = null;

    if (!this.accessToken || !this.doghouseId || !this.dogId) return;

    this.isOpen = true;

    const attackDoghouseResponse = await apiCall(this.accessToken).patch<AttackDoghouseResponse>(
      API_DOGHOUSE_ATTACK,
      { doghouseId: this.doghouseId, dogId: this.dogId }
    );

    const dogInfoResponse = attackDoghouseResponse?.data?.dog;
    const attackResult = attackDoghouseResponse?.data?.attackResult;

    this.attackResult = attackResult;
    // console.log('ATTACK RSULT', attackResult);
    // if (!attackResult) {
    //   this.closeModal();
    // }

    if (dogInfoResponse) {
      updateDogInfoEvent(this, dogInfoResponse);
    }
  }

  protected createRenderRoot() {
    return this;
  }

  render() {
    return html` <div>
      <sl-card class="card-overview">
        <strong>${this.doghouseName}</strong>
        <p>HP: ${this.dhHp}/${this.dhMaxHp}</p>
        <div slot="footer">
          <sl-button id="attack-btn" @click=${this.attackDoghouse} pill>Attack</sl-button>
        </div>
      </sl-card>

      <app-modal-attack
        .open=${this.isOpen}
        .attackResult=${this.attackResult}
        @attackModal=${this.closeModal}
      ></app-modal-attack>
    </div>`;
  }
}
