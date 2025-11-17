import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from '../../hooks/useNavigate';
import * as productService from '../../services/productService';
import * as subscriptionService from '../../services/subscriptionService';
import * as adminService from '../../services/adminService'; // To get categories
import { Product, SubscriptionStatus, Category, UpdateProductParams } from '../../types';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { ROUTES, MOCK_RWANDA_LOCATIONS, PLACEHOLDER_IMAGE_URL } from '../../constants';
import { useLanguage } from '../../contexts/LanguageContext';

const AddEditProductPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const productId = window.location.hash.split('/').pop(); // Extract product ID for editing

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]); // For existing images or base64 previews
  const [phoneNumber, setPhoneNumber] = useState('');
  const [district, setDistrict] = useState('');
  const [sector, setSector] = useState('');
  const [village, setVillage] = useState('');
  const [gps, setGps] = useState('');

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [allCategories, setAllCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isEditing = useMemo(() => productId && productId !== 'add', [productId]);

  const fetchProductAndStatus = useCallback(async () => {
    if (!user || user.role !== 'business_owner') {
      navigate(ROUTES.LOGIN);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const subscription = await subscriptionService.getSubscriptionStatus(user.id);
      const approved = user.isApproved ?? false;
      setIsSubscribed(subscription?.status === SubscriptionStatus.ACTIVE && new Date(subscription.endDate) > new Date());
      setIsApproved(approved);

      if (!approved || !(subscription?.status === SubscriptionStatus.ACTIVE && new Date(subscription.endDate) > new Date())) {
        setError(t('subscriptionAndApprovalNeeded'));
        setLoading(false);
        return;
      }

      const fetchedCategories = await adminService.getCategories();
      setAllCategories(fetchedCategories);

      if (isEditing && productId) {
        const fetchedProduct = await productService.getProductById(productId);
        if (fetchedProduct && fetchedProduct.ownerId === user.id) {
          setName(fetchedProduct.name);
          setCategory(fetchedProduct.category);
          setDescription(fetchedProduct.description);
          setPrice(fetchedProduct.price);
          setImageUrls(fetchedProduct.imageUrls);
          setPhoneNumber(fetchedProduct.phoneNumber);
          setDistrict(fetchedProduct.location.district);
          setSector(fetchedProduct.location.sector);
          setVillage(fetchedProduct.location.village || '');
          setGps(fetchedProduct.location.gps || '');
        } else {
          setError(t('productNotFoundOrNoPermission'));
          navigate(ROUTES.BUSINESS_OWNER_PRODUCTS);
        }
      } else {
        // For new product, pre-fill some user details if available
        setPhoneNumber(user.phone || '');
        setDistrict(user.location?.district || '');
        setSector(user.location?.sector || '');
        setVillage(user.location?.village || '');
        setGps(user.location?.gps || '');
        setImageUrls([PLACEHOLDER_IMAGE_URL(400,300)]); // Default placeholder for new product
      }
    } catch (err: any) {
      setError(err.message || t('failedToLoadProductDataOrStatus'));
    } finally {
      setLoading(false);
    }
  }, [user, navigate, isEditing, productId, t]);


  useEffect(() => {
    if (!authLoading) {
      fetchProductAndStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImageFiles(prev => [...prev, ...filesArray]);

      // Generate local URLs for preview
      const newImagePreviews = filesArray.map(file => URL.createObjectURL(file));
      setImageUrls(prev => [...prev, ...newImagePreviews]);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImageFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    setImageUrls(prev => prev.filter((_, index) => index !== indexToRemove));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.role !== 'business_owner' || !isApproved || !isSubscribed) {
      setError(t('notAuthorizedPerformAction'));
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    if (!name || !category || !description || price === '' || !phoneNumber || !district || !sector || imageUrls.length === 0) {
      setError(t('fillAllRequiredFieldsAndUploadImage'));
      setSubmitting(false);
      return;
    }

    // In a real app, images would be uploaded to a cloud storage (e.g., Firebase Storage, AWS S3)
    // For this mock, we'll just keep the existing image URLs and add new placeholder URLs for new files
    let finalImageUrls = [...imageUrls];
    if (imageFiles.length > 0) {
        // In a real app, process imageFiles to upload and get actual URLs
        // For now, we'll just add new placeholder images for the newly added files
        const newFilePlaceholders = imageFiles.map((_,idx) => PLACEHOLDER_IMAGE_URL(400, 300 + idx));
        finalImageUrls = finalImageUrls.filter(url => !url.startsWith('blob:')) // Remove blob URLs from previous previews
        finalImageUrls = [...finalImageUrls, ...newFilePlaceholders];
    }
     // If no images are explicitly added, use a default placeholder
    if (finalImageUrls.length === 0) {
      finalImageUrls = [PLACEHOLDER_IMAGE_URL(400, 300)];
    }


    try {
      // Common product fields for both add and edit operations.
      // We are confident these are not undefined due to the validation check above.
      const commonProductFields = {
        name: name,
        category: category,
        description: description,
        price: Number(price),
        imageUrls: finalImageUrls,
        phoneNumber: phoneNumber,
        location: { district, sector, village, gps },
      };

      if (isEditing && productId) {
        // When editing, `commonProductFields` will implicitly match `UpdateProductParams`
        // as all properties of UpdateProductParams are optional, and we are providing values for them.
        await productService.updateProduct(productId, commonProductFields);
        setSuccess(t('productUpdatedSuccessfully'));
      } else {
        // When adding a product, `addProduct` expects an object that strictly adheres to `AddProductParams`,
        // meaning all its properties (including `ownerId`) must be present and non-optional.
        // The `commonProductFields` combined with `ownerId` satisfies this.
        const addProductData = {
          ownerId: user.id,
          ...commonProductFields,
        };
        await productService.addProduct(addProductData);
        setSuccess(t('productAddedSuccessfully'));
      }
      setTimeout(() => {
        navigate(ROUTES.BUSINESS_OWNER_PRODUCTS);
      }, 1500);
    } catch (err: any) {
      setError(err.message || t(isEditing ? 'failedToUpdateProduct' : 'failedToAddProduct'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center text-gray-600">{t('loadingForm')}</div>;
  }

  if (error && (!isApproved || !isSubscribed)) {
    return (
      <div className="container mx-auto px-4 py-8 text-center bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
        <p className="font-bold">{t('accessDenied')}</p>
        <p>{error}</p>
        <p className="mt-2">{t('ensureApprovalAndSubscription')}</p>
        <Button className="mt-4" onClick={() => navigate(ROUTES.BUSINESS_OWNER_DASHBOARD)}>{t('goToDashboard')}</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
        {isEditing ? t('editProduct') : t('addNewProduct')}
      </h2>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        {error && <p className="text-red-600 text-center mb-4">{error}</p>}
        {success && <p className="text-green-600 text-center mb-4">{success}</p>}

        <Input
          id="name"
          label={t('productName')}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('productNamePlaceholder')}
          required
        />
        <div className="mb-4">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            {t('category')}
          </label>
          <select
            id="category"
            className="block w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none focus:ring focus:ring-opacity-40"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">{t('selectACategory')}</option>
            {allCategories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            {t('description')}
          </label>
          <textarea
            id="description"
            className="block w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none focus:ring focus:ring-opacity-40"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('detailedDescriptionPlaceholder')}
            required
          ></textarea>
        </div>
        <Input
          id="price"
          label={t('priceRWF')}
          type="number"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          placeholder={t('pricePlaceholder')}
          required
          min="0"
        />

        <div className="mb-4">
          <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-1">
            {t('productImages')}
          </label>
          <input
            id="images"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          <div className="mt-4 flex flex-wrap gap-2">
            {imageUrls.map((url, index) => (
              <div key={index} className="relative">
                <img src={url} alt={t('productPreview', { index: index })} className="w-24 h-24 object-cover rounded-md border border-gray-200" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-red-700"
                  aria-label={t('removeImage', { index: index })}
                >
                  X
                </button>
              </div>
            ))}
            {imageUrls.length === 0 && <p className="text-sm text-gray-500 mt-1">{t('noImagesSelected')}</p>}
          </div>
        </div>

        <Input
          id="phoneNumber"
          label={t('contactPhoneNumber')}
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder={t('phoneNumberPlaceholder')}
          required
        />

        <h3 className="text-xl font-semibold text-gray-800 mb-4 mt-6">{t('locationDetails')}</h3>
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

        <Button type="submit" fullWidth disabled={submitting} className="mt-6">
          {submitting ? (isEditing ? t('updating') : t('adding')) : (isEditing ? t('updateProduct') : t('addProduct'))}
        </Button>
        <Button type="button" variant="secondary" fullWidth className="mt-4" onClick={() => navigate(ROUTES.BUSINESS_OWNER_PRODUCTS)}>
          {t('cancel')}
        </Button>
      </form>
    </div>
  );
};

export default AddEditProductPage;