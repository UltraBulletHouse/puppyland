import { consume } from '@lit/context';
import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/components/badge/badge.js';
import '@shoelace-style/shoelace/dist/components/option/option.js';
import '@shoelace-style/shoelace/dist/components/select/select.js';

import { accessTokenContext } from '../../contexts/userFirebaseContext';
import '../icon-svg/svg-icon';
import { sharedStyles } from '../../styles/shared-styles';
import { t, ti } from '../../i18n';
import {
  LeaderboardCategory,
  LeaderboardData,
  LeaderboardEntry,
  LeaderboardsResponse,
} from '../../types/leaderboard';

@customElement('leaderboards-component')
export class LeaderboardsComponent extends LitElement {
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

      #header {
        padding: 0; /* stretch to full width of parent card */
        border-bottom: none;
        background: transparent;
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

      #category-buttons {
        display: flex;
        gap: 0; /* compact segmented look */
        margin-top: 0;
        flex-wrap: nowrap; /* keep in a single row */
        justify-content: center;
        white-space: nowrap;
        width: fit-content; /* shrink to content like tabs */
        max-width: 100%;
        margin-left: auto;
        margin-right: auto;
        padding: 2px; /* segmented track padding */
        background: color-mix(in srgb, var(--primary) 8%, #fff);
        border-radius: 999px;
        border: 1px solid var(--color-surface-border);
        overflow-x: auto; /* allow horizontal scroll on very small phones */
        -webkit-overflow-scrolling: touch;
      }

      .category-button {
        flex: 0 0 auto; /* let buttons size to content and wrap */
      }

      .category-button::part(base) {
        font-size: 11px;
        padding: 3px 8px; /* extra compact */
        background: transparent;
        color: var(--text-2);
        border: none;
        border-radius: 999px;
        transition: background-color 0.2s, color 0.2s;
        align-items: center;
        justify-content: center;
        box-shadow: none;
      }
      .category-button::part(prefix) {
        margin-right: 4px;
        font-size: 14px;
      }

      @media (max-width: 420px) {
        .category-button::part(base) {
          font-size: 10px;
          padding: 2px 6px;
        }
        .category-button::part(prefix) {
          font-size: 12px;
        }
      }

      .category-button.active::part(base) {
        background: var(--primary);
        color: #fff;
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
        background: var(--color-surface-strong);
        border-radius: var(--border-radius-medium);
        border: 1px solid var(--color-surface-border);
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
        color: var(--color-medal-gold);
      }
      .rank.rank-2 {
        color: var(--color-medal-silver);
      }
      .rank.rank-3 {
        color: var(--color-medal-bronze);
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
        color: var(--color-medal-gold);
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
    dogName: '',
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
    const cacheKey = 'leaderboards';
    if (!this.accessToken) {
      /* console.error('No access token available for leaderboard'); */
      return;
    }

    try {
      this.isLoading = true;
      const { idbGet, idbSet } = await import('../../utils/idb');
      // Try last-known cached leaderboards for instant UI
      try {
        const cached = await idbGet<LeaderboardsResponse>(cacheKey);
        if (cached?.value) {
          this.leaderboards = cached.value.leaderboards;
          this.currentUser = cached.value.currentUser;
          this.isLoading = false; // render quickly, then refresh network below
        }
      } catch {}
      const { apiCall } = await import('../../utils/apiUtils');
      const { API_LEADERBOARD_GET } = await import('../../constants/apiConstants');

      const response = await apiCall(this.accessToken).get(API_LEADERBOARD_GET);
      const data: LeaderboardsResponse = response.data;

      this.leaderboards = data.leaderboards;
      this.currentUser = data.currentUser;
      try {
        await idbSet<LeaderboardsResponse>(cacheKey, data);
      } catch {}
      /* console.log('Fetched leaderboards:', this.leaderboards); */

      // Set the initial selected category to the first leaderboard or a default
      if (this.leaderboards.length > 0) {
        this.selectedCategory = this.leaderboards[0].category.toString();
        /* console.log('Initial selectedCategory:', this.selectedCategory); */
      }
    } catch (error) {
      /* console.error('Error fetching leaderboard data:', error); */
    } finally {
      this.isLoading = false;
    }
  }

  get currentLeaderboard(): LeaderboardData | undefined {
    /* console.log('Getting currentLeaderboard. selectedCategory:', this.selectedCategory); */
    const found = this.leaderboards.find((lb) => {
      /* console.log('  Comparing:', lb.category.toString(), '===', this.selectedCategory); */
      return lb.category.toString() === this.selectedCategory;
    });
    /* console.log('  Found leaderboard:', found); */
    return found;
  }

  get currentUserEntry(): LeaderboardEntry | undefined {
    return this.currentLeaderboard?.entries.find((entry) => entry.isCurrentUser);
  }

  handleCategoryChange(newCategory: LeaderboardCategory) {
    if (newCategory && newCategory !== this.selectedCategory) {
      this.selectedCategory = newCategory;
      this.requestUpdate();
    }
  }

  getCategoryLabel(category: string): string {
    switch (category) {
      case LeaderboardCategory.LEVEL:
        return t('leaderboardTopLevels');
      case LeaderboardCategory.DOGHOUSES_BUILT:
        return t('leaderboardMasterBuilders');
      case LeaderboardCategory.DOGHOUSES_DESTROYED:
        return t('leaderboardTopDestroyers');
      default:
        return t('leaderboardGeneric');
    }
  }

  getScoreLabel(category: string): string {
    switch (category) {
      case LeaderboardCategory.LEVEL:
        return t('leaderboardColLevel');
      case LeaderboardCategory.DOGHOUSES_BUILT:
        return t('leaderboardColBuilt');
      case LeaderboardCategory.DOGHOUSES_DESTROYED:
        return t('leaderboardColDestroyed');
      default:
        return t('leaderboardColScore');
    }
  }

  getScoreValue(entry: LeaderboardEntry): number {
    // For Level leaderboard, show the actual level instead of the calculated score
    // For other leaderboards, show the relevant metric
    switch (this.selectedCategory) {
      case LeaderboardCategory.LEVEL:
        return entry.level ?? 0;
      case LeaderboardCategory.DOGHOUSES_BUILT:
        return entry.totalDoghousesBuilt ?? 0;
      case LeaderboardCategory.DOGHOUSES_DESTROYED:
        return entry.destroyedDoghouses ?? 0;
      default:
        return entry.score ?? 0;
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
          <div id="header"></div>
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
          <div id="category-buttons">
            <sl-button
              class="category-button ${this.selectedCategory === LeaderboardCategory.LEVEL
                ? 'active'
                : ''}"
              @click=${() => this.handleCategoryChange(LeaderboardCategory.LEVEL)}
              size="small"
            >
              <sl-icon name="star" slot="prefix"></sl-icon>
              ${t('leaderboardTopLevels')}
            </sl-button>
            <sl-button
              class="category-button ${this.selectedCategory === LeaderboardCategory.DOGHOUSES_BUILT
                ? 'active'
                : ''}"
              @click=${() => this.handleCategoryChange(LeaderboardCategory.DOGHOUSES_BUILT)}
              size="small"
            >
              <sl-icon name="hammer" slot="prefix"></sl-icon>
              ${t('leaderboardMasterBuilders')}
            </sl-button>
            <sl-button
              class="category-button ${this.selectedCategory ===
              LeaderboardCategory.DOGHOUSES_DESTROYED
                ? 'active'
                : ''}"
              @click=${() => this.handleCategoryChange(LeaderboardCategory.DOGHOUSES_DESTROYED)}
              size="small"
            >
              <sl-icon name="lightning-charge" slot="prefix"></sl-icon>
              ${t('leaderboardTopDestroyers')}
            </sl-button>
          </div>
        </div>

        <div id="content">
          ${userEntry
            ? html`
                <div id="current-user-card">
                  <div id="current-user-header">
                    <div id="current-user-avatar"><svg-icon name="dogFaceSvg"></svg-icon></div>
                    <div id="current-user-info">
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
                    <svg-icon name="dogFaceSvg"></svg-icon>
                  </div>

                  <div class="player-info">
                    <div class="dog-name">${entry.dogName}</div>
                  </div>

                  <div class="score">
                    <div class="score-value">${this.getScoreValue(entry)}</div>
                    <div class="score-label">${this.getScoreLabel(this.selectedCategory)}</div>
                  </div>
                </div>
              `;
            })}

            <div id="stats-footer">
              ${ti('leaderboardFooter', { total: leaderboard.totalPlayers.toLocaleString(), date: new Date(leaderboard.lastUpdated).toLocaleDateString() })}
              
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
