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
import confetti from 'canvas-confetti';

@customElement('daily-quests')
export class DailyQuests extends LitElement {
  static styles = [
    sharedStyles,
    css`
     #reward-overlay {
       position: fixed;
       inset: 0;
       z-index: 5000;
       display: flex;
       align-items: center;
       justify-content: center;
       background: rgba(0,0,0,0.35);
       backdrop-filter: blur(3px);
       animation: overlayFade 200ms ease-out;
     }
     #reward-card {
       width: min(90vw, 520px);
       border-radius: var(--border-radius-medium);
       background: var(--color-white);
       border: 1px solid var(--color-primary-medium);
       box-shadow: 0 10px 30px rgba(0,0,0,.2);
       padding: 20px;
       text-align: center;
       animation: scaleIn 260ms cubic-bezier(0.2, 0.8, 0.2, 1);
     }
     #reward-title {
       display:flex;
       align-items:center;
       justify-content:center;
       gap:10px;
       font-size: 20px;
       font-weight: 700;
       color: var(--color-black);
       margin-bottom: 12px;
     }
     #reward-items {
       display: grid;
       grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
       gap: 12px;
       margin-bottom: 16px;
     }
     .reward-tile {
       border: 1px solid var(--color-primary-light);
       border-radius: var(--border-radius-small);
       padding: 12px;
       background: var(--color-primary-light);
       display:flex;
       flex-direction:column;
       align-items:center;
       gap:8px;
       transition: transform .2s ease;
     }
     .reward-tile:hover { transform: translateY(-2px); }
     .reward-icon-big { font-size: 28px; }
     .reward-name { font-weight: 600; color: var(--color-black); font-size: 14px; }
     .reward-desc { color: var(--color-black-medium); font-size: 12px; }
     #reward-actions { display:flex; justify-content:center; }

     @keyframes scaleIn { from { transform: scale(0.92); opacity: 0;} to { transform: scale(1); opacity: 1;} }
     @keyframes overlayFade { from { opacity: 0;} to { opacity: 1;} }

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
        position: relative;
      }
      .quest-item.completed::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: var(--border-radius-small);
        pointer-events: none;
        box-shadow: inset 0 0 0 2px var(--color-secondary);
        opacity: 0.35;
      }
      .claimed-badge::part(base) {
        background: transparent;
        color: var(--color-secondary);
        border: none;
        padding: 0;
        font-weight: 700;
      }
      .claimed-badge sl-icon {
        margin-right: 6px;
      }
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

      @media (max-width: 750px) {
        #content { padding: 12px; }
        #header { margin-bottom: 12px; padding: 12px; }
        #title { gap: 6px; font-size: 16px; }
        .quest-item { padding: 10px; margin-bottom: 8px; }
        .quest-title { font-size: 13px; }
        .quest-description { font-size: 11px; }
        .quest-actions { gap: 6px; }
        .quest-reward { padding: 4px 6px; font-size: 11px; }
        .quest-progress { margin-top: 6px; }
        sl-progress-bar { --height: 5px; }
        .reward-icon { font-size: 12px; }
        .quest-type-icon { font-size: 14px; margin-right: 6px; }
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

  @state()
  private rewardOverlayOpen: boolean = false;

  @state()
  private rewardSummary: Array<{ icon: string; name: string; description: string }> = [];

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
    // Disable the button quickly to avoid double-claim taps (optimistic UI)
    const prevQuests = [...this.quests];
    this.quests = this.quests.map(q => q.id === questId ? { ...q, isRewardClaimed: true } : q);

    try {
      const { apiCall } = await import('../../utils/apiUtils');
      const { API_QUEST_CLAIM } = await import('../../constants/apiConstants');

      const response = await apiCall(this.accessToken).post(`${API_QUEST_CLAIM}/${questId}`);
      const data = response.data as any;

      // Build a neat reward summary based on backend payload shape
      const rewards: Array<{ icon: string; name: string; description: string }> = [];
      const addReward = (icon: string, name: string, description: string) =>
        rewards.push({ icon, name, description });

      if (data?.reward) {
        const r = data.reward;
        if (r.type === 'EXPERIENCE' || r.type === 1) {
          addReward('mortarboard', 'Experience', `+${r.amount ?? r.value ?? ''} XP`);
        }
        if (r.type === 'ENERGY' || r.type === 2) {
          addReward('lightning-charge', 'Energy', `+${r.amount ?? r.value ?? ''}`);
        }
        if (r.type === 'ENERGY_RESTORE') {
          addReward('lightning-charge', 'Energy Restored', `${r.description ?? ''}`);
        }
        if (r.type === 'DOGHOUSES' || r.type === 3) {
          addReward('house-add', 'Doghouse', `+${r.amount ?? 1}`);
        }
        if (r.type === 'COINS' || r.type === 4) {
          addReward('coin', 'Coins', `+${r.amount ?? ''}`);
        }
      }

      // Fallback: if backend doesn’t return detailed reward, reflect the quest’s reward
      if (!rewards.length) {
        const claimedQuest = this.quests.find(q => q.id === questId);
        if (claimedQuest) {
          addReward(
            this.getRewardIcon(claimedQuest.reward.type),
            'Reward',
            claimedQuest.reward.description
          );
        }
      }

      this.rewardSummary = rewards;
      this.rewardOverlayOpen = true;

      try {
        confetti({
          particleCount: 80,
          spread: 60,
          startVelocity: 35,
          gravity: 0.9,
          ticks: 120,
          origin: { y: 0.3 }
        });
      } catch {}


    } catch (error) {
      console.error('Error claiming quest reward:', error);
      // Revert optimistic UI on failure
      this.quests = prevQuests;
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

 private closeRewardOverlay() {
   this.rewardOverlayOpen = false;
 }

 private renderRewardOverlay() {
   return html`
     <div id="reward-overlay" @click=${this.closeRewardOverlay}>
       <div id="reward-card" @click=${(e: Event) => e.stopPropagation()}>
         <div id="reward-title">
           <sl-icon name="gift"></sl-icon>
           Rewards Claimed
         </div>
         <div id="reward-items">
           ${this.rewardSummary.map((r, i) => html`
             <div class="reward-tile" style="animation-delay: ${i * 80}ms;">
               <sl-icon name="${r.icon}" class="reward-icon-big"></sl-icon>
               <div class="reward-name">${r.name}</div>
               <div class="reward-desc">${r.description}</div>
             </div>
           `)}
         </div>
         <div id="reward-actions">
           <sl-button variant="primary" pill @click=${this.closeRewardOverlay}>
             Awesome!
           </sl-button>
         </div>
       </div>
     </div>
   `;
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
      ${this.rewardOverlayOpen ? this.renderRewardOverlay() : ''}
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
                            <sl-badge variant="success" class="claimed-badge">
                              <sl-icon name="check-circle"></sl-icon>
                              <span>Claimed</span>
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
