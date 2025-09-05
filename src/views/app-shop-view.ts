import { consume } from '@lit/context';
import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';

import '@shoelace-style/shoelace/dist/components/tab-group/tab-group.js';
import '@shoelace-style/shoelace/dist/components/tab-panel/tab-panel.js';
import '@shoelace-style/shoelace/dist/components/tab/tab.js';

import '../components/app-spinner/app-spinner';
import '../components/icon-png/icon-png';
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
import { sharedStyles } from '../styles/shared-styles';
import { t } from '../i18n';
import {
  AcknowledgePurchaseResponse,
  GoogleBillingItem,
  Price,
  ShopItemLocal,
} from '../types/shop';
import { UserInfoResponse } from '../types/userInfo';
import { showSuccessModal, alertNotifyDanger } from '../utils/alertsUtils';
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
        color: var(--color-black);
      }

      #content {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        -webkit-overflow-scrolling: touch;
      }

      /* Center the tabs wrapper and limit width for nicer mobile look */
      #tabs-container {
        display: flex;
        justify-content: center;
      }
      .shop-tabs {
        width: 100%;
        max-width: 560px;
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

      icon-png-badge {
        --icon-png-badge-width: 32px;
        --icon-png-badge-height: 32px;
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
        'Purchase Successful',
        `You spent ${data?.spentTreats} Treats on ${data?.itemBought}.`
      );
    } catch (error) {
      console.log(error);
      alertNotifyDanger('Purchase failed. Please try again.');
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
        label: `Total`,
        amount: { currency: `EUR`, value: `0` },
      },
    };

    const request = new PaymentRequest(paymentMethods, paymentDetails);

    try {
      const paymentResponse = await request.show();
      const { purchaseToken } = paymentResponse.details;

      const result = await this.acknowledgePurchase(item, purchaseToken);
      await paymentResponse.complete('success');

      const { itemBought, quantity, dog } = result as AcknowledgePurchaseResponse;

      updateDogInfoEvent(this, dog);
      // Refresh user info (for treats balance updates after treat pack purchases)
      if (this.accessToken) {
        try {
          const refreshed = await apiCall(this.accessToken).get<UserInfoResponse>(API_USER_INFO);
          updateUserInfoEvent(this, refreshed.data.user);
        } catch {}
      }

      showSuccessModal(
        'Purchase Successful',
        `You have successfully purchased ${quantity} of ${itemBought}.`
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

  renderShopItemReal = (item: ShopItemLocal) => html`
    <div class="shop-item">
      <div class="item-icon">
        ${item.icon
          ? html`<icon-png-badge name=${item.icon} badge=${ifDefined(item.badge)}></icon-png-badge>`
          : html`<sl-icon name="star"></sl-icon>`}
      </div>
      <div class="item-details">
        <div class="item-name">${item.name}</div>
        <div class="item-description">${item.description}</div>
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

  renderShopItemTreats = (item: ShopItemLocal) => html`
    <div class="shop-item">
      <div class="item-icon">
        ${item.icon
          ? html`<icon-png-badge name=${item.icon} badge=${ifDefined(item.badge)}></icon-png-badge>`
          : html`<sl-icon name="star"></sl-icon>`}
      </div>
      <div class="item-details">
        <div class="item-name">${item.name}</div>
        <div class="item-description">${item.description}</div>
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
          <sl-icon name="shop" style="font-size: 24px;"></sl-icon>
          <div id="title">${t('shop')}</div>
          <div id="balance-pill" title="Treats">
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
                ${t('spend')}
              </sl-tab>
              <sl-tab slot="nav" panel="buy-treats">
                <sl-icon name="coin" style="margin-right: 6px;"></sl-icon>
                ${t('buy')}
              </sl-tab>
              <sl-tab slot="nav" panel="premium">
                <sl-icon name="star" style="margin-right: 6px;"></sl-icon>
                ${t('buyPremium')}
              </sl-tab>

              <sl-tab-panel name="spend-treats">
                ${this.renderCategorySection(t('doghouses'), 'house-add', shopItemsDoghouse, (i) =>
                  this.renderShopItemTreats(i)
                )}
                ${this.renderCategorySection(t('renameTokens'), 'pencil', shopItemsRename, (i) =>
                  this.renderShopItemTreats(i)
                )}
                ${this.renderCategorySection(t('repairKits'), 'tools', shopItemsRepair, (i) =>
                  this.renderShopItemTreats(i)
                )}
                ${this.renderCategorySection(t('energy'), 'lightning-charge', shopItemsEnergy, (i) =>
                  this.renderShopItemTreats(i)
                )}
              </sl-tab-panel>

              <sl-tab-panel name="buy-treats">
                ${this.shopGoogleItems
                  ? html`
                      ${this.renderCategorySection(
                        t('treatPacks'),
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
                      t('subscriptions'),
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
