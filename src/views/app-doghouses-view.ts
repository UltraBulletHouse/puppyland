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
        align-items: center;
        height: 100%;
        width: 100%;
        background: var(--color-white);
      }
      #title {
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 20px 0;
      }
      #title #title-text {
        font-weight: 400;
        font-size: 30px;
        margin: 0 30px 0 30px;
      }
      #list {
        height: 100%;
        width: 100%;
        margin: 0;
        overflow: auto;
      }
      #list sl-details::part(base),
      #list sl-details::part(summary),
      #list sl-details::part(header) {
        width: 100%;
        overflow: hidden;
        background-color: var(--color-white);
      }
      #list sl-details::part(summary) {
        display: block;
        text-overflow: ellipsis;
      }
      .is-edit-mode {
        color: var(--color-primary);
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
    this.doghouses = dogInfoResponse.data.doghousesList;
    this.doghouseNameChangesCounter = dogInfoResponse.data.doghouseNameChangesCounter;
  }

  render() {
    //TODO: posortowac liste wedlug najmlodszego
    //https://stackoverflow.com/questions/52287060/how-to-sort-array-by-date-in-javascript
    //https://stackoverflow.com/questions/10123953/how-to-sort-an-object-array-by-date-property

    return html`
      <div id="container">
        <div id="title">
          <!-- <sl-icon name="houses"></sl-icon> -->
          <div id="title-text">Your doghouses</div>
          <sl-icon
            name="gear"
            @click=${this.handleEditMode}
            class=${this.editMode ? 'is-edit-mode' : ''}
          ></sl-icon>
        </div>

        <div id="list">
          ${when(
            this.doghouses,
            () =>
              this.doghouses?.map(
                (item) => html`
                  <div>
                    <app-dogouse-item
                      .dogouseInfo=${item}
                      .isEditMode=${this.editMode}
                      @updateDoghouse=${this.updateDoghouse}
                    ></app-dogouse-item>
                  </div>
                `
              ),
            () => html`<app-spinner></app-spinner>`
          )}
        </div>
      </div>
    `;
  }
}
