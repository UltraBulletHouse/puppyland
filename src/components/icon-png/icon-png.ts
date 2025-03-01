import { css } from 'lit';
import { LitElement, html } from 'lit-element';
import { customElement, property } from 'lit/decorators.js';

import { sharedStyles } from '../../styles/shared-styles';
import { getImagePngUrl } from '../../utils/getImage';

@customElement('icon-png-badge')
export class IconPngBadge extends LitElement {
  static styles = [
    sharedStyles,
    css`
      .image-wrapper {
        position: relative;
      }
      .badge {
        position: absolute;
        right: -4px;
        top: -6px;
        font-size: 13px;
        padding: 1px 4px 0;
        background: var(--color-primary);
        border-radius: var(--border-radius-circle);
        color: var(--color-white);
      }
      .image {
        width: var(--icon-png-badge-width);
      }
    `,
  ];

  @property({ type: String })
  name: string = '';

  @property({ type: String })
  badge?: string;

  render() {
    return html`<div class="image-wrapper">
      <div class="badge">${this.badge}</div>
      <img class="image" src="${getImagePngUrl(this.name)}" />
    </div>`;
  }
}
