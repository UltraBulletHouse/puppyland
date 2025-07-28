import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/components/badge/badge.js';
import '@shoelace-style/shoelace/dist/components/progress-bar/progress-bar.js';

import { sharedStyles } from '../../styles/shared-styles';
import { Quest, QuestType, RewardType } from '../../types/quest';

@customElement('daily-quests')
export class DailyQuests extends LitElement {
  static styles = [
    sharedStyles,
    css`
      #container {
        background: var(--color-white);
        border-radius: var(--border-radius-medium);
        padding: 16px;
        margin: 16px 0;
        border: 1px solid var(--color-primary-medium);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      #header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--color-primary-light);
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

      .quest-item.completed {
        background: var(--color-secondary-light);
        border-color: var(--color-secondary);
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
    `,
  ];

  @state()
  quests: Quest[] = [
    {
      id: '1',
      title: 'Doghouse Destroyer',
      description: 'Attack enemy doghouses 10 times today',
      type: QuestType.ATTACK_DOGHOUSES,
      target: 10,
      progress: 7,
      reward: {
        type: RewardType.DOGHOUSES,
        amount: 1,
        description: '+1 Available Doghouse',
      },
      isCompleted: false,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      title: 'Builder Master',
      description: 'Build 3 new doghouses',
      type: QuestType.BUILD_DOGHOUSES,
      target: 3,
      progress: 3,
      reward: {
        type: RewardType.EXPERIENCE,
        amount: 500,
        description: '+500 Experience',
      },
      isCompleted: true,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      title: 'Energy Boost',
      description: 'Gain 1000 experience points',
      type: QuestType.GAIN_EXPERIENCE,
      target: 1000,
      progress: 650,
      reward: {
        type: RewardType.ENERGY,
        amount: 50,
        description: '+50 Energy',
      },
      isCompleted: false,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  @state()
  nextRefreshAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  getQuestTypeIcon(type: QuestType): string {
    switch (type) {
      case QuestType.ATTACK_DOGHOUSES:
        return 'lightning-charge';
      case QuestType.BUILD_DOGHOUSES:
        return 'hammer';
      case QuestType.GAIN_EXPERIENCE:
        return 'star';
      case QuestType.VISIT_LOCATIONS:
        return 'geo-alt';
      case QuestType.REPAIR_DOGHOUSES:
        return 'tools';
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
      case QuestType.VISIT_LOCATIONS:
        return 'visit';
      case QuestType.REPAIR_DOGHOUSES:
        return 'repair';
      default:
        return '';
    }
  }

  getRewardIcon(type: RewardType): string {
    switch (type) {
      case RewardType.DOGHOUSES:
        return 'house-add';
      case RewardType.EXPERIENCE:
        return 'star-fill';
      case RewardType.ENERGY:
        return 'lightning-charge-fill';
      case RewardType.COINS:
        return 'coin';
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
    const now = new Date();
    const refresh = this.nextRefreshAt;
    const diff = refresh.getTime() - now.getTime();

    if (diff <= 0) return 'Refreshing...';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  }

  render() {
    if (!this.quests || this.quests.length === 0) {
      return html`
        <div id="container">
          <div id="header">
            <div id="title">
              <sl-icon name="list-task"></sl-icon>
              Daily Quests
            </div>
          </div>
          <div id="empty-state">
            <sl-icon name="calendar-x"></sl-icon>
            <div>No quests available today</div>
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
                <div class="quest-reward ${quest.isCompleted ? 'completed' : ''}">
                  <sl-icon
                    name="${this.getRewardIcon(quest.reward.type)}"
                    class="reward-icon ${this.getRewardClass(quest.reward.type)}"
                  ></sl-icon>
                  ${quest.reward.amount}
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
    `;
  }
}
