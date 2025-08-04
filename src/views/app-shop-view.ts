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
import { alertNotifySuccess } from '../utils/alertsUtils';
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
        align-items: center;
        height: 100%;
        width: 100%;
        background: var(--color-white);
        padding: 20px;
      }
      #title {
        margin-bottom: 20px;
      }
      #buy-btn {
        margin-bottom: 10px;
      }
      #items-container {
        height: calc(100% - 45px);
        width: 100%;
        overflow: auto;
      }
      .items-section {
        display: flex;
        flex-direction: column;
        justify-content: center;
        width: 100%;
        margin-bottom: 20px;
        border-radius: var(--border-radius-small);
        border: 1px solid var(--color-primary-medium);
      }
      .shop-item {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 10px;
        margin: 10px;
        border-radius: var(--border-radius-small);
        border: 1px solid var(--color-primary-medium);
        background-color: var(--color-primary-light);
      }
      .item-title {
        text-align: center;
        font-weight: 700;
      }
      .item-main-container {
        display: flex;
        width: 100%;
      }
      .shop-item-icon {
        width: 46px;
      }
      icon-png-badge {
        --icon-png-badge-width: 46px;
      }
      .item-description {
        padding: 8px;
        padding-left: 22px;
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
    // Define the preferred payment method and item ID
    const paymentMethods = [
      {
        supportedMethods: 'https://play.google.com/billing',
        data: {
          sku: item,
        },
      },
    ];

    // The "total" member of the paymentDetails is required by the Payment
    // Request API, but is not used when using Google Play Billing. We can
    // set it up with bogus details.
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

      alertNotifySuccess(`You bought ${quantity} of ${itemBought}`);
    } catch (error) {
      console.log(error);
    }
  }

  async buyProduct(item: string) {
    if ('getDigitalGoodsService' in window) {
      // Digital Goods API is supported!
      try {
        // const service = await (window as any).getDigitalGoodsService(
        //   'https://play.google.com/billing'
        // );
        // Google Play Billing is supported!
        // const skuDetails: GoogleBillingItem[] = await service.getDetails(shopItems);

        await this.makePurchase(item);

        // const existingPurchases = await service.listPurchases();
        // <console.log(existingPurchases);
      } catch (error) {
        // Google Play Billing is not available. Use another payment flow.
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

  shopItem = (item: ShopItemLocal) =>
    html`<div class="shop-item">
      <div class="item-title">${item.name}</div>
      <div class="item-main-container">
        <div class="item-image">
          <icon-png-badge name=${item.icon} badge=${ifDefined(item.badge)}></icon-png-badge>
        </div>
        <div class="item-description">${item.description}</div>
      </div>
      <div>
        <sl-button @click=${() => this.buyProduct(item.id)} pill
          >${item.price.value} ${item.price.currency}</sl-button
        >
      </div>
    </div> `;

  render() {
    return html`
      <div id="container">
        <div id="title">SHOP</div>
        ${this.shopGoogleItems
          ? html`
              <div id="items-container">
                <div class="items-section">
                  ${parseShopItems(shopItemsDoghouse, this.shopGoogleItems).map((item) =>
                    this.shopItem(item)
                  )}
                </div>
                <div class="items-section">
                  ${parseShopItems(shopItemsRepair, this.shopGoogleItems).map((item) =>
                    this.shopItem(item)
                  )}
                </div>
                <div class="items-section">
                  ${parseShopItems(shopItemsEnergy, this.shopGoogleItems).map((item) =>
                    this.shopItem(item)
                  )}
                </div>
              </div>
            `
          : null}
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
