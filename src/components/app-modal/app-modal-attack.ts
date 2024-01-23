import { consume } from '@lit/context';
import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { API_DOGHOUSE_ATTACK } from '../../constants/apiConstants';
import { updateDogInfoEvent } from '../../contexts/dogInfoContext';
import { accessTokenContext } from '../../contexts/userFirebaseContext';
import { sharedStyles } from '../../styles/shared-styles';
import { AttackDoghouseResponse, AttackResult } from '../../types/doghouse';
import { apiCall } from '../../utils/apiUtils';
import { sendEvent } from '../../utils/eventUtils';
import '../app-spinner/app-spinner';
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

  @consume({ context: accessTokenContext, subscribe: true })
  @property({ attribute: false })
  accessToken: string | null = null;

  @property({ type: Boolean })
  open: boolean = false;

  @property({ type: String })
  dogId?: string;

  @property({ type: String })
  dhId?: string;

  @state()
  attackResult: AttackResult | null = null;

  closeModal = () => {
    sendEvent(this, 'attackModal');
  };

  attackDoghouse = async () => {
    this.attackResult = null;

    if (!this.accessToken || !this.dhId || !this.dogId) return;

    const attackDoghouseResponse = await apiCall(this.accessToken).patch<AttackDoghouseResponse>(
      API_DOGHOUSE_ATTACK,
      { doghouseId: this.dhId, dogId: this.dogId }
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
            <sl-button @click=${this.closeModal} pill>Close</sl-button>
          </div>`
      : html` <div>
          <sl-button @click=${this.attackDoghouse} pill>Attack</sl-button>
          <sl-button @click=${this.closeModal} pill>Close</sl-button>
        </div>`;

    return html`<app-modal
      modalId="attack-doghouse"
      .open=${this.open}
      .element=${modalTemplate}
    ></app-modal>`;
  }
}
