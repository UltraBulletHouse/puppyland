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
        background: var(--color-white);
      }
      #dog-image {
        font-size: 90px;
        margin-top: 40px;
        margin-bottom: 20px;
      }
      #dog-image-circle {
        height: 130px;
        width: 130px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: var(--border-radius-circle);
        background-color: var(--sl-color-gray-200);
        border: 2px solid var(--sl-color-gray-50);
        outline: 2px solid #37a26e;
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
        margin-bottom: 20px;
      }
      #dog-level-icon {
      }
      #dog-exp-bar,
      #dog-energy-bar {
        --indicator-color: var(--color-secondary);
        --height: 10px;

        margin-top: 10px;
      }
      #pencil-wrapper {
        position: relative;
      }
      #names-counter {
        position: absolute;
        top: -3px;
        right: -18px;
        font-size: 12px;
        background: var(--color-primary-medium);
        border-radius: 50px;
        padding: 0px 5px;
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
    if (this.dogInfo?.nameChangesCounter === 0) return;

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

    const dogInfoResponse = await apiCall(this.accessToken).get<DogInfoResponse>(API_DOG_GET);
    const { dog } = dogInfoResponse.data;
    if (dog) {
      this.newName = dog.name;
      updateDogInfoEvent(this, dog);
    }
  }

  render() {
    const { name, availableDoghouses, experience, expForNextLevel, level, energy, energyMax } =
      this.dogInfo ??
      ({
        id: '',
        userId: '',
        name: '',
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

    return this.dogInfo
      ? html`
          <div id="container">
            <div id="dog-image">
              <div id="dog-image-circle">
                <svg-icon name="dogHead"></svg-icon>
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
                    pill
                  ></sl-input>`
                : this.newName ?? name ?? ''}
              ${this.isEditingName
                ? html`<sl-icon name="check-lg" @click=${this.saveNewName}></sl-icon>
                    <sl-icon name="x" @click=${this.onCloseEditing}></sl-icon> `
                : html`<div id="pencil-wrapper">
                    <sl-icon name="pencil" @click=${this.editName}></sl-icon>
                    <div id="names-counter">${this.dogInfo.nameChangesCounter}</div>
                  </div>`}
            </div>
            <div id="info-container">
              <div id="dog-level">
                <sl-icon name="star"></sl-icon>Level: ${level}
                <!-- <div id="dog-level-wrapper">
                  <sl-icon id="dog-level-icon" name="star"></sl-icon>
                <span id="dog-level-counter">${level}</span>
                </div> -->
              </div>
              <div id="dog-experience">
                <sl-icon name="mortarboard"></sl-icon>Exp: ${experience} / ${expForNextLevel}
                <sl-progress-bar
                  id="dog-exp-bar"
                  value=${(experience / expForNextLevel) * 100}
                ></sl-progress-bar>
              </div>
              <!-- <div id="dog-owned-doghouses">
                <sl-icon name="houses"></sl-icon>Owned doghouses:
              </div> -->
              <div id="dog-attack-power">
                <sl-icon name="lightning-charge"></sl-icon>Energy: ${energy} / ${energyMax}
                <sl-progress-bar
                  id="dog-energy-bar"
                  value=${(energy / energyMax) * 100}
                ></sl-progress-bar>
              </div>
              <!-- <div id="dog-available-attacks">
                <sl-icon name="heart-arrow"></sl-icon>Available attacks:
              </div> -->
              <div id="dog-available-doghouses">
                <sl-icon name="house-add"></sl-icon>Available doghouses: ${availableDoghouses}
              </div>
            </div>
          </div>
        `
      : html` <app-spinner></app-spinner> `;
  }
}
