import { LitElement, TemplateResult, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('app-modal')
export class AppModal extends LitElement {
  @property({ type: Object })
  element?: TemplateResult<1>;

  @property({ type: Boolean })
  open: boolean = false;

  protected createRenderRoot() {
    return document.body;
  }

  render() {
    return this.open
      ? html`<div>
          <style>
            #modal-container {
              display: flex;
              justify-content: space-evenly;
              align-items: center;
              position: fixed;
              top: 0;
              left: 0;
              height: 100vh;
              width: 100vw;
              background: #0000003e;
              z-index: 1001;
              padding: 20px;
              box-sizing: border-box;
            }
            #modal-content {
              width: 100%;
              height: 100%;
              background: var(--color-white);
              border: 1px solid var(--color-primary-medium);
              border-radius: var(--border-radius-medium);
              padding: 20px;
              animation: blowUpModal 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
            }
            @keyframes blowUpModal {
              0% {
                transform: scale(0);
              }
              100% {
                transform: scale(1);
              }
            }
          </style>
          <div id="modal-container">
            <div id="modal-content">${this.element}</div>
          </div>
        </div> `
      : null;
  }
}
