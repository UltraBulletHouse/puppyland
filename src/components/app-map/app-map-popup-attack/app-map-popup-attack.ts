import { consume } from '@lit/context';
import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { customElement } from 'lit/decorators/custom-element.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { html } from 'lit/static-html.js';

import '@shoelace-style/shoelace/dist/components/card/card.js';

import { API_DOGHOUSE_ATTACK } from '../../../constants/apiConstants';
import { updateDogInfoEvent } from '../../../contexts/dogInfoContext';
import { accessTokenContext } from '../../../contexts/userFirebaseContext';
import { AttackDoghouseResponse } from '../../../types/doghouse';
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

  modalRef = createRef();

  updated(): void {
    const modal = this.modalRef.value;
    (modal as AppModal).openModal();
  }

  async attackDoghouse() {
    if (!this.accessToken || !this.doghouseId || !this.dogId) return;

    const attackDoghouseResponse = await apiCall(this.accessToken).patch<AttackDoghouseResponse>(
      API_DOGHOUSE_ATTACK,
      { doghouseId: this.doghouseId, dogId: this.dogId }
    );

    const dogInfoResponse = attackDoghouseResponse?.data?.dog;
    const attackResult = attackDoghouseResponse?.data?.attackResult;
    console.log(attackResult);

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
        <div slot="footer">
          <sl-button id="attack-btn" @click=${this.attackDoghouse}>Attack</sl-button>
        </div>
      </sl-card>

      <app-modal ${ref(this.modalRef)}>
        <div>ATTACK 1</div>
      </app-modal>
    </div>`;
  }
}
