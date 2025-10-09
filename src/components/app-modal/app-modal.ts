import { LitElement, TemplateResult, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('app-modal')
export class AppModal extends LitElement {
  @property({ type: Object })
  element: TemplateResult<1> = {} as TemplateResult<1>;

  @property({ type: Boolean })
  open: boolean = false;

  @property({ type: Boolean, attribute: 'no-backdrop' })
  noBackdrop: boolean = false;

  protected createRenderRoot() {
    return document.body;
  }

  render() {
    const containerClasses = this.noBackdrop
      ? 'modal-container modal-container--plain'
      : 'modal-container';
    const contentClasses = this.noBackdrop ? 'modal-content modal-content--plain' : 'modal-content';

    return this.open
      ? html`<div>
          <style>
            .modal-container {
              display: flex;
              justify-content: space-evenly;
              align-items: flex-start;
              position: fixed;
              top: 0;
              left: 0;
              height: 100vh;
              width: 100vw;
              background: #0000003e;
              z-index: 100050;
              padding: 20px 20px 80px 20px;
              box-sizing: border-box;
            }
            .modal-container.modal-container--plain {
              justify-content: center;
              align-items: center;
              padding: 0;
              background: transparent;
            }
            .modal-content {
              width: 100%;
              height: 100%;
              background: var(--color-surface-strong);
              border: 1px solid var(--color-surface-border);
              border-radius: var(--border-radius-medium);
              animation: blowUpModal 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
            }
            .modal-content.modal-content--plain {
              width: auto;
              height: auto;
              background: transparent;
              border: none;
              animation: none;
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
          <div class="${containerClasses}">
            <div class="${contentClasses}">${this.element}</div>
          </div>
        </div> `
      : null;
  }
}
