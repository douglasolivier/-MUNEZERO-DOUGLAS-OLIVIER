import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from '../../hooks/useNavigate';
import * as productService from '../../services/productService';
import * as subscriptionService from '../../services/subscriptionService';
import { Product, SubscriptionStatus } from '../../types';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { ROUTES } from '../../constants';
import { useLanguage } from '../../contexts/LanguageContext';

const BusinessOwnerProductManagementPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const fetchProductsAndStatus = useCallback(async () => {
    if (!user || user.role !== 'business_owner') return;

    setLoading(true);
    setError('');
    try {
      const fetchedProducts = await productService.getProducts(user.id);
      setProducts(fetchedProducts);

      const subscription = await subscriptionService.getSubscriptionStatus(user.id);
      setIsSubscribed(subscription?.status === SubscriptionStatus.ACTIVE && new Date(subscription.endDate) > new Date());
      setIsApproved(user.isApproved ?? false);

    } catch (err: any) {
      setError(err.message || t('failedToFetchProductsOrSubscription'));
    } finally {
      setLoading(false);
    }
  }, [user, t]);

  useEffect(() => {
    if (!authLoading && user && user.role === 'business_owner') {
      fetchProductsAndStatus();
    } else if (!authLoading && (!user || user.role !== 'business_owner')) {
      navigate(ROUTES.LOGIN); // Redirect if not authenticated or not a business owner
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      setLoading(true);
      try {
        await productService.deleteProduct(productToDelete.id);
        fetchProductsAndStatus(); // Re-fetch products to update the list
        setError('');
      } catch (err: any) {
        setError(err.message || t('failedToDeleteProduct'));
      } finally {
        setLoading(false);
        setIsDeleteModalOpen(false);
        setProductToDelete(null);
      }
    }
  };

  if (authLoading || loading) {
    return <div className="container mx-auto px-4 py-8 text-center text-gray-600">{t('loadingProducts')}</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-600">{error}</div>;
  }

  if (!user || user.role !== 'business_owner') {
    return null; // Should be redirected
  }

  const canAddProducts = isApproved && isSubscribed;

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">{t('myProducts')}</h2>

      {!canAddProducts && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p className="font-bold">{t('actionRequired')}</p>
          <p>{t('subscriptionAndApprovalNeeded')}</p>
          {!isApproved && <p className="mt-2">{t('status')}: {t('pendingAdminApproval')}.</p>}
          {!isSubscribed && <p className="mt-2">{t('status')}: {t('inactiveSubscription')}. <a href={ROUTES.BUSINESS_OWNER_SUBSCRIPTION} className="underline">{t('subscribeNowLink')}</a></p>}
        </div>
      )}

      <div className="flex justify-end mb-6">
        <Button onClick={() => navigate(ROUTES.BUSINESS_OWNER_ADD_PRODUCT)} disabled={!canAddProducts}>
          {t('addNewProduct')}
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <p className="text-xl text-gray-600 mb-4">{t('noProductsPosted')}</p>
          <Button onClick={() => navigate(ROUTES.BUSINESS_OWNER_ADD_PRODUCT)} disabled={!canAddProducts}>
            {t('addYourFirstProduct')}
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('image')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('productName')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('category')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('price')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img src={product.imageUrls[0]} alt={product.name} className="h-12 w-12 rounded object-cover" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.price.toLocaleString('en-RW', { style: 'currency', currency: 'RWF' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`${ROUTES.BUSINESS_OWNER_EDIT_PRODUCT}${product.id}`)}
                      disabled={!canAddProducts}
                    >
                      {t('edit')}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteClick(product)}
                      disabled={!canAddProducts}
                    >
                      {t('delete')}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={t('confirmDeletion')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
              {t('cancel')}
            </Button>
            <Button variant="danger" onClick={confirmDelete} disabled={loading}>
              {loading ? t('deleting') : t('delete')}
            </Button>
          </>
        }
      >
        <p className="text-gray-700">
          {t('confirmDeleteProductMessage', { productName: productToDelete?.name || '' })}
        </p>
      </Modal>
    </div>
  );
};

export default BusinessOwnerProductManagementPage;