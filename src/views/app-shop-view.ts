import { consume } from '@lit/context';
import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';

import '../components/icon-png/icon-png';
import { API_PURCHASE_ACKNOWLEDGE } from '../constants/apiConstants';
import {
  shopItems,
  shopItemsDoghouse,
  shopItemsEnergy,
  shopItemsRepair,
} from '../constants/shopItems';
import { updateDogInfoEvent } from '../contexts/dogInfoContext';
import { accessTokenContext } from '../contexts/userFirebaseContext';
import { sharedStyles } from '../styles/shared-styles';
import {
  AcknowledgePurchaseResponse,
  GoogleBillingItem,
  Price,
  ShopItemLocal,
} from '../types/shop';
import { showSuccessModal } from '../utils/alertsUtils';
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
        background: var(--color-white);
      }

      #header {
        padding: 20px 16px;
        border-bottom: 1px solid var(--color-primary-light);
        background: linear-gradient(
          135deg,
          var(--color-primary-light) 0%,
          var(--color-white) 100%
        );
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
        background: var(--color-white);
        border-radius: var(--border-radius-medium);
        border: 1px solid var(--color-primary-medium);
        overflow: hidden;
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
        border-radius: var(--border-radius-small);
        background: var(--color-primary-light);
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
        background-color: var(--color-primary);
        color: var(--color-white);
        border: none;
        font-weight: 600;
      }

      .price-tag {
        font-weight: 700;
        font-size: 16px;
      }
    `,
  ];

  @consume({ context: accessTokenContext, subscribe: true })
  @property({ attribute: false })
  accessToken: string | null = null;

  @state()
  shopGoogleItems: GoogleBillingItem[] | null = null;

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

      showSuccessModal(
        'Purchase Successful',
        `You have successfully purchased ${quantity} of ${itemBought}.`
      );
    } catch (error) {
      console.log(error);
    }
  }

  async buyProduct(item: string) {
    if ('getDigitalGoodsService' in window) {
      try {
        await this.makePurchase(item);
      } catch (error) {
        return;
      }
    }
  }

  async firstUpdated() {
    if (!this.accessToken) return;
    if ('getDigitalGoodsService' in window) {
      try {
        const service = await (window as any).getDigitalGoodsService(
          'https://play.google.com/billing'
        );

        const skuDetails: GoogleBillingItem[] = await service.getDetails(shopItems);
        this.shopGoogleItems = skuDetails;
      } catch (error) {
        return;
      }
    }
  }

  renderShopItem = (item: ShopItemLocal) => html`
    <div class="shop-item">
      <div class="item-icon">
        <icon-png-badge name=${item.icon} badge=${ifDefined(item.badge)}></icon-png-badge>
      </div>
      <div class="item-details">
        <div class="item-name">${item.name}</div>
        <div class="item-description">${item.description}</div>
      </div>
      <div class="item-action">
        <sl-button class="buy-button" @click=${() => this.buyProduct(item.id)} pill>
          <span class="price-tag">${item.price.value} ${item.price.currency}</span>
        </sl-button>
      </div>
    </div>
  `;

  renderCategorySection(
    title: string,
    icon: string,
    items: ShopItemLocal[],
    googleItems: GoogleBillingItem[] | null
  ) {
    const parsedItems = parseShopItems(items, googleItems);
    return html`
      <div class="category-section">
        <div class="category-title">
          <sl-icon name=${icon}></sl-icon>
          ${title}
        </div>
        <div class="item-list">
          ${parsedItems.map((item) => this.renderShopItem(item))}
        </div>
      </div>
    `;
  }

  render() {
    return html`
      <div id="container">
        <div id="header">
          <sl-icon name="shop" style="font-size: 24px;"></sl-icon>
          <div id="title">Shop</div>
        </div>
        <div id="content">
          ${this.shopGoogleItems
            ? html`
                ${this.renderCategorySection(
                  'Doghouses',
                  'house-add',
                  shopItemsDoghouse,
                  this.shopGoogleItems
                )}
                ${this.renderCategorySection(
                  'Repair Kits',
                  'tools',
                  shopItemsRepair,
                  this.shopGoogleItems
                )}
                ${this.renderCategorySection(
                  'Energy',
                  'lightning-charge',
                  shopItemsEnergy,
                  this.shopGoogleItems
                )}
              `
            : html`<app-spinner></app-spinner>`}
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
