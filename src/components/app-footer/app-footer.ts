import { consume } from '@lit/context';
import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { updateViewEvent, viewContext } from '../../contexts/viewContext';
import { t } from '../../i18n';
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
        background: linear-gradient(
          180deg,
          color-mix(in srgb, var(--color-primary) 12%, #fff) 0%,
          color-mix(in srgb, var(--color-primary) 8%, #fff) 100%
        );
        border-top: none;
        box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
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
        color: var(--color-black);
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
        color: var(--color-black);
      }
      .nav-button.active {
        color: var(--primary);
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
        background: color-mix(in srgb, var(--primary) 8%, #fff);
        color: var(--primary);
        border: 2px solid var(--color-primary-medium);
        border-radius: var(--border-radius-circle);
        width: 64px;
        height: 64px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8px 22px rgba(22, 94, 73, 0.25);
        transition:
          transform 0.2s ease,
          background-color 0.2s ease,
          color 0.2s ease;
      }
      .map-button:hover {
        transform: scale(1.05);
      }
      .map-button.active {
        background: linear-gradient(
          180deg,
          color-mix(in srgb, var(--primary) 85%, #fff),
          var(--primary)
        );
        color: #fff;
        border-color: var(--primary);
        transform: scale(1.02);
      }
      .map-button .nav-icon {
        font-size: 32px;
        filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.25));
      }
      /* Active icon contrast on light footer */
      .nav-button.active .nav-icon {
        color: var(--color-primary);
        filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.25));
      }
      /* Ensure label text uses Nunito */
      .nav-button span {
        font-family: var(--font-body);
      }
    `,
  ];

  @consume({ context: viewContext, subscribe: true })
  @property({ attribute: false })
  view: View = View.SIGNIN_VIEW;

  @property({ type: Boolean })
  hasShadow = false;

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('locale-changed', () => this.requestUpdate());
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('locale-changed', () => this.requestUpdate());
  }

  changeView(view: View) {
    updateViewEvent(this, view);
  }

  render() {
    return html`
      <div id="footer-space"></div>
      <footer id="footer">
        <button
          class="nav-button ${this.view === View.DOG_VIEW ? 'active' : ''}"
          @mouseenter="${() => import('../../views/app-dog-view').catch(() => {})}"
          @click="${() => this.changeView(View.DOG_VIEW)}"
        >
          <svg-icon name="dogPaw" class="nav-icon"></svg-icon>
          <span>${t('navMyDog')}</span>
        </button>
        <button
          class="nav-button ${this.view === View.DOGHOUSE_VIEW ? 'active' : ''}"
          @mouseenter="${() => import('../../views/app-doghouses-view').catch(() => {})}"
          @click="${() => this.changeView(View.DOGHOUSE_VIEW)}"
        >
          <sl-icon name="house-heart" class="nav-icon"></sl-icon>
          <span>${t('doghouses')}</span>
        </button>
        <div class="map-button-container">
          <button
            class="map-button ${this.view === View.MAP_VIEW ? 'active' : ''}"
            @mouseenter="${() => import('../../views/app-map-view').catch(() => {})}"
            @click="${() => this.changeView(View.MAP_VIEW)}"
          >
            <sl-icon name="globe-americas" class="nav-icon"></sl-icon>
          </button>
        </div>
        <button
          class="nav-button ${this.view === View.SHOP_VIEW ? 'active' : ''}"
          @mouseenter="${() => import('../../views/app-shop-view').catch(() => {})}"
          @click="${() => this.changeView(View.SHOP_VIEW)}"
        >
          <sl-icon name="cart" class="nav-icon"></sl-icon>
          <span>${t('shop')}</span>
        </button>
        <button
          class="nav-button ${this.view === View.USER_VIEW ? 'active' : ''}"
          @mouseenter="${() => import('../../views/app-user-view').catch(() => {})}"
          @click="${() => this.changeView(View.USER_VIEW)}"
        >
          <sl-icon name="person-circle" class="nav-icon"></sl-icon>
          <span>${t('navProfile')}</span>
        </button>
      </footer>
    `;
  }
}
