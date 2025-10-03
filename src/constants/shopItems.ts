import { ShopItemLocal } from '../types/shop';

// SKUs that exist in Google Play (real-money purchases)
export const googleSkuIds = [
  'small_treats',
  'tasty_handful',
  'snack_sack',
  'mega_munch',
  'ultimate_treat',
  'premium',
];

export const shopItemsDoghouse: ShopItemLocal[] = [
  {
    id: 'doghouse_1_pack',
    name: 'Doghouse 1 pack',
    icon: 'doghouse-plus',
    badge: '1',
    price: { currency: 'Treats', value: '100' },
    description: 'You can place 1 additional doghouses',
  },
  {
    id: 'doghouse_3_pack',
    name: 'Doghouse 3 pack',
    icon: 'doghouse-plus',
    badge: '3',
    price: { currency: 'Treats', value: '200' },
    description: 'You can place 3 additional doghouses',
  },
  {
    id: 'doghouse_6_pack',
    name: 'Doghouse 6 pack',
    icon: 'doghouse-plus',
    badge: '6',
    price: { currency: 'Treats', value: '300' },
    description: 'You can place 6 additional doghouses',
  },
];

export const shopItemsRename: ShopItemLocal[] = [
  {
    id: 'dog_rename',
    name: 'Dog rename token',
    icon: 'dogface-pencil',
    badge: '1',
    price: { currency: 'Treats', value: '100' },
    description: 'Buy one rename for your dog',
  },
  {
    id: 'doghouse_rename',
    name: 'Doghouse rename token',
    icon: 'doghouse-pencil',
    badge: '1',
    price: { currency: 'Treats', value: '100' },
    description: 'Buy one rename for your doghouse',
  },
];

export const shopItemsRepair: ShopItemLocal[] = [
  {
    id: 'repair_50',
    name: 'Repair 50',
    icon: 'doghouse-hammer',
    badge: '50',
    price: { currency: 'Treats', value: '100' },
    description: '',
  },
  {
    id: 'repair_max',
    name: 'Full repair',
    icon: 'doghouse-hammer',
    badge: 'MAX',
    price: { currency: 'Treats', value: '300' },
    description: '',
  },
];

export const shopItemsEnergy: ShopItemLocal[] = [
  {
    id: 'energy_10_boost',
    name: 'Energy 10 boost',
    icon: 'energy-drink',
    badge: '10',
    price: { currency: 'Treats', value: '100' },
    description: '',
  },
  {
    id: 'energy_50_boost',
    name: 'Energy 50 boost',
    icon: 'energy-drink',
    badge: '50',
    price: { currency: 'Treats', value: '300' },
    description: '',
  },
];

export const shopItemsSubscription: ShopItemLocal[] = [
  {
    id: 'premium',
    name: 'Premium',
    icon: 'premium-star',
    price: { currency: 'EUR', value: '' },
    description: 'Unlock premium features',
  },
];

// Real-money Treat packs and subscription (used for Google Billing)
export const shopItemsTreatPacks: ShopItemLocal[] = [
  {
    id: 'small_treats',
    name: 'Small Treats',
    icon: 'treats-pack',
    badge: 'S',
    price: { currency: 'EUR', value: '' },
    description: '100 Treats',
  },
  {
    id: 'tasty_handful',
    name: 'Tasty Handful',
    icon: 'treats-pack',
    badge: 'M',
    price: { currency: 'EUR', value: '' },
    description: '700 Treats',
  },
  {
    id: 'snack_sack',
    name: 'Snack Sack',
    icon: 'treats-pack',
    badge: 'L',
    price: { currency: 'EUR', value: '' },
    description: '1600 Treats',
  },
  {
    id: 'mega_munch',
    name: 'Mega munch bag',
    icon: 'treats-pack',
    badge: 'XL',
    price: { currency: 'EUR', value: '' },
    description: '3600 Treats',
  },
  {
    id: 'ultimate_treat',
    name: 'Ultimate treat crate',
    icon: 'treats-pack',
    badge: 'XXL',
    price: { currency: 'EUR', value: '' },
    description: '12500 Treats',
  },
];
