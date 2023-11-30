import { consume } from '@lit/context';
import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import '../components/app-footer';
import '../components/app-header';
import { userContext } from '../contexts/user-context';
import { styles } from '../styles/shared-styles';
import { UserFirebase, auth } from '../utils/firebase';
import './app-map';

@customElement('app-home')
export class AppHome extends LitElement {
  static styles = [
    styles,
    css`
      #container {
        flex: 1;
      }
    `,
  ];

  @consume({ context: userContext, subscribe: true })
  @property({ attribute: false })
  userFirebase?: UserFirebase;

  async callApi(accesToken: string) {
    console.log(accesToken);
    // TODO: Remove
    // const corsAny = 'https://cors-anywhere.herokuapp.com/'
    // const apiUrl = 'http://testaccount1rif-001-site1.anytempurl.com/DogHouses';
    // const headers = {
    //   'Content-Type': 'application/json',
    //   'Access-Control-Allow-Origin': '*',
    //   'Authorization': 'Bearer ' + accesToken,
    // };
    // POST
    // 49.829981, 21.445329
    // await fetch(apiUrl, {
    //   method: 'post',
    //   headers: headers,
    //   body: JSON.stringify({
    //     lat: 49.829981,
    //     lng: 21.445329
    //   }),
    // });
    // GET
    // 50.252745, 21.847445
    // const response = await fetch(
    //   apiUrl +
    //     '?' +
    //     new URLSearchParams({
    //       lat: '50.252745',
    //       lng: '21.847445',
    //     }),
    //   {
    //     method: 'get',
    //     headers: headers,
    //   }
    // );
    // const movies = await response.json();
  }

  async updated() {
    // TODO: Remove
    // const accesToken = await this.userFirebase?.getIdToken();
    // if (!accesToken) return;
    // this.callApi(accesToken);
  }

  onClick() {
    auth.signOut();
    // TODO: Remove
    // <button @click="${this.onClick}">Sign out</button>
  }

  render() {
    return html`
      <main>
        <div id="container">
          <app-map></app-map>
        </div>
        <app-footer></app-footer>
      </main>
    `;
  }
}
