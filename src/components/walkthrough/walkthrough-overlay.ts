import { LitElement, TemplateResult, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { t, ta } from '../../i18n';
import '../icon-svg/icon-svg-badge';

@customElement('walkthrough-overlay')
export class WalkthroughOverlay extends LitElement {
  static styles = [
    css`
      :host {
        position: fixed;
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
        left: 8px;
        right: 8px;
        bottom: calc(20px + env(safe-area-inset-bottom, 0px));
        border-radius: 12px;
        background: var(--color-surface-strong);
        border: 1px solid var(--color-surface-border);
        box-shadow: 0 6px 28px rgba(0, 0, 0, 0.22);
        max-height: calc(100vh - 20px - env(safe-area-inset-bottom, 0px));
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
        gap: 8px;
        padding: 10px 12px;
        overflow: auto;
        align-items: stretch;
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
      .instructions li {
        margin: 4px 0;
      }

      .screenshot {
        border-radius: 10px;
        border: 1px solid var(--color-surface-border);
        background: var(--color-surface);
        padding: 6px;
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
        padding: 8px;
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
        .phone-content {
          min-height: 240px;
        }
      }

      /* Simple primitives used inside mock screenshots */
      .map-mock {
        position: relative;
        height: 110px;
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
      .map-pin {
        position: absolute;
      }
      .mini-map {
        position: relative;
      }
      .zoom-stack {
        position: absolute;
        left: 8px;
        top: 8px;
        display: grid;
        gap: 4px;
      }
      .zoom-btn {
        height: 22px;
        width: 22px;
        border-radius: 8px;
        background: #fff;
        border: 1px solid #d3d9d4;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        color: var(--color-black);
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
      }
      .energy-chip {
        position: absolute;
        right: 8px;
        top: 8px;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        background: var(--lav-100);
        border: 1px solid var(--lav);
        color: var(--lav);
        border-radius: 999px;
        padding: 2px 8px;
        font-weight: 800;
        font-size: 11px;
      }
      .add-mini {
        position: absolute;
        left: 8px;
        bottom: 8px;
      }
      .add-mini::part(base) {
        height: 28px;
        width: 28px;
        border-radius: 12px;
        background: #fff;
        border: 1px solid var(--wood);
        color: var(--wood);
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
      }
      .count-mini::part(base) {
        position: absolute;
        right: -8px;
        top: -8px;
        background: var(--wood);
        color: #fff;
      }
      .chips {
        display: flex;
        gap: 6px;
        margin-top: 8px;
      }
      .chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        background: var(--color-surface);
        border: 1px solid var(--color-surface-border);
        border-radius: 999px;
        padding: 2px 8px;
        font-size: 11px;
      }
      .map-pin.own {
        left: 18%;
        top: 38%;
      }
      .map-pin.enemy {
        left: 62%;
        top: 52%;
      }
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
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
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
      .energy-note {
        font-size: 12px;
        color: #425247;
      }
      .dh-note {
        font-size: 11px;
        color: #607064;
      }

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
      .rank {
        font-weight: 800;
        margin-right: 6px;
        font-size: 12px;
      }
      .name {
        flex: 1;
      }
      .score {
        color: #425247;
        font-weight: 700;
      }
    `,
  ];

  @property({ type: Boolean, reflect: true })
  open = false;

  @state()
  step = 0;

  private steps: Array<{
    title: string;
    desc: string;
    hint: string;
    howto: string[];
    shot: () => TemplateResult;
  }> = [
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
              <div class="map-mock mini-map">
                <div class="zoom-stack">
                  <div class="zoom-btn">+</div>
                  <div class="zoom-btn">−</div>
                </div>
                <div class="energy-chip"><sl-icon name="lightning-charge"></sl-icon>120</div>
                <span class="map-pin own"
                  ><icon-svg-badge name="doghouse-plus"-large></icon-svg-badge
                ></span>
                <span class="map-pin enemy"
                  ><icon-svg-badge name="doghouse-star"-large></icon-svg-badge
                ></span>

                <div class="levelup-popup">
                  <strong>${t('walkthrough.ui.levelUp')}</strong>
                  <div>${t('walkthrough.ui.plusOneSkillPoint')}</div>
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
            <div class="phone-content" style="display:grid; gap:8px;">
              <div
                class="mini-map"
                style="height: 80px; border: 1px solid #d3d9d4; border-radius: 8px; background: #fff; position: relative;"
              >
                <div class="energy-chip" style="top: 6px; right: 6px;">
                  <sl-icon name="lightning-charge"></sl-icon>120
                </div>
              </div>
              <div class="energy-bar"><div class="energy-fill" style="--energy:58%"></div></div>
              <div class="dh-note"><sl-icon name="lightning-charge"></sl-icon> ${t('walkthrough.ui.energyUsedAttackHeal')}</div>
              <div class="energy-note">${t('walkthrough.ui.energyPerDay')}</div>
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
            <div class="phone-content" style="display:grid; gap:8px;">
              <div class="list">
                <div class="list-item">
                  <span>${t('walkthrough.ui.questPlaceDoghouse')}</span>
                  <span class="score">+50</span>
                </div>
                <div class="list-item">
                  <span>${t('walkthrough.ui.questAttackEnemy')}</span>
                  <span class="score">+40</span>
                </div>
                <div class="list-item">
                  <span>${t('walkthrough.ui.questHealOwn')}</span>
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
                    <div><strong>${t('walkthrough.ui.premiumTitle')}</strong></div>
                    <div class="dh-note">${t('walkthrough.ui.premiumFeatures')}</div>
                  </div>
                </div>
                <span class="score">${t('walkthrough.ui.buy')}</span>
              </div>
              <div class="list">
                <div class="list-item">
                  <div style="display:flex; align-items:center; gap:8px;">
                    <icon-svg-badge name="doghouse-plus"></icon-svg-badge>
                    <span>${t('walkthrough.ui.extraDoghouse')}</span>
                  </div>
                  <span class="score">Snacks</span>
                </div>
                <div class="list-item">
                  <div style="display:flex; align-items:center; gap:8px;">
                    <icon-svg-badge name="dogface-pencil"></icon-svg-badge>
                    <span>${t('walkthrough.ui.renameToken')}</span>
                  </div>
                  <span class="score">Snacks</span>
                </div>
                <div class="list-item">
                  <div style="display:flex; align-items:center; gap:8px;">
                    <icon-svg-badge name="doghouse-hammer"></icon-svg-badge>
                    <span>${t('walkthrough.ui.repairPack')}</span>
                  </div>
                  <span class="score">Snacks</span>
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
          <button
            class="close-btn"
            @click=${this.close}
            aria-label="${t('walkthrough.buttons.close')}"
          >
            ✕
          </button>
        </div>
        <div class="content">
          <div class="text">
            <div class="desc">${step.desc}</div>
            <div class="hint">${step.hint}</div>
            ${step.howto?.length
              ? html`<ol class="instructions">
                  ${step.howto.map((i) => html`<li>${i}</li>`)}
                </ol>`
              : ''}
          </div>
          <div class="screenshot">${step.shot()}</div>
        </div>
        <div class="actions">
          <button class="btn secondary" @click=${this.prev} ?disabled=${this.step === 0}>
            ${t('walkthrough.buttons.back')}
          </button>
          ${this.step < this.steps.length - 1
            ? html`<button class="btn" @click=${this.next}>
                ${t('walkthrough.buttons.next')}
              </button>`
            : html`<button class="btn" @click=${this.close}>
                ${t('walkthrough.buttons.done')}
              </button>`}
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
