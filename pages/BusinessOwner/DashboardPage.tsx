import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from '../../hooks/useNavigate';
import { ROUTES, SUBSCRIPTION_AMOUNT, CURRENCY } from '../../constants';
import * as subscriptionService from '../../services/subscriptionService';
import { Subscription, SubscriptionStatus } from '../../types';
import Button from '../../components/Button';
import { useLanguage } from '../../contexts/LanguageContext';

const BusinessOwnerDashboardPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [subscription, setSubscription] = useState<Subscription | undefined>(undefined);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [subscriptionError, setSubscriptionError] = useState('');

  const fetchSubscriptionStatus = useCallback(async () => {
    if (!user || user.role !== 'business_owner') return;

    setLoadingSubscription(true);
    setSubscriptionError('');
    try {
      const currentSubscription = await subscriptionService.getSubscriptionStatus(user.id);
      setSubscription(currentSubscription);
    } catch (err: any) {
      setSubscriptionError(err.message || t('failedToFetchSubscriptionStatus'));
    } finally {
      setLoadingSubscription(false);
    }
  }, [user, t]);

  useEffect(() => {
    if (!authLoading && user && user.role === 'business_owner') {
      fetchSubscriptionStatus();
    } else if (!authLoading && (!user || user.role !== 'business_owner')) {
      // Redirect if not authenticated or not a business owner
      navigate(ROUTES.LOGIN);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);


  if (authLoading || loadingSubscription) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-gray-600">
        {t('loadingDashboard')}
      </div>
    );
  }

  if (!user || user.role !== 'business_owner') {
    return null; // Should be redirected by useEffect
  }

  const isApproved = user.isApproved ?? false;
  const isSubscribed = subscription?.status === SubscriptionStatus.ACTIVE && new Date(subscription.endDate) > new Date();

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">
        {t('welcomeBusinessOwner', { name: user.businessName || user.email })}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Business Approval Status Card */}
        <div className={`p-6 rounded-lg shadow-md ${isApproved ? 'bg-green-50' : 'bg-red-50'}`}>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('businessApprovalStatus')}</h3>
          <p className={`text-lg font-bold ${isApproved ? 'text-green-700' : 'text-red-700'}`}>
            {isApproved ? t('approved') : t('pendingAdminApproval')}
          </p>
          {!isApproved && (
            <p className="text-gray-600 text-sm mt-2">
              {t('businessNeedsApprovalMessage')}
            </p>
          )}
        </div>

        {/* Subscription Status Card */}
        <div className={`p-6 rounded-lg shadow-md ${isSubscribed ? 'bg-blue-50' : 'bg-yellow-50'}`}>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('subscriptionStatus')}</h3>
          <p className={`text-lg font-bold ${isSubscribed ? 'text-blue-700' : 'text-yellow-700'}`}>
            {isSubscribed ? t('active') : t('inactiveExpired')}
          </p>
          {subscription && isSubscribed && (
            <p className="text-gray-600 text-sm mt-2">
              {t('expires')}: {new Date(subscription.endDate).toLocaleDateString()}
            </p>
          )}
          {!isSubscribed && isApproved && (
            <div className="mt-4">
              <Button onClick={() => navigate(ROUTES.BUSINESS_OWNER_SUBSCRIPTION)} fullWidth>
                {t('subscribeNow', { amount: SUBSCRIPTION_AMOUNT, currency: CURRENCY })}
              </Button>
            </div>
          )}
          {!isApproved && (
            <p className="text-gray-600 text-sm mt-2">
              {t('mustBeApprovedToSubscribe')}
            </p>
          )}
          {subscriptionError && (
            <p className="text-red-600 text-sm mt-2">{subscriptionError}</p>
          )}
        </div>

        {/* Quick Actions Card */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('quickActions')}</h3>
          <div className="space-y-3 mt-4">
            <Button onClick={() => navigate(ROUTES.BUSINESS_OWNER_PRODUCTS)} fullWidth>
              {t('manageProducts')}
            </Button>
            <Button onClick={() => navigate(ROUTES.BUSINESS_OWNER_ADD_PRODUCT)} variant="secondary" fullWidth disabled={!isApproved || !isSubscribed}>
              {t('addNewProduct')}
            </Button>
            {!isApproved && <p className="text-red-500 text-sm">{t('requiresAdminApproval')}</p>}
            {!isSubscribed && isApproved && <p className="text-red-500 text-sm">{t('requiresActiveSubscription')}</p>}
          </div>
        </div>
      </div>

      <div className="mt-12 text-center">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">{t('yourBusinessProfile')}</h3>
        <div className="bg-white p-6 rounded-lg shadow-md inline-block text-left">
          <p className="text-lg text-gray-700 mb-2">
            <span className="font-semibold">{t('businessName')}:</span> {user.businessName || t('notAvailable')}
          </p>
          <p className="text-lg text-gray-700 mb-2">
            <span className="font-semibold">{t('email')}:</span> {user.email}
          </p>
          <p className="text-lg text-gray-700 mb-2">
            <span className="font-semibold">{t('phone')}:</span> {user.phone}
          </p>
          <p className="text-lg text-gray-700 mb-2">
            <span className="font-semibold">{t('location')}:</span>{' '}
            {user.location ? `${user.location.district}, ${user.location.sector}` : t('notAvailable')}
            {user.location?.village && <>, {user.location.village}</>}
            {user.location?.gps && <>, GPS: {user.location.gps}</>}
          </p>
          {/* Add an edit profile button here if desired */}
        </div>
      </div>
    </div>
  );
};

export default BusinessOwnerDashboardPage;