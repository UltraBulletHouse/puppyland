import { consume } from '@lit/context';
import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { customElement } from 'lit/decorators/custom-element.js';
import { html } from 'lit/static-html.js';

import { API_DOGHOUSE_ATTACK } from '../../../constants/apiConstants';
import { accessTokenContext } from '../../../contexts/userFirebaseContext';
import { updateUserInfoEvent } from '../../../contexts/userInfoContext/userInfoContext';
import { AttackDoghouseResponse } from '../../../types/doghouse';
import { apiCall } from '../../../utils/apiUtils';

@customElement('app-map-popup-attack')
export class AppIndex extends LitElement {
  @consume({ context: accessTokenContext, subscribe: true })
  @property({ attribute: false })
  accessToken: string | null = null;

  @property()
  doghouseId: string | null = null;

  async attackDoghouse() {
    if (!this.accessToken) return;

    const attackDoghouseResponse = await apiCall(this.accessToken).patch<AttackDoghouseResponse>(
      API_DOGHOUSE_ATTACK,
      { doghouseId: this.doghouseId }
    );

    const userInfoRes = attackDoghouseResponse.data.user;
    if (userInfoRes) {
      updateUserInfoEvent(this, userInfoRes);
    }
  }

  render() {
    return html`<sl-button id="attack-btn" @click=${this.attackDoghouse}>Attack</sl-button>`;
  }
}
