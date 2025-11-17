import React, { useState } from 'react';
import { useNavigate } from '../../hooks/useNavigate'; // Custom hook for hash-based navigation
import { useAuth } from '../../contexts/AuthContext';
import * as authService from '../../services/authService';
import { UserRole } from '../../types';
import { ROUTES, MOCK_RWANDA_LOCATIONS } from '../../constants';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useLanguage } from '../../contexts/LanguageContext';

const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.CUSTOMER);
  const [businessName, setBusinessName] = useState('');
  const [district, setDistrict] = useState('');
  const [sector, setSector] = useState('');
  const [village, setVillage] = useState(''); // Optional
  const [gps, setGps] = useState(''); // Optional

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validateForm = () => {
    setError('');
    if (!email || !phone || !password || !confirmPassword) {
      setError(t('allFieldsRequired'));
      return false;
    }
    if (password !== confirmPassword) {
      setError(t('passwordsDoNotMatch'));
      return false;
    }
    if (role === UserRole.BUSINESS_OWNER) {
      if (!businessName || !district || !sector) {
        setError(t('businessDetailsRequired'));
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const location =
        role === UserRole.BUSINESS_OWNER
          ? { district, sector, village, gps }
          : undefined;

      const { token, user } = await authService.register(
        email,
        phone,
        password,
        role,
        businessName,
        location,
      );
      login(token, user);
      setSuccess(t('registrationSuccessful'));
      setTimeout(() => {
        if (user.role === UserRole.BUSINESS_OWNER) {
          navigate(ROUTES.BUSINESS_OWNER_DASHBOARD);
        } else if (user.role === UserRole.ADMIN) {
          navigate(ROUTES.ADMIN_DASHBOARD);
        } else {
          navigate(ROUTES.PRODUCTS); // Default for customers
        }
      }, 1500);
    } catch (err: any) {
      setError(err.message || t('registrationFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">{t('registerForApp', { appName: t('appName') })}</h2>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        {error && <p className="text-red-600 text-center mb-4">{error}</p>}
        {success && <p className="text-green-600 text-center mb-4">{success}</p>}

        <Input
          id="email"
          label={t('email')}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('emailPlaceholder')}
          required
        />
        <Input
          id="phone"
          label={t('phoneNumberLabel')}
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t('phoneNumberPlaceholder')}
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
        <Input
          id="confirmPassword"
          label={t('confirmPassword')}
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="********"
          required
        />

        <div className="mb-4">
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            {t('registerAs')}:
          </label>
          <select
            id="role"
            className="block w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none focus:ring focus:ring-opacity-40"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            required
          >
            <option value={UserRole.CUSTOMER}>{t('customer')}</option>
            <option value={UserRole.BUSINESS_OWNER}>{t('businessOwner')}</option>
          </select>
        </div>

        {role === UserRole.BUSINESS_OWNER && (
          <>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 mt-6">{t('businessDetails')}</h3>
            <Input
              id="businessName"
              label={t('businessName')}
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder={t('businessNamePlaceholder')}
              required
            />
            <div className="mb-4">
              <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
                {t('district')}
              </label>
              <select
                id="district"
                className="block w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none focus:ring focus:ring-opacity-40"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                required
              >
                <option value="">{t('selectDistrict')}</option>
                {MOCK_RWANDA_LOCATIONS.districts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="sector" className="block text-sm font-medium text-gray-700 mb-1">
                {t('sector')}
              </label>
              <select
                id="sector"
                className="block w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none focus:ring focus:ring-opacity-40"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                required
              >
                <option value="">{t('selectSector')}</option>
                {MOCK_RWANDA_LOCATIONS.sectors.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <Input
              id="village"
              label={t('villageOptional')}
              type="text"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              placeholder={t('villagePlaceholder')}
            />
            <Input
              id="gps"
              label={t('gpsCoordinatesOptional')}
              type="text"
              value={gps}
              onChange={(e) => setGps(e.target.value)}
              placeholder={t('gpsCoordinatesPlaceholder')}
            />
          </>
        )}

        <Button type="submit" fullWidth disabled={loading} className="mt-6">
          {loading ? t('registering') : t('register')}
        </Button>
      </form>

      <p className="text-center text-gray-600 mt-6">
        {t('alreadyHaveAccount')}{' '}
        <a href={ROUTES.LOGIN} className="text-indigo-600 hover:underline">
          {t('loginHere')}
        </a>
      </p>
    </div>
  );
};

export default RegisterPage;