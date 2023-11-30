import { LitElement } from 'lit';
import { Ref } from 'lit/directives/ref.js';

import '@shoelace-style/shoelace/dist/components/button/button.js';
import SlDrawer from '@shoelace-style/shoelace/dist/components/drawer/drawer.js';
import '@shoelace-style/shoelace/dist/components/drawer/drawer.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';

import '../components/app-header';

export declare class AppHeader extends LitElement {
  static styles: import('lit').CSSResult;
  inputRef: Ref<SlDrawer>;
  openMenu(): void;
  render(): import('lit-html').TemplateResult<1>;
}
