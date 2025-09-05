import { consume } from '@lit/context';
import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { when } from 'lit/directives/when.js';

import '@shoelace-style/shoelace/dist/components/badge/badge.js';
import '@shoelace-style/shoelace/dist/components/option/option.js';
import '@shoelace-style/shoelace/dist/components/select/select.js';

import '../components/app-spinner/app-spinner';
import '../components/doghouse-item/doghouse-item';
import { API_DOGHOUSE_GET } from '../constants/apiConstants';
import { dogInfoContext } from '../contexts/dogInfoContext';
import { accessTokenContext } from '../contexts/userFirebaseContext';
import { userInfoContext } from '../contexts/userInfoContext';
import { sharedStyles } from '../styles/shared-styles';
import { DogInfo } from '../types/dog';
import { Doghouse, GetDoghouseResponse } from '../types/doghouse';
import { apiCall } from '../utils/apiUtils';
import { t } from '../i18n';

@customElement('app-doghouses-view')
export class AppDoghousesView extends LitElement {
  static styles = [
    sharedStyles,
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
        color: var(--color-black);
      }
      #controls {
        display: flex;
        align-items: center;
        gap: 8px;
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
        transition: background-color 0.2s, color 0.2s;
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
  doghouseNameChangesCounter: number = 0;

  @state()
  editMode: boolean = false;

  @state()
  sortBy: 'date' | 'hp' = 'date';

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
            <sl-icon name="houses" style="font-size: 24px;"></sl-icon>
            <div id="title">${t('doghouses')}</div>
          </div>
          <div id="controls">
            <div id="sort-buttons">
              <sl-button
                class="sort-button ${this.sortBy === 'date' ? 'active' : ''}"
                @click=${() => (this.sortBy = 'date')}
                size="small"
              >
                <sl-icon name="calendar-date" slot="prefix"></sl-icon>
                ${t('dateLabel')}
              </sl-button>
              <sl-button
                class="sort-button ${this.sortBy === 'hp' ? 'active' : ''}"
                @click=${() => (this.sortBy = 'hp')}
                size="small"
              >
                <sl-icon name="heart-pulse" slot="prefix"></sl-icon>
                ${t('hpAbbrev')}
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
                title=${this.editMode ? t('exitEditMode') : t('editDoghouses') }
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
