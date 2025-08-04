import { LitElement, css, html } from 'lit';
import { customElement, state, property } from 'lit/decorators.js';
import { consume } from '@lit/context';

import '@shoelace-style/shoelace/dist/components/badge/badge.js';
import '@shoelace-style/shoelace/dist/components/option/option.js';
import '@shoelace-style/shoelace/dist/components/select/select.js';

import { sharedStyles } from '../../styles/shared-styles';
import { accessTokenContext } from '../../contexts/userFirebaseContext';
import {
  LeaderboardEntry,
  LeaderboardCategory,
  LeaderboardData,
  LeaderboardsResponse
} from '../../types/leaderboard';

@customElement('leaderboards-component')
export class LeaderboardsComponent extends LitElement {
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

      #header {
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
        margin-bottom: 12px;
      }

      #category-selector {
        width: 100%;
      }

      #content {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        min-height: 0;
        max-height: calc(100vh - 200px);
        -webkit-overflow-scrolling: touch;
      }

      #current-user-card {
        background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
        color: white;
        border-radius: var(--border-radius-medium);
        padding: 16px;
        margin-bottom: 16px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      #current-user-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;
      }

      #current-user-avatar {
        width: 48px;
        height: 48px;
        border-radius: var(--border-radius-circle);
        background: rgba(255, 255, 255, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
      }

      #current-user-info {
        flex: 1;
      }

      #current-user-name {
        font-weight: 600;
        font-size: 16px;
        margin-bottom: 2px;
      }

      #current-user-dog {
        font-size: 14px;
        opacity: 0.9;
      }

      #current-user-rank {
        background: rgba(255, 255, 255, 0.2);
        padding: 8px 12px;
        border-radius: var(--border-radius-small);
        font-weight: 700;
        font-size: 14px;
        text-align: center;
        min-width: 60px;
      }

      #leaderboard-list {
        background: var(--color-white);
        border-radius: var(--border-radius-medium);
        border: 1px solid var(--color-primary-medium);
        overflow: visible;
        margin-bottom: 16px;
      }

      .leaderboard-entry {
        display: flex;
        align-items: center;
        padding: 12px 16px;
        border-bottom: 1px solid var(--color-primary-light);
        transition: background-color 0.2s ease;
        min-height: 64px;
      }

      .leaderboard-entry:last-child {
        border-bottom: none;
      }

      .leaderboard-entry:hover {
        background: var(--color-primary-light);
      }

      .leaderboard-entry.current-user {
        background: var(--color-secondary-light);
        border-left: 4px solid var(--color-secondary);
      }

      .rank {
        width: 40px;
        text-align: center;
        font-weight: 700;
        font-size: 16px;
        color: var(--color-black-medium);
      }

      .rank.top-3 {
        color: var(--color-primary);
        font-size: 18px;
      }

      .rank.rank-1 {
        color: #ffd700;
      }
      .rank.rank-2 {
        color: #c0c0c0;
      }
      .rank.rank-3 {
        color: #cd7f32;
      }

      .player-avatar {
        width: 40px;
        height: 40px;
        border-radius: var(--border-radius-circle);
        background: var(--color-primary-light);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        margin: 0 12px;
        border: 2px solid var(--color-primary-medium);
      }

      .player-info {
        flex: 1;
        min-width: 0;
      }

      .player-name {
        font-weight: 600;
        font-size: 14px;
        color: var(--color-black);
        margin-bottom: 2px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .dog-name {
        font-size: 12px;
        color: var(--color-black-medium);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .score {
        text-align: right;
        margin-left: 8px;
      }

      .score-value {
        font-weight: 700;
        font-size: 16px;
        color: var(--color-primary);
      }

      .score-label {
        font-size: 11px;
        color: var(--color-black-light);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .player-badge {
        margin-left: 8px;
        padding: 2px 6px;
        border-radius: var(--border-radius-small);
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .badge-champion {
        background: linear-gradient(135deg, #ffd700, #ffa500);
        color: white;
      }

      .badge-top-player {
        background: linear-gradient(135deg, #c0c0c0, #a0a0a0);
        color: white;
      }

      .badge-rising-star {
        background: linear-gradient(135deg, #ff6b6b, #ff5252);
        color: white;
      }

      .badge-veteran {
        background: linear-gradient(135deg, #9b59b6, #8e44ad);
        color: white;
      }

      .badge-newcomer {
        background: linear-gradient(135deg, #4ecdc4, #44a08d);
        color: white;
      }

      #stats-footer {
        padding: 12px 16px;
        background: var(--color-primary-light);
        border-top: 1px solid var(--color-primary-medium);
        text-align: center;
        font-size: 12px;
        color: var(--color-black-medium);
      }

      #empty-state {
        text-align: center;
        padding: 40px 20px;
        color: var(--color-black-light);
      }

      #empty-state sl-icon {
        font-size: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
      }

      .crown-icon {
        margin-right: 4px;
        font-size: 14px;
        color: #FFD700;
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
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `,
  ];

  @property({ type: Boolean })
  isActive: boolean = false;

  @consume({ context: accessTokenContext, subscribe: true })
  @property({ attribute: false })
  accessToken: string | null = null;

  @state()
  selectedCategory: string = LeaderboardCategory.LEVEL;

  @state()
  leaderboards: LeaderboardData[] = []; // Initialize as empty array

  @state()
  currentUser = {
    userId: '',
    userName: '',
    dogName: ''
  };

  @state()
  isLoading: boolean = true;

  private hasFetchedData: boolean = false;

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    if (changedProperties.has('isActive') && this.isActive && !this.hasFetchedData) {
      this.fetchLeaderboardData();
      this.hasFetchedData = true;
    }
  }

  private async fetchLeaderboardData() {
    if (!this.accessToken) {
      console.error('No access token available for leaderboard');
      return;
    }

    try {
      this.isLoading = true;
      const { apiCall } = await import('../../utils/apiUtils');
      const { API_LEADERBOARD_GET } = await import('../../constants/apiConstants');
      
      const response = await apiCall(this.accessToken).get(API_LEADERBOARD_GET);
      const data: LeaderboardsResponse = response.data;
      
      this.leaderboards = data.leaderboards;
      this.currentUser = data.currentUser;
      console.log('Fetched leaderboards:', this.leaderboards);
      
      // Set the initial selected category to the first leaderboard or a default
      if (this.leaderboards.length > 0) {
        this.selectedCategory = this.leaderboards[0].category.toString();
        console.log('Initial selectedCategory:', this.selectedCategory);
      }
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  get currentLeaderboard(): LeaderboardData | undefined {
    console.log('Getting currentLeaderboard. selectedCategory:', this.selectedCategory);
    const found = this.leaderboards.find(lb => {
      console.log('  Comparing:', lb.category.toString(), '===', this.selectedCategory);
      return lb.category.toString() === this.selectedCategory;
    });
    console.log('  Found leaderboard:', found);
    return found;
  }

  get currentUserEntry(): LeaderboardEntry | undefined {
    return this.currentLeaderboard?.entries.find((entry) => entry.isCurrentUser);
  }

  handleCategoryChange(event: CustomEvent) {
    const newCategory = (event.target as HTMLSelectElement).value;
    if (newCategory && newCategory !== this.selectedCategory) {
      this.selectedCategory = newCategory;
      this.requestUpdate();
    }
  }

  getCategoryLabel(category: string): string {
    switch (category) {
      case LeaderboardCategory.LEVEL: return 'Top Levels';
      case LeaderboardCategory.DOGHOUSES_BUILT: return 'Master Builders';
      case LeaderboardCategory.DOGHOUSES_DESTROYED: return 'Top Destroyers';
      default: return 'Leaderboard';
    }
  }

  getScoreLabel(category: string): string {
    switch (category) {
      case LeaderboardCategory.LEVEL: return 'Level';
      case LeaderboardCategory.DOGHOUSES_BUILT: return 'Built';
      case LeaderboardCategory.DOGHOUSES_DESTROYED: return 'Destroyed';
      default: return 'Score';
    }
  }

  getScoreValue(entry: LeaderboardEntry): number {
    // For Level leaderboard, show the actual level instead of the calculated score
    // For other leaderboards, show the relevant metric
    switch (this.selectedCategory) {
      case LeaderboardCategory.LEVEL: return entry.level ?? 0;
      case LeaderboardCategory.DOGHOUSES_BUILT: return entry.ownedDoghouses ?? 0;
      case LeaderboardCategory.DOGHOUSES_DESTROYED: return entry.destroyedDoghouses ?? 0;
      default: return entry.score ?? 0;
    }
  }

  getRankIcon(rank: number): string {
    switch (rank) {
      case 1:
        return '👑';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return '';
    }
  }

  render() {
    if (this.isLoading) {
      return html`
        <div id="container">
          <div id="header">
            <div id="title">
              <sl-icon name="trophy"></sl-icon>
              Leaderboards
            </div>
          </div>
          <div id="loading-state">
            <sl-icon name="arrow-clockwise"></sl-icon>
            <p>Loading leaderboards...</p>
          </div>
        </div>
      `;
    }

    const leaderboard = this.currentLeaderboard;
    const userEntry = this.currentUserEntry;

    if (!leaderboard) {
      return html`
        <div id="container">
          <div id="empty-state">
            <sl-icon name="trophy"></sl-icon>
            <div>No leaderboard data available</div>
          </div>
        </div>
      `;
    }

    return html`
      <div id="container">
        <div id="header">
          <div id="title">
            <sl-icon name="trophy"></sl-icon>
            Leaderboards
          </div>

          <sl-select
            id="category-selector"
            value=${this.selectedCategory.toString()}
            @sl-change=${this.handleCategoryChange}
            size="small"
            hoist
          >
            <sl-option value=${LeaderboardCategory.LEVEL.toString()}>
              <sl-icon name="star" slot="prefix"></sl-icon>
              Top Levels
            </sl-option>
            <sl-option value=${LeaderboardCategory.DOGHOUSES_BUILT.toString()}>
              <sl-icon name="hammer" slot="prefix"></sl-icon>
              Master Builders
            </sl-option>
            <sl-option value=${LeaderboardCategory.DOGHOUSES_DESTROYED.toString()}>
              <sl-icon name="lightning-charge" slot="prefix"></sl-icon>
              Top Destroyers
            </sl-option>
          </sl-select>
        </div>

        <div id="content">
          ${userEntry
            ? html`
                <div id="current-user-card">
                  <div id="current-user-header">
                    <div id="current-user-avatar">🐕</div>
                    <div id="current-user-info">
                      <div id="current-user-name">${this.currentUser.userName}</div>
                      <div id="current-user-dog">${this.currentUser.dogName}</div>
                    </div>
                    <div id="current-user-rank">#${userEntry.rank}</div>
                  </div>
                </div>
              `
            : ''}
          ${userEntry
            ? html`
                <div id="current-user-card">
                  <div id="current-user-header">
                    <div id="current-user-avatar">🐕</div>
                    <div id="current-user-info">
                      <div id="current-user-name">${this.currentUser.userName}</div>
                      <div id="current-user-dog">${this.currentUser.dogName}</div>
                    </div>
                    <div id="current-user-rank">#${userEntry.rank}</div>
                  </div>
                </div>
              `
            : ''}

          <div id="leaderboard-list">
            ${leaderboard.entries.map((entry) => {
              return html`
              <div class="leaderboard-entry ${entry.isCurrentUser ? 'current-user' : ''}">
                <div class="rank ${entry.rank <= 3 ? `top-3 rank-${entry.rank}` : ''}">
                  ${entry.rank <= 3 ? this.getRankIcon(entry.rank) : `#${entry.rank}`}
                </div>
                
                <div class="player-avatar">
                  ${entry.isCurrentUser ? '🐕' : '🐶'}
                </div>
                
                <div class="player-info">
                  <div class="player-name">${entry.userName}</div>
                  <div class="dog-name">${entry.dogName}</div>
                </div>
                
                ${entry.badge && entry.badge.type ? html`
                  <div class="player-badge badge-${entry.badge.type}">
                    ${entry.badge.label}
                  </div>
                ` : ''}
                
                <div class="score">
                  <div class="score-value">
                    ${this.getScoreValue(entry)}
                  </div>
                  <div class="score-label">
                    ${this.getScoreLabel(this.selectedCategory)}
                  </div>
                </div>
              </div>
            `;
            })}

          <div id="stats-footer">
            ${leaderboard.totalPlayers.toLocaleString()} total players • Updated
            ${new Date(leaderboard.lastUpdated).toLocaleDateString()}
          </div>
        </div>
      </div>
    `;
  }
}
