import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from '../../hooks/useNavigate';
import * as subscriptionService from '../../services/subscriptionService';
import { Subscription, SubscriptionStatus, PaymentMethod } from '../../types';
import Button from '../../components/Button';
import { ROUTES, SUBSCRIPTION_AMOUNT, CURRENCY, PAYMENT_OPTIONS } from '../../constants';
import Modal from '../../components/Modal';
import { useLanguage } from '../../contexts/LanguageContext';

const BusinessOwnerSubscriptionPage: React.FC = () => {
  const { user, loading: authLoading, updateUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [subscription, setSubscription] = useState<Subscription | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(PaymentMethod.MTN_MOBILE_MONEY);
  const [processingPayment, setProcessingPayment] = useState(false);

  const fetchSubscriptionStatus = useCallback(async () => {
    if (!user || user.role !== 'business_owner') return;

    setLoading(true);
    setError('');
    try {
      const currentSubscription = await subscriptionService.getSubscriptionStatus(user.id);
      setSubscription(currentSubscription);
    } catch (err: any) {
      setError(err.message || t('failedToFetchSubscriptionStatus'));
    } finally {
      setLoading(false);
    }
  }, [user, t]);

  useEffect(() => {
    if (!authLoading && user && user.role === 'business_owner') {
      fetchSubscriptionStatus();
    } else if (!authLoading && (!user || user.role !== 'business_owner')) {
      navigate(ROUTES.LOGIN); // Redirect if not authenticated or not a business owner
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const handlePayment = async () => {
    if (!user || !user.isApproved) {
      setError(t('mustBeApprovedToSubscribe'));
      return;
    }

    setProcessingPayment(true);
    setError('');
    setSuccess('');
    try {
      const newSubscription = await subscriptionService.subscribe(user.id, selectedPaymentMethod);
      setSubscription(newSubscription);
      setSuccess(t('paymentSuccessful', { method: selectedPaymentMethod }));
      // If payment affects user approval state (e.g., allows posting), update user context
      updateUser({ ...user, isApproved: true }); // Ensure isApproved is true after payment (backend would handle this logic)
      setIsPaymentModalOpen(false);
    } catch (err: any) {
      setError(err.message || t('paymentFailed'));
    } finally {
      setProcessingPayment(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-gray-600">
        {t('loadingSubscriptionDetails')}
      </div>
    );
  }

  if (error && (!user || user.role !== 'business_owner' || !user.isApproved)) {
    return (
      <div className="container mx-auto px-4 py-8 text-center bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
        <p className="font-bold">{t('accessDenied')}</p>
        <p>{error}</p>
        <p className="mt-2">{t('ensureApprovalAndSubscription')}</p>
        <Button className="mt-4" onClick={() => navigate(ROUTES.BUSINESS_OWNER_DASHBOARD)}>{t('goToDashboard')}</Button>
      </div>
    );
  }

  const isSubscribed = subscription?.status === SubscriptionStatus.ACTIVE && new Date(subscription.endDate) > new Date();
  const isApproved = user?.isApproved ?? false;

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">{t('yourSubscription')}</h2>

      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        {error && <p className="text-red-600 mb-4">{error}</p>}
        {success && <p className="text-green-600 mb-4">{success}</p>}

        <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('currentStatus')}:</h3>
        {isSubscribed ? (
          <div className="text-green-600 text-2xl font-bold mb-2">{t('active')}</div>
        ) : (
          <div className="text-red-600 text-2xl font-bold mb-2">{t('inactiveExpired')}</div>
        )}

        {subscription && (
          <p className="text-gray-700 mb-4">
            {isSubscribed ? t('renewsOn', { date: new Date(subscription.endDate).toLocaleDateString() }) : t('lastActiveUntil', { date: new Date(subscription.endDate).toLocaleDateString() })}
            <br />
            {t('paidWith')}: {subscription.paymentMethod} (ID: {subscription.transactionId})
          </p>
        )}

        {!isApproved && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mt-6" role="alert">
                <p className="font-bold">{t('adminApprovalRequired')}</p>
                <p>{t('businessNeedsApprovalToSubscribe')}</p>
            </div>
        )}

        {isApproved && !isSubscribed && (
          <div className="mt-6">
            <p className="text-lg text-gray-700 mb-4">
              {t('monthlySubscription')}: <span className="font-bold">{SUBSCRIPTION_AMOUNT} {CURRENCY}</span>
            </p>
            <Button fullWidth onClick={() => setIsPaymentModalOpen(true)} disabled={!isApproved}>
              {t('subscribeNow')}
            </Button>
          </div>
        )}
      </div>

      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title={t('subscribeModalTitle', { amount: SUBSCRIPTION_AMOUNT, currency: CURRENCY })}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsPaymentModalOpen(false)} disabled={processingPayment}>
              {t('cancel')}
            </Button>
            <Button variant="primary" onClick={handlePayment} disabled={processingPayment}>
              {processingPayment ? t('processing') : t('payNow')}
            </Button>
          </>
        }
      >
        <p className="text-gray-700 mb-4">{t('selectPaymentMethod')}:</p>
        <div className="space-y-3">
          {PAYMENT_OPTIONS.map((option) => (
            <label key={option.value} className="flex items-center space-x-3 text-gray-800 cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value={option.value}
                checked={selectedPaymentMethod === option.value}
                onChange={() => setSelectedPaymentMethod(option.value as PaymentMethod)}
                className="form-radio h-5 w-5 text-indigo-600"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
        {processingPayment && <p className="mt-4 text-center text-indigo-600">{t('simulatingPayment')}</p>}
        {error && <p className="mt-4 text-center text-red-600">{error}</p>}
      </Modal>
    </div>
  );
};

export default BusinessOwnerSubscriptionPage;