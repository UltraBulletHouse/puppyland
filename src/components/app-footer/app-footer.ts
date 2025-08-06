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
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 60px; /* A bit more spacious */
        background-color: var(--color-white);
        border-top: 1px solid var(--color-primary-light);
        box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
        z-index: 2000;
        display: flex;
        justify-content: space-around;
        align-items: center;
      }
      #footer-space {
        height: 60px; /* Match footer height */
      }
      .nav-button {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        color: var(--color-black-light);
        background-color: transparent;
        border: none;
        cursor: pointer;
        transition:
          color 0.2s,
          transform 0.2s;
        font-size: 11px;
        font-weight: 500;
        padding: 4px;
        height: 100%;
        flex: 1;
        -webkit-tap-highlight-color: transparent; /* For mobile */
      }
      .nav-button:focus-visible {
        outline: none; /* Remove default focus outline */
      }
      .nav-button:hover {
        color: var(--color-primary);
      }
      .nav-button.active {
        color: var(--color-primary);
      }
      .nav-icon {
        font-size: 24px;
        transition: font-size 0.2s;
      }
      .nav-button.active .nav-icon {
        font-size: 26px; /* Slightly larger when active */
      }
      /* Special style for the central map button */
      .map-button-container {
        margin-top: -30px; /* Lifts the button up */
        position: relative;
        z-index: 1;
      }
      .map-button {
        background: var(--color-white);
        color: var(--color-black-light);
        border: 1px solid var(--color-primary-light);
        border-radius: var(--border-radius-circle);
        width: 64px;
        height: 64px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transition:
          transform 0.2s ease,
          background-color 0.2s ease,
          color 0.2s ease;
      }
      .map-button:hover {
        transform: scale(1.05);
        background: var(--color-primary-light);
        color: var(--color-primary);
      }
      .map-button.active {
        background: var(--color-primary-light);
        border-color: var(--color-primary);
        color: var(--color-primary);
        transform: scale(1.02);
      }
      .map-button .nav-icon {
        font-size: 32px;
      }
    `,
  ];

  @consume({ context: viewContext, subscribe: true })
  @property({ attribute: false })
  view: View = View.SIGNIN_VIEW;

  @property({ type: Boolean })
  hasShadow = false;

  changeView(view: View) {
    updateViewEvent(this, view);
  }

  render() {
    return html`
      <div id="footer-space"></div>
      <footer id="footer">
        <button
          class="nav-button ${this.view === View.DOG_VIEW ? 'active' : ''}"
          @click="${() => this.changeView(View.DOG_VIEW)}"
        >
          <svg-icon name="dogPaw" class="nav-icon"></svg-icon>
          <span>My Dog</span>
        </button>
        <button
          class="nav-button ${this.view === View.DOGHOUSE_VIEW ? 'active' : ''}"
          @click="${() => this.changeView(View.DOGHOUSE_VIEW)}"
        >
          <sl-icon name="house-heart" class="nav-icon"></sl-icon>
          <span>Doghouses</span>
        </button>
        <div class="map-button-container">
          <button
            class="map-button ${this.view === View.MAP_VIEW ? 'active' : ''}"
            @click="${() => this.changeView(View.MAP_VIEW)}"
          >
            <sl-icon name="globe-americas" class="nav-icon"></sl-icon>
          </button>
        </div>
        <button
          class="nav-button ${this.view === View.SHOP_VIEW ? 'active' : ''}"
          @click="${() => this.changeView(View.SHOP_VIEW)}"
        >
          <sl-icon name="cart" class="nav-icon"></sl-icon>
          <span>Shop</span>
        </button>
        <button
          class="nav-button ${this.view === View.USER_VIEW ? 'active' : ''}"
          @click="${() => this.changeView(View.USER_VIEW)}"
        >
          <sl-icon name="person-circle" class="nav-icon"></sl-icon>
          <span>Profile</span>
        </button>
      </footer>
    `;
  }
}
