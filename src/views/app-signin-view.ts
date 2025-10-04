import { signInWithPopup } from 'firebase/auth';
import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import '../components/icon-svg/svg-icon';

import { t } from '../i18n';
import { sharedStyles } from '../styles/shared-styles';
import { alertNotifyDanger } from '../utils/alertsUtils';
import { auth, googleProvider } from '../utils/firebase';

/**
 * @fires updateView
 */
@customElement('app-signin-view')
export class AppSignin extends LitElement {
  static styles = [
    sharedStyles,
    css`
      #container {
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        min-height: 100vh;
        padding: 32px 16px;
        background: var(--app-bg);
        background-image: radial-gradient(circle at top, rgba(22, 195, 138, 0.18), transparent 55%);
        overflow: hidden;
      }
      .ambient {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }
      .ambient::before,
      .ambient::after {
        content: '';
        position: absolute;
        border-radius: 999px;
        filter: blur(60px);
        opacity: 0.35;
      }
      .ambient::before {
        width: 280px;
        height: 280px;
        top: -120px;
        right: -60px;
        background: var(--color-primary);
      }
      .ambient::after {
        width: 220px;
        height: 220px;
        bottom: -90px;
        left: -40px;
        background: var(--coral);
      }
      .content-card {
        position: relative;
        max-width: 520px;
        width: 100%;
        padding: 32px 28px;
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.88);
        border: 1px solid rgba(22, 195, 138, 0.18);
        backdrop-filter: blur(18px);
        box-shadow: 0 25px 60px rgba(16, 42, 34, 0.2);
        display: flex;
        flex-direction: column;
        gap: 24px;
        color: var(--text);
      }
      .header {
        display: flex;
        flex-direction: column;
        gap: 20px;
        align-items: center;
        text-align: center;
      }
      .hero-icon {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        width: 120px;
        height: 120px;
        border-radius: 18px;
        background: rgba(22, 195, 138, 0.12);
        border: 1px solid rgba(22, 195, 138, 0.25);
      }
      .hero-icon svg-icon {
        width: 96px;
        height: 96px;
      }
      .eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.12em;
        font-size: 12px;
        font-weight: 600;
        color: var(--color-primary);
        margin-bottom: 6px;
      }
      h1 {
        margin: 0 0 8px;
        font-size: clamp(28px, 5vw, 36px);
        font-weight: 700;
        color: var(--text);
      }
      .subtitle {
        margin: 0;
        color: var(--text-2);
        line-height: 1.5;
        font-size: 16px;
      }
      .feature-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: 12px;
      }
      .feature-item {
        display: flex;
        align-items: center;
        gap: 12px;
        font-weight: 600;
        color: var(--text);
      }
      .feature-item sl-icon {
        font-size: 20px;
        color: var(--color-primary);
      }
      .actions {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      #google-btn {
        height: 48px;
        font-size: 16px;
        font-weight: 600;
      }
      .secondary-hint {
        text-align: center;
        font-size: 13px;
        color: var(--text-2);
      }
      @media (min-width: 720px) {
        .content-card {
          padding: 40px 44px;
          gap: 32px;
        }
        .header {
          gap: 28px;
        }
        .feature-list {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
        .feature-item {
          justify-content: center;
          text-align: center;
        }
      }
    `,
  ];

  async signInWithGoogle() {
    await signInWithPopup(auth, googleProvider).catch((err) => {
      alertNotifyDanger(err.message);
    });
  }

  render() {
    return html`
      <div id="container">
        <div class="ambient"></div>
        <section class="content-card" aria-labelledby="signin-heading">
          <header class="header">
            <div class="hero-icon">
              <svg-icon name="logo"></svg-icon>
            </div>
            <div>
              <div class="eyebrow">${t('signIn.heroEyebrow')}</div>
              <h1 id="signin-heading">${t('signIn.heroHeadline')}</h1>
              <p class="subtitle">${t('signIn.heroSubtitle')}</p>
            </div>
          </header>

          <ul class="feature-list">
            <li class="feature-item">
              <sl-icon name="map"></sl-icon>
              <span>${t('signIn.featureExplore')}</span>
            </li>
            <li class="feature-item">
              <sl-icon name="shield-check"></sl-icon>
              <span>${t('signIn.featureBuild')}</span>
            </li>
            <li class="feature-item">
              <sl-icon name="trophy"></sl-icon>
              <span>${t('signIn.featureCompete')}</span>
            </li>
          </ul>

          <div class="actions">
            <sl-button id="google-btn" pill variant="primary" @click=${this.signInWithGoogle}>
              <sl-icon name="google"></sl-icon>
              ${t('signInWithGoogle')}
            </sl-button>
            <div class="secondary-hint">${t('signIn.secondaryHint')}</div>
          </div>
        </section>
      </div>
    `;
  }
}
