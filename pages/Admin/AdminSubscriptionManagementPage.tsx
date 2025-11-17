import React, { useEffect, useState, useCallback } from 'react';
import * as subscriptionService from '../../services/subscriptionService';
import * as authService from '../../services/authService';
import { Subscription, SubscriptionStatus, User } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

const AdminSubscriptionManagementPage: React.FC = () => {
  const { t } = useLanguage();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [users, setUsers] = useState<User[]>([]); // To get business owner details
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSubscriptionsAndUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const fetchedSubscriptions = await subscriptionService.getPayments();
      const fetchedUsers = await authService.getMockUsers();
      setSubscriptions(fetchedSubscriptions);
      setUsers(fetchedUsers);
    } catch (err: any) {
      setError(err.message || t('failedToFetchData'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchSubscriptionsAndUsers();
  }, [fetchSubscriptionsAndUsers]);

  const getBusinessOwnerEmail = (ownerId: string): string => {
    const owner = users.find(u => u.id === ownerId);
    return owner ? owner.email : t('notAvailable');
  };

  const getBusinessOwnerName = (ownerId: string): string => {
    const owner = users.find(u => u.id === ownerId);
    return owner ? owner.businessName || owner.email : t('notAvailable');
  };

  // Sort subscriptions by end date, most recent first
  const sortedSubscriptions = [...subscriptions].sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());

  return (
    <div className="px-4">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">{t('subscriptionManagement')}</h2>
      <p className="text-gray-600 mb-6">{t('viewAllSubscriptions')}</p>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {loading ? (
        <p className="text-center text-gray-600 text-lg">{t('loadingSubscriptions')}</p>
      ) : sortedSubscriptions.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">{t('noSubscriptionsFound')}</p>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('businessOwner')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('status')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('amount')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('paymentMethod')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('transactionID')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('startDate')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('endDate')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedSubscriptions.map((sub) => (
                <tr key={sub.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {getBusinessOwnerName(sub.ownerId)} ({getBusinessOwnerEmail(sub.ownerId)})
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        sub.status === SubscriptionStatus.ACTIVE && new Date(sub.endDate) > new Date() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {sub.status === SubscriptionStatus.ACTIVE && new Date(sub.endDate) > new Date() ? t('active') : t('expired')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sub.amount.toLocaleString('en-RW', { style: 'currency', currency: sub.currency })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sub.paymentMethod}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sub.transactionId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(sub.startDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(sub.endDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminSubscriptionManagementPage;