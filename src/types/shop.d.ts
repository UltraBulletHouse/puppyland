export interface AcknowledgePurchase {
  packageName: string;
  productId: string;
  token: string;
}

export interface AcknowledgePurchaseResponse {
  success: boolean;
}

export interface Price {
  currency: string;
  value: string;
}

export interface GoogleBillingItem {
  description: string;
  iconURLs: [];
  introductoryPrice: Price;
  itemId: string;
  price: Price;
  title: string;
  type: string;
}
