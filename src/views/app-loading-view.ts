import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import { sharedStyles } from '../styles/shared-styles';

@customElement('app-loading-view')
export class AppLoadingView extends LitElement {
  static styles = [
    sharedStyles,
    css`
      #container {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        height: 100%;
        background: var(--app-bg);
      }
    `,
  ];

  render() {
    return html`
      <div id="container">
        <sl-spinner style="font-size: 80px;"></sl-spinner>
      </div>
    `;
  }
}
