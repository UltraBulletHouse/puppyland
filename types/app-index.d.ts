import { LitElement } from 'lit';

import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';

import './components/app-footer';
import './styles/global.css';
import { UserInfo } from './types/userInfo';
import { View } from './types/view';

export declare class AppIndex extends LitElement {
  static styles: import('lit').CSSResult[];
  view: View;
  accessToken: string | null;
  userInfo: UserInfo | null;
  changeView(event: CustomEvent<View>): void;
  firstUpdated(): void;
  renderContent(view: View): import('lit-html').TemplateResult<1>;
  render(): import('lit-html').TemplateResult<1>;
}
