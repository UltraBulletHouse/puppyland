import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('app-footer')
export class AppHFooter extends LitElement {
  static styles = css`
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
      width: 48px;
      background: rgb(255, 255, 255);
      position: absolute;
      top: -4px;
      border-radius: 100%;
    }
    .btn-icon {
      font-size: 24px;
    }
    .btn-icon--big {
      font-size: 32px;
    }
  `;

  render() {
    return html`
      <footer id="footer">
        <div id="container">
          <sl-icon-button name="piggy-bank" class="btn-icon"></sl-icon-button>
          <sl-icon-button name="house-heart" class="btn-icon"></sl-icon-button>
          <div>
            <sl-icon-button name="globe-americas" class="btn-icon--big"></sl-icon-button>
            <div id="wave"></div>
          </div>
          <sl-icon-button name="cart" class="btn-icon"> </sl-icon-button>
          <sl-icon-button name="person-circle" class="btn-icon"></sl-icon-button>
        </div>
      </footer>
    `;
  }
}
