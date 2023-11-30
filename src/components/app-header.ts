import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { Ref, createRef, ref } from 'lit/directives/ref.js';

import '@shoelace-style/shoelace/dist/components/button/button.js';
import SlDrawer from '@shoelace-style/shoelace/dist/components/drawer/drawer.js';
import '@shoelace-style/shoelace/dist/components/drawer/drawer.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';

import '../components/app-header';

@customElement('app-header')
export class AppHeader extends LitElement {
  static styles = css`
    header {
      height: 40px;
    }
    #menu-btn::part(base) {
      font-size: 30px;
      color: var(--sl-color-violet-100);
    }
    #drawer::host {
      width: 80%;
    }
  `;

  inputRef: Ref<SlDrawer> = createRef();

  openMenu() {
    const btn = this.inputRef.value!;
    btn.show();
  }

  render() {
    return html`
      <header>
        <sl-drawer style="--size: 80vw;" label="Drawer" class="drawer" ${ref(this.inputRef)}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          <sl-button slot="footer" variant="primary">Close</sl-button>
        </sl-drawer>

        <sl-icon-button
          id="menu-btn"
          name="list"
          label="Menu"
          @click=${this.openMenu}
        ></sl-icon-button>
      </header>
    `;
  }
}
