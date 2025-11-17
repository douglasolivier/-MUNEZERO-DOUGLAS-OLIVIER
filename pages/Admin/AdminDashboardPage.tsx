import React, { ReactNode, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from '../../hooks/useNavigate';
import { UserRole } from '../../types';
import { ROUTES } from '../../constants';
import { Sidebar, SidebarLink } from '../../components/Sidebar';
import AdminUserManagementPage from './AdminUserManagementPage';
import AdminAllProductsManagementPage from './AdminAllProductsManagementPage';
import AdminCategoryManagementPage from './AdminCategoryManagementPage';
import AdminSubscriptionManagementPage from './AdminSubscriptionManagementPage';
import { useLanguage } from '../../contexts/LanguageContext';

const AdminDashboardPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Determine current active sub-page based on hash
  const [activeSubPage, setActiveSubPage] = useState<string>('');

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== UserRole.ADMIN) {
        navigate(ROUTES.LOGIN); // Redirect if not admin
      } else {
        const currentHash = window.location.hash;
        if (currentHash.startsWith(ROUTES.ADMIN_DASHBOARD)) {
          // Extract the specific admin sub-route
          const subRoute = currentHash.replace(ROUTES.ADMIN_DASHBOARD, '');
          setActiveSubPage(subRoute === '' ? ROUTES.ADMIN_USERS : currentHash); // Default to users if just #/admin/dashboard
        } else {
          // If navigated directly to #/admin/dashboard or not a sub-route, default to users
          setActiveSubPage(ROUTES.ADMIN_USERS);
          navigate(ROUTES.ADMIN_USERS); // Ensure URL reflects default
        }
      }
    }
  }, [user, authLoading, navigate]);

  const renderAdminContent = useCallback((): ReactNode => {
    switch (activeSubPage) {
      case ROUTES.ADMIN_USERS:
        return <AdminUserManagementPage />;
      case ROUTES.ADMIN_PRODUCTS:
        return <AdminAllProductsManagementPage />;
      case ROUTES.ADMIN_CATEGORIES:
        return <AdminCategoryManagementPage />;
      case ROUTES.ADMIN_SUBSCRIPTIONS:
        return <AdminSubscriptionManagementPage />;
      default:
        return <AdminUserManagementPage />; // Default content
    }
  }, [activeSubPage]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-128px)] text-lg text-gray-700">
        {t('loadingAdminDashboard')}
      </div>
    );
  }

  if (!user || user.role !== UserRole.ADMIN) {
    return null; // Should be redirected by useEffect
  }

  return (
    <div className="flex min-h-[calc(100vh-128px)] bg-gray-100">
      <Sidebar title={t('adminPanel')}>
        <SidebarLink href={ROUTES.ADMIN_USERS} isActive={activeSubPage === ROUTES.ADMIN_USERS}>
          {t('userManagement')}
        </SidebarLink>
        <SidebarLink href={ROUTES.ADMIN_PRODUCTS} isActive={activeSubPage === ROUTES.ADMIN_PRODUCTS}>
          {t('productManagement')}
        </SidebarLink>
        <SidebarLink href={ROUTES.ADMIN_CATEGORIES} isActive={activeSubPage === ROUTES.ADMIN_CATEGORIES}>
          {t('categoryManagement')}
        </SidebarLink>
        <SidebarLink href={ROUTES.ADMIN_SUBSCRIPTIONS} isActive={activeSubPage === ROUTES.ADMIN_SUBSCRIPTIONS}>
          {t('subscriptionManagement')}
        </SidebarLink>
      </Sidebar>

      <div className="flex-grow p-4 md:p-8">
        {renderAdminContent()}
      </div>
    </div>
  );
};

export default AdminDashboardPage;