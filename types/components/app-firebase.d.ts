import * as firebaseui from 'firebaseui';
import { LitElement } from 'lit';

export declare class AppFirebase extends LitElement {
  static styles: import('lit').CSSResult[];
  stylesLoaded: boolean;
  uiFirebase: firebaseui.auth.AuthUI;
  constructor();
  onLoadStyles(): void;
  signin(): Promise<void>;
  signout(): void;
  connectedCallback(): void;
  render(): import('lit-html').TemplateResult<1>;
}
