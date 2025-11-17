import React, { useState } from 'react';
import { useNavigate } from '../../hooks/useNavigate';
import { useAuth } from '../../contexts/AuthContext';
import * as authService from '../../services/authService';
import { UserRole } from '../../types';
import { ROUTES } from '../../constants';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useLanguage } from '../../contexts/LanguageContext';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [identifier, setIdentifier] = useState(''); // Can be email or phone
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { token, user } = await authService.login(identifier, password);
      login(token, user);
      setSuccess(t('loginSuccessful'));
      setTimeout(() => {
        switch (user.role) {
          case UserRole.BUSINESS_OWNER:
            navigate(ROUTES.BUSINESS_OWNER_DASHBOARD);
            break;
          case UserRole.ADMIN:
            navigate(ROUTES.ADMIN_DASHBOARD);
            break;
          case UserRole.CUSTOMER:
          default:
            navigate(ROUTES.PRODUCTS);
            break;
        }
      }, 1000);
    } catch (err: any) {
      setError(err.message || t('loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">{t('loginToApp', { appName: t('appName') })}</h2>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        {error && <p className="text-red-600 text-center mb-4">{error}</p>}
        {success && <p className="text-green-600 text-center mb-4">{success}</p>}

        <Input
          id="identifier"
          label={t('emailOrPhoneNumber')}
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder={t('emailOrPhonePlaceholder')}
          required
        />
        <Input
          id="password"
          label={t('password')}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="********"
          required
        />

        <Button type="submit" fullWidth disabled={loading} className="mt-6">
          {loading ? t('loggingIn') : t('login')}
        </Button>
      </form>

      <p className="text-center text-gray-600 mt-6">
        {t('dontHaveAccount')}{' '}
        <a href={ROUTES.REGISTER} className="text-indigo-600 hover:underline">
          {t('registerHere')}
        </a>
      </p>
    </div>
  );
};

export default LoginPage;