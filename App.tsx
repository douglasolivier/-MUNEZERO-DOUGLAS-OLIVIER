import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/Auth/RegisterPage';
import LoginPage from './pages/Auth/LoginPage';
import ProductsListPage from './pages/Customer/ProductsListPage';
import ProductDetailPage from './pages/Customer/ProductDetailPage';
import CartPage from './pages/Customer/CartPage';
import BusinessOwnerDashboardPage from './pages/BusinessOwner/DashboardPage';
import BusinessOwnerProductManagementPage from './pages/BusinessOwner/ProductManagementPage';
import AddEditProductPage from './pages/BusinessOwner/AddEditProductPage';
import BusinessOwnerSubscriptionPage from './pages/BusinessOwner/SubscriptionPage';
import AdminDashboardPage from './pages/Admin/AdminDashboardPage';
import AdminUserManagementPage from './pages/Admin/AdminUserManagementPage';
import AdminAllProductsManagementPage from './pages/Admin/AdminAllProductsManagementPage';
import AdminCategoryManagementPage from './pages/Admin/AdminCategoryManagementPage';
import AdminSubscriptionManagementPage from './pages/Admin/AdminSubscriptionManagementPage';
import AboutUsPage from './pages/AboutUsPage'; // New Page Import
import BlogPage from './pages/BlogPage'; // New Page Import
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext'; // Import LanguageProvider
import { UserRole } from './types';
import { ROUTES } from './constants';

// Custom hook to handle hash-based routing
const useLocationHash = () => {
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    // Set initial hash if not present
    if (window.location.hash === '') {
      window.location.hash = ROUTES.HOME;
    }
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return hash;
};

// Component to handle routing logic within App.tsx
const Router: React.FC = () => {
  const hash = useLocationHash();
  const { user, loading } = useAuth();
  const { t } = useLanguage(); // Use for loading message translation

  const getPage = useCallback(() => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[calc(100vh-128px)] text-lg text-gray-700">
          {t('loadingUserSession')}
        </div>
      );
    }

    // Public routes accessible by anyone
    if (hash === ROUTES.HOME) return <HomePage />;
    if (hash === ROUTES.REGISTER) return <RegisterPage />;
    if (hash === ROUTES.LOGIN) return <LoginPage />;
    if (hash === ROUTES.PRODUCTS) return <ProductsListPage />;
    if (hash.startsWith(ROUTES.PRODUCT_DETAIL)) return <ProductDetailPage />;
    if (hash === ROUTES.CART) return <CartPage />;
    if (hash === ROUTES.ABOUT_US) return <AboutUsPage />; // New Route
    if (hash === ROUTES.BLOG) return <BlogPage />; // New Route


    // Redirect unauthenticated users from protected routes
    if (!user) {
      window.location.hash = ROUTES.HOME;
      return <HomePage />;
    }

    // Role-specific routes
    switch (user.role) {
      case UserRole.BUSINESS_OWNER:
        if (hash === ROUTES.BUSINESS_OWNER_DASHBOARD) return <BusinessOwnerDashboardPage />;
        if (hash === ROUTES.BUSINESS_OWNER_PRODUCTS) return <BusinessOwnerProductManagementPage />;
        if (hash === ROUTES.BUSINESS_OWNER_ADD_PRODUCT) return <AddEditProductPage />;
        if (hash.startsWith(ROUTES.BUSINESS_OWNER_EDIT_PRODUCT)) return <AddEditProductPage />; // Reuse for edit
        if (hash === ROUTES.BUSINESS_OWNER_SUBSCRIPTION) return <BusinessOwnerSubscriptionPage />;
        break;
      case UserRole.ADMIN:
        // Admin dashboard is a parent route for other admin pages
        if (hash.startsWith(ROUTES.ADMIN_DASHBOARD)) {
          // Determine which sub-admin page to render
          if (hash === ROUTES.ADMIN_USERS) return <AdminUserManagementPage />;
          if (hash === ROUTES.ADMIN_PRODUCTS) return <AdminAllProductsManagementPage />;
          if (hash === ROUTES.ADMIN_CATEGORIES) return <AdminCategoryManagementPage />;
          if (hash === ROUTES.ADMIN_SUBSCRIPTIONS) return <AdminSubscriptionManagementPage />;
          // Default admin view
          return <AdminUserManagementPage />;
        }
        break;
      case UserRole.CUSTOMER:
        // No specific customer-only authenticated routes yet, they use public ones.
        // Can add 'My Orders' etc. in future.
        break;
      default:
        break;
    }

    // Default to home if no specific route matches or unauthorized
    window.location.hash = ROUTES.HOME;
    return <HomePage />;
  }, [hash, user, loading, t]);

  return <main className="flex-grow p-4 md:p-8 bg-gray-50">{getPage()}</main>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <Router />
          <Footer />
        </div>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;