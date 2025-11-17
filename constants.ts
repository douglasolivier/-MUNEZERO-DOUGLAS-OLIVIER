import { Category, LocationDetails } from './types';

export const APP_NAME = 'ShoraMall';

export const ROUTES = {
  HOME: '#/',
  LOGIN: '#/login',
  REGISTER: '#/register',
  PRODUCTS: '#/products',
  PRODUCT_DETAIL: '#/products/', // Append ID: #/products/:id
  CART: '#/cart',
  ABOUT_US: '#/about-us', // New route
  BLOG: '#/blog', // New route
  BUSINESS_OWNER_DASHBOARD: '#/business/dashboard',
  BUSINESS_OWNER_PRODUCTS: '#/business/products',
  BUSINESS_OWNER_ADD_PRODUCT: '#/business/products/add',
  BUSINESS_OWNER_EDIT_PRODUCT: '#/business/products/edit/', // Append ID: #/business/products/edit/:id
  BUSINESS_OWNER_SUBSCRIPTION: '#/business/subscription',
  ADMIN_DASHBOARD: '#/admin/dashboard',
  ADMIN_USERS: '#/admin/users',
  ADMIN_PRODUCTS: '#/admin/products',
  ADMIN_CATEGORIES: '#/admin/categories',
  ADMIN_SUBSCRIPTIONS: '#/admin/subscriptions',
};

export const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: 'Electronics' },
  { id: '2', name: 'Clothes & Fashion' },
  { id: '3', name: 'Food & Beverages' },
  { id: '4', name: 'Furniture & Home Decor' },
  { id: '5', name: 'Vehicles' },
  { id: '6', name: 'Services' },
  { id: '7', name: 'Books & Stationery' },
  { id: '8', name: 'Health & Beauty' },
];

export const MOCK_RWANDA_LOCATIONS = {
  districts: [
    'Gasabo', 'Kicukiro', 'Nyarugenge', 'Bugesera', 'Kayonza', 'Kirehe',
    'Ngoma', 'Nyagatare', 'Rwamagana', 'Gisagara', 'Huye', 'Kamonyi',
    'Muhanga', 'Nyamagabe', 'Nyanza', 'Ruhango', 'Burera', 'Gakenke',
    'Gicumbi', 'Musanze', 'Rulindo', 'Karongi', 'Ngororero', 'Nyabihu',
    'Nyamasheke', 'Rubavu', 'Rusizi', 'Rutsiro'
  ],
  sectors: [
    'Kigali', 'Nyamirambo', 'Remera', 'Kimironko', 'Gatsata', 'Gisozi',
    'Kacyiru', 'Nyarugenge', 'Nyamata', 'Rukomo', 'Kayonza', 'Kirehe',
    'Gahanga', 'Gashora', 'Bwishyura', 'Cyamplavu', 'Gatenga', 'Kinihira'
  ],
};

export const SUBSCRIPTION_AMOUNT = 2000;
export const CURRENCY = 'RWF';

export const PAYMENT_OPTIONS = [
  { value: 'MTN Mobile Money', label: 'MTN Mobile Money' },
  { value: 'Airtel Money', label: 'Airtel Money' },
  { value: 'Bank Transfer', label: 'Bank Transfer (Local Rwandan Banks)' },
];

export const PLACEHOLDER_IMAGE_URL = (width: number, height: number) => `https://picsum.photos/${width}/${height}`;

// Utility to create a simple unique ID
export const generateId = (): string => Math.random().toString(36).substring(2, 9);

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'rw', name: 'Kinyarwanda' },
];
export const DEFAULT_LANGUAGE = 'en';