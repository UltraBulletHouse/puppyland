import { consume } from '@lit/context';
import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import '../components/app-map/app-map';
import { API_PURCHASE_ACKNOWLEDGE } from '../constants/apiConstants';
import { accessTokenContext } from '../contexts/userFirebaseContext';
import { sharedStyles } from '../styles/shared-styles';
import { AcknowledgePurchaseResponse, GoogleBillingItem, ShopItem } from '../types/shop';
import { alertNotifySuccess } from '../utils/alertsUtils';
import { apiCall } from '../utils/apiUtils';
import { getImagePngUrl } from '../utils/getImage';

//TODO: Move it to .env
const PACKAGE_NAME = 'app.netlify.astounding_naiad_fc1ffa.twa';

const shopItems = [
  'repair_50_bonus',
  'repair_max_bonus',
  'energy_10_boost',
  'energy_50_boost',
  'doghouse_1_pack',
  'doghouse_3_pack',
  'doghouse_6_pack',
];

const shopItemsDoghouse: ShopItem[] = [
  {
    id: 'doghouse_1_pack',
    name: 'Doghouse 1 pack',
    icon: 'doghouse-1-pack',
    price: 1,
    description: '',
  },
  {
    id: 'doghouse_3_pack',
    name: 'Doghouse 3 pack',
    icon: 'doghouse-3-pack',
    price: 1,
    description: '',
  },
  {
    id: 'doghouse_6_pack',
    name: 'Doghouse 6 pack',
    icon: 'doghouse-6-pack',
    price: 1,
    description: '',
  },
];

const shopItemsHealth: ShopItem[] = [
  {
    id: 'health_50_bonus',
    name: 'Health 50 bonus',
    icon: 'health-50-bonus',
    price: 1,
    description: '',
  },
  {
    id: 'health_max_bonus',
    name: 'Health max bonus',
    icon: 'health-max-bonus',
    price: 1,
    description: '',
  },
];

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
      .items-container {
        display: flex;
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
        width: 86px;
        margin: 10px;
        border-radius: var(--border-radius-small);
        border: 1px solid var(--color-primary-medium);
        background-color: var(--color-primary-light);
      }
      .item-title {
        text-align: center;
      }
      .shop-item-icon {
        width: 46px;
      }
    `,
  ];

  @consume({ context: accessTokenContext, subscribe: true })
  @property({ attribute: false })
  accessToken: string | null = null;

  @state()
  shopItems: Object = { czydziala: 'nie' };

  async acknowledgePurchase(productId: string, token: string) {
    if (!this.accessToken) return;

    await apiCall(this.accessToken).patch<AcknowledgePurchaseResponse>(API_PURCHASE_ACKNOWLEDGE, {
      packageName: PACKAGE_NAME,
      productId,
      token,
    });
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

      await this.acknowledgePurchase(item, purchaseToken);
      await paymentResponse.complete('success');

      alertNotifySuccess('You just bought item!');
    } catch (error) {
      console.log(error);
    }
  }

  async buyProduct(item: string) {
    if ('getDigitalGoodsService' in window) {
      // Digital Goods API is supported!
      try {
        const service = await (window as any).getDigitalGoodsService(
          'https://play.google.com/billing'
        );
        // Google Play Billing is supported!

        const skuDetails: GoogleBillingItem[] = await service.getDetails(shopItems);
        console.log('SkuDetails = ', skuDetails);

        await this.makePurchase(item);

        // const existingPurchases = await service.listPurchases();
        // console.log(existingPurchases);
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
        console.log('SkuDetails = ', skuDetails);
        this.shopItems = skuDetails

      } catch (error) {
        return;
      }
    }

  }

  shopItem = (item: ShopItem) =>
    html`<div class="shop-item">
      <div class="item-title">${item.name}</div>
      <div class="item-image">
        <img class="shop-item-icon" src="${getImagePngUrl('firstaid')}" />
      </div>
      <div class="item-price">${item.price}$</div>
      <div></div>
    </div> `;

  render() {
    return html`
      <div id="container">
        <div id="title">SHOP</div>
        <div class="items-container">${shopItemsDoghouse.map((item) => this.shopItem(item))}</div>
        <div class="items-container">${shopItemsHealth.map((item) => this.shopItem(item))}</div>

        <div>${JSON.stringify(this.shopItems)}</div>
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
