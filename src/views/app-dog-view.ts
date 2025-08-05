import { consume } from '@lit/context';
import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/components/badge/badge.js';
import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/tab-group/tab-group.js';
import '@shoelace-style/shoelace/dist/components/tab-panel/tab-panel.js';
import '@shoelace-style/shoelace/dist/components/tab/tab.js';

import '../components/app-spinner/app-spinner';
import '../components/daily-quests/daily-quests';
import '../components/leaderboards/leaderboards';
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
        height: 100%;
        width: 100%;
        background: var(--color-white);
      }
      #dog-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20px 16px;
        background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-white) 100%);
        border-bottom: 1px solid var(--color-primary-medium);
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
        background-color: var(--sl-color-gray-200);
        border: 2px solid var(--sl-color-gray-50);
        outline: 2px solid #37a26e;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      #dog-name {
        display: flex;
        align-items: center;
        font-size: 18px;
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
      sl-tab-group {
        height: 100%;
      }
      sl-tab-panel {
        height: 100%;
        overflow-y: auto;
        padding: 0;
      }
      #stats-content {
        padding: 16px;
      }
      #info-container {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .stat-card {
        background: var(--color-white);
        border: 1px solid var(--color-primary-medium);
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
        font-size: 20px;
        padding: 8px;
        border-radius: var(--border-radius-circle);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
      }

      .stat-icon.level {
        background: linear-gradient(135deg, #ffd700, #ffa500);
        color: white;
      }

      .stat-icon.experience {
        background: linear-gradient(135deg, #9b59b6, #8e44ad);
        color: white;
      }

      .stat-icon.energy {
        background: linear-gradient(135deg, #e74c3c, #c0392b);
        color: white;
      }

      .stat-icon.doghouses {
        background: linear-gradient(135deg, #3498db, #2980b9);
        color: white;
      }

      .stat-title {
        font-weight: 600;
        font-size: 16px;
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
        height: 8px;
        background: var(--color-primary-light);
        border-radius: 4px;
        overflow: hidden;
        position: relative;
      }

      .progress-fill {
        height: 100%;
        border-radius: 4px;
        transition: width 0.6s ease;
        position: relative;
        overflow: hidden;
      }

      .progress-fill.experience {
        background: linear-gradient(90deg, #9b59b6, #8e44ad);
      }

      .progress-fill.energy {
        background: linear-gradient(90deg, #e74c3c, #c0392b);
      }

      .progress-fill::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        animation: shimmer 2s infinite;
      }

      @keyframes shimmer {
        0% {
          transform: translateX(-100%);
        }
        100% {
          transform: translateX(100%);
        }
      }

      .level-badge {
        background: linear-gradient(135deg, #ffd700, #ffa500);
        color: white;
        padding: 4px 12px;
        border-radius: var(--border-radius-circle);
        font-weight: 700;
        font-size: 14px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .doghouses-count {
        background: var(--color-secondary);
        color: white;
        padding: 4px 12px;
        border-radius: var(--border-radius-circle);
        font-weight: 700;
        font-size: 14px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
      #dog-buffs {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        margin-top: 20px;
        padding: 30px;
      }
      icon-png-badge {
        --icon-png-badge-width: 46px;
        --icon-png-badge-height: 46px;
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

  @state()
  isNameSaveDisabled: boolean = false;

  @state()
  activeTab: string = 'stats'; // Default active tab

  handleTabShow(event: CustomEvent) {
    this.activeTab = event.detail.name;
  }

  editName() {
    if (this.dogInfo?.nameChangesCounter === 0) return;

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

    return this.dogInfo && this.newName
      ? html`
          <div id="container">
            <div id="dog-header">
              <div id="dog-image">
                <div id="dog-image-circle">
                  <svg-icon name="dogHead"></svg-icon>
                </div>
              </div>
              <div id="dog-name">
                ${this.isEditingName
                  ? html`<sl-input
                      id="input"
                      value=${this.newName ?? name ?? ''}
                      @sl-change=${this.onChangeName}
                      minlength="3"
                      maxlength="20"
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
                      <div id="names-counter">${nameChangesCounter}</div>
                    </div>`}
              </div>
            </div>

            <div id="content-tabs">
              <sl-tab-group @sl-tab-show=${this.handleTabShow}>
                <sl-tab slot="nav" panel="stats">
                  <sl-icon name="bar-chart"></sl-icon>
                  Stats
                </sl-tab>
                <sl-tab slot="nav" panel="quests">
                  <sl-icon name="list-task"></sl-icon>
                  Daily Quests
                </sl-tab>
                <sl-tab slot="nav" panel="leaderboards">
                  <sl-icon name="trophy"></sl-icon>
                  Leaderboards
                </sl-tab>

                <sl-tab-panel name="stats">
                  <div id="stats-content">
                    <div id="info-container">
                      <!-- Level Card -->
                      <div class="stat-card">
                        <div class="stat-header">
                          <div class="stat-icon level">
                            <sl-icon name="star"></sl-icon>
                          </div>
                          <div class="stat-title">Level</div>
                          <div class="level-badge">${level}</div>
                        </div>
                      </div>

                      <!-- Experience Card -->
                      <div class="stat-card">
                        <div class="stat-header">
                          <div class="stat-icon experience">
                            <sl-icon name="mortarboard"></sl-icon>
                          </div>
                          <div class="stat-title">Experience</div>
                          <div class="stat-value">${experience}</div>
                        </div>
                        <div class="stat-progress">
                          <div class="progress-info">
                            <span class="progress-current"
                              >${experience} / ${expForNextLevel} XP</span
                            >
                            <span class="progress-percentage"
                              >${Math.round((experience / expForNextLevel) * 100)}%</span
                            >
                          </div>
                          <div class="modern-progress-bar">
                            <div
                              class="progress-fill experience"
                              style="width: ${(experience / expForNextLevel) * 100}%"
                            ></div>
                          </div>
                        </div>
                      </div>

                      <!-- Energy Card -->
                      <div class="stat-card">
                        <div class="stat-header">
                          <div class="stat-icon energy">
                            <sl-icon name="lightning-charge"></sl-icon>
                          </div>
                          <div class="stat-title">Energy</div>
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

                      <!-- Available Doghouses Card -->
                      <div class="stat-card">
                        <div class="stat-header">
                          <div class="stat-icon doghouses">
                            <sl-icon name="house-add"></sl-icon>
                          </div>
                          <div class="stat-title">Available Doghouses</div>
                          <div class="doghouses-count">${availableDoghouses}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </sl-tab-panel>

                <sl-tab-panel name="quests">
                  <daily-quests .isActive=${this.activeTab === 'quests'}></daily-quests>
                </sl-tab-panel>

                <sl-tab-panel name="leaderboards">
                  <leaderboards-component .isActive=${this.activeTab === 'leaderboards'}></leaderboards-component>
                </sl-tab-panel>
              </sl-tab-group>
            </div>
          </div>
        `
      : html` <app-spinner></app-spinner> `;
  }
}