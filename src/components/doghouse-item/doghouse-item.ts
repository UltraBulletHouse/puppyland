import { consume } from '@lit/context';
import { LitElement, PropertyValueMap, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/relative-time/relative-time.js';

import { API_DOGHOUSE_UPDATE } from '../../constants/apiConstants';
import { accessTokenContext } from '../../contexts/userFirebaseContext';
import { t } from '../../i18n';
import { sharedStyles } from '../../styles/shared-styles';
import { Doghouse, UpdateDoghouseResponse } from '../../types/doghouse';
import { apiCall } from '../../utils/apiUtils';
import { sendEvent } from '../../utils/eventUtils';

/**
 * @fires updateDoghouse
 */
@customElement('app-dogouse-item')
export class AppDoghouseItem extends LitElement {
  static styles = [
    sharedStyles,
    css`
      #container {
        margin-bottom: 8px;
        padding: 12px 16px;
        border-radius: var(--border-radius-medium);
        background-color: var(--color-surface-strong);
        border: 1px solid var(--color-surface-border);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        transition: all 0.2s ease;
      }
      #container:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        transform: translateY(-1px);
      }
      #header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }
      #doghouse-name {
        display: flex;
        align-items: center;
        flex: 1;
        min-width: 0;
      }
      #doghouse-name-wrapper {
        display: flex;
        align-items: center;
        flex: 1;
        min-width: 0;
      }
      #doghouse-name-text {
        font-weight: 600;
        font-size: 16px;
        color: var(--color-black);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      #doghouse-name sl-input {
        flex: 1;
        min-width: 0;
      }
      #edit-actions {
        display: flex;
        gap: 8px;
        margin-left: 8px;
      }
      #edit-actions sl-icon {
        font-size: 16px;
        padding: 4px;
        border-radius: var(--border-radius-small);
        cursor: pointer;
        transition: background-color 0.2s ease;
      }
      #edit-actions sl-icon:hover {
        background-color: var(--color-primary-light);
      }
      #edit-actions sl-icon[name='check-lg'] {
        color: var(--color-secondary);
      }
      #edit-actions sl-icon[name='x'] {
        color: var(--color-blue);
      }
      #edit-actions sl-icon[name='pencil'] {
        color: var(--color-primary);
      }
      #footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
      }
      #stats {
        display: flex;
        gap: 16px;
        align-items: center;
        flex-wrap: wrap;
      }
      #hp-stat,
      #date-stat {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 14px;
        color: var(--color-black-medium);
      }
      #hp-stat sl-icon {
        color: var(--color-primary);
        font-size: 14px;
      }
      #date-stat sl-icon {
        color: var(--color-black-light);
        font-size: 14px;
      }
      #view-on-map-button::part(base) {
        font-size: 13px;
        font-weight: 600;
        padding: 6px 14px;
        border-radius: 999px;
        background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-medium) 100%);
        color: var(--color-white);
        border: none;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition:
          transform 0.2s ease,
          filter 0.2s ease;
      }
      #view-on-map-button::part(base):hover {
        transform: translateY(-1px);
        filter: brightness(1.05);
      }
      #view-on-map-button::part(base):active {
        transform: translateY(0);
        filter: brightness(0.97);
      }
      #view-on-map-button sl-icon {
        font-size: 16px;
      }
      #hp-bar {
        width: 60px;
        height: 4px;
        background: #ddeee6;
        border-radius: 2px;
        overflow: hidden;
        margin-left: 4px;
      }
      #hp-fill {
        height: 100%;
        background: linear-gradient(90deg, #9b0808 0%, #c62828 55%, #ff7a7a 100%);
        border-radius: 2px;
        transition: width 0.3s ease;
      }
      #hp-fill.low {
        background: linear-gradient(90deg, #9b0808 0%, #b71c1c 55%, #ff5f5f 100%);
      }
      #hp-fill.critical {
        background: linear-gradient(90deg, #9b0808 0%, #8b1212 55%, #f44343 100%);
      }
      p {
        margin: 0;
      }
    `,
  ];

  @consume({ context: accessTokenContext, subscribe: true })
  @property({ attribute: false })
  accessToken: string | null = null;

  @property({ type: Object })
  dogouseInfo: Doghouse | null = null;

  @property({ type: Boolean })
  isEditMode: boolean = false;

  @state()
  isEditingName: boolean = false;

  @state()
  newName: string | null = null;

  editName() {
    this.isEditingName = true;
  }

  onChangeName(event: Event) {
    const newName = (event.target as HTMLInputElement)?.value;
    this.newName = newName;
  }

  onCloseEditing() {
    this.isEditingName = false;
  }

  updated(changedProperties: PropertyValueMap<this>) {
    if (changedProperties.has('isEditMode') && !this.isEditMode) {
      this.onCloseEditing();
    }
    if (changedProperties.has('dogouseInfo') && !this.isEditingName) {
      // Keep displayed name in sync with incoming data when not editing
      this.newName = this.dogouseInfo?.name ?? null;
    }
  }

  async saveNewName() {
    const doghouseId = this.dogouseInfo?.id;
    if (!this.accessToken || !doghouseId) return;
    this.isEditingName = false;

    if (this.newName === this.dogouseInfo?.name) return;

    const doghouseResponse = await apiCall(this.accessToken).patch<UpdateDoghouseResponse>(
      API_DOGHOUSE_UPDATE,
      {
        doghouseId,
        name: this.newName,
      }
    );

    sendEvent<Doghouse>(this, 'updateDoghouse', doghouseResponse.data.doghouse);
  }

  protected firstUpdated() {
    if (!this.dogouseInfo) return;
    this.newName = this.dogouseInfo.name;
  }

  private onLocaleChanged = () => this.requestUpdate();
  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('locale-changed', this.onLocaleChanged);
  }
  disconnectedCallback() {
    window.removeEventListener('locale-changed', this.onLocaleChanged);
    super.disconnectedCallback();
  }

  render() {
    if (!this.dogouseInfo) return null;
    const { name, hp, maxHp, createdDate } = this.dogouseInfo;
    const displayName = this.newName ?? name ?? '';
    const displayEdit = this.isEditingName && this.isEditMode;
    const rawHpPercentage = maxHp > 0 ? (hp / maxHp) * 100 : 0;
    const hpPercentage = Math.max(0, Math.min(100, rawHpPercentage));
    const hpStateClass = hpPercentage < 30 ? 'critical' : hpPercentage < 60 ? 'low' : '';

    const nameInput = html`<sl-input
      value=${displayName}
      @sl-change=${this.onChangeName}
      minlength="3"
      maxlength="15"
      autofocus
      required
      pill
      size="small"
      placeholder="${t('doghouseNamePlaceholder')}"
    ></sl-input>`;

    const nameText = html`
      <div id="doghouse-name-wrapper">
        <span id="doghouse-name-text" data-autofit>${displayName}</span>
      </div>
    `;

    return html`
      <div id="container">
        <div id="header">
          <div id="doghouse-name">${displayEdit ? nameInput : nameText}</div>
          ${displayEdit
            ? html`
                <div id="edit-actions">
                  <sl-icon
                    name="check-lg"
                    @click=${this.saveNewName}
                    title="${t('save')}"
                  ></sl-icon>
                  <sl-icon name="x" @click=${this.onCloseEditing} title="${t('cancel')}"></sl-icon>
                </div>
              `
            : this.isEditMode
              ? html`
                  <div id="edit-actions">
                    <sl-icon
                      name="pencil"
                      @click=${this.editName}
                      title="${t('editName')}"
                    ></sl-icon>
                  </div>
                `
              : ''}
        </div>

        <div id="footer">
          <div id="stats">
            <div id="hp-stat">
              <sl-icon name="heart-pulse"></sl-icon>
              <span>${hp}/${maxHp}</span>
              <div id="hp-bar">
                <div id="hp-fill" class="${hpStateClass}" style="width: ${hpPercentage}%"></div>
              </div>
            </div>

            <div id="date-stat">
              <sl-icon name="calendar-check"></sl-icon>
              <sl-relative-time
                lang="${document.documentElement.lang || 'en'}"
                date=${createdDate}
              ></sl-relative-time>
            </div>
          </div>
          <sl-button
            id="view-on-map-button"
            variant="default"
            size="small"
            pill
            @click=${this.goToMap}
            title="${t('viewOnMap')}"
          >
            <sl-icon slot="prefix" name="map"></sl-icon>
            ${t('viewOnMap')}
          </sl-button>
        </div>
      </div>
    `;
  }

  private goToMap = () => {
    if (!this.dogouseInfo) return;
    const detail = { ...this.dogouseInfo };
    sendEvent<{ doghouse: Doghouse }>(this, 'focusDoghouse', { doghouse: detail });
  };
}
