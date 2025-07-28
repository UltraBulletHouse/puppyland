import { ShopItemLocal } from '../types/shop';

export const shopItems = [
  'repair_50',
  'repair_max',
  'energy_10_boost',
  'energy_50_boost',
  'doghouse_1_pack',
  'doghouse_3_pack',
  'doghouse_6_pack',
];

export const shopItemsDoghouse: ShopItemLocal[] = [
  {
    id: 'doghouse_1_pack',
    name: 'Doghouse 1 pack',
    icon: 'doghouse',
    badge: '1',
    price: { currency: 'EUR', value: '0' },
    description: 'You can place 1 additional doghouses',
  },
  {
    id: 'doghouse_3_pack',
    name: 'Doghouse 3 pack',
    icon: 'doghouse',
    badge: '3',
    price: { currency: 'EUR', value: '0' },
    description: 'You can place 3 additional doghouses',
  },
  {
    id: 'doghouse_6_pack',
    name: 'Doghouse 6 pack',
    icon: 'doghouse',
    badge: '6',
    price: { currency: 'EUR', value: '0' },
    description: 'You can place 6 additional doghouses',
  },
];

export const shopItemsRepair: ShopItemLocal[] = [
  {
    id: 'repair_50',
    name: 'Repair 50',
    icon: 'toolkit',
    badge: '50',
    price: { currency: 'EUR', value: '' },
    description: '',
  },
  {
    id: 'repair_max',
    name: 'Repair max',
    icon: 'toolkit',
    badge: 'MAX',
    price: { currency: 'EUR', value: '' },
    description: '',
  },
];

export const shopItemsEnergy: ShopItemLocal[] = [
  {
    id: 'energy_10_boost',
    name: 'Energy 10 boost',
    icon: 'energy-drink',
    badge: '10',
    price: { currency: 'EUR', value: '' },
    description: '',
  },
  {
    id: 'energy_50_boost',
    name: 'Energy 50 boost',
    icon: 'energy-drink',
    badge: '50',
    price: { currency: 'EUR', value: '' },
    description: '',
  },
];

export const allShopItems = [...shopItemsDoghouse, ...shopItemsRepair, ...shopItemsEnergy];
