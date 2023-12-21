import { consume } from '@lit/context';
import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { API_DOG_GET } from '../constants/apiConstants';
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
        height: 100%;
      }
    `,
  ];

  @consume({ context: accessTokenContext, subscribe: true })
  @property({ attribute: false })
  accessToken: string | null = null;

  @state()
  dog: DogInfo | null = null;

  async firstUpdated() {
    if (!this.accessToken) return;

    const dogInfoResponse = await apiCall(this.accessToken).get<DogInfoResponse>(API_DOG_GET);
    this.dog = dogInfoResponse.data.dog;
  }

  render() {
    const dogEntries = Object.entries(this.dog ?? {});

    return html`
      <div id="container">
        <ul>
          ${dogEntries.map(([key, value]) => html`<li>${key}: ${value}</li>`)}
        </ul>
      </div>
    `;
  }
}
