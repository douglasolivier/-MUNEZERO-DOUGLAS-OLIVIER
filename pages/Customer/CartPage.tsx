import React, { useState, useEffect } from 'react';
import { CartItem } from '../../types';
import Button from '../../components/Button';
import { ROUTES, PLACEHOLDER_IMAGE_URL } from '../../constants';
import { useLanguage } from '../../contexts/LanguageContext';

const CartPage: React.FC = () => {
  const { t } = useLanguage();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  const updateCartInStorage = (updatedCart: CartItem[]) => {
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const handleQuantityChange = (id: string, delta: number) => {
    const updatedCart = cartItems
      .map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
      .filter((item) => item.quantity > 0); // Remove if quantity drops to 0
    updateCartInStorage(updatedCart);
  };

  const handleRemoveItem = (id: string) => {
    const updatedCart = cartItems.filter((item) => item.id !== id);
    updateCartInStorage(updatedCart);
  };

  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">{t('yourShoppingCart')}</h2>

      {cartItems.length === 0 ? (
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <p className="text-xl text-gray-600 mb-4">{t('cartIsEmpty')}</p>
          <Button onClick={() => window.location.hash = ROUTES.PRODUCTS}>
            {t('startShopping')}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <div className="divide-y divide-gray-200">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center py-4">
                  <img
                    src={item.imageUrls[0] || PLACEHOLDER_IMAGE_URL(100,100)}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-md mr-4 flex-shrink-0"
                  />
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.category}</p>
                    <p className="text-lg font-bold text-indigo-600 mt-1">
                      {item.price.toLocaleString('en-RW', { style: 'currency', currency: 'RWF' })}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleQuantityChange(item.id, -1)}
                      aria-label={t('decreaseQuantity')}
                    >
                      -
                    </Button>
                    <span className="text-lg font-medium">{item.quantity}</span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleQuantityChange(item.id, 1)}
                      aria-label={t('increaseQuantity')}
                    >
                      +
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRemoveItem(item.id)}
                      aria-label={t('removeItem')}
                    >
                      {t('remove')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-6 h-fit">
            <h3 className="text-xl font-bold text-gray-800 mb-4">{t('orderSummary')}</h3>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700">{t('subtotal')}:</span>
              <span className="font-semibold text-lg">
                {cartTotal.toLocaleString('en-RW', { style: 'currency', currency: 'RWF' })}
              </span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-700">{t('shipping')}:</span>
              <span className="font-semibold text-lg">{t('free')}</span>
            </div>
            <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
              <span className="text-xl font-bold text-gray-800">{t('total')}:</span>
              <span className="text-2xl font-extrabold text-indigo-700">
                {cartTotal.toLocaleString('en-RW', { style: 'currency', currency: 'RWF' })}
              </span>
            </div>
            <Button fullWidth className="mt-6" disabled>
              {t('proceedToCheckout')}
            </Button>
            <Button fullWidth variant="outline" className="mt-4" onClick={() => window.location.hash = ROUTES.PRODUCTS}>
              {t('continueShopping')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;