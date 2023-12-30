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

//TODO: Test item - remove
const TEST_ITEM = 'doghouse_3_pack';

//TODO: Move it to .env
const PACKAGE_NAME = 'app.netlify.astounding_naiad_fc1ffa.twa';

@customElement('app-shop-view')
export class AppShopView extends LitElement {
  static styles = [
    sharedStyles,
    css`
      #container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        width: 100%;
      }
    `,
  ];

  @consume({ context: accessTokenContext, subscribe: true })
  @property({ attribute: false })
  accessToken: string | null = null;

  async acknowledgePurchase(productId: string, token: string) {
    console.log('accessToken', this.accessToken);
    if (!this.accessToken) return;

    const acknowledgePurchaseResponse = await apiCall(
      this.accessToken
    ).patch<AcknowledgePurchaseResponse>(API_PURCHASE_ACKNOWLEDGE, {
      packageName: PACKAGE_NAME,
      productId,
      token,
    });

    console.log('acknowledgePurchaseResponse', acknowledgePurchaseResponse);
    alertNotifySuccess(`${acknowledgePurchaseResponse.data}`);
  }

  async makePurchase(sku: string) {
    // Define the preferred payment method and item ID
    const paymentMethods = [
      {
        supportedMethods: 'https://play.google.com/billing',
        data: {
          sku: sku,
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
      console.log('purchaseToken', purchaseToken);

      await this.acknowledgePurchase(TEST_ITEM, purchaseToken);
    } catch (error) {
      console.log(error);
    }
  }

  async buyProduct() {
    if ('getDigitalGoodsService' in window) {
      // Digital Goods API is supported!
      try {
        const service = await (window as any).getDigitalGoodsService(
          'https://play.google.com/billing'
        );
        // Google Play Billing is supported!

        const skuDetails: GoogleBillingItem[] = await service.getDetails([TEST_ITEM]);
        console.log('skuDetails', skuDetails);

        const result = await this.makePurchase(TEST_ITEM);
        console.log('makePurshaseResult', result);

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
        <sl-button @click=${this.buyProduct} pill>BUY - ${TEST_ITEM}</sl-button>
      </div>
    `;
  }
}
