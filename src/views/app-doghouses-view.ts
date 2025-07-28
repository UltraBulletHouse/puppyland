import { consume } from '@lit/context';
import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';

import '../components/app-spinner/app-spinner';
import '../components/doghouse-item/doghouse-item';
import { API_DOGHOUSE_GET } from '../constants/apiConstants';
import { dogInfoContext } from '../contexts/dogInfoContext';
import { accessTokenContext } from '../contexts/userFirebaseContext';
import { sharedStyles } from '../styles/shared-styles';
import { DogInfo } from '../types/dog';
import { Doghouse, GetDoghouseResponse } from '../types/doghouse';
import { apiCall } from '../utils/apiUtils';

@customElement('app-doghouses-view')
export class AppDoghousesView extends LitElement {
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
      #header {
        position: sticky;
        top: 0;
        background: var(--color-white);
        z-index: 10;
        border-bottom: 1px solid var(--color-primary-medium);
        padding: 12px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      #title-text {
        font-weight: 600;
        font-size: 18px;
        color: var(--color-black);
        letter-spacing: 0.5px;
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

  @state()
  doghouses: Doghouse[] | null = null;

  @state()
  doghouseNameChangesCounter: number = 0;

  @state()
  editMode: boolean = false;

  updateDoghouse(event: CustomEvent<Doghouse>) {
    if (!this.doghouses) return;
    const dhToUpdate = event.detail;
    const updatedDoghouses = this.doghouses.map((x) => (x.id === dhToUpdate.id ? dhToUpdate : x));

    this.doghouses = updatedDoghouses;
  }

  handleEditMode() {
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
    // Sort doghouses by creation date (newest first)
    const sortedDoghouses = this.doghouses?.slice().sort((a, b) => 
      new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
    );

    return html`
      <div id="container">
        <div id="header">
          <div id="title-text">My Doghouses</div>
          <sl-icon
            id="edit-button"
            name="gear"
            @click=${this.handleEditMode}
            class=${this.editMode ? 'is-edit-mode' : ''}
            title=${this.editMode ? 'Exit edit mode' : 'Edit doghouses'}
          ></sl-icon>
        </div>

        <div id="list">
          ${when(
            this.doghouses,
            () => sortedDoghouses && sortedDoghouses.length > 0
              ? sortedDoghouses.map(
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
                    <div>No doghouses yet</div>
                    <div style="font-size: 14px; margin-top: 8px;">
                      Go to the map to build your first doghouse!
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
