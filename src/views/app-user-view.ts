import { consume } from '@lit/context';
import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/components/avatar/avatar.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
import '@shoelace-style/shoelace/dist/components/divider/divider.js';
import '@shoelace-style/shoelace/dist/components/option/option.js';
import '@shoelace-style/shoelace/dist/components/select/select.js';
import '@shoelace-style/shoelace/dist/components/switch/switch.js';

import { userInfoContext } from '../contexts/userInfoContext';
import { updateViewEvent } from '../contexts/viewContext';
import { sharedStyles } from '../styles/shared-styles';
import { UserInfo } from '../types/userInfo';
import { View } from '../types/view';
import { auth } from '../utils/firebase';

/**
 * @fires updateView
 */
@customElement('app-user-view')
export class AppUserView extends LitElement {
  static styles = [
    sharedStyles,
    css`
      .container {
        display: flex;
        flex-direction: column;
        height: calc(100vh - 60px);
        background: var(--app-bg);
        overflow-y: auto;
        padding: 0;
      }

      .header {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 2rem 1rem 1rem;
        background: var(--header-bg);
        border-radius: 0 0 2rem 2rem;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        margin-bottom: 1rem;
      }

      .user-avatar {
        width: 80px;
        height: 80px;
        font-size: 2rem;
        margin-bottom: 1rem;
      }

      .user-name {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--color-black);
        margin-bottom: 0.5rem;
      }

      .user-email {
        font-size: 0.9rem;
        color: var(--color-black-medium);
      }

      .settings-content {
        flex: 1;
        padding: 0 1rem 2rem;
        max-width: 500px;
        width: 100%;
        margin: 0 auto;
      }

      .settings-card {
        margin-top: 1rem;
        margin-bottom: 1rem;
        border-radius: var(--border-radius-medium);
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
        border: none;
      }

      .settings-card::part(body) {
        padding: 1.5rem;
      }

      .setting-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 0;
        border-bottom: 1px solid var(--color-primary-light);
      }

      .setting-item:last-child {
        border-bottom: none;
      }

      .setting-info {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex: 1;
      }

      .setting-icon {
        width: 24px;
        height: 24px;
        color: var(--color-primary);
      }

      .setting-details {
        flex: 1;
      }

      .setting-title {
        font-weight: 600;
        color: var(--color-black);
        margin-bottom: 0.25rem;
      }

      .setting-description {
        font-size: 0.85rem;
        color: var(--color-black-medium);
        line-height: 1.3;
      }

      .setting-control {
        margin-left: 1rem;
      }

      .language-select {
        min-width: 120px;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 1rem;
        margin-bottom: 1rem;
      }

      .stat-item {
        text-align: center;
        padding: 1rem;
        background: var(--color-primary-light);
        border-radius: var(--border-radius-small);
      }

      .stat-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--color-primary);
        margin-bottom: 0.25rem;
      }

      .stat-label {
        font-size: 0.8rem;
        color: var(--color-black-medium);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .danger-zone {
        padding-top: 1rem;
        border-top: 2px solid var(--color-primary-light);
      }

      .signout-button {
        width: 100%;
        margin-top: 1rem;
      }

      .signout-button::part(base) {
        background: #b54b3a; /* earthy danger */
        border-color: #b54b3a;
        color: white;
      }

      .signout-button::part(base):hover {
        background: #9e3c2d;
        border-color: #8a3427;
      }

      .attribution-card .setting-details a {
        font-size: 0.8rem;
        color: var(--color-primary);
        text-decoration: none;
      }

      .attribution-card .setting-details a:hover {
        text-decoration: underline;
      }

      .contact-card .setting-details a {
        font-size: 0.9rem;
        color: var(--color-primary);
        text-decoration: none;
      }

      .contact-card .setting-details a:hover {
        text-decoration: underline;
      }

      @media (max-width: 480px) {
        .header {
          padding: 1.5rem 1rem 1rem;
        }

        .user-avatar {
          width: 70px;
          height: 70px;
          font-size: 1.8rem;
        }

        .user-name {
          font-size: 1.3rem;
        }

        .settings-content {
          padding: 0 0.5rem 1rem;
        }

        .setting-item {
          padding: 0.75rem 0;
        }

        .setting-info {
          gap: 0.75rem;
        }

        .stats-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
    `,
  ];

  @consume({ context: userInfoContext, subscribe: true })
  @property({ attribute: false })
  userInfo: UserInfo | null = null;

  @state()
  private selectedLanguage = 'en';

  @state()
  private notificationsEnabled = true;

  @state()
  private darkMode = false;

  async signOut() {
    await auth.signOut();
    updateViewEvent(this, View.SIGNIN_VIEW);
  }

  private handleLanguageChange(event: CustomEvent) {
    this.selectedLanguage = event.detail.item.value;
    localStorage.setItem('puppyland-language', this.selectedLanguage);
  }

  private handleNotificationToggle(event: CustomEvent) {
    this.notificationsEnabled = (event.target as any).checked;
    localStorage.setItem('puppyland-notifications', this.notificationsEnabled.toString());
  }

  private handleDarkModeToggle(event: CustomEvent) {
    this.darkMode = (event.target as any).checked;
    localStorage.setItem('puppyland-darkmode', this.darkMode.toString());
  }

  connectedCallback() {
    super.connectedCallback();
    this.selectedLanguage = localStorage.getItem('puppyland-language') || 'en';
    this.notificationsEnabled = localStorage.getItem('puppyland-notifications') !== 'false';
    this.darkMode = localStorage.getItem('puppyland-darkmode') === 'true';
  }

  private renderAppSettings() {
    return html`
      <sl-card class="settings-card">
        <div slot="header">
          <strong>App Settings</strong>
        </div>

        <!-- Language Setting -->
        <div class="setting-item">
          <div class="setting-info">
            <sl-icon name="globe" class="setting-icon"></sl-icon>
            <div class="setting-details">
              <div class="setting-title">Language</div>
              <div class="setting-description">Choose your preferred language</div>
            </div>
          </div>
          <div class="setting-control">
            <sl-select
              class="language-select"
              value=${this.selectedLanguage}
              @sl-change=${this.handleLanguageChange}
              size="small"
            >
              <sl-option value="en">English</sl-option>
              <sl-option value="es">Spanish</sl-option>
              <sl-option value="fr">French</sl-option>
              <sl-option value="de">German</sl-option>
              <sl-option value="it">Italian</sl-option>
              <sl-option value="pt">Portuguese</sl-option>
              <sl-option value="pl">Polish</sl-option>
            </sl-select>
          </div>
        </div>

        <!-- Notifications Setting -->
        <div class="setting-item">
          <div class="setting-info">
            <sl-icon name="bell" class="setting-icon"></sl-icon>
            <div class="setting-details">
              <div class="setting-title">Push Notifications</div>
              <div class="setting-description">Get notified about game events</div>
            </div>
          </div>
          <div class="setting-control">
            <sl-switch
              ?checked=${this.notificationsEnabled}
              @sl-change=${this.handleNotificationToggle}
            >
            </sl-switch>
          </div>
        </div>

        <!-- Dark Mode Setting -->
        <div class="setting-item">
          <div class="setting-info">
            <sl-icon name="moon" class="setting-icon"></sl-icon>
            <div class="setting-details">
              <div class="setting-title">Dark Mode</div>
              <div class="setting-description">Switch to dark theme</div>
            </div>
          </div>
          <div class="setting-control">
            <sl-switch ?checked=${this.darkMode} @sl-change=${this.handleDarkModeToggle}>
            </sl-switch>
          </div>
        </div>
      </sl-card>
    `;
  }

  private renderDangerZone() {
    return html`
      <div class="danger-zone">
        <sl-button class="signout-button" variant="danger" size="large" @click=${this.signOut}>
          <sl-icon slot="prefix" name="box-arrow-right"></sl-icon>
          Sign Out
        </sl-button>
      </div>
    `;
  }

  private renderContactUs() {
    return html`
      <sl-card class="settings-card contact-card">
        <div slot="header">
          <strong>Contact Us</strong>
        </div>
        <div class="setting-item">
          <div class="setting-info">
            <sl-icon name="envelope" class="setting-icon"></sl-icon>
            <div class="setting-details">
              <div class="setting-description">
                For any inquiries, please email us at:
                <a href="mailto:puppyhousedev@gmail.com">puppyhousedev@gmail.com </a>
              </div>
            </div>
          </div>
        </div>
      </sl-card>
    `;
  }

  private renderAttribution() {
    return html`
      <sl-card class="settings-card attribution-card">
        <div slot="header">
          <strong>Attributions</strong>
        </div>
        <div class="setting-item">
          <div class="setting-info">
            <sl-icon name="house" class="setting-icon"></sl-icon>
            <div class="setting-details">
              <a
                href="https://www.flaticon.com/free-icons/dog-house"
                title="dog house icons"
                target="_blank"
                >Dog house icons created by Freepik - Flaticon</a
              >
            </div>
          </div>
        </div>
        <div class="setting-item">
          <div class="setting-info">
            <sl-icon name="lightning-charge" class="setting-icon"></sl-icon>
            <div class="setting-details">
              <a
                href="https://www.flaticon.com/free-icons/energy-drink"
                title="energy drink icons"
                target="_blank"
                >Energy drink icons created by Freepik - Flaticon</a
              >
            </div>
          </div>
        </div>
        <div class="setting-item">
          <div class="setting-info">
            <sl-icon name="tools" class="setting-icon"></sl-icon>
            <div class="setting-details">
              <a
                href="https://www.flaticon.com/free-icons/toolkit"
                title="toolkit icons"
                target="_blank"
                >Toolkit icons created by Freepik - Flaticon</a
              >
            </div>
          </div>
        </div>
      </sl-card>
    `;
  }

  render() {
    const userInitials = this.userInfo?.name.slice(0, 2).toUpperCase() ?? 'XX';
    const userName = this.userInfo?.name ?? 'Unknown User';
    const userEmail = this.userInfo?.email ?? 'No email';

    return html`
      <div class="container">
        <!-- Header Section -->
        <div class="header">
          <sl-avatar class="user-avatar" initials=${userInitials} label="User Avatar"> </sl-avatar>
          <div class="user-name">${userName}</div>
          <div class="user-email">${userEmail}</div>
        </div>

        <!-- Settings Content -->
        <div class="settings-content">
          ${this.renderAppSettings()} ${this.renderDangerZone()} ${this.renderContactUs()}
          ${this.renderAttribution()}
        </div>
      </div>
    `;
  }
}
