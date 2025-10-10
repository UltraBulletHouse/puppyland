import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { t } from '../../i18n';
import { DogInfo } from '../../types/dog';
import { sendEvent } from '../../utils/eventUtils';
import { LevelUpModalStyles } from './level-up-modal-styles';

@customElement('level-up-modal')
export class LevelUpModal extends LitElement {
  @property({ attribute: false })
  dogInfo: DogInfo | null = null;

  closeModal = () => {
    sendEvent(this, 'close');
  };

  render() {
    const levelTextTemplate = t('levelUp.reachedLevel');
    const [levelTextBefore = '', levelTextAfter = ''] = levelTextTemplate.split('{level}');
    const levelValue = this.dogInfo?.level ?? '';

    return html`
      ${LevelUpModalStyles}
      <div id="level-up-modal">
        <h2>${t('levelUp.title')}</h2>
        <h3>${levelTextBefore}<strong>${levelValue}</strong>${levelTextAfter}</h3>
        <div>
          <ul>
            <li><sl-icon name="plus-circle"></sl-icon>${t('levelUp.skillPointReward')}</li>
            <li><sl-icon name="house-add"></sl-icon>${t('levelUp.doghouseReward')}</li>
          </ul>
        </div>
        <sl-button class="claim-btn" @click=${this.closeModal} pill>${t('claim')}</sl-button>
      </div>
    `;
  }
}
