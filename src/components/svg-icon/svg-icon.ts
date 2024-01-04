import { TemplateResult, css } from 'lit';
import { LitElement, html } from 'lit-element';
import { customElement, property, state } from 'lit/decorators.js';

import { sharedStyles } from '../../styles/shared-styles';

@customElement('svg-icon')
export class SvgIcon extends LitElement {
  static styles = [
    sharedStyles,
    css`
      .svg-wrapper {
        display: inline-block;
        height: 1em;
        width: 1em;
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
      const svgIcon = await import(`../../assets/iconsTemplates/${this.name}.ts`);
      this.svgElement = svgIcon[this.name];
    } catch (error) {
      console.error('Error loading SVG:', error);
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.loadSVG();
  }

  render() {
    if (!this.svgElement) return;
    return html`<span class="svg-wrapper">${this.svgElement}</span>`;
  }
}
