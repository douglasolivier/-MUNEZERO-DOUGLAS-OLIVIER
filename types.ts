export enum UserRole {
  CUSTOMER = 'customer',
  BUSINESS_OWNER = 'business_owner',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  email: string;
  phone: string;
  role: UserRole;
  password?: string; // Only for registration/login, not stored or exposed
  isApproved?: boolean; // For business owners, set by admin
  businessName?: string; // For business owners
  location?: LocationDetails; // For business owners
}

export interface Product {
  id: string;
  ownerId: string;
  name: string;
  category: string;
  description: string;
  price: number;
  imageUrls: string[];
  phoneNumber: string;
  location: LocationDetails;
  createdAt: string;
  updatedAt: string;
}

export interface LocationDetails {
  district: string;
  sector: string;
  village?: string;
  gps?: string; // e.g., "Lat: -1.9403, Lng: 29.8739"
}

export interface Category {
  id: string;
  name: string;
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
}

export enum PaymentMethod {
  MTN_MOBILE_MONEY = 'MTN Mobile Money',
  AIRTEL_MONEY = 'Airtel Money',
  BANK_TRANSFER = 'Bank Transfer',
}

export interface Subscription {
  id: string;
  ownerId: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  transactionId: string;
}

export interface AuthContextType {
  user: User | null;
  authToken: string | null;
  loading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  updateUser: (userData: User) => void;
}

export interface CartItem extends Product {
  quantity: number;
}

// Refactored UpdateProductParams: 'id' is passed as a separate argument to updateProduct function
// and should not be part of the `updatedFields` object.
export interface UpdateProductParams {
  name?: string;
  category?: string;
  description?: string;
  price?: number;
  imageUrls?: string[];
  phoneNumber?: string;
  location?: LocationDetails;
}