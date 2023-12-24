import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';

import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';

@customElement('app-modal')
export class AppModal extends LitElement {
  @state()
  isOpen: boolean = false;

  openModal() {
    console.log('OPEN MODAL');
    this.isOpen = true;
  }

  closeModal() {
    console.log('CLOSE MODAL');
    this.isOpen = false;
  }

  firstUpdated() {
    // const dialog = document.getElementById('dialog');
    // console.log(dialog);
    // (dialog as SlDialog).show();
  }

  protected createRenderRoot() {
    this.attachShadow({ mode: 'open' });

    return document.body;
  }

  render() {
    return html`
      ${when(
        this.isOpen,
        () =>
          html`<div>
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
                background: #00000029;
                z-index: 1001;
                padding: 20px;
                box-sizing: border-box;
              }
              #modal-content {
                width: 100%;
                height: 100%;
                background: #fff;
                border-radius: 4px;
                padding: 20px;
                animation: blowUpModal 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
              }
              #modal-header {
                display: flex;
                justify-content: end;
              }
              #close-icon {
                padding: 2px;
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
              <div id="modal-content">
                <div id="modal-header">
                  <div id="close-icon">
                    <sl-icon name="x-lg" @click=${this.closeModal}></sl-icon>
                  </div>
                </div>
                ${this.children}
              </div>
            </div>
          </div>`,
        () => null
      )}
    `;
  }
}
