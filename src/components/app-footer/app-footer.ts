import { consume } from '@lit/context';
import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { viewContext } from '../../contexts/viewContext';
import { sharedStyles } from '../../styles/shared-styles';
import { View } from '../../types/view';

@customElement('app-footer')
export class AppFooter extends LitElement {
  static styles = [
    sharedStyles,
    css`
      #footer {
        position: relative;
        z-index: 9999999999;
        box-shadow: 3px -1px 20px 11px #0000002b;
      }
      #container {
        display: flex;
        justify-content: space-evenly;
        align-items: center;
      }
      #wave {
        height: 12px;
        width: 50px;
        background: rgb(255, 255, 255);
        position: absolute;
        top: -4px;
        border-radius: 100%;
      }
      .btn-icon {
        font-size: 26px;
      }
      .btn-icon-big {
        font-size: 34px;
      }
      .btn-icon--active {
        color: #37a26e;
      }
    `,
  ];

  @consume({ context: viewContext, subscribe: true })
  @property({ attribute: false })
  view: View = View.SIGNIN_VIEW;

  changeView(view: View) {
    const options: CustomEventInit<View> = {
      detail: view,
      bubbles: true,
    };
    this.dispatchEvent(new CustomEvent<View>('updateView', options));
  }

  render() {
    // console.log('FOOTER', this.view);
    return html`
      <footer id="footer">
        <div id="container">
          <sl-icon-button
            name="piggy-bank"
            class="btn-icon ${this.view === View.DOG_VIEW && 'btn-icon--active'}"
            @click="${() => this.changeView(View.DOG_VIEW)}"
          ></sl-icon-button>
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
            <div id="wave"></div>
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
