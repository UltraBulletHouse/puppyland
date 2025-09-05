import { consume } from '@lit/context';
import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/components/badge/badge.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/drawer/drawer.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/popup/popup.js';
import '@shoelace-style/shoelace/dist/components/range/range.js';
import '@shoelace-style/shoelace/dist/components/tab-group/tab-group.js';
import '@shoelace-style/shoelace/dist/components/tab-panel/tab-panel.js';
import '@shoelace-style/shoelace/dist/components/tab/tab.js';
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js';

import '../components/app-spinner/app-spinner';
import '../components/daily-quests/daily-quests';
import '../components/icon-png/icon-png';
import '../components/leaderboards/leaderboards';
import {
  API_DOG_GET,
  API_DOG_UPDATE,
  API_SUBSCRIPTION_REFRESH,
  API_USER_INFO,
} from '../constants/apiConstants';
import { dogInfoContext, updateDogInfoEvent } from '../contexts/dogInfoContext';
import { accessTokenContext } from '../contexts/userFirebaseContext';
import { userInfoContext } from '../contexts/userInfoContext';
import { sharedStyles } from '../styles/shared-styles';
import { DogDerivedStats, DogInfo, DogInfoResponse, DogInfoUpdateResponse } from '../types/dog';
import { apiCall } from '../utils/apiUtils';
import { t, ti } from '../i18n';

@customElement('app-dog-view')
export class AppDogView extends LitElement {
  static styles = [
    sharedStyles,
    css`
      #container {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
        background: var(--app-bg);
        position: relative;
      }
      #manage-subscription {
        position: absolute;
        top: 12px;
        right: 12px;
        z-index: 10;
      }
      #dog-header {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 16px 12px;
        background: var(--header-bg);
        border-bottom: 1px solid var(--header-border);
      }
      #top-right-row {
        position: absolute;
        top: 12px;
        right: 12px;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        z-index: 10;
      }
      #top-left-row {
        position: absolute;
        top: 12px;
        left: 12px;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        z-index: 10;
      }
      #premium-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: color-mix(in srgb, var(--color-surface) 85%, transparent);
        padding: 6px 10px;
        border-radius: 999px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
        backdrop-filter: blur(4px);
      }
      #treats-balance {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-weight: 800;
        padding: 6px 12px;
        border-radius: 999px;
        background: linear-gradient(
          180deg,
          var(--gold),
          color-mix(in srgb, var(--gold) 70%, var(--primary) 30%)
        );
        color: #3a2a00;
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
        cursor: pointer;
      }
      #treats-balance sl-icon::part(base) {
        color: #8a5b13;
        background: color-mix(in srgb, var(--gold-100) 80%, #fff 20%);
        border-radius: 999px;
        padding: 4px;
      }
      #dog-image {
        margin-bottom: 12px;
      }
      #dog-image-circle {
        font-size: 70px;
        height: 100px;
        width: 100px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: var(--border-radius-circle);
        background: linear-gradient(135deg, var(--lime), var(--primary));
        border: 2px solid color-mix(in srgb, var(--lime) 60%, #fff);
        outline: 2px solid var(--color-primary-medium);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      #dog-name {
        display: flex;
        align-items: center;
        font-size: 20px;
        font-weight: 600;
        color: var(--color-black);
      }
      #dog-name sl-input {
        width: 290px;
      }
      #dog-name sl-icon {
        margin-left: 10px;
      }
      #content-tabs {
        flex: 1;
        overflow: hidden;
      }

      /* Center the tabs wrapper and limit width like shop */
      #tabs-container {
        display: flex;
        justify-content: center;
        margin-top: 8px;
      }
      .dog-tabs {
        width: 100%;
        max-width: 560px;
      }
      .dog-tabs::part(nav) {
        justify-content: center;
        flex-wrap: wrap;
        white-space: normal;
        gap: 4px;
        width: fit-content;
        margin-left: auto;
        margin-right: auto;
        padding: 4px;
        background: color-mix(in srgb, var(--primary) 8%, #fff);
        border-radius: 999px;
        border: none;
        box-shadow: none;
      }
      /* Hide Shoelace's sliding active tab indicator */
      .dog-tabs::part(active-tab-indicator),
      .dog-tabs::part(indicator) {
        display: none;
      }
      .dog-tabs::part(nav) {
        --track-width: 0;
      }
      .dog-tabs::part(base) {
        border-radius: var(--border-radius-medium);
        border: none;
        box-shadow: none;
      }
      sl-tab-group {
        height: 100%;
      }
      sl-tab-group::part(nav) {
        padding: 8px;
        border: none;
        box-shadow: none;
      }
      sl-tab-panel {
        overflow-y: auto;
        padding: 0;
        height: calc(100vh - 270px);
      }
      sl-tab::part(base) {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        font-size: 16px;
        border-radius: 999px;
        color: var(--text-2);
      }
      sl-tab[active]::part(base) {
        background: var(--primary);
        color: #fff;
      }

      @media (max-width: 400px) {
        sl-tab::part(base) {
          padding: 6px 8px;
          font-size: 14px;
        }

        .dog-tabs sl-tab sl-icon {
          font-size: 16px;
        }
      }

      .dog-tabs sl-tab sl-icon {
        font-size: 18px;
      }

      #stats-content {
        padding: 16px;
        padding-top: 0;
      }
      #info-container {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
      }

      @media (max-width: 400px) {
        #info-container {
          grid-template-columns: repeat(1, 1fr);
        }
      }

      .stat-card {
        background: var(--color-surface-strong);
        border: 1px solid var(--color-surface-border);
        border-radius: var(--border-radius-medium);
        padding: 16px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        transition: all 0.2s ease;
      }

      .stat-card:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        transform: translateY(-1px);
      }

      .stat-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
      }

      .stat-icon {
        font-size: 14px;
        padding: 2px;
        border-radius: var(--border-radius-circle);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border: 2px solid var(--primary);
        color: var(--primary);
        background: #fff;
      }
      .stat-icon.energy {
        border-color: var(--coral);
        color: var(--coral);
      }
      .stat-icon.doghouses {
        border-color: var(--wood);
        color: var(--wood);
      }

      .stat-title {
        font-weight: 700;
        font-size: 18px;
        color: var(--color-black);
        flex: 1;
      }

      .stat-value {
        font-weight: 700;
        font-size: 18px;
        color: var(--color-primary);
      }

      .stat-progress {
        margin-top: 8px;
      }

      .progress-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
        font-size: 12px;
      }

      .progress-current {
        color: var(--color-black-medium);
        font-weight: 500;
      }

      .progress-percentage {
        color: var(--color-primary);
        font-weight: 600;
      }

      .modern-progress-bar {
        width: 100%;
        height: 12px;
        background: #ddeee6;
        border-radius: 999px;
        overflow: hidden;
        position: relative;
      }

      .progress-fill {
        height: 100%;
        border-radius: 999px;
        transition: width 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        position: relative;
        overflow: hidden;
      }

      .progress-fill.experience {
        background: linear-gradient(90deg, var(--primary), var(--lime));
      }

      .progress-fill.energy {
        background: linear-gradient(90deg, var(--coral), color-mix(in srgb, var(--coral) 85%, #000));
      }

      .level-badge {
        background: linear-gradient(
          135deg,
          var(--lime),
          color-mix(in srgb, var(--primary) 40%, var(--lime))
        );
        color: #0b2a20;
        padding: 4px 12px;
        border-radius: var(--border-radius-circle);
        font-weight: 800;
        font-size: 14px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .doghouses-count {
        width: 28px;
        height: 28px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: var(--gold-100);
        color: #5a4200;
        border: 2px solid var(--gold);
        border-radius: 999px;
        font-weight: 900;
        font-size: 12px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      #pencil-wrapper {
        position: relative;
      }
      #pencil-wrapper sl-icon {
        cursor: pointer;
        position: relative;
        z-index: 2;
      }
      #names-counter {
        position: absolute;
        top: -3px;
        right: -18px;
        font-size: 12px;
        background: var(--color-primary-medium);
        border-radius: 50px;
        padding: 0px 5px;
        pointer-events: none; /* allow clicks to pass through to the pencil icon */
        z-index: 999;
      }
      #dog-buffs {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        margin-top: 20px;
        padding: 30px;
      }
      .buffs-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 10px;
        margin-top: 12px;
      }
      .buff-item-tile {
        display: flex;
        align-items: center;
        padding: 12px;
        border-radius: var(--border-radius-medium);
        background: var(--color-surface-strong);
        border: 1px solid var(--color-surface-border);
        transition: background-color 0.2s ease;
      }
      .buff-item-tile:hover {
        background: var(--color-primary-light);
      }
      .buff-icon {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--border-radius-circle);
        background: color-mix(in srgb, var(--primary) 14%, #fff);
        outline: 2px solid color-mix(in srgb, var(--primary) 35%, transparent);
        margin-right: 12px;
        flex-shrink: 0;
      }
      .buff-details {
        flex: 1;
        min-width: 0;
      }
      .buff-item-tile .buff-name {
        font-size: 14px;
        font-weight: 600;
        color: var(--color-black);
      }
      icon-png-badge {
        --icon-png-badge-width: 32px;
        --icon-png-badge-height: 32px;
      }

      /* RPG Stats Allocation */
      .attributes-card {
        grid-column: 1 / -1;
        padding: 12px;
      }
      .doghouse-buffs-card {
        grid-column: 1 / -1;
      }
      .stat-chips {
        display: flex;
        gap: 8px;
        margin-bottom: 8px;
        flex-wrap: wrap;
      }
      .chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 8px;
        border-radius: var(--border-radius-circle);
        font-size: 12px;
        font-weight: 700;
        border: 1px solid var(--color-primary-medium);
        background: var(--color-primary-light);
        color: var(--color-black);
      }
      .chip.points {
        border-color: var(--accent);
        background: color-mix(in srgb, var(--accent) 22%, #fff);
      }
      .chip.muted {
        opacity: 0.8;
      }
      .alloc-grid {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .alloc-card {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        border-radius: 16px;
        background: var(--color-surface-strong);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
      }
      /* Unify allocation cards to the same neutral surface */
      .alloc-card.power,
      .alloc-card.stamina,
      .alloc-card.reach,
      .alloc-card.fortification {
        background: var(--color-surface-strong);
      }
      .alloc-card .title-row {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
      }
      .alloc-card .bottom-row {
        display: flex;
        align-items: center;
      }
      .alloc-card .stat-icon {
        font-size: 14px;
        width: 28px;
        height: 28px;
        padding: 2px;
        border-radius: 999px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 2px solid var(--primary);
        color: var(--primary);
        background: #fff;
      }
      /* Unify icon accents as primary */
      .alloc-card.power .stat-icon,
      .alloc-card.stamina .stat-icon,
      .alloc-card.reach .stat-icon,
      .alloc-card.fortification .stat-icon {
        border-color: var(--primary);
        color: var(--primary);
      }
      .alloc-card .title {
        font-weight: 700;
        color: var(--color-black);
        white-space: nowrap;
      }
      .alloc-card .desc {
        display: none;
      }
      @media (min-width: 420px) {
        .alloc-card .desc {
          display: block;
          grid-column: 2 / span 2;
          font-size: 12px;
          color: var(--color-black-medium);
        }
      }
      .alloc-card .impact {
        font-size: 12px;
        color: var(--color-black-medium);
        font-weight: 600;
      }
      .alloc-card .impact-row {
        display: flex;
        align-items: center;
        column-gap: 8px;
      }
      .alloc-card .help-icon::part(base) {
        color: var(--color-black-medium);
        font-size: 16px;
        padding: 0;
        margin-left: 8px;
        height: auto;
        min-height: 0;
      }
      .mini-progress {
        display: grid;
        gap: 6px;
        margin: 8px 0 12px;
      }
      .mini-progress-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        color: var(--color-black-medium);
      }
      .mini-progress-label {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-weight: 600;
      }
      .mini-progress-value {
        font-weight: 700;
        color: var(--color-primary);
      }
      .modern-progress-bar.mini {
        height: 10px;
      }
      .alloc-card .value {
        justify-self: end;
        font-weight: 900;
        color: #5a4200;
        width: 28px;
        height: 28px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        font-size: 12px;
        background: var(--gold-100);
        border: 2px solid var(--gold);
        border-radius: 999px;
      }
      .alloc-card .alloc-btn.plus.hidden-keep-space::part(base) {
        background: var(--sl-color-gray-300);
        color: var(--sl-color-gray-50);
        border-color: var(--sl-color-gray-400);
        box-shadow: none;
      }
      .alloc-btn-slot {
        position: absolute;
        right: 26px;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        justify-content: flex-end;
      }
      .alloc-card {
        border: none !important;
        position: relative;
      }
      .alloc-card.alloc-card--floating .alloc-btn-slot {
        position: absolute;
        right: 26px;
        top: 50%;
        transform: translateY(-50%);
      }
      .alloc-card .alloc-btn.plus::part(base) {
        padding: 0;
        width: 28px;
        height: 28px;
        min-height: 28px;
        border-radius: 999px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(
          180deg,
          var(--color-primary),
          color-mix(in srgb, var(--color-primary) 85%, #000 15%)
        );
        color: white;
        border: none;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        transition:
          background 0.15s ease,
          transform 0.05s ease,
          box-shadow 0.15s ease;
        line-height: 1;
      }
      .alloc-card .alloc-btn.plus:hover::part(base) {
        background: color-mix(in srgb, var(--color-primary) 85%, #fff 15%);
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.18);
      }
      .alloc-card .alloc-btn.plus:active::part(base) {
        transform: translateY(1px);
      }
      .alloc-card .alloc-btn.plus::part(prefix),
      .alloc-card .alloc-btn.plus::part(suffix) {
        display: none;
      }
      .alloc-card .alloc-btn.plus::part(label) {
        line-height: 1;
        font-size: 16px;
        font-weight: 800;
      }
      .points-panel {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 10px 12px;
        border-radius: var(--border-radius-medium);
        border: 1px solid var(--border);
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.9), #fff);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
        margin: 8px 0 12px;
      }
      .points-panel.active {
        border-color: color-mix(in srgb, var(--accent) 55%, #fff);
        background: linear-gradient(180deg, color-mix(in srgb, var(--accent) 18%, #fff), #fff);
      }
      .points-panel.done {
        border-color: color-mix(in srgb, var(--sl-color-success-600) 40%, #fff);
        background: linear-gradient(
          180deg,
          color-mix(in srgb, var(--sl-color-success-200) 25%, #fff),
          #fff
        );
      }
      .points-left {
        display: inline-flex;
        align-items: center;
        gap: 10px;
      }
      .points-left sl-icon::part(base) {
        font-size: 18px;
        color: var(--primary);
      }
      .points-panel.done .points-left sl-icon::part(base) {
        color: var(--sl-color-success-600);
      }
      .points-number {
        font-size: 18px;
        font-weight: 800;
        color: var(--primary);
        line-height: 1;
      }
      .points-subtitle {
        font-size: 12px;
        color: var(--color-black-medium);
      }
      .points-actions {
        display: inline-flex;
        gap: 8px;
      }
      .alloc-card .alloc-btn::part(label) {
        line-height: 1;
      }

      /* Attribute Details Drawer styles */
      .details-drawer::part(panel) {
        max-width: 520px;
        margin: 0 auto;

        border-top-left-radius: var(--border-radius-large, 16px);
        border-top-right-radius: var(--border-radius-large, 16px);
        padding: 16px 16px 20px;
      }
      .details-header {
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 800;
        font-size: 16px;
        margin-bottom: 8px;
      }
      .details-header sl-icon::part(base) {
        background: var(--color-primary);
        color: white;
        border-radius: 999px;
        padding: 6px;
        font-size: 16px;
      }
      .details-text {
        color: var(--color-black-medium);
        margin: 0 0 14px;
        line-height: 1.4;
      }
      .details-actions {
        display: flex;
        justify-content: flex-end;
      }
    `,
  ];

  static styles2 = css``;

  static detailsStyles = css`
    .details-drawer::part(panel) {
      border-top-left-radius: var(--border-radius-large, 16px);
      border-top-right-radius: var(--border-radius-large, 16px);
      padding: 16px 16px 20px;
    }
    .details-header {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 800;
      font-size: 16px;
      margin-bottom: 8px;
    }
    .details-header sl-icon::part(base) {
      background: var(--color-primary);
      color: white;
      border-radius: 999px;
      padding: 6px;
      font-size: 16px;
    }
    .details-text {
      color: var(--color-black-medium);
      margin: 0 0 14px;
      line-height: 1.4;
    }
    .details-actions {
      display: flex;
      justify-content: flex-end;
    }
  `;

  @consume({ context: accessTokenContext, subscribe: true })
  @property({ attribute: false })
  accessToken: string | null = null;

  @consume({ context: dogInfoContext, subscribe: true })
  @property({ attribute: false })
  dogInfo: DogInfo | null = null;

  @consume({ context: userInfoContext, subscribe: true })
  @property({ attribute: false })
  userInfo: import('../types/userInfo').UserInfo | null = null;

  @state()
  isEditingName: boolean = false;

  // RPG-like stats and allocation points
  @state()
  statPointsAvailable: number = 0;

  @state()
  stats: { power: number; stamina: number; reach: number; fortification: number } = {
    power: 0,
    stamina: 0,
    reach: 0,
    fortification: 0,
  };

  @state()
  baseStats: { power: number; stamina: number; reach: number; fortification: number } = {
    power: 0,
    stamina: 0,
    reach: 0,
    fortification: 0,
  };

  allocateStat(stat: 'power' | 'stamina' | 'reach' | 'fortification') {
    if (this.statPointsAvailable <= 0) return;
    this.stats = { ...this.stats, [stat]: this.stats[stat] + 1 } as typeof this.stats;
    this.statPointsAvailable = this.statPointsAvailable - 1;
  }

  deallocateStat(stat: 'power' | 'stamina' | 'reach' | 'fortification') {
    if (this.stats[stat] <= this.baseStats[stat]) return; // can't go below base
    this.stats = { ...this.stats, [stat]: this.stats[stat] - 1 } as typeof this.stats;
    this.statPointsAvailable = this.statPointsAvailable + 1;
  }

  async saveAttributes() {
    if (!this.accessToken || !this.dogInfo) return;
    const deltas = {
      power: this.stats.power - this.baseStats.power,
      stamina: this.stats.stamina - this.baseStats.stamina,
      reach: this.stats.reach - this.baseStats.reach,
      fortification: this.stats.fortification - this.baseStats.fortification,
    };
    const spent = deltas.power + deltas.stamina + deltas.reach + deltas.fortification;
    if (spent <= 0) return;

    const { API_DOG_ALLOCATE_ATTRS } = await import('../constants/apiConstants');
    const { apiCall } = await import('../utils/apiUtils');

    const resp = await apiCall(this.accessToken).patch<{ dog: DogInfo }>(API_DOG_ALLOCATE_ATTRS, {
      dogId: this.dogInfo.id,
      ...deltas,
    });

    // Update dog in context and reset baseline
    const updated = resp.data?.dog;
    if (updated) {
      this.baseStats = { ...this.stats };
      updateDogInfoEvent(this, updated);
      // Optimistic derived update to avoid UI drop while waiting for refresh
      const cur = this.derived ?? {
        attackMin: 5,
        attackMax: 9,
        energyMax: 100,
        reachMeters: 200,
        doghouseMaxHp: 100,
      };
      this.derived = {
        attackMin: cur.attackMin + deltas.power,
        attackMax: cur.attackMax + deltas.power,
        energyMax: cur.energyMax + 10 * deltas.stamina,
        reachMeters: cur.reachMeters + 10 * deltas.reach,
        doghouseMaxHp: cur.doghouseMaxHp + 20 * deltas.fortification,
      };
    }

    // Refresh from backend to get accurate derived stats and any server-side adjustments
    try {
      const refreshed = await apiCall(this.accessToken).get<DogInfoResponse>(API_DOG_GET);
      const { dog: freshDog, derived: freshDerived } = refreshed.data;
      if (freshDog) {
        updateDogInfoEvent(this, freshDog);
        const attrs = (freshDog as any).attributes as
          | {
              power: number;
              stamina: number;
              reach: number;
              fortification: number;
            }
          | undefined;
        if (attrs) {
          this.baseStats = { ...attrs };
          this.stats = { ...attrs };
        }
        this.statPointsAvailable = (freshDog as any).skillPointsAvailable ?? 0;
      }
      this.derived = freshDerived ?? this.derived;
    } catch {}
  }

  resetAllocation = () => {
    const spent =
      this.stats.power -
      this.baseStats.power +
      (this.stats.stamina - this.baseStats.stamina) +
      (this.stats.reach - this.baseStats.reach) +
      (this.stats.fortification - this.baseStats.fortification);
    if (spent <= 0) return;
    // Revert to last saved baseline and return the unsaved points to the pool
    this.stats = { ...this.baseStats };
    this.statPointsAvailable += spent;
  };

  manageSubscription() {
    // Open Google Play subscription management deep link
    const pkg = 'app.netlify.astounding_naiad_fc1ffa.twa'; // same as PACKAGE_NAME in shop view
    // Universal link for subscription center
    const url = `https://play.google.com/store/account/subscriptions?sku=premium&package=${pkg}`;
    window.open(url, '_blank');
  }

  @state()
  newName: string | null = null;

  @state()
  isNameSaveDisabled: boolean = false;

  @state()
  activeTab: string = 'stats'; // Default active tab

  // Attribute details drawer state
  @state()
  detailsOpen: boolean = false;
  @state()
  detailsTitle: string = '';
  @state()
  detailsText: string = '';
  @state()
  detailsIcon: string = 'info-circle';

  // Derived stats from backend for display
  @state()
  derived: DogDerivedStats | null = null;

  openAttributeDetails(kind: 'power' | 'stamina' | 'reach' | 'fortification') {
    // Compute current impact values from assigned points (relative to baseline)
    const powerDelta = this.stats.power - this.baseStats.power;
    const staminaDelta = this.stats.stamina - this.baseStats.stamina;
    const reachDelta = this.stats.reach - this.baseStats.reach;
    const fortDelta = this.stats.fortification - this.baseStats.fortification;

    // Base from backend-derived stats to reflect current state accurately
    const baseMin = this.derived?.attackMin ?? 5;
    const baseMax = this.derived?.attackMax ?? 9;
    const baseEnergyMax = this.derived?.energyMax ?? 100;
    const baseRange = this.derived?.reachMeters ?? 200;
    const baseDoghouseHp = this.derived?.doghouseMaxHp ?? 100;

    const dmgMin = baseMin + powerDelta;
    const dmgMax = baseMax + powerDelta;
    const maxEnergy = baseEnergyMax + 10 * staminaDelta;
    const rangeM = baseRange + 10 * reachDelta;
    const doghouseHp = baseDoghouseHp + 20 * fortDelta;

    let title = '';
    let text = '';
    let icon = '';

    switch (kind) {
      case 'power':
        title = t('power');
        icon = 'fire';
        text = ti('powerDesc', { min: dmgMin, max: dmgMax });
        break;
      case 'stamina':
        title = t('stamina');
        icon = 'heart-pulse';
        text = ti('staminaDesc', { n: maxEnergy });
        break;
      case 'reach':
        title = t('reach');
        icon = 'radar';
        text = ti('reachDesc', { n: rangeM });
        break;
      case 'fortification':
        title = t('fortification');
        icon = 'shield-shaded';
        text = ti('fortificationDesc', { n: doghouseHp });
        break;
    }

    this.detailsTitle = title;
    this.detailsText = text;
    this.detailsIcon = icon;
    this.detailsOpen = true;
  }

  onCloseAttributeDetails() {
    this.detailsOpen = false;
  }

  handleTabShow(event: CustomEvent) {
    this.activeTab = event.detail.name;
  }

  editName() {
    const isPremium = this.userInfo?.isPremium === true;
    if (!isPremium && (this.dogInfo?.nameChangesCounter ?? 0) === 0) return;

    this.isEditingName = true;
  }

  async saveNewName() {
    if (!this.accessToken) return;
    console.log('this.isNameSaveDisabled', this.isNameSaveDisabled);
    if (this.isNameSaveDisabled) return;
    this.isNameSaveDisabled = true;
    setTimeout(() => {
      this.isNameSaveDisabled = false;
    }, 10000);

    const dogInfoResponse = await apiCall(this.accessToken).patch<DogInfoUpdateResponse>(
      API_DOG_UPDATE,
      {
        dogId: this.dogInfo?.id,
        name: this.newName,
      }
    );

    updateDogInfoEvent(this, dogInfoResponse.data.dog);

    this.newName = dogInfoResponse.data.dog.name;
    this.isEditingName = false;
  }

  onChangeName(event: Event) {
    const newName = (event.target as HTMLInputElement)?.value;
    this.newName = newName;
  }

  onCloseEditing() {
    this.isEditingName = false;
  }

  async firstUpdated() {
    if (!this.accessToken) return;

    // Trigger subscription refresh in the background (non-blocking)
    (async () => {
      try {
        await apiCall(this.accessToken!).post(API_SUBSCRIPTION_REFRESH, {});
        // Optionally refresh user info after successful refresh
        const userInfoResp = await apiCall(this.accessToken!).get<{
          user: import('../types/userInfo').UserInfo;
        }>(API_USER_INFO);
        const user = userInfoResp.data?.user;
        if (user) {
          const { updateUserInfoEvent } = await import('../contexts/userInfoContext');
          updateUserInfoEvent(this, user);
        }
      } catch {}
    })();

    // Proceed without waiting for refresh
    const dogInfoResponse = await apiCall(this.accessToken).get<DogInfoResponse>(API_DOG_GET);
    const { dog, derived } = dogInfoResponse.data;
    this.derived = derived ?? null;
    if (dog) {
      this.newName = dog.name;
      updateDogInfoEvent(this, dog);
      // Initialize UI allocation stats from backend dog attributes if present
      const attrs = (dog as any).attributes as
        | { power: number; stamina: number; reach: number; fortification: number }
        | undefined;
      if (attrs) {
        this.baseStats = { ...attrs };
        this.stats = { ...attrs };
      }
      // If backend exposes skillPointsAvailable on dog, use it; else 0
      this.statPointsAvailable = (dog as any).skillPointsAvailable ?? 0;
    }
  }

  render() {
    const {
      name,
      availableDoghouses,
      experience,
      expForNextLevel,
      level,
      energy,
      energyMax,
      nameChangesCounter,
    } =
      this.dogInfo ??
      ({
        id: '',
        userId: '',
        name: '-----------',
        nameChangesCounter: 0,
        availableDoghouses: 0,
        energy: 0,
        energyMax: 0,
        experience: 0,
        expForNextLevel: 0,
        level: 0,
        buffsForDoghouses: null,
        buffsForDog: null,
        photo: null,
      } as DogInfo);

    const spentPoints =
      this.stats.power -
      this.baseStats.power +
      (this.stats.stamina - this.baseStats.stamina) +
      (this.stats.reach - this.baseStats.reach) +
      (this.stats.fortification - this.baseStats.fortification);
    const hasPending = spentPoints > 0;

    // Live preview of derived stats based on local allocation deltas
    const powerDelta = this.stats.power - this.baseStats.power;
    const staminaDelta = this.stats.stamina - this.baseStats.stamina;
    const reachDelta = this.stats.reach - this.baseStats.reach;
    const fortDelta = this.stats.fortification - this.baseStats.fortification;

    const atkMinPreview = (this.derived?.attackMin ?? 5) + powerDelta;
    const atkMaxPreview = (this.derived?.attackMax ?? 9) + powerDelta;
    const energyMaxPreview = (this.derived?.energyMax ?? 100) + 10 * staminaDelta;
    const reachPreview = (this.derived?.reachMeters ?? 200) + 10 * reachDelta;
    const doghouseHpPreview = (this.derived?.doghouseMaxHp ?? 100) + 20 * fortDelta;

    return this.dogInfo && this.newName
      ? html`
          <div id="container">
            <div id="dog-header">
              <div id="top-left-row">
                ${this.userInfo?.isPremium
                  ? html`<div id="premium-pill">
                      <sl-badge
                        variant="success"
                        pill
                        title=${this.userInfo?.premiumExpiryUtc
                          ? ti('premiumExpires', { date: new Date(this.userInfo.premiumExpiryUtc).toLocaleString() })
                          : ''}
                        >${t('premiumBadge')}</sl-badge
                      >
                      <sl-tooltip content="${t('manageSubscription')}">
                        <sl-icon-button
                          name="gear"
                          label="${t('manageSubscription')}"
                          @click=${this.manageSubscription}
                        ></sl-icon-button>
                      </sl-tooltip>
                    </div>`
                  : ''}
              </div>

              <div id="top-right-row">
                <div
                  id="treats-balance"
                  @click=${() =>
                    this.dispatchEvent(
                      new CustomEvent('updateView', {
                        detail: 'app-shop-view',
                        bubbles: true,
                        composed: true,
                      })
                    )}
                >
                  <sl-icon name="coin"></sl-icon>
                  <span>${this.userInfo?.treatsBalance ?? 0}</span>
                </div>
              </div>
              <div id="dog-image">
                <div id="dog-image-circle">
                  <svg-icon name="dogFaceSvg"></svg-icon>
                </div>
              </div>
              <div id="dog-name">
                ${this.isEditingName
                  ? html`<sl-input
                      id="input"
                      value=${this.newName ?? name ?? ''}
                      @sl-change=${this.onChangeName}
                      minlength="3"
                      maxlength="15"
                      autofocus
                      required
                      size="small"
                    ></sl-input>`
                  : this.newName ?? ''}
                ${this.isEditingName
                  ? html`<sl-icon name="check-lg" @click=${this.saveNewName}></sl-icon>
                      <sl-icon name="x" @click=${this.onCloseEditing}></sl-icon> `
                  : html`<div id="pencil-wrapper">
                      <sl-icon name="pencil" @click=${this.editName}></sl-icon>
                      ${this.userInfo?.isPremium
                        ? html`<div id="names-counter" title="${t('unlimited')}">∞</div>`
                        : html`<div id="names-counter">${nameChangesCounter}</div>`}
                    </div>`}
              </div>
            </div>

            <div id="content-tabs">
              <div id="tabs-container">
                <sl-tab-group class="dog-tabs" @sl-tab-show=${this.handleTabShow}>
                  <sl-tab slot="nav" panel="stats">
                    <sl-icon name="bar-chart"></sl-icon>
                    ${t('statsTab')}
                  </sl-tab>
                  <sl-tab slot="nav" panel="quests">
                    <sl-icon name="list-task"></sl-icon>
                    ${t('dailyQuestsTab')}
                  </sl-tab>
                  <sl-tab slot="nav" panel="leaderboards">
                    <sl-icon name="trophy"></sl-icon>
                    ${t('leaderboardsTab')}
                  </sl-tab>

                  <sl-tab-panel name="stats">
                    <div id="stats-content">
                      <div id="info-container">
                        <!-- Attributes (integrated with Level) -->
                        <div class="stat-card attributes-card">
                          <div class="stat-header">
                            <div class="stat-icon level">
                              <sl-icon name="star"></sl-icon>
                            </div>
                            <div class="stat-title">${t('statsTitle')}</div>
                            <div class="level-badge" title="${t('levelTooltip')}">${ti('levelWithNumber', { level })}</div>
                          </div>
                          <!-- Compact Experience tile integrated into Attributes -->
                          <div class="mini-progress" title="${t('xpToNext')}">
                            <div class="progress-info">
                              <span class="progress-current">
                                ${experience} / ${expForNextLevel} ${t('xpAbbrev')}
                                (${Math.round(
                                  expForNextLevel ? (experience / expForNextLevel) * 100 : 0
                                )}%)
                              </span>
                            </div>
                            <div class="modern-progress-bar mini">
                              <div
                                class="progress-fill experience"
                                style="width: ${expForNextLevel
                                  ? (experience / expForNextLevel) * 100
                                  : 0}%"
                              ></div>
                            </div>
                          </div>

                          <div
                            class="points-panel ${this.statPointsAvailable > 0 ? 'active' : 'done'}"
                          >
                            <div class="points-left">
                              <sl-icon
                                name="${this.statPointsAvailable > 0
                                  ? 'plus-circle'
                                  : 'check2-circle'}"
                              ></sl-icon>
                              ${this.statPointsAvailable > 0
                                ? html`<div>
                                    <div class="points-number">${this.statPointsAvailable}</div>
                                    <div class="points-subtitle">${t('pointsToAllocate')}</div>
                                  </div>`
                                : html`<div>${t('allPointsAssigned')}</div>`}
                            </div>
                            ${hasPending
                              ? html`<div class="points-actions">
                                  <sl-button
                                    size="small"
                                    pill
                                    variant="primary"
                                    @click=${this.saveAttributes}
                                    >${t('save')}</sl-button
                                  >
                                  <sl-button size="small" pill @click=${this.resetAllocation}
                                    >${t('reset')}</sl-button
                                  >
                                </div>`
                              : ''}
                          </div>

                          <div class="alloc-grid">
                            <div class="alloc-card alloc-card--floating power">
                              <sl-icon class="stat-icon level" name="fire"></sl-icon>
                              <div class="title-row">
                                <div class="title">${t('power')}</div>
                                <div class="bottom-row">
                                  <span class="impact"
                                    >${ti('attackLabel', { min: atkMinPreview, max: atkMaxPreview })}</span
                                  >
                                  <sl-icon-button
                                    class="help-icon"
                                    name="info-circle"
                                    label="${t('whatIsPower')}"
                                    @click=${() => this.openAttributeDetails('power')}
                                  ></sl-icon-button>
                                </div>
                              </div>
                              <div class="alloc-btn-slot">
                                ${this.statPointsAvailable > 0
                                  ? html`<sl-button
                                      class="alloc-btn plus"
                                      circle
                                      size="small"
                                      @click=${(e: Event) => {
                                        e.stopPropagation();
                                        this.allocateStat('power');
                                      }}
                                      ><sl-icon name="plus-lg"></sl-icon
                                    ></sl-button>`
                                  : html``}
                              </div>
                              <div class="value">${this.stats.power}</div>
                            </div>

                            <div class="alloc-card alloc-card--floating stamina">
                              <sl-icon class="stat-icon energy" name="heart-pulse"></sl-icon>
                              <div class="title-row">
                                <div class="title">${t('stamina')}</div>
                                <div class="bottom-row">
                                  <span class="impact">${ti('maxEnergyLabel', { n: energyMaxPreview })}</span>
                                  <sl-icon-button
                                    class="help-icon"
                                    name="info-circle"
                                    label="${t('whatIsStamina')}"
                                    @click=${() => this.openAttributeDetails('stamina')}
                                  ></sl-icon-button>
                                </div>
                              </div>
                              <div class="value">${this.stats.stamina}</div>
                              <div class="alloc-btn-slot">
                                ${this.statPointsAvailable > 0
                                  ? html`<sl-button
                                      class="alloc-btn plus"
                                      circle
                                      size="small"
                                      @click=${(e: Event) => {
                                        e.stopPropagation();
                                        this.allocateStat('stamina');
                                      }}
                                      ><sl-icon name="plus-lg"></sl-icon
                                    ></sl-button>`
                                  : html``}
                              </div>
                            </div>

                            <div class="alloc-card alloc-card--floating reach">
                              <sl-icon class="stat-icon doghouses" name="broadcast-pin"></sl-icon>
                              <div class="title-row">
                                <div class="title">${t('reach')}</div>
                                <div class="bottom-row">
                                  <span class="impact">${ti('rangeLabel', { n: reachPreview })}</span>
                                  <sl-icon-button
                                    class="help-icon"
                                    name="info-circle"
                                    label="${t('whatIsReach')}"
                                    @click=${() => this.openAttributeDetails('reach')}
                                  ></sl-icon-button>
                                </div>
                              </div>
                              <div class="value">${this.stats.reach}</div>
                              <div class="alloc-btn-slot">
                                ${this.statPointsAvailable > 0
                                  ? html`<sl-button
                                      class="alloc-btn plus"
                                      circle
                                      size="small"
                                      @click=${(e: Event) => {
                                        e.stopPropagation();
                                        this.allocateStat('reach');
                                      }}
                                      ><sl-icon name="plus-lg"></sl-icon
                                    ></sl-button>`
                                  : html``}
                              </div>
                            </div>

                            <div class="alloc-card alloc-card--floating fortification">
                              <sl-icon class="stat-icon experience" name="shield-shaded"></sl-icon>
                              <div class="title-row">
                                <div class="title">${t('fortification')}</div>
                                <div class="bottom-row">
                                  <span class="impact">${ti('doghouseHpLabel', { n: doghouseHpPreview })}</span>
                                  <sl-icon-button
                                    class="help-icon"
                                    name="info-circle"
                                    label="${t('whatIsFortification')}"
                                    @click=${() => this.openAttributeDetails('fortification')}
                                  ></sl-icon-button>
                                </div>
                              </div>
                              <div class="value">${this.stats.fortification}</div>
                              <div class="alloc-btn-slot">
                                ${this.statPointsAvailable > 0
                                  ? html`<sl-button
                                      class="alloc-btn plus"
                                      circle
                                      size="small"
                                      @click=${(e: Event) => {
                                        e.stopPropagation();
                                        this.allocateStat('fortification');
                                      }}
                                      ><sl-icon name="plus-lg"></sl-icon
                                    ></sl-button>`
                                  : html``}
                              </div>
                            </div>
                          </div>
                        </div>

                        <!-- Available Doghouses Card -->
                        <div class="stat-card">
                          <div class="stat-header">
                            <div class="stat-icon doghouses">
                              <sl-icon name="house-add"></sl-icon>
                            </div>
                            <div class="stat-title">${t('availableDoghousesTitle')}</div>
                            <div class="doghouses-count">${availableDoghouses}</div>
                          </div>
                        </div>

                        <!-- Energy Card -->
                        <div class="stat-card">
                          <div class="stat-header">
                            <div class="stat-icon energy">
                              <sl-icon name="lightning-charge"></sl-icon>
                            </div>
                            <div class="stat-title">${t('energyTitle')}</div>
                            <div class="stat-value">${energy}</div>
                          </div>
                          <div class="stat-progress">
                            <div class="progress-info">
                              <span class="progress-current">${energy} / ${energyMax}</span>
                              <span class="progress-percentage"
                                >${Math.round((energy / energyMax) * 100)}%</span
                              >
                            </div>
                            <div class="modern-progress-bar">
                              <div
                                class="progress-fill energy"
                                style="width: ${(energy / energyMax) * 100}%"
                              ></div>
                            </div>
                          </div>
                        </div>

                        <!-- Experience is shown in the Attributes card as a compact tile -->

                        <!-- Doghouse Buffs Card -->
                        ${this.dogInfo?.buffsForDoghouses &&
                        this.dogInfo.buffsForDoghouses.length > 0
                          ? html`
                              <div class="stat-card doghouse-buffs-card">
                                <div class="stat-header">
                                  <div class="stat-icon doghouses">
                                    <sl-icon name="tools"></sl-icon>
                                  </div>
                                  <div class="stat-title">${t('doghouseBuffs')}</div>
                                </div>
                                <div class="buffs-grid">
                                  ${this.dogInfo.buffsForDoghouses.map(
                                    (buff) => html`
                                      <div class="buff-item-tile">
                                        <div class="buff-icon">
                                          <icon-png-badge
                                            name="${buff.buffSku.includes('repair')
                                              ? 'toolkit'
                                              : 'energy-drink'}"
                                            badge="${buff.quantity}"
                                          ></icon-png-badge>
                                        </div>
                                        <div class="buff-details">
                                          <div class="buff-name">${buff.name}</div>
                                        </div>
                                      </div>
                                    `
                                  )}
                                </div>
                              </div>
                            `
                          : ``}
                      </div>
                    </div>
                  </sl-tab-panel>

                  <sl-tab-panel name="quests">
                    <div id="stats-content">
                      <div class="stat-card">
                        <daily-quests .isActive=${this.activeTab === 'quests'}></daily-quests>
                      </div>
                    </div>
                  </sl-tab-panel>

                  <sl-tab-panel name="leaderboards">
                    <div id="stats-content">
                      <div class="stat-card">
                        <leaderboards-component
                          .isActive=${this.activeTab === 'leaderboards'}
                        ></leaderboards-component>
                      </div>
                    </div>
                  </sl-tab-panel>
                </sl-tab-group>

                <!-- Attribute Details Drawer -->
                <sl-drawer
                  ?open=${this.detailsOpen}
                  aria-label=${this.detailsTitle}
                  placement="bottom"
                  class="details-drawer"
                  @sl-after-hide=${this.onCloseAttributeDetails}
                  @sl-request-close=${this.onCloseAttributeDetails}
                >
                  <div class="details-header">
                    <sl-icon name=${this.detailsIcon}></sl-icon>
                    <span>${this.detailsTitle}</span>
                  </div>
                  <p class="details-text">${this.detailsText}</p>
                  <div class="details-actions">
                    <sl-button variant="primary" pill @click=${this.onCloseAttributeDetails}
                      >${t('gotIt')}</sl-button
                    >
                  </div>
                </sl-drawer>
              </div>
            </div>
          </div>
        `
      : html` <app-spinner></app-spinner> `;
  }
}
