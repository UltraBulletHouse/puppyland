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
        font-weight: 400;
        margin: 20px 0;
      }
      #title #title-text {
        margin-left: 10px;
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

  updateDoghouse(event: CustomEvent<Doghouse>) {
    if (!this.doghouses) return;
    const dhToUpdate = event.detail;
    const updatedDoghouses = this.doghouses.map((x) => (x.id === dhToUpdate.id ? dhToUpdate : x));

    this.doghouses = updatedDoghouses;
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
        <h2 id="title">
          <sl-icon name="houses"></sl-icon>
          <span id="title-text">Your doghouses</span>
        </h2>

        <div id="list">
          ${when(
            this.doghouses,
            () =>
              this.doghouses?.map(
                (item) => html`
                  <div>
                    <app-dogouse-item
                      .dogouseInfo=${item}
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
