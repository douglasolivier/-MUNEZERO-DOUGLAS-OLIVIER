import React from 'react';
import { ROUTES } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-800 text-white p-6 mt-auto">
      <div className="container mx-auto text-center">
        <div className="mb-4">
          <a href={ROUTES.HOME} className="text-lg font-semibold hover:text-indigo-400 transition-colors">
            {t('appName')}
          </a>
        </div>
        <nav className="mb-4 space-x-4">
          <a href={ROUTES.PRODUCTS} className="hover:text-indigo-400 transition-colors">{t('products')}</a>
          <a href={ROUTES.ABOUT_US} className="hover:text-indigo-400 transition-colors">{t('aboutUs')}</a>
          <a href={ROUTES.BLOG} className="hover:text-indigo-400 transition-colors">{t('blog')}</a>
          <a href={ROUTES.LOGIN} className="hover:text-indigo-400 transition-colors">{t('businessLogin')}</a>
          <a href={ROUTES.REGISTER} className="hover:text-indigo-400 transition-colors">{t('register')}</a>
          {/* Add more links like About, Contact Us, Privacy Policy etc. */}
        </nav>
        <p className="text-sm text-gray-400">
          &copy; {new Date().getFullYear()} {t('appName')}. {t('allRightsReserved')}.
        </p>
      </div>
    </footer>
  );
};

export default Footer;