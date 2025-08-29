import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { DogInfo } from '../../types/dog';
import { sendEvent } from '../../utils/eventUtils';
import { LevelUpModalStyles } from './level-up-modal-styles';

@customElement('level-up-modal')
export class LevelUpModal extends LitElement {
  @property({ attribute: false })
  dogInfo: DogInfo | null = null;

  closeModal = () => {
    // sendEvent(this, 'close');
  };

  render() {
    return html`
      ${LevelUpModalStyles}
      <div id="level-up-modal">
        <h2>🎉 Level Up! 🎉</h2>
        <h3>You reached level <strong>${this.dogInfo?.level}</strong>!</h3>
        <div>
          <ul>
            <li><sl-icon name="plus-circle"></sl-icon>Skill point +1</li>
            <li><sl-icon name="house-add"></sl-icon>Doghouse +1</li>
          </ul>
        </div>
        <sl-button class="claim-btn" @click=${this.closeModal} pill>Claim</sl-button>
      </div>
    `;
  }
}
