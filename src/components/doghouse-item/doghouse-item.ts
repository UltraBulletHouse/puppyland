import { consume } from '@lit/context';
import { LitElement, PropertyValueMap, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/relative-time/relative-time.js';

import { API_DOGHOUSE_UPDATE } from '../../constants/apiConstants';
import { accessTokenContext } from '../../contexts/userFirebaseContext';
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
        height: 100%;
        margin: 10px;
        padding: 10px;
        border-radius: var(--border-radius-big);
        background-color: var(--color-primary-light);
        border: 1px solid var(--color-primary-medium);
      }
      p {
        margin: 5px 0;
      }
      #doghouse-name {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
      }
      #doghouse-name-wrapper {
        display: flex;
        max-width: 85%;
      }
      #doghouse-name sl-icon {
        font-size: 14px;
      }
      #doghouse-name-text {
        overflow: hidden;
        text-overflow: ellipsis;
      }
      #doghouse-name sl-input {
        max-width: 85%;
      }
      #doghouse-name sl-icon,
      #doghouse-days sl-icon,
      #doghouse-hp sl-icon {
        margin-left: 10px;
        margin-right: 2px;
      }
      #doghouse-days,
      #doghouse-hp {
        font-weight: 300;
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

  render() {
    if (!this.dogouseInfo) return null;
    const { name, hp, maxHp, createdDate } = this.dogouseInfo;
    const displayName = this.newName ?? name ?? '';
    const displayEdit = this.isEditingName && this.isEditMode;

    const nameInput = html`<sl-input
      id="input"
      value=${displayName}
      @sl-change=${this.onChangeName}
      minlength="3"
      maxlength="20"
      autofocus
      required
      pill
    ></sl-input>`;

    const nameText = html` <p id="doghouse-name-wrapper">
      <span id="doghouse-name-text">${displayName}</span>
    </p>`;

    return html`
      <div id="container">
        <div id="doghouse-name">
          ${displayEdit ? nameInput : nameText}
          ${displayEdit
            ? html`<sl-icon name="check-lg" @click=${this.saveNewName}></sl-icon>
                <sl-icon name="x" @click=${this.onCloseEditing}></sl-icon> `
            : this.isEditMode
              ? html`<sl-icon name="pencil" @click=${this.editName}></sl-icon>`
              : ''}
        </div>
        <div id="doghouse-hp">
          <p><sl-icon name="heart-pulse"></sl-icon>${hp}/${maxHp}</p>
        </div>
        <div id="doghouse-days">
          <p>
            <sl-icon name="calendar-check"></sl-icon>Created
            <sl-relative-time date=${createdDate}></sl-relative-time>
          </p>
        </div>
      </div>
    `;
  }
}
