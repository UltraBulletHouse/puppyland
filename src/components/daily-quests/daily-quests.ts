import { consume } from '@lit/context';
import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/components/badge/badge.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/progress-bar/progress-bar.js';

import { accessTokenContext } from '../../contexts/userFirebaseContext';
import { sharedStyles } from '../../styles/shared-styles';
import { DailyQuestsResponse, Quest, QuestType, RewardType } from '../../types/quest';
import { t } from '../../i18n';

@customElement('daily-quests')
export class DailyQuests extends LitElement {
  static styles = [
    sharedStyles,
    css`
      #container {
        background: var(--color-surface);
        height: 100%;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      #content {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        min-height: 0;
        max-height: calc(100vh - 200px);
        -webkit-overflow-scrolling: touch;
      }

      #header {
        display: flex;
        justify-content: flex-end; /* only timer on the right */
        align-items: center;
        margin-bottom: 8px;
        padding: 8px 12px; /* smaller header */
        border-bottom: 1px solid var(--header-border);
        background: var(--header-bg);
      }

      /* Title removed from header for compact look */

      #refresh-timer {
        font-size: 12px;
        color: var(--color-black-medium);
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .quest-item {
        background: var(--color-surface-strong);
        border-radius: 16px;
        padding: 12px;
        margin-bottom: 12px;
        border: 1px solid var(--color-surface-border);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
        transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
      }

      .quest-item:last-child {
        margin-bottom: 0;
      }

      .quest-item:hover {
        background: var(--color-surface);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      }

      .quest-item.completed {
        background: var(--color-secondary-light);
        border-left: 4px solid var(--color-secondary);
      }

      .quest-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 8px;
      }

      .quest-info {
        flex: 1;
        min-width: 0;
      }

      .quest-title {
        display: flex;
        align-items: center;
        font-weight: 700;
        font-size: 16px;
        color: var(--color-black);
        margin-bottom: 4px;
        line-height: 1.3;
      }

      .quest-description {
        font-size: 12px;
        color: var(--color-black-medium);
        line-height: 1.4;
      }

      .quest-actions {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 8px;
      }

      .quest-reward {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: var(--gold-100);
        border: 2px solid var(--gold);
        color: #5a4200;
        padding: 4px 10px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 800;
        white-space: nowrap;
      }

      .quest-reward.completed {
        background: var(--color-secondary);
        color: var(--color-white);
        border-color: var(--color-secondary);
      }

      .quest-progress {
        margin-top: 8px;
      }

      .progress-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
        font-size: 12px;
      }

      .progress-text {
        color: var(--color-black-medium);
        font-weight: 500;
      }

      .progress-percentage {
        color: var(--color-primary);
        font-weight: 600;
      }

      sl-progress-bar {
        --height: 8px;
        --track-color: var(--color-surface);
        --indicator-color: var(--primary);
      }

      .quest-item.completed sl-progress-bar {
        --indicator-color: var(--color-secondary);
      }

      .reward-icon {
        font-size: 14px;
      }

      .reward-icon.doghouse {
        color: var(--color-primary);
      }
      .reward-icon.experience {
        color: var(--color-lime);
      }
      .reward-icon.energy {
        color: var(--color-blue);
      }
      .reward-icon.coins {
        color: var(--color-lime);
      }

      .quest-title sl-icon {
        width: 28px;
        height: 28px;
        margin-right: 8px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 999px;
        border: 2px solid var(--primary);
        color: var(--primary);
        background: #fff;
        font-size: 14px;
      }
      .quest-type-icon.attack,
      .quest-type-icon.destroy,
      .quest-type-icon.energy {
        border-color: var(--coral);
        color: var(--coral);
      }
      .quest-type-icon.build,
      .quest-type-icon.visit {
        border-color: var(--sky);
        color: var(--sky);
      }
      .quest-type-icon.experience,
      .quest-type-icon.level-up {
        border-color: var(--lime);
        color: var(--lime);
      }
      .quest-type-icon.repair {
        border-color: var(--primary);
        color: var(--primary);
      }

      #empty-state {
        text-align: center;
        padding: 20px;
        color: var(--color-black-light);
      }

      #empty-state sl-icon {
        font-size: 32px;
        margin-bottom: 8px;
        opacity: 0.5;
      }

      #loading-state {
        text-align: center;
        padding: 40px 20px;
        color: var(--color-black-medium);
      }

      #loading-state sl-icon {
        font-size: 48px;
        margin-bottom: 16px;
        animation: spin 2s linear infinite;
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
    `,
  ];

  @consume({ context: accessTokenContext, subscribe: true })
  @property({ attribute: false })
  accessToken: string | null = null;

  @property({ type: Boolean })
  isActive: boolean = false;

  @state()
  quests: Quest[] = [];

  @state()
  nextRefreshAt: string = '';

  @state()
  isLoading: boolean = true;

  @state()
  private hasFetchedData: boolean = false;

  async firstUpdated() {}

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    if (changedProperties.has('isActive') && this.isActive && !this.hasFetchedData) {
      this.fetchDailyQuests();
      this.hasFetchedData = true;
    }
  }

  private async fetchDailyQuests() {
    if (!this.accessToken) {
      /* console.error('No access token available for daily quests'); */
      return;
    }

    try {
      this.isLoading = true;
      const { apiCall } = await import('../../utils/apiUtils');
      const { API_QUESTS_DAILY } = await import('../../constants/apiConstants');

      const response = await apiCall(this.accessToken).get(API_QUESTS_DAILY);
      const data: DailyQuestsResponse = response.data;

      this.quests = data.quests;
      this.nextRefreshAt = data.nextRefreshAt;
      /* console.log('Fetched daily quests:', this.quests); */
    } catch (error) {
      /* console.error('Error fetching daily quests:', error); */
    } finally {
      this.isLoading = false;
    }
  }

  private async claimReward(questId: string) {
    if (!this.accessToken) return;

    try {
      const { apiCall } = await import('../../utils/apiUtils');
      const { API_QUEST_CLAIM } = await import('../../constants/apiConstants');

      await apiCall(this.accessToken).post(`${API_QUEST_CLAIM}/${questId}`);
      /* console.log('Claimed reward:', response.data); */

      // Refresh quests after claiming
      await this.fetchDailyQuests();
    } catch (error) {
      /* console.error('Error claiming quest reward:', error); */
    }
  }

  getQuestTypeIcon(type: QuestType): string {
    switch (type) {
      case QuestType.ATTACK_DOGHOUSES:
        return 'lightning-charge';
      case QuestType.BUILD_DOGHOUSES:
        return 'house-add';
      case QuestType.GAIN_EXPERIENCE:
        return 'mortarboard';
      case QuestType.REPAIR_DOGHOUSES:
        return 'tools';
      case QuestType.DESTROY_DOGHOUSES:
        return 'fire';
      case QuestType.LEVEL_UP:
        return 'star';
      case QuestType.SPEND_ENERGY:
        return 'lightning-charge';
      default:
        return 'question-circle';
    }
  }

  getQuestTypeClass(type: QuestType): string {
    switch (type) {
      case QuestType.ATTACK_DOGHOUSES:
        return 'attack';
      case QuestType.BUILD_DOGHOUSES:
        return 'build';
      case QuestType.GAIN_EXPERIENCE:
        return 'experience';
      case QuestType.REPAIR_DOGHOUSES:
        return 'repair';
      case QuestType.DESTROY_DOGHOUSES:
        return 'destroy';
      case QuestType.LEVEL_UP:
        return 'level-up';
      case QuestType.SPEND_ENERGY:
        return 'energy';
      default:
        return '';
    }
  }

  getRewardIcon(type: RewardType): string {
    switch (type) {
      case RewardType.DOGHOUSES:
        return 'house-add';
      case RewardType.EXPERIENCE:
        return 'mortarboard';
      case RewardType.ENERGY:
        return 'lightning-charge';
      case RewardType.ENERGY_RESTORE:
        return 'lightning-charge';
      default:
        return 'gift';
    }
  }

  getRewardClass(type: RewardType): string {
    switch (type) {
      case RewardType.DOGHOUSES:
        return 'doghouse';
      case RewardType.EXPERIENCE:
        return 'experience';
      case RewardType.ENERGY:
        return 'energy';
      case RewardType.COINS:
        return 'coins';
      default:
        return '';
    }
  }

  formatTimeRemaining(): string {
    if (!this.nextRefreshAt) return t('loading');

    const now = new Date();
    const refreshTime = new Date(this.nextRefreshAt);
    const diff = refreshTime.getTime() - now.getTime();

    if (diff <= 0) return t('refreshing');

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}${t('hoursAbbrev')} ${minutes}${t('minutesAbbrev')}`;
  }

  render() {
    if (this.isLoading) {
      return html`
        <div id="container">
          <div id="header">
            <div id="refresh-timer">
              <sl-icon name="clock"></sl-icon>
              <span class="timer-label">${t('remainingTime')}</span>
              ${this.formatTimeRemaining()}
            </div>
          </div>
          <div id="content">
            <div id="loading-state">
              <sl-icon name="arrow-clockwise"></sl-icon>
              <p>${t('loadingDailyQuests')}</p>
            </div>
          </div>
        </div>
      `;
    }

    if (!this.quests || this.quests.length === 0) {
      return html`
        <div id="container">
          <div id="header">
            <div id="refresh-timer">
              <sl-icon name="clock"></sl-icon>
              <span class="timer-label">${t('remainingTime')}</span>
              ${this.formatTimeRemaining()}
            </div>
          </div>
          <div id="content">
            <div id="empty-state">
              <sl-icon name="calendar-x"></sl-icon>
              <div>${t('noQuestsToday')}</div>
            </div>
          </div>
        </div>
      `;
    }

    return html`
      <div id="container">
        <div id="header">
          <div id="refresh-timer">
            <sl-icon name="clock"></sl-icon>
            <span class="timer-label">${t('remainingTime')}</span>
            ${this.formatTimeRemaining()}
          </div>
        </div>
        
        <div id="content">
          ${this.quests.map((quest) => {
            const progressPercentage = Math.min((quest.progress / quest.target) * 100, 100);

            return html`
              <div class="quest-item ${quest.isCompleted ? 'completed' : ''}">
                <div class="quest-header">
                  <div class="quest-info">
                    <div class="quest-title">
                      <sl-icon
                        name="${this.getQuestTypeIcon(quest.type)}"
                        class="quest-type-icon ${this.getQuestTypeClass(quest.type)}"
                      ></sl-icon>
                      ${quest.title}
                    </div>
                    <div class="quest-description">${quest.description}</div>
                  </div>
                  <div class="quest-actions">
                    <div class="quest-reward ${quest.isCompleted ? 'completed' : ''}">
                      <sl-icon
                        name="${this.getRewardIcon(quest.reward.type)}"
                        class="reward-icon ${this.getRewardClass(quest.reward.type)}"
                      ></sl-icon>
                      ${quest.reward.description}
                    </div>
                    ${quest.isCompleted && !quest.isRewardClaimed
                      ? html`
                          <sl-button
                            variant="success"
                            size="small"
                            @click=${() => this.claimReward(quest.id)}
                          >
                            <sl-icon name="gift" slot="prefix"></sl-icon>
                            ${t('claim')}
                          </sl-button>
                        `
                      : quest.isRewardClaimed
                        ? html`
                            <sl-badge variant="success">
                              <sl-icon name="check-circle"></sl-icon>
                              ${t('claimed')}
                            </sl-badge>
                          `
                        : ''}
                  </div>
                </div>

                <div class="quest-progress">
                  <div class="progress-info">
                    <span class="progress-text"> ${quest.progress} / ${quest.target} </span>
                    <span class="progress-percentage"> ${Math.round(progressPercentage)}% </span>
                  </div>
                  <sl-progress-bar value="${progressPercentage}"></sl-progress-bar>
                </div>
              </div>
            `;
          })}
        </div>
      </div>
    `;
  }
}
