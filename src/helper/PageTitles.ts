export interface TitleInterface {
  [key: string]: string;
}

export const titles: TitleInterface = {
  '/': 'Dashboard',
  '/apps': 'Applications',
  '/orders': 'Orders',
  '/products': 'Products',
  '/products/:id': 'Product details',
  '/products/add': 'Add product',
  '/settings': 'Settings',
  '/users': 'Users',
  '/subscriptions': 'Subscriptions',
  '/plans': 'Plans',
  '/plans/create': 'Create plans',
  '/billings': 'Billings and transactions',
  '/billings/payments': 'Payments',
  '/website': 'Website settings',
  '/website/keys': 'Server settings'
};
