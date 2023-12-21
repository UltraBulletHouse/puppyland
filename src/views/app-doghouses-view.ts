import { consume } from '@lit/context';
import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { API_DOGHOUSE_GET } from '../constants/apiConstants';
import { accessTokenContext } from '../contexts/userFirebaseContext';
import { sharedStyles } from '../styles/shared-styles';
import { DogInfo } from '../types/dog';
import { apiCall } from '../utils/apiUtils';
import { dogInfoContext } from '../contexts/dogInfoContext';
import { Doghouse, GetDoghouseResponse } from '../types/doghouse';

@customElement('app-doghouses-view')
export class AppDoghousesView extends LitElement {
  static styles = [
    sharedStyles,
    css`
      #container {
        height: 100%;
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

    const dogInfoResponse = await apiCall(this.accessToken).get<GetDoghouseResponse>(API_DOGHOUSE_GET, {
      params: {
        dogId: this.dogInfo?.id
      },
    });
    this.doghouses = dogInfoResponse.data.doghousesList;
  }

  render() {

    return html`
      <div id="container">
        <ul>
          ${this.doghouses?.map(item => 
            html`<li>
              ----------------------------------
              ${Object.entries(item).map(([key, value]) => html`<li>${key}: ${value}</li>`)}
                </li>`)}
        </ul>
      </div>
    `;
  }
}
