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
        align-items: center;
        flex-direction: column;
        height: 100%;
        padding-top: 100px;
        background: var(--color-white);
      }
      #initials {
        margin-bottom: 40px;
      }
      #attribution-container {
        padding-top: 50px;
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

        <div id="attribution-container">
          <h4>Attribution:</h4>
          <div>
            <a
              href="https://www.freepik.com/icon/first-aid-kit_2679336#fromView=search&page=2&position=53&uuid=444a2b3d-808a-48ed-ba83-8652ce216897"
              >Icon by Freepik</a
            >
          </div>
        </div>
      </div>
    `;
  }
}
