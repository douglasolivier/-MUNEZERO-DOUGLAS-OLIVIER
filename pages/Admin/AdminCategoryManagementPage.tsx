import React, { useEffect, useState, useCallback } from 'react';
import * as adminService from '../../services/adminService';
import { Category } from '../../types';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import { useLanguage } from '../../contexts/LanguageContext';

const AdminCategoryManagementPage: React.FC = () => {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Add category state
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  // Edit category state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Delete category state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError('');
    setActionSuccess('');
    try {
      const fetchedCategories = await adminService.getCategories();
      setCategories(fetchedCategories);
    } catch (err: any) {
      setError(err.message || t('failedToFetchCategories'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // --- Add Category Logic ---
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError('');
    setActionSuccess('');
    try {
      const newCat = await adminService.addCategory(newCategoryName);
      setNewCategoryName('');
      setActionSuccess(t('categoryAddedSuccessfully', { categoryName: newCat.name }));
      fetchCategories();
      setIsAddModalOpen(false);
    } catch (err: any) {
      setAddError(err.message || t('failedToAddCategory'));
    } finally {
      setAddLoading(false);
    }
  };

  // --- Edit Category Logic ---
  const handleEditClick = (category: Category) => {
    setCategoryToEdit(category);
    setEditCategoryName(category.name);
    setIsEditModalOpen(true);
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryToEdit) return;

    setEditLoading(true);
    setEditError('');
    setActionSuccess('');
    try {
      const updatedCat = await adminService.updateCategory(categoryToEdit.id, editCategoryName);
      if (updatedCat) {
        setActionSuccess(t('categoryUpdatedSuccessfully', { categoryName: updatedCat.name }));
      }
      fetchCategories();
      setIsEditModalOpen(false);
    } catch (err: any) {
      setEditError(err.message || t('failedToUpdateCategory'));
    } finally {
      setEditLoading(false);
    }
  };

  // --- Delete Category Logic ---
  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    setDeleteLoading(true);
    setError('');
    setActionSuccess('');
    try {
      await adminService.deleteCategory(categoryToDelete.id);
      setActionSuccess(t('categoryDeletedSuccessfully', { categoryName: categoryToDelete.name }));
      fetchCategories();
    } catch (err: any) {
      setError(err.message || t('failedToDeleteCategory'));
    } finally {
      setDeleteLoading(false);
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
    }
  };

  return (
    <div className="px-4">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">{t('categoryManagement')}</h2>
      <p className="text-gray-600 mb-6">{t('addEditDeleteCategories')}</p>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {actionSuccess && <p className="text-green-600 mb-4">{actionSuccess}</p>}

      <div className="flex justify-end mb-6">
        <Button onClick={() => setIsAddModalOpen(true)}>{t('addNewCategory')}</Button>
      </div>

      {loading ? (
        <p className="text-center text-gray-600 text-lg">{t('loadingCategories')}</p>
      ) : categories.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">{t('noCategoriesDefined')}</p>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('categoryName')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {category.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium space-x-2">
                    <Button variant="primary" size="sm" onClick={() => handleEditClick(category)} disabled={loading}>
                      {t('edit')}
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDeleteClick(category)} disabled={loading}>
                      {t('delete')}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Category Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={t('addNewCategory')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)} disabled={addLoading}>
              {t('cancel')}
            </Button>
            <Button variant="primary" onClick={handleAddCategory} disabled={addLoading}>
              {addLoading ? t('adding') : t('addCategory')}
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddCategory} className="space-y-4">
          {addError && <p className="text-red-600 mb-4">{addError}</p>}
          <Input
            id="newCategoryName"
            label={t('categoryName')}
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder={t('categoryNamePlaceholder')}
            required
            disabled={addLoading}
          />
        </form>
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={t('editCategoryTitle', { categoryName: categoryToEdit?.name || '' })}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)} disabled={editLoading}>
              {t('cancel')}
            </Button>
            <Button variant="primary" onClick={handleUpdateCategory} disabled={editLoading}>
              {editLoading ? t('updating') : t('saveChanges')}
            </Button>
          </>
        }
      >
        <form onSubmit={handleUpdateCategory} className="space-y-4">
          {editError && <p className="text-red-600 mb-4">{editError}</p>}
          <Input
            id="editCategoryName"
            label={t('categoryName')}
            type="text"
            value={editCategoryName}
            onChange={(e) => setEditCategoryName(e.target.value)}
            required
            disabled={editLoading}
          />
        </form>
      </Modal>

      {/* Delete Category Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={t('confirmCategoryDeletion')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)} disabled={deleteLoading}>
              {t('cancel')}
            </Button>
            <Button variant="danger" onClick={confirmDelete} disabled={deleteLoading}>
              {deleteLoading ? t('deleting') : t('delete')}
            </Button>
          </>
        }
      >
        <p className="text-gray-700">
          {t('confirmDeleteCategoryMessage', { categoryName: categoryToDelete?.name || '' })}
        </p>
      </Modal>
    </div>
  );
};

export default AdminCategoryManagementPage;