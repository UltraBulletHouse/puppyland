import { DogInfo } from './dog';

export interface AcknowledgePurchase {
  packageName: string;
  productId: string;
  token: string;
}

export interface AcknowledgePurchaseResponse {
  success: boolean;
  itemBought: string;
  quantity: number;
  dog: DogInfo;
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

export interface ShopItem {
  id: string;
  name: string;
  icon: string;
  price: Price;
  description: string;
}

export interface ShopItemLocal extends ShopItem {
  badge?: string;
}
