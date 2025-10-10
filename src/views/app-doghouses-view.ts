import { consume } from '@lit/context';
import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { when } from 'lit/directives/when.js';

import '@shoelace-style/shoelace/dist/components/badge/badge.js';
import '@shoelace-style/shoelace/dist/components/option/option.js';
import '@shoelace-style/shoelace/dist/components/select/select.js';
import '@shoelace-style/shoelace/dist/components/drawer/drawer.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';

import '../components/app-spinner/app-spinner';
import '../components/doghouse-item/doghouse-item';
import { API_DOGHOUSE_GET } from '../constants/apiConstants';
import { dogInfoContext } from '../contexts/dogInfoContext';
import { accessTokenContext } from '../contexts/userFirebaseContext';
import { userInfoContext } from '../contexts/userInfoContext';
import { t } from '../i18n';
import { sharedStyles } from '../styles/shared-styles';
import { DogInfo } from '../types/dog';
import { Doghouse, GetDoghouseResponse } from '../types/doghouse';
import { apiCall } from '../utils/apiUtils';

@customElement('app-doghouses-view')
export class AppDoghousesView extends LitElement {
  static styles = [
    sharedStyles,
    css`
      #energy-info { display: flex; align-items: center; gap: 8px; padding: 8px 10px; margin: 8px; border-radius: 10px; background: color-mix(in srgb, var(--primary) 6%, #fff); border: 1px solid var(--color-surface-border); color: var(--text); }
      #energy-info .energy-text { display: flex; flex-direction: column; line-height: 1.2; }
      #energy-info .energy-text .line-main { font-weight: 600; font-size: 13px; }
      #energy-info .energy-text .line-sub { font-size: 11px; }
      #energy-info .spacer { flex: 1; }
      #energy-timer { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: var(--color-black-medium); font-weight: 600; }
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        margin: 12px;
        border-radius: 12px;
        background: color-mix(in srgb, var(--primary) 6%, #fff);
        border: 1px solid var(--color-surface-border);
        color: var(--text);
      }
      #energy-info sl-icon, #energy-timer sl-icon {
        color: var(--primary);
        font-size: 18px;
      }
      #energy-info .muted {
        color: var(--text-2);
        margin-left: 6px;
        font-size: 12px;
      }
    `, 
    css`
      sl-badge[variant='warning']::part(base) {
        background-color: var(--color-primary-medium);
        color: var(--color-black);
      }
      #container {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
        background: var(--app-bg);
      }
      #header {
        padding: 20px 16px;
        border-bottom: 1px solid var(--header-border);
        background: var(--header-bg);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }
      #left {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      #title {
        font-weight: 600;
        font-size: 20px;
        color: var(--primary);
      }
      #controls {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      #sort-label {
        font-size: 12px;
        color: var(--text-2);
      }
      #sort-by-selector {
        width: 120px;
      }
      /* Segmented tab-like group (match Dog view tabs) */
      #sort-buttons {
        display: flex;
        gap: 0;
        padding: 2px;
        background: color-mix(in srgb, var(--primary) 8%, #fff);
        border-radius: 999px;
        border: 1px solid var(--color-surface-border);
        overflow: hidden;
      }
      .sort-button::part(base) {
        font-size: 12px;
        padding: 4px 10px;
        background: transparent;
        color: var(--text-2);
        border: none;
        border-radius: 999px;
        transition:
          background-color 0.2s,
          color 0.2s;
        align-items: center;
        justify-content: center;
        box-shadow: none;
      }
      .sort-button.active::part(base) {
        background: var(--primary);
        color: #fff;
      }
      #edit-button {
        padding: 8px;
        border-radius: var(--border-radius-circle);
        transition: all 0.2s ease;
        cursor: pointer;
      }
      #edit-button:hover {
        background: var(--color-primary-light);
      }
      #edit-button.is-edit-mode {
        color: var(--color-primary);
        background: var(--color-primary-light);
      }
      #edit-button.disabled {
        cursor: not-allowed;
        opacity: 0.5;
        pointer-events: none;
      }
      #edit-container {
        position: relative;
      }
      #edit-badge {
        position: absolute;
        top: 0;
        right: 0;
        transform: translate(50%, -50%);
      }
      #list {
        flex: 1;
        overflow-y: auto;
        padding: 8px 12px 12px 12px;
        scroll-behavior: smooth;
      }
      #list::-webkit-scrollbar {
        width: 4px;
      }
      #list::-webkit-scrollbar-track {
        background: transparent;
      }
      #list::-webkit-scrollbar-thumb {
        background: var(--color-primary-medium);
        border-radius: 2px;
      }
      #empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 200px;
        color: var(--color-black-light);
        text-align: center;
        padding: 20px;
      }
      #empty-state sl-icon {
        font-size: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
      }

      /* Attribute Details Drawer styles (aligned with Dog view) */
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
        font-family: var(--font-head);
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
      .details-actions sl-button::part(base) {
        background: linear-gradient(var(--primary), var(--primary-700));
        color: #fff;
        border: none;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        font-family: var(--font-head);
        font-weight: 600;
        letter-spacing: 0.1px;
      }
      .details-actions sl-button:hover::part(base) {
        transform: translateY(-1px);
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.18);
      }
      .details-actions sl-button:active::part(base) {
        transform: translateY(1px);
        box-shadow: 0 1px 6px rgba(0, 0, 0, 0.12);
      }
    `,
  ];

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
  doghouses: Doghouse[] | null = null;

  @state()
  private nextEnergyRefreshAt?: string;

  @state()
  doghouseNameChangesCounter: number = 0;

  @state()
  editMode: boolean = false;

  @state()
  sortBy: 'date' | 'hp' = 'date';

  @state()
  private energyDrawerOpen: boolean = false;

  private openEnergyDetails = () => {
    this.energyDrawerOpen = true;
  };
  private closeEnergyDetails = () => {
    this.energyDrawerOpen = false;
  };
  private onEnergyDrawerHide = () => {
    this.energyDrawerOpen = false;
  };


  updateDoghouse(event: CustomEvent<Doghouse>) {
    if (!this.doghouses) return;
    const dhToUpdate = event.detail;
    const updatedDoghouses = this.doghouses.map((x) => (x.id === dhToUpdate.id ? dhToUpdate : x));

    this.doghouses = updatedDoghouses;
  }

  handleEditMode() {
    if (this.doghouseNameChangesCounter === 0 && !this.editMode) return;
    this.editMode = !this.editMode;
  }

  async connectedCallback() {
    this.setupEnergyTimer();
    super.connectedCallback();

    if (!this.accessToken) return;

    const dogInfoResponse = await apiCall(this.accessToken).get<GetDoghouseResponse>(
      API_DOGHOUSE_GET,
      {
        params: {
          dogId: this.dogInfo?.id,
        },
      }
    );
    this.doghouses = dogInfoResponse.data.doghousesList.reverse();
    this.doghouseNameChangesCounter = dogInfoResponse.data.doghouseNameChangesCounter;
  }

  private setupEnergyTimer() {
    // Compute next 00:00 UTC (no auto-refresh; match daily quests behavior)
    const now = new Date();
    const nextUtcMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
    this.nextEnergyRefreshAt = nextUtcMidnight.toISOString();
  }

  private formatEnergyTimeRemaining() {
    if (!this.nextEnergyRefreshAt) return html``;
    const target = new Date(this.nextEnergyRefreshAt).getTime();
    const now = Date.now();
    const diff = Math.max(0, target - now);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return html`<span class="timer-value">${hours}${t('hoursAbbrev')} ${minutes}${t('minutesAbbrev')}</span>`;
  }

  // No interval — matches daily quests component behavior\n  // private _energyTimerId?: number;\n

  render() {
    // Sort doghouses based on the selected criteria
    const sortedDoghouses = this.doghouses
      ? [...this.doghouses].sort((a, b) => {
          if (this.sortBy === 'hp') {
            return a.hp - b.hp; // Sort by HP ascending
          } else {
            return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime(); // Sort by date descending
          }
        })
      : [];

    return html`
      <div id="container">
        <div id="header">
          <div id="left">
            <div id="title" data-autofit>${t('doghousesTitle')}</div>
          </div>
          <div id="controls">
            <span id="sort-label">${t('sortBy')}</span>
            <div id="sort-buttons">
              <sl-button
                class="sort-button ${this.sortBy === 'date' ? 'active' : ''}"
                @click=${() => (this.sortBy = 'date')}
                size="small"
              >
                <sl-icon name="calendar-date" slot="prefix"></sl-icon>
                ${t('sortByDate') || t('dateLabel')}
              </sl-button>
              <sl-button
                class="sort-button ${this.sortBy === 'hp' ? 'active' : ''}"
                @click=${() => (this.sortBy = 'hp')}
                size="small"
              >
                <sl-icon name="heart-pulse" slot="prefix"></sl-icon>
                ${t('sortByHp') || t('hpAbbrev')}
              </sl-button>
            </div>
            <div id="edit-container">
              <sl-icon
                id="edit-button"
                name="pencil-square"
                @click=${this.handleEditMode}
                class="${this.editMode ? 'is-edit-mode' : ''} ${this.doghouseNameChangesCounter ===
                0
                  ? 'disabled'
                  : ''}"
                title=${this.editMode ? t('exitEditMode') : t('editDoghouses')}
              ></sl-icon>
              ${this.userInfo?.isPremium
                ? html`<sl-badge id="edit-badge" variant="success" pill title="${t('unlimited')}"
                    >∞</sl-badge
                  >`
                : html`<sl-badge id="edit-badge" variant="warning" pill
                    >${this.doghouseNameChangesCounter}</sl-badge
                  >`}
            </div>
          </div>
        </div>

        ${when(
          this.doghouses,
          () => {
            const count = this.doghouses ? this.doghouses.length : 0;
            const total = count * 10;
            return html`
              <div id="energy-info" part="energy-info">
                <sl-icon name="lightning-charge"></sl-icon>
                <div class="line-main">+${total}</div>
                <div class="spacer"></div>
                <div id="energy-timer">
                  <sl-icon name="clock"></sl-icon>
                  <span class="timer-label">${t('remainingTime')}</span>
                  ${this.formatEnergyTimeRemaining()}
                </div>
                <sl-icon-button name="info-circle" label="${t('details') || 'Details'}" @click=${this.openEnergyDetails}></sl-icon-button>
              </div>

              <sl-drawer label="${t('dailyEnergyDetails') || 'Daily energy refill'}" .open=${this.energyDrawerOpen} @sl-after-hide=${this.onEnergyDrawerHide} class="details-drawer" placement="bottom">
                <div class="details-header">
                  <sl-icon name="lightning-charge"></sl-icon>
                  <div>${t('dailyEnergyDetails') || 'Daily energy refill'}</div>
                </div>
                <div class="details-text">
                  <p>${t('dailyEnergyTitle') || 'Daily energy from doghouses'}: <strong>+${total}</strong></p>
                  <p>${t('dailyEnergyPerDoghouse') || 'Each doghouse grants +10 energy per day.'}</p>
                  <p>${t('nextRefillIn') || 'Next refill in'}: ${this.formatEnergyTimeRemaining()}</p>
                </div>
                <div class="details-actions">
                  <sl-button @click=${this.closeEnergyDetails}>${t('close') || 'Close'}</sl-button>
                </div>
              </sl-drawer>
            `;
          },
          () => html``
        )}

        <div id="list">
          ${when(
            this.doghouses,
            () =>
              sortedDoghouses && sortedDoghouses.length > 0
                ? repeat(
                    sortedDoghouses,
                    (item) => item.id,
                    (item) => html`
                      <app-dogouse-item
                        .dogouseInfo=${item}
                        .isEditMode=${this.editMode}
                        @updateDoghouse=${this.updateDoghouse}
                      ></app-dogouse-item>
                    `
                  )
                : html`
                    <div id="empty-state">
                      <sl-icon name="house-add"></sl-icon>
                      <div>${t('noDoghousesYet')}</div>
                      <div style="font-size: 14px; margin-top: 8px;">
                        ${t('goToMapToBuildFirst')}
                      </div>
                    </div>
                  `,
            () => html`<app-spinner></app-spinner>`
          )}
        </div>
      </div>
    `;
  }
}
