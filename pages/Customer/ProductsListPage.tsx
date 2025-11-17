import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as productService from '../../services/productService';
import * as adminService from '../../services/adminService'; // To get categories
import ProductCard from '../../components/ProductCard';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { Product, Category } from '../../types';
import { MOCK_RWANDA_LOCATIONS } from '../../constants';
import { useLanguage } from '../../contexts/LanguageContext';

const ProductsListPage: React.FC = () => {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [selectedLocation, setSelectedLocation] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Ensure only products from approved businesses are shown to customers
      const fetchedProducts = await productService.getProducts(undefined, undefined, undefined, undefined, undefined, undefined, true);
      setProducts(fetchedProducts);
      setFilteredProducts(fetchedProducts);
    } catch (err: any) {
      setError(err.message || t('failedToFetchProducts'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const fetchCategories = useCallback(async () => {
    try {
      const fetchedCategories = await adminService.getCategories();
      setCategories(fetchedCategories);
    } catch (err: any) {
      console.error(t('failedToFetchCategories'), err.message);
    }
  }, [t]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchProducts, fetchCategories]);

  const applyFilters = useCallback(() => {
    let currentFiltered = products;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      currentFiltered = currentFiltered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    if (selectedCategory) {
      currentFiltered = currentFiltered.filter(
        (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (minPrice !== '') {
      currentFiltered = currentFiltered.filter((p) => p.price >= Number(minPrice));
    }

    if (maxPrice !== '') {
      currentFiltered = currentFiltered.filter((p) => p.price <= Number(maxPrice));
    }

    if (selectedLocation) {
      const locQuery = selectedLocation.toLowerCase();
      currentFiltered = currentFiltered.filter(
        (p) =>
          p.location.district.toLowerCase().includes(locQuery) ||
          p.location.sector.toLowerCase().includes(locQuery) ||
          (p.location.village && p.location.village.toLowerCase().includes(locQuery))
      );
    }

    setFilteredProducts(currentFiltered);
  }, [products, searchQuery, selectedCategory, minPrice, maxPrice, selectedLocation]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedLocation('');
  };

  const allDistricts = useMemo(() => MOCK_RWANDA_LOCATIONS.districts, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">{t('exploreProducts')}</h2>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input
          id="search"
          type="text"
          placeholder={t('searchByNameOrDescriptionPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          label={t('search')}
        />

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            {t('category')}
          </label>
          <select
            id="category"
            className="block w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none focus:ring focus:ring-opacity-40"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">{t('allCategories')}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            {t('locationDistrictSector')}
          </label>
          <select
            id="location"
            className="block w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none focus:ring focus:ring-opacity-40"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            <option value="">{t('allLocations')}</option>
            {allDistricts.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        <div className="flex space-x-2">
          <Input
            id="minPrice"
            type="number"
            placeholder={t('minPricePlaceholder')}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value === '' ? '' : Number(e.target.value))}
            label={t('minPrice')}
          />
          <Input
            id="maxPrice"
            type="number"
            placeholder={t('maxPricePlaceholder')}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))}
            label={t('maxPrice')}
          />
        </div>

        <div className="md:col-span-2 lg:col-span-4 flex justify-end">
          <Button onClick={handleClearFilters} variant="outline" className="w-full md:w-auto">
            {t('clearFilters')}
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-600 text-lg">{t('loadingProducts')}</p>
      ) : error ? (
        <p className="text-center text-red-600 text-lg">{error}</p>
      ) : filteredProducts.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">{t('noProductsFound')}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsListPage;