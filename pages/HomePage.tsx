import React from 'react';
import { ROUTES, PLACEHOLDER_IMAGE_URL } from '../constants';
import Button from '../components/Button';
import { useLanguage } from '../contexts/LanguageContext';

const HomePage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto py-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
          {t('welcomeTo')} <span className="text-indigo-600">{t('appName')}</span>
        </h1>
        <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
          {t('homePageTagline')}
        </p>
      </header>

      <section className="grid md:grid-cols-2 gap-8 items-center mb-12">
        <div className="text-center md:text-left p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">{t('findAmazingProducts')}</h2>
          <p className="text-lg text-gray-700 mb-6">
            {t('findProductsDescription')}
          </p>
          <Button onClick={() => window.location.hash = ROUTES.PRODUCTS} size="lg">
            {t('shopNow')}
          </Button>
        </div>
        <div className="relative overflow-hidden rounded-lg shadow-lg">
          <img
            src={PLACEHOLDER_IMAGE_URL(800, 600)}
            alt={t('shoppingForProductsAlt')}
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-50"></div>
          <p className="absolute bottom-4 left-4 text-white text-xl font-semibold">{t('diverseCategories')}</p>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-8 items-center flex-row-reverse">
        <div className="text-center md:text-left p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">{t('boostYourBusiness')}</h2>
          <p className="text-lg text-gray-700 mb-6">
            {t('boostBusinessDescription')}
          </p>
          <Button onClick={() => window.location.hash = ROUTES.REGISTER} size="lg" variant="outline">
            {t('registerYourBusiness')}
          </Button>
        </div>
        <div className="relative overflow-hidden rounded-lg shadow-lg">
          <img
            src={PLACEHOLDER_IMAGE_URL(800, 601)}
            alt={t('businessOwnerManagingProductsAlt')}
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-50"></div>
          <p className="absolute bottom-4 left-4 text-white text-xl font-semibold">{t('showcaseProducts')}</p>
        </div>
      </section>

      <section className="mt-16 text-center bg-indigo-50 p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-indigo-700 mb-4">{t('whyChooseShoraMall', { appName: t('appName') })}</h2>
        <div className="grid md:grid-cols-3 gap-8 mt-8">
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('localFocusTitle')}</h3>
            <p className="text-gray-600">{t('localFocusDescription')}</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('easyToUseTitle')}</h3>
            <p className="text-gray-600">{t('easyToUseDescription')}</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('secureReliableTitle')}</h3>
            <p className="text-gray-600">{t('secureReliableDescription')}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;