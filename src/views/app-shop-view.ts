import { LitElement, PropertyValueMap, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import '../components/app-map/app-map';
import { sharedStyles } from '../styles/shared-styles';

interface Price {
  currency: string;
  value: string;
}


interface GoogleBillingItem {
  description: string;
  iconURLs: [];
  introductoryPrice: Price;
  itemId: string;
  price: Price;
  title: string;
  type: string;
}

@customElement('app-shop-view')
export class AppShopView extends LitElement {
  static styles = [
    sharedStyles,
    css`
      #container {
        height: 100%;
      }
    `,
  ];

  async makePurchase( sku: string) {
      // Define the preferred payment method and item ID
      const paymentMethods = [{
          supportedMethods: "https://play.google.com/billing",
          data: {
              sku: sku,
          }
      }];
  
      // The "total" member of the paymentDetails is required by the Payment
      // Request API, but is not used when using Google Play Billing. We can
      // set it up with bogus details.
      const paymentDetails = {
          total: {
              label: `Total`,
              amount: {currency: `USD`, value: `0`}
          }
      };
  
      const request = new PaymentRequest(paymentMethods, paymentDetails);
      // try {
          const paymentResponse = await request.show();
          const {purchaseToken} = paymentResponse.details;
          console.log(purchaseToken);
  // }
 }


  protected async firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>) {
    if ('getDigitalGoodsService' in window) {
      // Digital Goods API is supported!
      try {        
        const service = await (window as any).getDigitalGoodsService('https://play.google.com/billing');
        // Google Play Billing is supported!

      const skuDetails: GoogleBillingItem[] = await service.getDetails(['android.test.purchased','doghouse_3_pack']);
      console.log(skuDetails);

      this.makePurchase('doghouse_3_pack')
      
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
      </div>
    `;
  }
}
