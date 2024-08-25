import { consume } from '@lit/context';
import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import '../components/app-map/app-map';
import { API_PURCHASE_ACKNOWLEDGE } from '../constants/apiConstants';
import { accessTokenContext } from '../contexts/userFirebaseContext';
import { sharedStyles } from '../styles/shared-styles';
import { AcknowledgePurchaseResponse, GoogleBillingItem } from '../types/shop';
import { alertNotifySuccess } from '../utils/alertsUtils';
import { apiCall } from '../utils/apiUtils';

//TODO: Move it to .env
const PACKAGE_NAME = 'app.netlify.astounding_naiad_fc1ffa.twa';

const shopItems = [
  'doghouse_1_pack',
  'doghouse_3_pack',
  'doghouse_6_pack',
  'health_50_bonus',
  'health_max_bonus',
];

const shopItemsDoghouse = [
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

const shopItemsHealth = [
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
      #buy-btn {
        margin-bottom: 10px;
      }
      .items-container {
        display: flex;
        justify-content: center;
        width: 100%;
        margin-bottom: 10px;
        border: 1px solid black;
        border-radius: var(--border-radius-small);
      }
      .shop-item {
        width: 86px;
        margin: 10px;
        border: 1px solid red;
        border-radius: var(--border-radius-small);
      }
    `,
  ];

  @consume({ context: accessTokenContext, subscribe: true })
  @property({ attribute: false })
  accessToken: string | null = null;

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

  render() {
    return html`
      <div id="container">
        <div>SHOP</div>
        <div class="items-container">
          ${shopItemsDoghouse.map(
            (item) =>
              html`<div class="shop-item">
                <div>${item.name}</div>
                <div>${item.price}</div>
              </div> `
          )}
        </div>
        <div class="items-container">
          ${shopItemsHealth.map(
            (item) =>
              html`<div class="shop-item">
                <div>${item.name}</div>
                <div>${item.price}</div>
              </div> `
          )}
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
