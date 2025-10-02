import { TemplateResult, css } from 'lit';
import { LitElement, html } from 'lit-element';
import { customElement, property, state } from 'lit/decorators.js';

import { sharedStyles } from '../../styles/shared-styles';

@customElement('svg-icon')
export class SvgIcon extends LitElement {
  static styles = [
    sharedStyles,
    css`
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .svg-wrapper {
        display: inline-flex;
        justify-content: center;
        align-items: center;
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
      this.svgElement = undefined;
      // First try a named template export from iconsTemplates/{name}.ts
      try {
        const svgIcon = await import(`../../assets/iconsTemplates/${this.name}.ts`);
        this.svgElement = svgIcon[this.name];
        if (this.svgElement) return;
      } catch {}

      // Fallback: load raw SVG by filename from assets/icons
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

  updated(changed: Map<string, unknown>) {
    if (changed.has('name') && changed.get('name') !== this.name) {
      this.loadSVG();
    }
  }

  render() {
    if (!this.svgElement) return;
    return html`<span class="svg-wrapper">${this.svgElement}</span>`;
  }
}
