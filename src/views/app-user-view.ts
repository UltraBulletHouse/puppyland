import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import { sharedStyles } from '../styles/shared-styles';

@customElement('app-user-view')
export class AppUserView extends LitElement {
  static styles = [
    sharedStyles,
    css`
      #container {
        height: 100%;
      }
    `,
  ];

  render() {
    return html` <div id="container">USER VIEW</div> `;
  }
}
