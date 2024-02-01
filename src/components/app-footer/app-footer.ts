import { consume } from '@lit/context';
import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { updateViewEvent, viewContext } from '../../contexts/viewContext';
import { sharedStyles } from '../../styles/shared-styles';
import { View } from '../../types/view';

/**
 * @fires updateView
 */
@customElement('app-footer')
export class AppFooter extends LitElement {
  static styles = [
    sharedStyles,
    css`
      #footer {
        position: absolute;
        bottom: 0;
        width: 100%;
        background-color: #fff;
        border-top: 1px solid var(--color-primary-trans);
        border-top-right-radius: 17px;
        border-top-left-radius: 17px;
        z-index: 1000;
        box-shadow: 3px -1px 20px 11px #0000002b;
      }
      #footer-space {
        height: 44px;
      }
      #container {
        display: flex;
        justify-content: space-evenly;
        align-items: center;
      }
      .btn-icon {
        font-size: 26px;
      }
      .btn-icon-big {
        font-size: 34px;
      }
      .btn-icon--active,
      .btn-icon--active::part(base):active,
      .btn-icon--active::part(base):hover {
        color: var(--color-primary);
      }
    `,
  ];

  @consume({ context: viewContext, subscribe: true })
  @property({ attribute: false })
  view: View = View.SIGNIN_VIEW;

  changeView(view: View) {
    updateViewEvent(this, view);
  }

  render() {
    return html`
      <div id="footer-space"></div>
      <footer id="footer">
        <div id="container">
          <svg-icon-button
            name="dogPaw"
            class="btn-icon ${this.view === View.DOG_VIEW && 'btn-icon--active'}"
            @click="${() => this.changeView(View.DOG_VIEW)}"
          ></svg-icon-button>
          <sl-icon-button
            name="house-heart"
            class="btn-icon ${this.view === View.DOGHOUSE_VIEW && 'btn-icon--active'}"
            @click="${() => this.changeView(View.DOGHOUSE_VIEW)}"
          ></sl-icon-button>
          <div>
            <sl-icon-button
              name="globe-americas"
              class="btn-icon-big ${this.view === View.MAP_VIEW && 'btn-icon--active'}"
              @click="${() => this.changeView(View.MAP_VIEW)}"
            ></sl-icon-button>
          </div>
          <sl-icon-button
            name="cart"
            class="btn-icon ${this.view === View.SHOP_VIEW && 'btn-icon--active'}"
            @click="${() => this.changeView(View.SHOP_VIEW)}"
          >
          </sl-icon-button>
          <sl-icon-button
            name="person-circle"
            class="btn-icon ${this.view === View.USER_VIEW && 'btn-icon--active'}"
            @click="${() => this.changeView(View.USER_VIEW)}"
          ></sl-icon-button>
        </div>
      </footer>
    `;
  }
}
