import { consume } from '@lit/context';
import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';

import '@shoelace-style/shoelace/dist/components/tab-group/tab-group.js';
import '@shoelace-style/shoelace/dist/components/tab-panel/tab-panel.js';
import '@shoelace-style/shoelace/dist/components/tab/tab.js';

import '../components/app-spinner/app-spinner';
import '../components/icon-svg/icon-svg-badge';
import {
  API_PURCHASE_ACKNOWLEDGE,
  API_PURCHASE_BUY_WITH_TREATS,
  API_USER_INFO,
} from '../constants/apiConstants';
import {
  googleSkuIds,
  shopItemsDoghouse,
  shopItemsEnergy,
  shopItemsRename,
  shopItemsRepair,
  shopItemsSubscription,
  shopItemsTreatPacks,
} from '../constants/shopItems';
import { updateDogInfoEvent } from '../contexts/dogInfoContext';
import { accessTokenContext } from '../contexts/userFirebaseContext';
import { updateUserInfoEvent, userInfoContext } from '../contexts/userInfoContext';
import { t, ti } from '../i18n';
import { sharedStyles } from '../styles/shared-styles';
import {
  AcknowledgePurchaseResponse,
  GoogleBillingItem,
  Price,
  ShopItemLocal,
} from '../types/shop';
import { UserInfoResponse } from '../types/userInfo';
import { alertNotifyDanger, showSuccessModal } from '../utils/alertsUtils';
import { apiCall } from '../utils/apiUtils';

//TODO: Move it to .env
const PACKAGE_NAME = 'app.netlify.astounding_naiad_fc1ffa.twa';

const parsePriceToFixed = (price: Price): Price => {
  return {
    currency: price.currency,
    value: parseFloat(price.value).toFixed(2).toString(),
  };
};

const removeIdNameFromName = (name: string) => {
  return name.replace('(dogisland)', '');
};

const parseShopItems = (items: ShopItemLocal[], googleItems: GoogleBillingItem[] | null) => {
  if (!googleItems) return items;

  return items.map((item) => {
    const googleItem = googleItems.find((googleLocalItem) => googleLocalItem.itemId === item.id);
    if (!googleItem) return item;

    const parsedItem = {
      id: item.id,
      icon: item.icon,
      badge: item.badge,
      name: removeIdNameFromName(googleItem.title) ?? removeIdNameFromName(item.name),
      price: parsePriceToFixed(googleItem.price) ?? parsePriceToFixed(item.price),
      description: googleItem.description ?? item.description,
    };

    return parsedItem;
  });
};

@customElement('app-shop-view')
export class AppShopView extends LitElement {
  private isTreatPack(id: string): boolean {
    return !!shopItemsTreatPacks.find((i) => i.id === id);
  }

  private getTreatsCountForPack(id: string): number {
    const found = shopItemsTreatPacks.find((i) => i.id === id);
    if (found?.description) {
      const m = found.description.match(/\d+/);
      if (m) return parseInt(m[0], 10);
    }
    const fallback: Record<string, number> = {
      small_treats: 100,
      tasty_handful: 700,
      snack_sack: 1600,
      mega_munch: 3600,
      ultimate_treat: 12500,
    };
    return fallback[id] ?? 0;
  }
  // Resolve a human-friendly, localized product name from an id or object
  private getProductName(itemBought: any): string {
    try {
      // If it's just an id string
      if (typeof itemBought === 'string') {
        const id = itemBought;
        const key = `shop.product.${id}.name`;
        const localized = t(key);
        if (localized !== key) return localized;
        // Try known alias keys used in translations
        const aliasMap: Record<string, string> = {
          dog_rename: 'dog_rename_token',
          doghouse_rename: 'doghouse_rename_token',
        };
        const alias = aliasMap[id];
        if (alias) {
          const aliasKey = `shop.product.${alias}.name`;
          const aliasLoc = t(aliasKey);
          if (aliasLoc !== aliasKey) return aliasLoc;
        }
        const local = this.findLocalItemById(id);
        return local?.name || id;
      }
      // If it's an object, try id first
      if (itemBought && typeof itemBought === 'object') {
        const id = (itemBought as any).id || (itemBought as any).itemId;
        const fallbackName = (itemBought as any).name || (itemBought as any).title || '';
        if (id) {
          const key = `shop.product.${id}.name`;
          const localized = t(key);
          if (localized !== key) return localized;
          const local = this.findLocalItemById(id);
          return local?.name || fallbackName || id;
        }
        return fallbackName || id || 'Treats';
      }
      return String(itemBought ?? '');
    } catch {
      return '[unknown item]';
    }
  }

  private findLocalItemById(id: string) {
    return (
      shopItemsDoghouse.find((i) => i.id === id) ||
      shopItemsRename.find((i) => i.id === id) ||
      shopItemsRepair.find((i) => i.id === id) ||
      shopItemsEnergy.find((i) => i.id === id) ||
      shopItemsTreatPacks.find((i) => i.id === id) ||
      shopItemsSubscription.find((i) => i.id === id)
    );
  }

  private renderShopItemIcon(item: ShopItemLocal) {
    const iconName = item.icon;
    if (!iconName) {
      return html`<sl-icon name="star"></sl-icon>`;
    }

    if (AppShopView.PNG_ICON_NAMES.has(iconName)) {
      return html`<icon-svg-badge
        format="png"
        name=${iconName}
        badge=${ifDefined(item.badge)}
      ></icon-svg-badge>`;
    }

    if (AppShopView.SHOELACE_ICON_NAMES.has(iconName)) {
      return html`<sl-icon name="${iconName}"></sl-icon>`;
    }

    return html`<icon-svg-badge name=${iconName} badge=${ifDefined(item.badge)}></icon-svg-badge>`;
  }
  // PNG-backed icons available in src/assets/icons-png
  private static readonly PNG_ICON_NAMES = new Set(['doghouse', 'toolkit', 'energy-drink']);
  private static readonly SHOELACE_ICON_NAMES = new Set(['star']);
  static styles = [
    sharedStyles,
    css`
      #container {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
        background: var(--app-bg);
      }

      #header {
        padding: 20px 16px;
        border-bottom: 1px solid var(--header-border);
        background: var(--header-bg);
        display: flex;
        align-items: center;
        gap: 12px;
      }

      #title {
        font-weight: 600;
        font-size: 20px;
        color: var(--primary);
      }

      #content {
        flex: 1;
        overflow: hidden; /* scrolling handled by sl-tab-panel */
        padding: 16px;
      }

      /* Center the tabs wrapper and limit width for nicer mobile look */
      #tabs-container {
        display: flex;
        justify-content: center;
        position: sticky;
        top: 0;
        z-index: 5;
        background: var(--app-bg);
        padding: 8px 0; /* ensures full-width background covers behind tabs */
      }
      .shop-tabs {
        width: 100%;
        max-width: 560px;
      }
      /* Make only the active tab panel scrollable */
      .shop-tabs sl-tab-panel {
        overflow-y: auto;
        padding: 0;
        height: calc(100vh - 220px);
        -webkit-overflow-scrolling: touch;
      }
      .shop-tabs::part(nav) {
        justify-content: center;
        flex-wrap: wrap;
        white-space: normal;
        gap: 2px;
        width: fit-content;
        margin-left: auto;
        margin-right: auto;
        padding: 2px;
        background: color-mix(in srgb, var(--primary) 8%, #fff);
        border-radius: 999px;
        border: none;
        box-shadow: none;
        position: sticky;
        top: 0; /* ensure nav itself sticks inside the scroll area */
        z-index: 6; /* slightly above container background */
      }
      .shop-tabs::part(nav) {
        --track-width: 0;
      }
      /* Hide Shoelace's sliding active tab indicator */
      .shop-tabs::part(active-tab-indicator),
      .shop-tabs::part(indicator) {
        display: none;
      }
      .shop-tabs::part(base) {
        border-radius: var(--border-radius-medium);
        border: none;
        box-shadow: none;
      }
      sl-tab::part(base) {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px;
        font-size: 14px;
        border-radius: 999px;
        color: var(--text-2);
        min-height: 40px;
      }
      sl-tab[active]::part(base) {
        background: var(--primary);
        color: #fff;
      }

      @media (max-width: 400px) {
        sl-tab::part(base) {
          padding: 3px 8px;
          font-size: 13px;
          min-height: 36px;
        }

        .shop-tabs sl-tab sl-icon {
          font-size: 16px;
        }
      }
      /* Smaller icons inside tab labels */
      .shop-tabs sl-tab sl-icon {
        font-size: 16px;
      }

      .category-section {
        margin-bottom: 24px;
      }

      .category-title {
        font-size: 18px;
        font-weight: 600;
        color: var(--color-black);
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
        padding-left: 8px;
      }

      .item-list {
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.9), var(--color-surface-strong));
        border-radius: var(--border-radius-medium);
        border: 1px solid var(--color-surface-border);
        overflow: hidden;
        box-shadow: 0 6px 18px rgba(22, 94, 73, 0.08);
      }

      .shop-item {
        display: flex;
        align-items: center;
        padding: 16px;
        border-bottom: 1px solid var(--color-primary-light);
        transition: background-color 0.2s ease;
      }

      .shop-item:last-child {
        border-bottom: none;
      }

      .shop-item:hover {
        background: var(--color-primary-light);
      }

      .item-icon {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--border-radius-circle);
        background: color-mix(in srgb, var(--primary) 14%, #fff);
        outline: 2px solid color-mix(in srgb, var(--primary) 35%, transparent);
        margin-right: 16px;
      }

      icon-svg-badge {
        --icon-svg-badge-width: 32px;
        --icon-svg-badge-height: 32px;
      }
      .item-icon sl-icon {
        font-size: 26px;
        color: var(--primary);
      }

      .item-details {
        flex: 1;
        min-width: 0;
      }

      .item-name {
        font-weight: 600;
        font-size: 16px;
        color: var(--color-black);
        margin-bottom: 4px;
      }

      .item-description {
        font-size: 14px;
        color: var(--color-black-medium);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .item-action {
        margin-left: 16px;
      }

      .buy-button::part(base) {
        color: var(--color-white);
        border: none;
        font-weight: 700;
        box-shadow: 0 4px 12px rgba(16, 42, 34, 0.2);
      }
      .buy-button--treats::part(base) {
        background: linear-gradient(var(--primary), var(--primary-700));
      }
      .buy-button--real::part(base) {
        background: linear-gradient(var(--sky), color-mix(in srgb, var(--sky) 82%, #0b2030));
      }

      .price-tag {
        font-weight: 800;
        font-size: 16px;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }

      /* Gold balance pill (flat, like modal energy) */
      #balance-pill {
        margin-left: auto;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-weight: 800;
        padding: 6px 12px;
        border-radius: 999px;
        background: var(--gold-100);
        border: 2px solid var(--gold);
        color: #5a4200;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }
      #balance-pill sl-icon::part(base) {
        color: #8a5b13;
        background: color-mix(in srgb, var(--gold-100) 80%, #fff 20%);
        border-radius: 999px;
        padding: 4px;
      }
    `,
  ];

  @consume({ context: accessTokenContext, subscribe: true })
  @property({ attribute: false })
  accessToken: string | null = null;

  @state()
  shopGoogleItems: GoogleBillingItem[] | null = null;

  // Track per-item loading state for treats purchases and real-money purchases
  @state()
  private processingTreatsItemId: string | null = null;
  @state()
  private processingRealItemId: string | null = null;

  @consume({ context: userInfoContext, subscribe: true })
  @property({ attribute: false })
  userInfo: import('../types/userInfo').UserInfo | null = null;

  async acknowledgePurchase(productId: string, token: string) {
    if (!this.accessToken) return;

    const result = await apiCall(this.accessToken).patch<AcknowledgePurchaseResponse>(
      API_PURCHASE_ACKNOWLEDGE,
      {
        packageName: PACKAGE_NAME,
        productId,
        token,
      }
    );

    return result.data;
  }

  async buyWithTreats(item: string) {
    if (!this.accessToken) return;
    // Prevent parallel purchases with treats
    if (this.processingTreatsItemId) return;
    this.processingTreatsItemId = item;
    try {
      const result = await apiCall(this.accessToken).post(API_PURCHASE_BUY_WITH_TREATS, {
        itemId: item,
        quantity: 1,
      });
      const { data } = result;
      // Update dog and user info
      updateDogInfoEvent(this, data?.dog);
      // refresh user info to get updated treats balance
      const refreshed = await apiCall(this.accessToken).get<UserInfoResponse>(API_USER_INFO);
      updateUserInfoEvent(this, refreshed.data.user);

      showSuccessModal(
        t('shop.purchaseSuccessTitle'),
        ti('shop.purchaseTreatsSuccessDesc', {
          spent: data?.spentTreats ?? 0,
          item: this.getProductName(item),
        })
      );
    } catch (error) {
      console.log(error);
      alertNotifyDanger(t('shop.purchaseFailed'));
    } finally {
      this.processingTreatsItemId = null;
    }
  }

  async makePurchase(item: string) {
    const paymentMethods = [
      {
        supportedMethods: 'https://play.google.com/billing',
        data: {
          sku: item,
        },
      },
    ];

    const paymentDetails = {
      total: {
        label: t('shop.total'),
        amount: { currency: `EUR`, value: `0` },
      },
    };

    const request = new PaymentRequest(paymentMethods, paymentDetails);

    try {
      const paymentResponse = await request.show();
      const { purchaseToken } = paymentResponse.details;

      const result = await this.acknowledgePurchase(item, purchaseToken);
      await paymentResponse.complete('success');

      const { quantity, dog } = result as AcknowledgePurchaseResponse;

      updateDogInfoEvent(this, dog);
      // Refresh user info (for treats balance updates after treat pack purchases)
      if (this.accessToken) {
        try {
          const refreshed = await apiCall(this.accessToken).get<UserInfoResponse>(API_USER_INFO);
          updateUserInfoEvent(this, refreshed.data.user);
        } catch {}
      }

      showSuccessModal(
        t('shop.purchaseSuccessTitle'),
        (() => {
          // For treat packs, show amount + localized word for Treats instead of box name
          if (this.isTreatPack(item)) {
            const count = this.getTreatsCountForPack(item);
            const reward = ti('rewards.description.TREATS', { amount: count });
            return reward;
          }
          return ti('shop.purchaseRealSuccessDesc', {
            quantity: quantity ?? 1,
            item: this.getProductName(item),
          });
        })()
      );
    } catch (error) {
      console.log(error);
    }
  }

  async buyProduct(item: string) {
    if (!('getDigitalGoodsService' in window)) return;
    if (this.processingRealItemId) return; // prevent parallel purchases
    this.processingRealItemId = item;
    try {
      await this.makePurchase(item);
    } catch (error) {
      // ignored, handled inside makePurchase
    } finally {
      this.processingRealItemId = null;
    }
  }

  async firstUpdated() {
    // Defer loading Google Billing details until user opens relevant tabs
    // (keep this method for other one-time setups if needed)
    // Load Google Billing details for real-money SKUs (treat packs + premium)
  }

  renderShopItemReal = (item: ShopItemLocal) => {
    const nameKey = `shop.product.${item.id}.name`;
    const descKey = `shop.product.${item.id}.description`;
    const tn = t(nameKey);
    const td = t(descKey);
    const displayName = tn === nameKey ? item.name : tn;
    const displayDesc = td === descKey ? item.description : td;
    return html`
      <div class="shop-item">
        <div class="item-icon">
          ${this.renderShopItemIcon(item)}
        </div>
        <div class="item-details">
          <div class="item-name">${displayName}</div>
          <div class="item-description">${displayDesc}</div>
        </div>
        <div class="item-action">
          <sl-button
            class="buy-button buy-button--real"
            @click=${() => this.buyProduct(item.id)}
            ?disabled=${this.processingRealItemId !== null}
            ?loading=${this.processingRealItemId === item.id}
            pill
          >
            <span class="price-tag">${item.price.value} ${item.price.currency}</span>
          </sl-button>
        </div>
      </div>
    `;
  };

  renderShopItemTreats = (item: ShopItemLocal) => {
    const nameKey = `shop.product.${item.id}.name`;
    const descKey = `shop.product.${item.id}.description`;
    const tn = t(nameKey);
    const td = t(descKey);
    const displayName = tn === nameKey ? item.name : tn;
    const displayDesc = td === descKey ? item.description : td;
    return html`
      <div class="shop-item">
        <div class="item-icon">
          ${this.renderShopItemIcon(item)}
        </div>
        <div class="item-details">
          <div class="item-name">${displayName}</div>
          <div class="item-description">${displayDesc}</div>
        </div>
        <div class="item-action">
          <sl-button
            class="buy-button buy-button--treats"
            @click=${() => this.buyWithTreats(item.id)}
            ?disabled=${this.processingTreatsItemId !== null}
            ?loading=${this.processingTreatsItemId === item.id}
            pill
          >
            <span class="price-tag">${item.price.value} <sl-icon name="coin"></sl-icon></span>
          </sl-button>
        </div>
      </div>
    `;
  };

  renderCategorySection(
    title: string,
    icon: string,
    items: ShopItemLocal[],
    renderer: (item: ShopItemLocal) => unknown,
    googleItems: GoogleBillingItem[] | null = null
  ) {
    const parsedItems = googleItems ? parseShopItems(items, googleItems) : items;
    return html`
      <div class="category-section">
        <div class="category-title">
          <sl-icon name=${icon}></sl-icon>
          ${title}
        </div>
        <div class="item-list">${parsedItems.map((item) => renderer(item as ShopItemLocal))}</div>
      </div>
    `;
  }

  private async ensureGoogleItemsLoaded() {
    if (this.shopGoogleItems || !this.accessToken) return;
    if ('getDigitalGoodsService' in window) {
      try {
        const service = await (window as any).getDigitalGoodsService(
          'https://play.google.com/billing'
        );
        const skuDetails: GoogleBillingItem[] = await service.getDetails(googleSkuIds);
        this.shopGoogleItems = skuDetails;
      } catch (error) {
        /* ignore */
      }
    }
  }

  render() {
    return html`
      <div id="container">
        <div id="header">
          <div id="title" data-autofit>${t('shop.title')}</div>
          <div id="balance-pill" title="${t('shop.product.treats')}">
            <sl-icon name="coin"></sl-icon>
            <span>${this.userInfo?.treatsBalance ?? 0}</span>
          </div>
        </div>
        <div id="content">
          <div id="tabs-container">
            <sl-tab-group
              class="shop-tabs"
              @sl-tab-show=${(e: any) => {
                const name = e.detail?.name || e.target?.activeTab?.panel;
                if (name === 'buy-treats' || name === 'premium') this.ensureGoogleItemsLoaded();
              }}
            >
              <sl-tab slot="nav" panel="spend-treats">
                <sl-icon name="handbag" style="margin-right: 6px;"></sl-icon>
                <span data-autofit>${t('shop.spend')}</span>
              </sl-tab>
              <sl-tab slot="nav" panel="buy-treats">
                <sl-icon name="coin" style="margin-right: 6px;"></sl-icon>
                <span data-autofit>${t('shop.buy')}</span>
              </sl-tab>
              <sl-tab slot="nav" panel="premium">
                <sl-icon name="star" style="margin-right: 6px;"></sl-icon>
                <span data-autofit>${t('shop.buyPremium')}</span>
              </sl-tab>

              <sl-tab-panel name="spend-treats">
                ${this.renderCategorySection(
                  t('shop.doghouses'),
                  'house-add',
                  shopItemsDoghouse,
                  (i) => this.renderShopItemTreats(i)
                )}
                ${this.renderCategorySection(
                  t('shop.renameTokens'),
                  'pencil',
                  shopItemsRename,
                  (i) => this.renderShopItemTreats(i)
                )}
                ${this.renderCategorySection(t('shop.repairKits'), 'tools', shopItemsRepair, (i) =>
                  this.renderShopItemTreats(i)
                )}
                ${this.renderCategorySection(
                  t('shop.energy'),
                  'lightning-charge',
                  shopItemsEnergy,
                  (i) => this.renderShopItemTreats(i)
                )}
              </sl-tab-panel>

              <sl-tab-panel name="buy-treats">
                ${this.shopGoogleItems
                  ? html`
                      ${this.renderCategorySection(
                        t('shop.treatPacks'),
                        'coin',
                        shopItemsTreatPacks,
                        (i) => this.renderShopItemReal(i),
                        this.shopGoogleItems
                      )}
                    `
                  : html`<app-spinner></app-spinner>`}
              </sl-tab-panel>

              <sl-tab-panel name="premium">
                ${this.shopGoogleItems
                  ? html`${this.renderCategorySection(
                      t('shop.subscriptions'),
                      'star',
                      shopItemsSubscription,
                      (i) => this.renderShopItemReal(i),
                      this.shopGoogleItems
                    )}`
                  : html`<app-spinner></app-spinner>`}
              </sl-tab-panel>
            </sl-tab-group>
          </div>
        </div>
      </div>
    `;
  }
}

// ${shopItems.map(
//   (item) =>
//     html`<sl-button id="buy-btn" @click=${() => this.buyProduct(item)} pill
//       >${item}</sl-button
//     >`
// )}
