import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import { sharedStyles } from '../../styles/shared-styles';

@customElement('app-spinner')
export class AppSpinner extends LitElement {
  static styles = [
    sharedStyles,
    css`
      #container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100%;
        width: 100%;
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
