import { Subscription, SubscriptionStatus, PaymentMethod, UserRole } from '../types';
import { generateId, SUBSCRIPTION_AMOUNT, CURRENCY } from '../constants';
import * as authService from './authService';

// Mock in-memory database for subscriptions
let mockSubscriptions: Subscription[] = [
  {
    id: 'sub1',
    ownerId: 'business1',
    status: SubscriptionStatus.ACTIVE,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    amount: SUBSCRIPTION_AMOUNT,
    currency: CURRENCY,
    paymentMethod: PaymentMethod.MTN_MOBILE_MONEY,
    transactionId: 'MTN-12345',
  },
  {
    id: 'sub_unapproved',
    ownerId: 'unapproved_business',
    status: SubscriptionStatus.INACTIVE,
    startDate: '',
    endDate: '',
    amount: SUBSCRIPTION_AMOUNT,
    currency: CURRENCY,
    paymentMethod: PaymentMethod.MTN_MOBILE_MONEY,
    transactionId: '',
  }
];

export const getSubscriptionStatus = async (ownerId: string): Promise<Subscription | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Find the latest subscription for the owner
      const subs = mockSubscriptions
        .filter((s) => s.ownerId === ownerId)
        .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());
      resolve(subs.length > 0 ? subs[0] : undefined);
    }, 300);
  });
};

export const subscribe = async (
  ownerId: string,
  paymentMethod: PaymentMethod,
): Promise<Subscription> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // In a real app, this would integrate with payment gateways
      console.log(`Simulating payment for ${ownerId} via ${paymentMethod}`);

      const users = authService.getMockUsers();
      const owner = users.find(u => u.id === ownerId);

      if (!owner || owner.role !== UserRole.BUSINESS_OWNER) {
        reject(new Error('Only business owners can subscribe.'));
        return;
      }
      if (!owner.isApproved) {
         reject(new Error('Your business account must be approved by an admin before subscribing.'));
         return;
      }

      const now = new Date();
      const newSubscription: Subscription = {
        id: generateId(),
        ownerId,
        status: SubscriptionStatus.ACTIVE,
        startDate: now.toISOString(),
        endDate: new Date(now.setMonth(now.getMonth() + 1)).toISOString(), // 1 month validity
        amount: SUBSCRIPTION_AMOUNT,
        currency: CURRENCY,
        paymentMethod,
        transactionId: `TXN-${generateId()}`,
      };

      // Remove any existing active subscription for this owner and add the new one
      mockSubscriptions = mockSubscriptions.filter(s => s.ownerId !== ownerId || s.status !== SubscriptionStatus.ACTIVE);
      mockSubscriptions.push(newSubscription);
      resolve(newSubscription);
    }, 1500); // Simulate payment processing time
  });
};

export const getPayments = async (): Promise<Subscription[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockSubscriptions]);
    }, 300);
  });
};

export const getMockSubscriptions = (): Subscription[] => [...mockSubscriptions];