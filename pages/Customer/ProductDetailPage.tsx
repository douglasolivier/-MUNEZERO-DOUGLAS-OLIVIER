import React, { useState, useEffect, useCallback } from 'react';
import * as productService from '../../services/productService';
import { Product, CartItem } from '../../types';
import Button from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../constants';
import { useLanguage } from '../../contexts/LanguageContext';

const ProductDetailPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const productId = window.location.hash.split('/').pop();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [cartMessage, setCartMessage] = useState('');

  const fetchProduct = useCallback(async () => {
    if (!productId) {
      setError(t('productIDNotFound'));
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const fetchedProduct = await productService.getProductById(productId);
      if (fetchedProduct) {
        setProduct(fetchedProduct);
      } else {
        setError(t('productNotFound'));
      }
    } catch (err: any) {
      setError(err.message || t('failedToFetchProductDetails'));
    } finally {
      setLoading(false);
    }
  }, [productId, t]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleAddToCart = () => {
    if (product) {
      const cart: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingItemIndex = cart.findIndex(item => item.id === product.id);

      if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += quantity;
      } else {
        cart.push({ ...product, quantity });
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      setCartMessage(t('productAddedToCart', { quantity, productName: product.name }));
      setTimeout(() => setCartMessage(''), 3000);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-600">{t('loadingProductDetails')}</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  if (!product) {
    return <div className="text-center py-8 text-gray-600">{t('productNotFound')}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden md:flex">
        <div className="md:w-1/2 p-4">
          <img
            src={product.imageUrls[0]}
            alt={product.name}
            className="w-full h-80 object-cover rounded-lg"
          />
          {product.imageUrls.length > 1 && (
            <div className="flex space-x-2 mt-4 overflow-x-auto">
              {product.imageUrls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  className="w-24 h-24 object-cover rounded-md cursor-pointer border border-gray-200 hover:border-indigo-500"
                />
              ))}
            </div>
          )}
        </div>
        <div className="md:w-1/2 p-6 flex flex-col justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900">{product.name}</h1>
            <p className="text-indigo-600 text-lg font-semibold mt-2">{product.category}</p>
            <p className="text-gray-700 text-base mt-4 leading-relaxed">{product.description}</p>

            <div className="mt-6 flex items-baseline space-x-2">
              <span className="text-5xl font-extrabold text-indigo-700">
                {product.price.toLocaleString('en-RW', { style: 'currency', currency: 'RWF' })}
              </span>
            </div>

            <div className="mt-6 border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('businessDetails')}:</h3>
              <p className="text-gray-700">
                {t('contact')}: <span className="font-medium">{product.phoneNumber}</span>
              </p>
              <p className="text-gray-700">
                {t('location')}: <span className="font-medium">{product.location.district}, {product.location.sector}</span>
                {product.location.village && <>, <span className="font-medium">{product.location.village}</span></>}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col md:flex-row gap-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="secondary"
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                aria-label={t('decreaseQuantity')}
              >
                -
              </Button>
              <span className="text-xl font-bold">{quantity}</span>
              <Button
                variant="secondary"
                onClick={() => setQuantity(prev => prev + 1)}
                aria-label={t('increaseQuantity')}
              >
                +
              </Button>
            </div>
            <Button onClick={handleAddToCart} variant="primary" fullWidth className="md:w-auto">
              {t('addToCart')}
            </Button>
          </div>
          {cartMessage && <p className="mt-4 text-green-600 text-center">{cartMessage}</p>}
        </div>
      </div>
      <div className="mt-8 text-center">
        <Button variant="outline" onClick={() => window.location.hash = ROUTES.PRODUCTS}>
          {t('backToProducts')}
        </Button>
      </div>
    </div>
  );
};

export default ProductDetailPage;