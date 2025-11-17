import React, { useEffect, useState, useCallback } from 'react';
import * as adminService from '../../services/adminService';
import { User, UserRole } from '../../types';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { useLanguage } from '../../contexts/LanguageContext';

const AdminUserManagementPage: React.FC = () => {
  const { t } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalAction, setModalAction] = useState<'approve' | 'reject' | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    setActionSuccess('');
    try {
      const fetchedUsers = await adminService.getAllUsers();
      setUsers(fetchedUsers);
    } catch (err: any) {
      setError(err.message || t('failedToFetchUsers'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleActionClick = (user: User, action: 'approve' | 'reject') => {
    setSelectedUser(user);
    setModalAction(action);
    setIsModalOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedUser || !modalAction) return;

    setLoading(true); // Temporarily disable action buttons
    setError('');
    setActionSuccess('');

    try {
      if (modalAction === 'approve') {
        await adminService.approveBusinessOwner(selectedUser.id);
        setActionSuccess(t('businessOwnerApproved', { email: selectedUser.email }));
      } else {
        await adminService.rejectBusinessOwner(selectedUser.id);
        setActionSuccess(t('businessOwnerRejected', { email: selectedUser.email }));
      }
      fetchUsers(); // Re-fetch to get updated status
    } catch (err: any) {
      setError(err.message || t('failedToPerformAction', { action: modalAction }));
    } finally {
      setIsModalOpen(false);
      setSelectedUser(null);
      setModalAction(null);
      setLoading(false); // Re-enable buttons after action
    }
  };

  const businessOwners = users.filter((u) => u.role === UserRole.BUSINESS_OWNER);

  return (
    <div className="px-4">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">{t('userManagement')}</h2>
      <p className="text-gray-600 mb-6">{t('manageBusinessOwnerAccounts')}</p>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {actionSuccess && <p className="text-green-600 mb-4">{actionSuccess}</p>}

      {loading ? (
        <p className="text-center text-gray-600 text-lg">{t('loadingUsers')}</p>
      ) : businessOwners.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">{t('noBusinessOwnersRegistered')}</p>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('email')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('phone')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('businessName')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('status')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {businessOwners.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.businessName || t('notAvailable')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {user.isApproved ? t('approved') : t('pending')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium space-x-2">
                    {!user.isApproved ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleActionClick(user, 'approve')}
                        disabled={loading}
                      >
                        {t('approve')}
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleActionClick(user, 'reject')}
                        disabled={loading}
                      >
                        {t('reject')}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t(modalAction === 'approve' ? 'approveBusinessOwner' : 'rejectBusinessOwner')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={loading}>
              {t('cancel')}
            </Button>
            <Button
              variant={modalAction === 'approve' ? 'primary' : 'danger'}
              onClick={confirmAction}
              disabled={loading}
            >
              {loading ? t('processing') : t(modalAction === 'approve' ? 'confirmApprove' : 'confirmReject')}
            </Button>
          </>
        }
      >
        <p className="text-gray-700">
          {t('confirmActionBusinessOwnerMessage', { action: modalAction, email: selectedUser?.email || '', businessName: selectedUser?.businessName || '' })}
        </p>
        {modalAction === 'reject' && (
          <p className="text-red-600 mt-2">
            {t('rejectedBusinessesWarning')}
          </p>
        )}
      </Modal>
    </div>
  );
};

export default AdminUserManagementPage;