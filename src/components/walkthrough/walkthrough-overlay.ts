import { LitElement, css, html, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import '../icon-svg/icon-svg-badge';
import { ta, t } from '../../i18n';

@customElement('walkthrough-overlay')
export class WalkthroughOverlay extends LitElement {
  static styles = [
    css`
      :host {
        position: absolute;
        inset: 0;
        display: none;
        pointer-events: none;
        z-index: 3000;
      }
      :host([open]) {
        display: block;
        pointer-events: auto;
      }

      .backdrop {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.35);
        backdrop-filter: blur(1px);
      }

      .panel {
        position: absolute;
        left: 12px;
        right: 12px;
        bottom: calc(28px + env(safe-area-inset-bottom, 0px));
        border-radius: 16px;
        background: var(--color-surface-strong);
        border: 1px solid var(--color-surface-border);
        box-shadow: 0 8px 40px rgba(0, 0, 0, 0.25);
        max-height: calc(100% - 24px);
        display: grid;
        grid-template-rows: auto 1fr auto;
        overflow: hidden;
      }

      .header {
        padding: 14px 16px 8px;
        border-bottom: 1px solid var(--color-surface-border);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .title {
        font-size: 16px;
        font-weight: 800;
      }

      .content {
        display: grid;
        grid-template-columns: 1fr;
        gap: 12px;
        padding: 12px 16px;
        overflow: auto;
      }

      .text {
        display: grid;
        gap: 8px;
      }

      .desc {
        color: var(--color-text);
        font-size: 14px;
        line-height: 1.35;
      }

      .hint {
        color: var(--color-muted);
        font-size: 13px;
      }

      .instructions {
        margin: 6px 0 0;
        padding-left: 18px;
        color: var(--color-text);
        font-size: 13px;
      }
      .instructions li { margin: 4px 0; }

      .screenshot {
        border-radius: 12px;
        border: 1px solid var(--color-surface-border);
        background: var(--color-surface);
        padding: 10px;
      }

      .phone-frame {
        border-radius: 18px;
        background: #0b0f0c;
        border: 2px solid #181d19;
        padding: 8px;
      }

      .phone-screen {
        border-radius: 14px;
        background: linear-gradient(160deg, #e9f1ea, #dfe8e0);
        border: 1px solid #c8d1c9;
        overflow: hidden;
      }

      .status-bar {
        height: 20px;
        background: rgba(255, 255, 255, 0.85);
        border-bottom: 1px solid #d3d9d4;
      }

      .phone-content {
        padding: 10px;
        background: #f7faf8;
        min-height: 160px;
      }

      .actions {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        padding: 10px 12px 12px;
        border-top: 1px solid var(--color-surface-border);
      }

      .btn {
        appearance: none;
        border: 1px solid var(--color-primary-medium);
        background: color-mix(in srgb, var(--color-primary) 8%, #fff);
        color: var(--color-primary);
        font-weight: 700;
        padding: 10px 14px;
        border-radius: 12px;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
      }

      .btn.secondary {
        border-color: var(--color-muted);
        color: var(--color-muted);
        background: color-mix(in srgb, var(--color-muted) 6%, #fff);
      }

      .btn:disabled {
        opacity: 0.6;
        cursor: default;
      }

      .close-btn {
        appearance: none;
        border: none;
        background: transparent;
        color: var(--color-muted);
        font-size: 18px;
        cursor: pointer;
        padding: 4px 8px;
      }

      /* Tiny layout tweak for larger screens */
      @media (min-width: 560px) and (min-height: 720px) {
        .panel {
          left: 24px;
          right: 24px;
          bottom: 18px;
        }
        .content {
          grid-template-columns: 1fr 1fr;
        }
        .phone-content { min-height: 240px; }
      }

      /* Simple primitives used inside mock screenshots */
      .map-mock {
        position: relative;
        height: 160px;
        border-radius: 12px;
        background: repeating-linear-gradient(
          45deg,
          #dfe8e0,
          #dfe8e0 10px,
          #e9f1ea 10px,
          #e9f1ea 20px
        );
        border: 1px solid #c8d1c9;
        overflow: hidden;
      }
      .map-pin { position: absolute; }
      .map-pin.own { left: 18%; top: 38%; }
      .map-pin.enemy { left: 62%; top: 52%; }
      .levelup-popup {
        position: absolute;
        right: 8px;
        top: 8px;
        background: white;
        color: #1a1d1a;
        font-size: 12px;
        border-radius: 8px;
        padding: 6px 8px;
        border: 1px solid #d3d9d4;
        box-shadow: 0 4px 10px rgba(0,0,0,0.08);
      }

      .energy-bar {
        height: 16px;
        border-radius: 10px;
        border: 1px solid #c8d1c9;
        background: #fff;
        overflow: hidden;
      }
      .energy-fill {
        height: 100%;
        width: var(--energy, 75%);
        background: linear-gradient(90deg, #86e1ff, #6bd6f9);
      }
      .energy-note { font-size: 12px; color: #425247; }
      .dh-note { font-size: 11px; color: #607064; }

      .list {
        display: grid;
        gap: 6px;
      }
      .list-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 8px 10px;
        border: 1px solid #d3d9d4;
        background: white;
        border-radius: 10px;
      }
      .rank { font-weight: 800; margin-right: 8px; }
      .name { flex: 1; }
      .score { color: #425247; font-weight: 700; }
    `,
  ];

  @property({ type: Boolean, reflect: true })
  open = false;

  @state()
  step = 0;

  private steps: Array<{ title: string; desc: string; hint: string; howto: string[]; shot: () => TemplateResult }>
    = [
      {
        title: t('walkthrough.steps.gainingExperience.title'),
        desc: t('walkthrough.steps.gainingExperience.desc'),
        hint: t('walkthrough.steps.gainingExperience.hint'),
        howto: ta<string[]>('walkthrough.steps.gainingExperience.howto') || [],
        shot: () => html`
          <div class="phone-frame">
            <div class="phone-screen">
              <div class="status-bar"></div>
              <div class="phone-content">
                <div class="map-mock">
                  <span class="map-pin own"><icon-svg-badge name="doghouse-plus"></icon-svg-badge></span>
                  <span class="map-pin enemy"><icon-svg-badge name="doghouse-star"></icon-svg-badge></span>
                  <div class="levelup-popup">
                    <strong>Level Up!</strong>
                    <div>+1 skill point</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `,
      },
      {
        title: t('walkthrough.steps.energyMechanics.title'),
        desc: t('walkthrough.steps.energyMechanics.desc'),
        hint: t('walkthrough.steps.energyMechanics.hint'),
        howto: ta<string[]>('walkthrough.steps.energyMechanics.howto') || [],
        shot: () => html`
          <div class="phone-frame">
            <div class="phone-screen">
              <div class="status-bar"></div>
              <div class="phone-content" style="display:grid; gap:10px;">
                <div class="energy-bar"><div class="energy-fill" style="--energy:58%"></div></div>
                <div class="dh-note">-2 energy used to Attack • -1 to Heal</div>
                <div class="energy-note">+1 energy/day for each doghouse you own</div>
              </div>
            </div>
          </div>
        `,
      },
      {
        title: t('walkthrough.steps.dailyQuests.title'),
        desc: t('walkthrough.steps.dailyQuests.desc'),
        hint: t('walkthrough.steps.dailyQuests.hint'),
        howto: ta<string[]>('walkthrough.steps.dailyQuests.howto') || [],
        shot: () => html`
          <div class="phone-frame">
            <div class="phone-screen">
              <div class="status-bar"></div>
              <div class="phone-content" style="display:grid; gap:12px;">
                <div class="list">
                  <div class="list-item">
                    <span>Place 1 doghouse</span>
                    <span class="score">+50</span>
                  </div>
                  <div class="list-item">
                    <span>Attack an enemy doghouse</span>
                    <span class="score">+40</span>
                  </div>
                  <div class="list-item">
                    <span>Heal your doghouse</span>
                    <span class="score">+25</span>
                  </div>
                </div>
                <div class="list">
                  <div class="list-item">
                    <span class="rank">1</span>
                    <span class="name">AlphaPup</span>
                    <span class="score">1,240</span>
                  </div>
                  <div class="list-item">
                    <span class="rank">2</span>
                    <span class="name">DoggoMaster</span>
                    <span class="score">1,060</span>
                  </div>
                  <div class="list-item">
                    <span class="rank">3</span>
                    <span class="name">ShibaPro</span>
                    <span class="score">990</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `,
      },
      {
        title: t('walkthrough.steps.premiumShop.title'),
        desc: t('walkthrough.steps.premiumShop.desc'),
        hint: t('walkthrough.steps.premiumShop.hint'),
        howto: ta<string[]>('walkthrough.steps.premiumShop.howto') || [],
        shot: () => html`
          <div class="phone-frame">
            <div class="phone-screen">
              <div class="status-bar"></div>
              <div class="phone-content" style="display:grid; gap:12px;">
                <div class="list-item">
                  <div style="display:flex; align-items:center; gap:8px;">
                    <icon-svg-badge name="doghouse-star"></icon-svg-badge>
                    <div>
                      <div><strong>Premium</strong></div>
                      <div class="dh-note">Premium dog icons • Unlimited renames</div>
                    </div>
                  </div>
                  <span class="score">Buy</span>
                </div>
                <div class="list">
                  <div class="list-item">
                    <div style="display:flex; align-items:center; gap:8px;">
                      <icon-svg-badge name="doghouse-plus"></icon-svg-badge>
                      <span>Extra doghouse</span>
                    </div>
                    <span class="score">Snacks</span>
                  </div>
                  <div class="list-item">
                    <div style="display:flex; align-items:center; gap:8px;">
                      <icon-svg-badge name="dogface-pencil"></icon-svg-badge>
                      <span>Rename token</span>
                    </div>
                    <span class="score">Snacks</span>
                  </div>
                  <div class="list-item">
                    <div style="display:flex; align-items:center; gap:8px;">
                      <icon-svg-badge name="doghouse-hammer"></icon-svg-badge>
                      <span>Repair pack</span>
                    </div>
                    <span class="score">Snacks</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `,
      },
    ];

  private next = () => {
    if (this.step < this.steps.length - 1) this.step += 1;
  };
  private prev = () => {
    if (this.step > 0) this.step -= 1;
  };
  private close = () => {
    this.dispatchEvent(new CustomEvent('close'));
  };

  render() {
    if (!this.open) return null;

    const step = this.steps[this.step];
    return html`
      <div class="backdrop" @click=${this.close}></div>
      <div class="panel" @click=${(e: Event) => e.stopPropagation()}>
        <div class="header">
          <div class="title">${step.title}</div>
          <button class="close-btn" @click=${this.close} aria-label="Close">✕</button>
        </div>
        <div class="content">
          <div class="text">
            <div class="desc">${step.desc}</div>
            <div class="hint">${step.hint}</div>
            ${step.howto?.length
              ? html`<ol class="instructions">${step.howto.map((i) => html`<li>${i}</li>`)}</ol>`
              : ''}
          </div>
          <div class="screenshot">${step.shot()}</div>
        </div>
        <div class="actions">
          <button class="btn secondary" @click=${this.prev} ?disabled=${this.step === 0}>${t('walkthrough.buttons.back')}</button>
          ${this.step < this.steps.length - 1
            ? html`<button class="btn" @click=${this.next}>${t('walkthrough.buttons.next')}</button>`
            : html`<button class="btn" @click=${this.close}>${t('walkthrough.buttons.done')}</button>`}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'walkthrough-overlay': WalkthroughOverlay;
  }
}
