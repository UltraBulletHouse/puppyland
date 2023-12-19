import { consume } from '@lit/context';
import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { customElement } from 'lit/decorators/custom-element.js';
import { html } from 'lit/static-html.js';

import '@shoelace-style/shoelace/dist/components/card/card.js';

import { API_DOGHOUSE_ATTACK } from '../../../constants/apiConstants';
import { accessTokenContext } from '../../../contexts/userFirebaseContext';
import { updateUserInfoEvent } from '../../../contexts/userInfoContext';
import { AttackDoghouseResponse } from '../../../types/doghouse';
import { alertNotifySuccess } from '../../../utils/alertsUtils';
import { apiCall } from '../../../utils/apiUtils';

@customElement('app-map-popup-attack')
export class AppMapPopupAttack extends LitElement {
  @consume({ context: accessTokenContext, subscribe: true })
  @property({ attribute: false })
  accessToken: string | null = null;

  @property({ type: String })
  doghouseId?: string;

  @property({ type: String })
  doghouseName?: string;

  async attackDoghouse() {
    if (!this.accessToken || !this.doghouseId) return;

    const attackDoghouseResponse = await apiCall(this.accessToken).patch<AttackDoghouseResponse>(
      API_DOGHOUSE_ATTACK,
      { doghouseId: this.doghouseId }
    );

    const userInfoRes = attackDoghouseResponse.data.user;
    if (userInfoRes) {
      updateUserInfoEvent(this, userInfoRes);

      alertNotifySuccess(`You attacked ${this.doghouseName} HP: ${attackDoghouseResponse.data.hp}`);
    }
  }

  render() {
    return html` <div>
      <sl-card class="card-overview">
        <strong>${this.doghouseName}</strong>
        <div slot="footer">
          <sl-button id="attack-btn" @click=${this.attackDoghouse}>Attack</sl-button>
        </div>
      </sl-card>
    </div>`;
  }
}
