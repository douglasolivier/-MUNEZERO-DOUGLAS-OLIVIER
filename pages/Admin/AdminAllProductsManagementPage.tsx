import React, { useEffect, useState, useCallback } from 'react';
import * as adminService from '../../services/adminService';
import { Product } from '../../types';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { PLACEHOLDER_IMAGE_URL } from '../../constants';
import Input from '../../components/Input';
import { MOCK_RWANDA_LOCATIONS } from '../../constants';
import { useLanguage } from '../../contexts/LanguageContext';

const AdminAllProductsManagementPage: React.FC = () => {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Delete Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Edit Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [allCategories, setAllCategories] = useState<{ id: string; name: string }[]>([]);


  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    setActionSuccess('');
    try {
      const fetchedProducts = await adminService.getAllProducts();
      setProducts(fetchedProducts);
      const fetchedCategories = await adminService.getCategories();
      setAllCategories(fetchedCategories);
    } catch (err: any) {
      setError(err.message || t('failedToFetchProducts'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // --- Delete Logic ---
  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    setLoading(true);
    setError('');
    setActionSuccess('');
    try {
      await adminService.adminDeleteProduct(productToDelete.id);
      setActionSuccess(t('productDeletedSuccessfully', { productName: productToDelete.name }));
      fetchProducts(); // Re-fetch products to update the list
    } catch (err: any) {
      setError(err.message || t('failedToDeleteProduct'));
    } finally {
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
      setLoading(false);
    }
  };

  // --- Edit Logic ---
  const handleEditClick = (product: Product) => {
    setProductToEdit(product);
    setEditForm({
      name: product.name,
      category: product.category,
      description: product.description,
      price: product.price,
      imageUrls: product.imageUrls,
      phoneNumber: product.phoneNumber,
      location: product.location,
    });
    setIsEditModalOpen(true);
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'price') {
        setEditForm(prev => ({ ...prev, [name]: Number(value) }));
    } else if (name === 'district' || name === 'sector' || name === 'village' || name === 'gps') {
        setEditForm(prev => ({
            ...prev,
            location: {
                ...prev.location!,
                [name]: value
            }
        }));
    } else {
        setEditForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      // For simplicity in mock, just add new placeholder URLs
      const newImagePreviews = filesArray.map((_,idx) => PLACEHOLDER_IMAGE_URL(400, 300 + idx));
      setEditForm(prev => ({
        ...prev,
        imageUrls: [...(prev.imageUrls || []), ...newImagePreviews]
      }));
    }
  };

  const removeEditImage = (indexToRemove: number) => {
    setEditForm(prev => ({
      ...prev,
      imageUrls: prev.imageUrls?.filter((_, index) => index !== indexToRemove)
    }));
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productToEdit) return;

    setEditLoading(true);
    setEditError('');
    setActionSuccess('');

    // Ensure at least one image URL exists or add a placeholder
    let finalImageUrls = editForm.imageUrls || [];
    if (finalImageUrls.length === 0) {
      finalImageUrls = [PLACEHOLDER_IMAGE_URL(400, 300)];
    }

    try {
      await adminService.adminUpdateProduct(productToEdit.id, {
        ...editForm,
        imageUrls: finalImageUrls,
      });
      setActionSuccess(t('productUpdatedSuccessfully', { productName: editForm.name || 'product' }));
      fetchProducts(); // Re-fetch to get updated list
    } catch (err: any) {
      setEditError(err.message || t('failedToUpdateProduct'));
    } finally {
      setEditLoading(false);
      setIsEditModalOpen(false);
      setProductToEdit(null);
    }
  };

  return (
    <div className="px-4">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">{t('allProductsManagement')}</h2>
      <p className="text-gray-600 mb-6">{t('viewAndManageAllProducts')}</p>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {actionSuccess && <p className="text-green-600 mb-4">{actionSuccess}</p>}

      {loading ? (
        <p className="text-center text-gray-600 text-lg">{t('loadingProducts')}</p>
      ) : products.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">{t('noProductsFoundOnPlatform')}</p>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('image')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('productName')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('category')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('price')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('ownerID')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img src={product.imageUrls[0]} alt={product.name} className="h-12 w-12 rounded object-cover" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.price.toLocaleString('en-RW', { style: 'currency', currency: 'RWF' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.ownerId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Button variant="primary" size="sm" onClick={() => handleEditClick(product)} disabled={loading}>
                      {t('edit')}
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDeleteClick(product)} disabled={loading}>
                      {t('delete')}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Product Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={t('confirmProductDeletion')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)} disabled={loading}>
              {t('cancel')}
            </Button>
            <Button variant="danger" onClick={confirmDelete} disabled={loading}>
              {loading ? t('deleting') : t('delete')}
            </Button>
          </>
        }
      >
        <p className="text-gray-700">
          {t('confirmDeleteProductMessage', { productName: productToDelete?.name || '' })}
        </p>
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={t('editProductTitle', { productName: productToEdit?.name || '' })}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)} disabled={editLoading}>
              {t('cancel')}
            </Button>
            <Button variant="primary" onClick={submitEdit} disabled={editLoading}>
              {editLoading ? t('updating') : t('saveChanges')}
            </Button>
          </>
        }
      >
        <form onSubmit={submitEdit} className="space-y-4">
          {editError && <p className="text-red-600 text-center mb-4">{editError}</p>}
          <Input
            id="editName"
            name="name"
            label={t('productName')}
            type="text"
            value={editForm.name || ''}
            onChange={handleEditFormChange}
            required
          />
          <div>
            <label htmlFor="editCategory" className="block text-sm font-medium text-gray-700 mb-1">
              {t('category')}
            </label>
            <select
              id="editCategory"
              name="category"
              className="block w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none focus:ring focus:ring-opacity-40"
              value={editForm.category || ''}
              onChange={handleEditFormChange}
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
          <div>
            <label htmlFor="editDescription" className="block text-sm font-medium text-gray-700 mb-1">
              {t('description')}
            </label>
            <textarea
              id="editDescription"
              name="description"
              className="block w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none focus:ring focus:ring-opacity-40"
              rows={3}
              value={editForm.description || ''}
              onChange={handleEditFormChange}
              required
            ></textarea>
          </div>
          <Input
            id="editPrice"
            name="price"
            label={t('priceRWF')}
            type="number"
            value={editForm.price || ''}
            onChange={handleEditFormChange}
            required
            min="0"
          />
           <div className="mb-4">
            <label htmlFor="editImages" className="block text-sm font-medium text-gray-700 mb-1">
              {t('productImages')}
            </label>
            <input
              id="editImages"
              type="file"
              accept="image/*"
              multiple
              onChange={handleEditImageUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              {editForm.imageUrls?.map((url, index) => (
                <div key={index} className="relative">
                  <img src={url} alt={t('productPreview', { index: index })} className="w-24 h-24 object-cover rounded-md border border-gray-200" />
                  <button
                    type="button"
                    onClick={() => removeEditImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-red-700"
                    aria-label={t('removeImage', { index: index })}
                  >
                    X
                  </button>
                </div>
              ))}
              {editForm.imageUrls?.length === 0 && <p className="text-sm text-gray-500 mt-1">{t('noImagesSelected')}</p>}
            </div>
          </div>
          <Input
            id="editPhoneNumber"
            name="phoneNumber"
            label={t('contactPhoneNumber')}
            type="tel"
            value={editForm.phoneNumber || ''}
            onChange={handleEditFormChange}
            required
          />
          <h4 className="text-lg font-semibold text-gray-800 mb-2 mt-4">{t('location')}</h4>
            <div>
                <label htmlFor="editDistrict" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('district')}
                </label>
                <select
                    id="editDistrict"
                    name="district"
                    className="block w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none focus:ring focus:ring-opacity-40"
                    value={editForm.location?.district || ''}
                    onChange={handleEditFormChange}
                    required
                >
                    <option value="">{t('selectDistrict')}</option>
                    {MOCK_RWANDA_LOCATIONS.districts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="editSector" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('sector')}
                </label>
                <select
                    id="editSector"
                    name="sector"
                    className="block w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none focus:ring focus:ring-opacity-40"
                    value={editForm.location?.sector || ''}
                    onChange={handleEditFormChange}
                    required
                >
                    <option value="">{t('selectSector')}</option>
                    {MOCK_RWANDA_LOCATIONS.sectors.map((s) => (
                    <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>
            <Input
            id="editVillage"
            name="village"
            label={t('villageOptional')}
            type="text"
            value={editForm.location?.village || ''}
            onChange={handleEditFormChange}
            />
            <Input
            id="editGps"
            name="gps"
            label={t('gpsCoordinatesOptional')}
            type="text"
            value={editForm.location?.gps || ''}
            onChange={handleEditFormChange}
            />
        </form>
      </Modal>
    </div>
  );
};

export default AdminAllProductsManagementPage;