import { LitElement } from 'lit';

import { View } from '../types/view';

export declare class AppFooter extends LitElement {
  static styles: import('lit').CSSResult[];
  view: View;
  changeView(view: View): void;
  render(): import('lit-html').TemplateResult<1>;
}
