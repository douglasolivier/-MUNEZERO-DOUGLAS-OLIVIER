import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES, LANGUAGES } from '../constants';
import { UserRole } from '../types';
import Button from './Button';
import { useLanguage } from '../contexts/LanguageContext'; // Import useLanguage

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { t, currentLanguage, setLanguage } = useLanguage(); // Use the language context
  const [isOpen, setIsOpen] = useState(false); // State for mobile menu

  const toggleMenu = () => setIsOpen(!isOpen);

  const renderNavLinks = () => {
    // Common links for all users (or default if not logged in)
    const commonLinks = (
      <>
        <a href={ROUTES.PRODUCTS} className="nav-link">{t('products')}</a>
        <a href={ROUTES.ABOUT_US} className="nav-link">{t('aboutUs')}</a>
        <a href={ROUTES.BLOG} className="nav-link">{t('blog')}</a>
      </>
    );

    switch (user?.role) {
      case UserRole.BUSINESS_OWNER:
        return (
          <>
            <a href={ROUTES.BUSINESS_OWNER_DASHBOARD} className="nav-link">{t('dashboard')}</a>
            <a href={ROUTES.BUSINESS_OWNER_PRODUCTS} className="nav-link">{t('myProducts')}</a>
            <a href={ROUTES.BUSINESS_OWNER_SUBSCRIPTION} className="nav-link">{t('subscription')}</a>
            <Button onClick={logout} variant="secondary" size="sm">{t('logout')}</Button>
          </>
        );
      case UserRole.ADMIN:
        return (
          <>
            <a href={ROUTES.ADMIN_DASHBOARD} className="nav-link">{t('adminDashboard')}</a>
            <Button onClick={logout} variant="secondary" size="sm">{t('logout')}</Button>
          </>
        );
      case UserRole.CUSTOMER:
        return (
          <>
            {commonLinks}
            <a href={ROUTES.CART} className="nav-link">{t('cart')}</a>
            <Button onClick={logout} variant="secondary" size="sm">{t('logout')}</Button>
          </>
        );
      default:
        return (
          <>
            {commonLinks}
            <a href={ROUTES.LOGIN} className="nav-link">{t('login')}</a>
            <a href={ROUTES.REGISTER} className="nav-link">{t('register')}</a>
          </>
        );
    }
  };

  return (
    <nav className="bg-indigo-600 text-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <a href={ROUTES.HOME} className="text-2xl font-bold">
          {t('appName')}
        </a>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center space-x-2">
          {/* Language Switcher for mobile */}
          <div className="relative">
            <select
              value={currentLanguage}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-indigo-700 text-white text-sm py-1 px-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label={t('selectLanguage')}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.code.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          <Button onClick={toggleMenu} variant="ghost" aria-label={t('toggleNavigation')}>
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16m-7 6h7'}
              ></path>
            </svg>
          </Button>
        </div>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center space-x-4">
          {renderNavLinks()}
          {/* Language Switcher for desktop */}
          <div className="relative ml-4">
            <select
              value={currentLanguage}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-indigo-700 text-white text-sm py-1 px-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label={t('selectLanguage')}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Mobile menu content */}
      {isOpen && (
        <div className="md:hidden bg-indigo-700 pb-2">
          <div className="flex flex-col items-start px-4 space-y-2">
            {renderNavLinks()}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;