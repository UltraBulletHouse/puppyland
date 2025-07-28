import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/components/select/select.js';
import '@shoelace-style/shoelace/dist/components/option/option.js';
import '@shoelace-style/shoelace/dist/components/badge/badge.js';

import { sharedStyles } from '../../styles/shared-styles';
import { 
  LeaderboardEntry, 
  LeaderboardCategory, 
  LeaderboardData, 
  BadgeType 
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
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
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
        background: rgba(255,255,255,0.2);
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
        background: rgba(255,255,255,0.2);
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
      
      .rank.rank-1 { color: #FFD700; }
      .rank.rank-2 { color: #C0C0C0; }
      .rank.rank-3 { color: #CD7F32; }
      
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
        background: linear-gradient(135deg, #FFD700, #FFA500);
        color: white;
      }
      
      .badge-top-player {
        background: linear-gradient(135deg, #C0C0C0, #A0A0A0);
        color: white;
      }
      
      .badge-rising-star {
        background: linear-gradient(135deg, #FF6B6B, #FF5252);
        color: white;
      }
      
      .badge-veteran {
        background: linear-gradient(135deg, #9B59B6, #8E44AD);
        color: white;
      }
      
      .badge-newcomer {
        background: linear-gradient(135deg, #4ECDC4, #44A08D);
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
    `,
  ];

  @state()
  selectedCategory: LeaderboardCategory = LeaderboardCategory.LEVEL;

  @state()
  leaderboards: LeaderboardData[] = [
    {
      category: LeaderboardCategory.LEVEL,
      title: 'Top Levels',
      description: 'Highest level players',
      icon: 'star',
      lastUpdated: new Date().toISOString(),
      currentUserRank: 15,
      totalPlayers: 1247,
      entries: [
        {
          id: '1',
          userId: 'user1',
          userName: 'DragonMaster',
          dogName: 'Thunder',
          score: 89,
          rank: 1,
          level: 89,
          badge: { type: BadgeType.CHAMPION, label: 'Champion', color: '#FFD700' }
        },
        {
          id: '2',
          userId: 'user2',
          userName: 'PuppyLover99',
          dogName: 'Bella',
          score: 87,
          rank: 2,
          level: 87,
          badge: { type: BadgeType.TOP_PLAYER, label: 'Elite', color: '#C0C0C0' }
        },
        {
          id: '3',
          userId: 'user3',
          userName: 'WolfPack',
          dogName: 'Shadow',
          score: 85,
          rank: 3,
          level: 85,
          badge: { type: BadgeType.TOP_PLAYER, label: 'Elite', color: '#CD7F32' }
        },
        {
          id: '4',
          userId: 'user4',
          userName: 'GoldenRetriever',
          dogName: 'Max',
          score: 82,
          rank: 4,
          level: 82
        },
        {
          id: '5',
          userId: 'user5',
          userName: 'HuskyHero',
          dogName: 'Luna',
          score: 79,
          rank: 5,
          level: 79,
          badge: { type: BadgeType.RISING_STAR, label: 'Rising', color: '#FF6B6B' }
        },
        {
          id: '6',
          userId: 'user6',
          userName: 'BeagleBuddy',
          dogName: 'Charlie',
          score: 76,
          rank: 6,
          level: 76
        },
        {
          id: '7',
          userId: 'user7',
          userName: 'LabLegend',
          dogName: 'Daisy',
          score: 73,
          rank: 7,
          level: 73,
          badge: { type: BadgeType.VETERAN, label: 'Veteran', color: '#9B59B6' }
        },
        {
          id: '8',
          userId: 'user8',
          userName: 'PitBullPower',
          dogName: 'Tank',
          score: 70,
          rank: 8,
          level: 70
        },
        {
          id: '9',
          userId: 'user9',
          userName: 'BorderCollieBrain',
          dogName: 'Smart',
          score: 68,
          rank: 9,
          level: 68
        },
        {
          id: '10',
          userId: 'user10',
          userName: 'GermanShepherd',
          dogName: 'Rex',
          score: 65,
          rank: 10,
          level: 65
        },
        {
          id: '11',
          userId: 'user11',
          userName: 'PoodlePerfection',
          dogName: 'Fluffy',
          score: 62,
          rank: 11,
          level: 62
        },
        {
          id: '12',
          userId: 'user12',
          userName: 'ChihuahuaChamp',
          dogName: 'Tiny',
          score: 58,
          rank: 12,
          level: 58
        },
        {
          id: '13',
          userId: 'user13',
          userName: 'BullDogBoss',
          dogName: 'Bruiser',
          score: 55,
          rank: 13,
          level: 55
        },
        {
          id: '14',
          userId: 'user14',
          userName: 'DachshundDash',
          dogName: 'Sausage',
          score: 52,
          rank: 14,
          level: 52
        },
        {
          id: '15',
          userId: 'current',
          userName: 'You',
          dogName: 'Buddy',
          score: 45,
          rank: 15,
          level: 45,
          isCurrentUser: true
        },
        {
          id: '16',
          userId: 'user16',
          userName: 'BoxerBuddy',
          dogName: 'Rocky',
          score: 42,
          rank: 16,
          level: 42
        },
        {
          id: '17',
          userId: 'user17',
          userName: 'SpanielStar',
          dogName: 'Spot',
          score: 38,
          rank: 17,
          level: 38
        },
        {
          id: '18',
          userId: 'user18',
          userName: 'TerrierTough',
          dogName: 'Scrappy',
          score: 35,
          rank: 18,
          level: 35
        }
      ]
    },
    {
      category: LeaderboardCategory.DOGHOUSES_BUILT,
      title: 'Master Builders',
      description: 'Most doghouses built',
      icon: 'hammer',
      lastUpdated: new Date().toISOString(),
      currentUserRank: 23,
      totalPlayers: 1247,
      entries: [
        {
          id: '1',
          userId: 'user1',
          userName: 'ArchitectAce',
          dogName: 'Builder',
          score: 342,
          rank: 1,
          badge: { type: BadgeType.CHAMPION, label: 'Master Builder', color: '#FFD700' }
        },
        {
          id: '2',
          userId: 'user2',
          userName: 'ConstructionKing',
          dogName: 'Hammer',
          score: 298,
          rank: 2,
          badge: { type: BadgeType.TOP_PLAYER, label: 'Elite Builder', color: '#C0C0C0' }
        },
        {
          id: '3',
          userId: 'user3',
          userName: 'HouseHunter',
          dogName: 'Brick',
          score: 276,
          rank: 3,
          badge: { type: BadgeType.TOP_PLAYER, label: 'Pro Builder', color: '#CD7F32' }
        }
      ]
    },
    {
      category: LeaderboardCategory.DOGHOUSES_DESTROYED,
      title: 'Top Destroyers',
      description: 'Most doghouses destroyed',
      icon: 'lightning-charge',
      lastUpdated: new Date().toISOString(),
      currentUserRank: 8,
      totalPlayers: 1247,
      entries: [
        {
          id: '1',
          userId: 'user1',
          userName: 'DestroyerDan',
          dogName: 'Chaos',
          score: 1247,
          rank: 1,
          badge: { type: BadgeType.CHAMPION, label: 'Destroyer', color: '#E74C3C' }
        },
        {
          id: '2',
          userId: 'user2',
          userName: 'BattleBeast',
          dogName: 'Fury',
          score: 1156,
          rank: 2,
          badge: { type: BadgeType.TOP_PLAYER, label: 'Warrior', color: '#C0C0C0' }
        },
        {
          id: '3',
          userId: 'user3',
          userName: 'StormBreaker',
          dogName: 'Lightning',
          score: 1089,
          rank: 3,
          badge: { type: BadgeType.TOP_PLAYER, label: 'Fighter', color: '#CD7F32' }
        },
        {
          id: '4',
          userId: 'current',
          userName: 'You',
          dogName: 'Buddy',
          score: 234,
          rank: 8,
          isCurrentUser: true
        }
      ]
    },
    {
      category: LeaderboardCategory.EXPERIENCE,
      title: 'Experience Masters',
      description: 'Most experience points earned',
      icon: 'mortarboard',
      lastUpdated: new Date().toISOString(),
      currentUserRank: 42,
      totalPlayers: 1247,
      entries: [
        {
          id: '1',
          userId: 'user1',
          userName: 'XPHunter',
          dogName: 'Sage',
          score: 2847650,
          rank: 1,
          badge: { type: BadgeType.CHAMPION, label: 'Master', color: '#9B59B6' }
        },
        {
          id: '2',
          userId: 'user2',
          userName: 'WisdomSeeker',
          dogName: 'Scholar',
          score: 2634890,
          rank: 2,
          badge: { type: BadgeType.TOP_PLAYER, label: 'Expert', color: '#C0C0C0' }
        },
        {
          id: '3',
          userId: 'user3',
          userName: 'KnowledgeKing',
          dogName: 'Einstein',
          score: 2456780,
          rank: 3,
          badge: { type: BadgeType.VETERAN, label: 'Veteran', color: '#CD7F32' }
        },
        {
          id: '4',
          userId: 'current',
          userName: 'You',
          dogName: 'Buddy',
          score: 156780,
          rank: 42,
          isCurrentUser: true
        }
      ]
    },
    {
      category: LeaderboardCategory.WEEKLY_ACTIVITY,
      title: 'Weekly Champions',
      description: 'Most active players this week',
      icon: 'calendar-week',
      lastUpdated: new Date().toISOString(),
      currentUserRank: 12,
      totalPlayers: 1247,
      entries: [
        {
          id: '1',
          userId: 'user1',
          userName: 'AlwaysActive',
          dogName: 'Energizer',
          score: 2847,
          rank: 1,
          badge: { type: BadgeType.RISING_STAR, label: 'Hot Streak', color: '#FF6B6B' }
        },
        {
          id: '2',
          userId: 'user2',
          userName: 'DailyGrinder',
          dogName: 'Hustle',
          score: 2634,
          rank: 2,
          badge: { type: BadgeType.RISING_STAR, label: 'On Fire', color: '#FFA500' }
        },
        {
          id: '3',
          userId: 'user3',
          userName: 'WeekendWarrior',
          dogName: 'Sprint',
          score: 2456,
          rank: 3,
          badge: { type: BadgeType.NEWCOMER, label: 'Climber', color: '#4ECDC4' }
        },
        {
          id: '4',
          userId: 'current',
          userName: 'You',
          dogName: 'Buddy',
          score: 1567,
          rank: 12,
          isCurrentUser: true
        }
      ]
    }
  ];

  @state()
  currentUser = {
    userId: 'current',
    userName: 'You',
    dogName: 'Buddy'
  };

  get currentLeaderboard(): LeaderboardData | undefined {
    return this.leaderboards.find(lb => lb.category === this.selectedCategory);
  }

  get currentUserEntry(): LeaderboardEntry | undefined {
    return this.currentLeaderboard?.entries.find(entry => entry.isCurrentUser);
  }

  handleCategoryChange(event: CustomEvent) {
    const newCategory = event.target.value as LeaderboardCategory;
    if (newCategory && newCategory !== this.selectedCategory) {
      this.selectedCategory = newCategory;
      this.requestUpdate();
    }
  }

  getCategoryLabel(category: LeaderboardCategory): string {
    switch (category) {
      case LeaderboardCategory.LEVEL: return 'Top Levels';
      case LeaderboardCategory.EXPERIENCE: return 'Most Experience';
      case LeaderboardCategory.DOGHOUSES_BUILT: return 'Master Builders';
      case LeaderboardCategory.DOGHOUSES_DESTROYED: return 'Top Destroyers';
      case LeaderboardCategory.WEEKLY_ACTIVITY: return 'Weekly Champions';
      default: return 'Leaderboard';
    }
  }

  getScoreLabel(category: LeaderboardCategory): string {
    switch (category) {
      case LeaderboardCategory.LEVEL: return 'Level';
      case LeaderboardCategory.EXPERIENCE: return 'XP';
      case LeaderboardCategory.DOGHOUSES_BUILT: return 'Built';
      case LeaderboardCategory.DOGHOUSES_DESTROYED: return 'Destroyed';
      case LeaderboardCategory.WEEKLY_ACTIVITY: return 'Points';
      default: return 'Score';
    }
  }

  formatScore(score: number, category: LeaderboardCategory): string {
    if (category === LeaderboardCategory.EXPERIENCE) {
      return score >= 1000 ? `${(score / 1000).toFixed(1)}k` : score.toString();
    }
    return score.toString();
  }

  getRankIcon(rank: number): string {
    switch (rank) {
      case 1: return '👑';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '';
    }
  }

  render() {
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
            value=${this.selectedCategory}
            @sl-change=${this.handleCategoryChange}
            size="small"
            hoist
          >
            <sl-option value=${LeaderboardCategory.LEVEL}>
              <sl-icon name="star" slot="prefix"></sl-icon>
              Top Levels
            </sl-option>
            <sl-option value=${LeaderboardCategory.DOGHOUSES_BUILT}>
              <sl-icon name="hammer" slot="prefix"></sl-icon>
              Master Builders
            </sl-option>
            <sl-option value=${LeaderboardCategory.DOGHOUSES_DESTROYED}>
              <sl-icon name="lightning-charge" slot="prefix"></sl-icon>
              Top Destroyers
            </sl-option>
            <sl-option value=${LeaderboardCategory.EXPERIENCE}>
              <sl-icon name="mortarboard" slot="prefix"></sl-icon>
              Experience Masters
            </sl-option>
            <sl-option value=${LeaderboardCategory.WEEKLY_ACTIVITY}>
              <sl-icon name="calendar-week" slot="prefix"></sl-icon>
              Weekly Champions
            </sl-option>
          </sl-select>
        </div>

        <div id="content">
          ${userEntry ? html`
            <div id="current-user-card">
              <div id="current-user-header">
                <div id="current-user-avatar">🐕</div>
                <div id="current-user-info">
                  <div id="current-user-name">${this.currentUser.userName}</div>
                  <div id="current-user-dog">${this.currentUser.dogName}</div>
                </div>
                <div id="current-user-rank">
                  #${userEntry.rank}
                </div>
              </div>
            </div>
          ` : ''}

          <div id="leaderboard-list">
            ${leaderboard.entries.map(entry => html`
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
                
                ${entry.badge ? html`
                  <div class="player-badge badge-${entry.badge.type}">
                    ${entry.badge.label}
                  </div>
                ` : ''}
                
                <div class="score">
                  <div class="score-value">
                    ${this.formatScore(entry.score, this.selectedCategory)}
                  </div>
                  <div class="score-label">
                    ${this.getScoreLabel(this.selectedCategory)}
                  </div>
                </div>
              </div>
            `)}
          </div>

          <div id="stats-footer">
            ${leaderboard.totalPlayers.toLocaleString()} total players • Updated ${new Date(leaderboard.lastUpdated).toLocaleDateString()}
          </div>
        </div>
      </div>
    `;
  }
}