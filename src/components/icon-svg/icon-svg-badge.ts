import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { sharedStyles } from '../../styles/shared-styles';
import { getImagePngUrl } from '../../utils/getImage';

import './svg-icon';

type IconBadgeFormat = 'svg' | 'png';

@customElement('icon-svg-badge')
export class IconSvgBadge extends LitElement {
  static styles = [
    sharedStyles,
    css`
      :host {
        display: inline-flex;
      }

      .image-wrapper {
        position: relative;
        display: inline-flex;
      }

      .badge {
        position: absolute;
        right: -14px;
        top: -6px;
        font-size: 13px;
        padding: 1px 4px 0;
        background: var(--color-primary);
        border-radius: var(--border-radius-circle);
        color: var(--color-white);
      }

      .icon {
        width: var(--icon-svg-badge-width, var(--icon-png-badge-width, 32px));
        height: var(--icon-svg-badge-height, var(--icon-png-badge-height, 32px));
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .icon img {
        width: 100%;
        height: 100%;
      }

      .icon svg-icon {
        width: 100%;
        height: 100%;
      }
    `,
  ];

  @property({ type: String })
  name: string = '';

  @property({ type: String })
  badge?: string;

  @property({ type: String })
  format: IconBadgeFormat = 'svg';

  render() {
    const hasBadge = this.badge !== undefined && this.badge !== null && this.badge !== '';
    const format = this.format === 'png' ? 'png' : 'svg';

    return html`<div class="image-wrapper">
      ${hasBadge ? html`<div class="badge">${this.badge}</div>` : ''}
      <div class="icon">
        ${format === 'svg'
          ? html`<svg-icon .name=${this.name}></svg-icon>`
          : html`<img
              src="${getImagePngUrl(this.name)}"
              alt="icon ${this.name}"
              loading="lazy"
              decoding="async"
              fetchpriority="low"
              @contextmenu=${(e: Event) => e.preventDefault()}
            />`}
      </div>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'icon-svg-badge': IconSvgBadge;
  }
}
