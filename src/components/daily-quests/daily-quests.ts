import { consume } from '@lit/context';
import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/components/badge/badge.js';
import '@shoelace-style/shoelace/dist/components/badge/badge.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/progress-bar/progress-bar.js';

import { accessTokenContext } from '../../contexts/userFirebaseContext';
import { sharedStyles } from '../../styles/shared-styles';
import { DailyQuestsResponse, Quest, QuestType, RewardType } from '../../types/quest';

@customElement('daily-quests')
export class DailyQuests extends LitElement {
  static styles = [
    sharedStyles,
    css`
      #container {
        background: var(--color-white);
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
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        padding: 16px;
        border-bottom: 1px solid var(--color-primary-light);
        background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-white) 100%);
      }

      #title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        font-size: 18px;
        color: var(--color-black);
      }

      #refresh-timer {
        font-size: 12px;
        color: var(--color-black-medium);
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .quest-item {
        background: var(--color-primary-light);
        border-radius: var(--border-radius-small);
        padding: 12px;
        margin-bottom: 12px;
        border: 1px solid var(--color-primary-medium);
        transition: all 0.2s ease;
      }

      .quest-item:last-child {
        margin-bottom: 0;
      }

      .quest-item:hover {
        background: var(--color-primary-light);
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
        font-weight: 600;
        font-size: 14px;
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
        display: flex;
        align-items: center;
        gap: 4px;
        background: var(--color-white);
        padding: 6px 8px;
        border-radius: var(--border-radius-small);
        border: 1px solid var(--color-primary-medium);
        font-size: 12px;
        font-weight: 600;
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
        --height: 6px;
        --track-color: var(--color-white);
        --indicator-color: var(--color-primary);
      }

      .quest-item.completed sl-progress-bar {
        --indicator-color: var(--color-secondary);
      }

      .reward-icon {
        font-size: 14px;
      }

      .reward-icon.doghouse {
        color: #8b4513;
      }
      .reward-icon.experience {
        color: #ffd700;
      }
      .reward-icon.energy {
        color: #ff6b6b;
      }
      .reward-icon.coins {
        color: #ffa500;
      }

      .quest-type-icon {
        font-size: 16px;
        margin-right: 8px;
      }

      .quest-type-icon.attack {
        color: #e74c3c;
      }
      .quest-type-icon.build {
        color: #3498db;
      }
      .quest-type-icon.experience {
        color: #f39c12;
      }
      .quest-type-icon.visit {
        color: #9b59b6;
      }
      .quest-type-icon.repair {
        color: #27ae60;
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
      console.error('No access token available for daily quests');
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
      console.log('Fetched daily quests:', this.quests);
    } catch (error) {
      console.error('Error fetching daily quests:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private async claimReward(questId: string) {
    if (!this.accessToken) return;

    try {
      const { apiCall } = await import('../../utils/apiUtils');
      const { API_QUEST_CLAIM } = await import('../../constants/apiConstants');

      const response = await apiCall(this.accessToken).post(`${API_QUEST_CLAIM}/${questId}`);
      console.log('Claimed reward:', response.data);

      // Refresh quests after claiming
      await this.fetchDailyQuests();
    } catch (error) {
      console.error('Error claiming quest reward:', error);
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
    if (!this.nextRefreshAt) return 'Loading...';

    const now = new Date();
    const refreshTime = new Date(this.nextRefreshAt);
    const diff = refreshTime.getTime() - now.getTime();

    if (diff <= 0) return 'Refreshing...';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  }

  render() {
    if (this.isLoading) {
      return html`
        <div id="container">
          <div id="header">
            <div id="title">
              <sl-icon name="list-task"></sl-icon>
              Daily Quests
            </div>
          </div>
          <div id="content">
            <div id="loading-state">
              <sl-icon name="arrow-clockwise"></sl-icon>
              <p>Loading daily quests...</p>
            </div>
          </div>
        </div>
      `;
    }

    if (!this.quests || this.quests.length === 0) {
      return html`
        <div id="container">
          <div id="header">
            <div id="title">
              <sl-icon name="list-task"></sl-icon>
              Daily Quests
            </div>
          </div>
          <div id="content">
            <div id="empty-state">
              <sl-icon name="calendar-x"></sl-icon>
              <div>No quests available today</div>
            </div>
          </div>
        </div>
      `;
    }

    return html`
      <div id="container">
        <div id="header">
          <div id="title">
            <sl-icon name="list-task"></sl-icon>
            Daily Quests
          </div>
          <div id="refresh-timer">
            <sl-icon name="clock"></sl-icon>
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
                            Claim
                          </sl-button>
                        `
                      : quest.isRewardClaimed
                        ? html`
                            <sl-badge variant="success">
                              <sl-icon name="check-circle"></sl-icon>
                              Claimed
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
