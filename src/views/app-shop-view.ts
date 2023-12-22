import { LitElement, PropertyValueMap, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import '../components/app-map/app-map';
import { sharedStyles } from '../styles/shared-styles';
import { alertNotifyPrimary } from '../utils/alertsUtils';

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


  protected async firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>) {
    if ('getDigitalGoodsService' in window) {
      // Digital Goods API is supported!
      try {        
        const service = await (window as any).getDigitalGoodsService('https://play.google.com/billing');
        // Google Play Billing is supported!
        alertNotifyPrimary(service, {duration: Infinity})
      console.log(service);

      const skuDetails = await service.getDetails(['doghouse_3_pack']);
      alertNotifyPrimary(skuDetails, {duration: Infinity})
      console.log(skuDetails);

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