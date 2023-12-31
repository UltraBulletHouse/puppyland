import { consume } from '@lit/context';
import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/relative-time/relative-time.js';

import { API_DOGHOUSE_UPDATE } from '../../constants/apiConstants';
import { accessTokenContext } from '../../contexts/userFirebaseContext';
import { sharedStyles } from '../../styles/shared-styles';
import { Doghouse, UpdateDoghouseResponse } from '../../types/doghouse';
import { apiCall } from '../../utils/apiUtils';

@customElement('app-dogouse-item')
export class AppDoghouseItem extends LitElement {
  static styles = [
    sharedStyles,
    css`
      #container {
        height: 100%;
      }
      p {
        margin: 5px 0;
      }
      #doghouse-name {
        display: flex;
        align-items: center;
        width: 90%;
      }
      #doghouse-name-wrapper {
        display: flex;
        max-width: 85%;
      }
      #doghouse-name-wrapper sl-icon {
        flex-shrink: 0;
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
        margin-right: 10px;
      }
    `,
  ];

  @consume({ context: accessTokenContext, subscribe: true })
  @property({ attribute: false })
  accessToken: string | null = null;

  @property({ type: Object })
  dogouseInfo: Doghouse | null = null;

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

  async saveNewName() {
    const doghouseId = this.dogouseInfo?.id;
    if (!this.accessToken || !doghouseId) return;

    const doghouseResponse = await apiCall(this.accessToken).patch<UpdateDoghouseResponse>(
      API_DOGHOUSE_UPDATE,
      {
        doghouseId,
        name: this.newName,
      }
    );

    console.log(doghouseResponse);
    // this.newName = dogInfoResponse.data.name;
    this.isEditingName = false;
  }

  protected firstUpdated() {
    if (!this.dogouseInfo) return;
    this.newName = this.dogouseInfo.name;
  }

  render() {
    if (!this.dogouseInfo) return null;

    const { name, hp, maxHp, createdDate } = this.dogouseInfo;

    return html`
      <div id="container">
        <div id="doghouse-name">
          ${this.isEditingName
            ? html`<sl-input
                id="input"
                value=${this.newName ?? name ?? ''}
                @sl-change=${this.onChangeName}
                minlength="3"
                maxlength="20"
                autofocus
                required
                clearable
                pill
              ></sl-input>`
            : html` <p id="doghouse-name-wrapper">
                <sl-icon name="tag"></sl-icon
                ><span id="doghouse-name-text">${this.newName ?? name ?? ''}</span>
              </p>`}
          ${this.isEditingName
            ? html`<sl-icon name="check-lg" @click=${this.saveNewName}></sl-icon>`
            : html`<sl-icon name="pencil" @click=${this.editName}></sl-icon>`}
        </div>
        <div id="doghouse-hp">
          <p><sl-icon name="heart-pulse"></sl-icon>HP: ${hp}/${maxHp}</p>
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
