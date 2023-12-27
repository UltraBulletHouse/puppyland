import { consume } from '@lit/context';
import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/components/badge/badge.js';

import '../components/app-spinner/app-spinner';
import { API_DOG_GET } from '../constants/apiConstants';
import { dogInfoContext, updateDogInfoEvent } from '../contexts/dogInfoContext';
import { accessTokenContext } from '../contexts/userFirebaseContext';
import { sharedStyles } from '../styles/shared-styles';
import { DogInfo, DogInfoResponse } from '../types/dog';
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
        margin-top: 20px;
      }
      #dog-image-circle {
        height: 130px;
        width: 130px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 50%;
        background-color: var(--sl-color-gray-50);
        margin-bottom: 20px;
      }
      #dog-name {
        font-size: 20px;
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

  async firstUpdated() {
    if (!this.accessToken) return;

    const dogInfoResponse = await apiCall(this.accessToken).get<DogInfoResponse>(API_DOG_GET);
    const { dog } = dogInfoResponse.data;
    if (dog) {
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
    } = this.dogInfo ?? {};

    return this.dogInfo
      ? html`
          <div id="container">
            <div id="dog-image">
              <div id="dog-image-circle">
                <sl-icon name="piggy-bank"></sl-icon>
              </div>
            </div>
            <div id="dog-name">${name ?? 'El Burek Pablito'}</div>
            <div id="info-container">
              <div id="dog-level">
                <sl-icon name="star"></sl-icon>Level:
                <sl-badge variant="success" pill>${level ?? 0}</sl-badge>
              </div>
              <div id="dog-experience">
                <sl-icon name="mortarboard"></sl-icon>Experience: ${experience ?? 0}
              </div>
              <div id="dog-owned-doghouses">
                <sl-icon name="houses"></sl-icon>Owned doghouses: ${ownedDoghouses ?? 0}
              </div>
              <div id="dog-attack-power">
                <sl-icon name="lightning-charge"></sl-icon>Attack power: ${attackPower ?? 0}
              </div>
              <div id="dog-available-attacks">
                <sl-icon name="heart-arrow"></sl-icon>Available attacks: ${availableAttacks ?? 0}
              </div>
              <div id="dog-available-doghouses">
                <sl-icon name="house-add"></sl-icon>Available doghouses: ${availableDoghouses ?? 0}
              </div>
            </div>
          </div>
        `
      : html` <app-spinner></app-spinner> `;
  }
}
