import { TemplateResult, css } from 'lit';
import { LitElement, html } from 'lit-element';
import { customElement, property, state } from 'lit/decorators.js';

import { sharedStyles } from '../../styles/shared-styles';

@customElement('svg-icon-button')
export class SvgIcon extends LitElement {
  static styles = [
    sharedStyles,
    css`
      .svg-wrapper {
        display: flex;
        align-items: center;
        height: 1em;
        width: 1em;
        box-sizing: content-box !important;

        background: none;
        border: none;
        font-size: inherit;
        color: inherit;
        cursor: pointer;
        appearance: none;
        padding: var(--sl-spacing-x-small);
        transition: var(--sl-transition-x-fast) color;
      }
      .svg-wrapper svg {
        height: 100%;
        width: 100%;
      }
    `,
  ];

  @property({ type: String })
  name?: string;

  @state()
  svgElement?: TemplateResult<1>;

  async loadSVG() {
    try {
      if (!this.name) {
        throw new Error('"name" is not defined for svg-icon element');
      }
      // Try template export first
      try {
        const svgIcon = await import(`../../assets/iconsTemplates/${this.name}.ts`);
        this.svgElement = svgIcon[this.name];
        if (this.svgElement) return;
      } catch {}

      // Fallback to raw SVG from assets/icons
      try {
        const { getRawSvgIcon } = await import('../../assets/iconsTemplates/rawSvgIcon');
        this.svgElement = await getRawSvgIcon(this.name);
        if (this.svgElement) return;
      } catch {}

      throw new Error(`SVG icon not found: ${this.name}`);
    } catch (error) {
      console.error('Error loading SVG:', error);
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.loadSVG();
  }

  render() {
    return html`<button class="svg-wrapper">${this.svgElement}</button>`;
  }
}
