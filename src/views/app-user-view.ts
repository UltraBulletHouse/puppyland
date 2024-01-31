import { consume } from '@lit/context';
import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/components/avatar/avatar.js';

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
      #container {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        height: 100%;
      }
      #initials {
        margin-bottom: 40px;
      }
    `,
  ];

  @consume({ context: userInfoContext, subscribe: true })
  @property({ attribute: false })
  userInfo: UserInfo | null = null;

  async signOut() {
    await auth.signOut();
    updateViewEvent(this, View.SIGNIN_VIEW);
  }

  render() {
    const userInitials = this.userInfo?.name.slice(0, 2) ?? 'XX';

    return html`
      <div id="container">
        <sl-avatar id="initials" initials=${userInitials} label="Avatar"></sl-avatar>
        <sl-button @click=${this.signOut}>SignOut</sl-button>
      </div>
    `;
  }
}
