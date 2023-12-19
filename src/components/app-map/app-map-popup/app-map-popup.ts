import { consume } from '@lit/context';
import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { customElement } from 'lit/decorators/custom-element.js';
import { html } from 'lit/static-html.js';

import '@shoelace-style/shoelace/dist/components/card/card.js';

import { accessTokenContext } from '../../../contexts/userFirebaseContext';

@customElement('app-map-popup')
export class AppMapPopup extends LitElement {
  @consume({ context: accessTokenContext, subscribe: true })
  @property({ attribute: false })
  accessToken: string | null = null;

  @property({ type: String })
  dhId?: string;

  @property({ type: String })
  dhName?: string;

  @property({ type: String })
  dhHp?: string;

  @property({ type: String })
  dhMaxHp?: string;

  protected createRenderRoot() {
    return this;
  }

  render() {
    return html` <div>
      <sl-card class="card-overview">
        <strong>${this.dhName}</strong>
        <div slot="footer">HP: ${this.dhHp}/${this.dhMaxHp}</div>
      </sl-card>
    </div>`;
  }
}
