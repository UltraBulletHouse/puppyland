import { consume } from '@lit/context';
import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/components/details/details.js';

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
        height: 100%;
      }
      #list {
        height: 100%;
        margin: 0;
        overflow: auto;
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

  async firstUpdated() {
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
  }

  render() {
    return html`
      <div id="container">
        <div id="list">
          ${this.doghouses?.map(
            (item) => html`
              <sl-details summary=${item.name}>
                <ul>
                  ----------------------------------
                  ${Object.entries(item).map(([key, value]) => html`<li>${key}: ${value}</li>`)}
                </ul>
              </sl-details>
            `
          )}
        </div>
      </div>
    `;
  }
}
