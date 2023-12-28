import { consume } from '@lit/context';
import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/components/badge/badge.js';
import '@shoelace-style/shoelace/dist/components/input/input.js';

import '../components/app-spinner/app-spinner';
import { API_DOG_GET, API_DOG_UPDATE } from '../constants/apiConstants';
import { dogInfoContext, updateDogInfoEvent } from '../contexts/dogInfoContext';
import { accessTokenContext } from '../contexts/userFirebaseContext';
import { sharedStyles } from '../styles/shared-styles';
import { DogInfo, DogInfoResponse, DogInfoUpdateResponse } from '../types/dog';
import { apiCall } from '../utils/apiUtils';

@customElement('app-dog-view')
export class AppDogView extends LitElement {
  static styles = [
    sharedStyles,
    css`
      #container {
        display: flex;
        flex-direction: column;
        align-items: center;
        height: 100%;
        width: 100%;
      }
      #dog-image {
        font-size: 100px;
        margin-top: 40px;
      }
      #dog-image-circle {
        height: 130px;
        width: 130px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 50%;
        background-color: var(--sl-color-gray-200);
        margin-bottom: 20px;
      }
      #dog-name {
        display: flex;
        align-items: center;
        font-size: 20px;
      }
      #dog-name sl-input {
        width: 290px;
      }
      #dog-name sl-icon {
        margin-left: 10px;
      }
      #info-container {
        margin-top: 30px;
      }
      #info-container sl-icon {
        margin-right: 10px;
      }
      #info-container div {
        margin-bottom: 10px;
      }
    `,
  ];

  @consume({ context: accessTokenContext, subscribe: true })
  @property({ attribute: false })
  accessToken: string | null = null;

  @consume({ context: dogInfoContext, subscribe: true })
  @property({ attribute: false })
  dogInfo: DogInfo | null = null;

  @state()
  isEditingName: boolean = false;

  @state()
  newName: string | null = null;

  editName() {
    this.isEditingName = true;
  }

  async saveNewName() {
    if (!this.accessToken) return;

    const dogInfoResponse = await apiCall(this.accessToken).patch<DogInfoUpdateResponse>(
      API_DOG_UPDATE,
      {
        dogId: this.dogInfo?.id,
        name: this.newName,
      }
    );

    this.newName = dogInfoResponse.data.name;
    this.isEditingName = false;
  }

  onChangeName(event: Event) {
    const newName = (event.target as HTMLInputElement)?.value;
    this.newName = newName;
  }

  async firstUpdated() {
    if (!this.accessToken) return;

    const dogInfoResponse = await apiCall(this.accessToken).get<DogInfoResponse>(API_DOG_GET);
    const { dog } = dogInfoResponse.data;
    if (dog) {
      this.newName = dog.name;
      updateDogInfoEvent(this, dog);
    }
  }

  render() {
    const {
      name,
      attackPower,
      availableAttacks,
      availableDoghouses,
      ownedDoghouses,
      experience,
      level,
    } = this.dogInfo ?? {
      attackPower: 0,
      availableAttacks: 0,
      availableDoghouses: 0,
      ownedDoghouse: 0,
      experience: 0,
      level: 0,
    };

    return this.dogInfo
      ? html`
          <div id="container">
            <div id="dog-image">
              <div id="dog-image-circle">
                <sl-icon name="piggy-bank"></sl-icon>
              </div>
            </div>
            <div id="dog-name">
              ${this.isEditingName
                ? html`<sl-input
                    id="input"
                    value=${this.newName ?? ''}
                    @sl-change=${this.onChangeName}
                    minlength="3"
                    maxlength="20"
                    autofocus
                    required
                    clearable
                    pill
                  ></sl-input>`
                : this.newName ?? name ?? ''}
              ${this.isEditingName
                ? html`<sl-icon name="check-lg" @click=${this.saveNewName}></sl-icon>`
                : html`<sl-icon name="pencil" @click=${this.editName}></sl-icon>`}
            </div>
            <div id="info-container">
              <div id="dog-level">
                <sl-icon name="star"></sl-icon>Level:
                <sl-badge variant="success" pill>${level}</sl-badge>
              </div>
              <div id="dog-experience">
                <sl-icon name="mortarboard"></sl-icon>Experience: ${experience}
              </div>
              <div id="dog-owned-doghouses">
                <sl-icon name="houses"></sl-icon>Owned doghouses: ${ownedDoghouses}
              </div>
              <div id="dog-attack-power">
                <sl-icon name="lightning-charge"></sl-icon>Attack power: ${attackPower}
              </div>
              <div id="dog-available-attacks">
                <sl-icon name="heart-arrow"></sl-icon>Available attacks: ${availableAttacks}
              </div>
              <div id="dog-available-doghouses">
                <sl-icon name="house-add"></sl-icon>Available doghouses: ${availableDoghouses}
              </div>
            </div>
          </div>
        `
      : html` <app-spinner></app-spinner> `;
  }
}
