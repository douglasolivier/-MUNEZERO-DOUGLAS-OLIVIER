import { User, Product, Category, UpdateProductParams } from '../types';
import * as authService from './authService';
import * as productService from './productService';
import { MOCK_CATEGORIES, generateId } from '../constants';

// --- User Management ---
export const getAllUsers = async (): Promise<User[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(authService.getMockUsers());
    }, 300);
  });
};

export const approveBusinessOwner = async (userId: string): Promise<User | undefined> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = authService.getMockUsers();
      const userToApprove = users.find(u => u.id === userId);

      if (!userToApprove || userToApprove.role !== 'business_owner') {
        reject(new Error('User not found or is not a business owner.'));
        return;
      }

      if (userToApprove.isApproved) {
        resolve(userToApprove); // Already approved
        return;
      }

      const updatedUser = authService.updateMockUser({ ...userToApprove, isApproved: true });
      resolve(updatedUser);
    }, 500);
  });
};

export const rejectBusinessOwner = async (userId: string): Promise<User | undefined> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = authService.getMockUsers();
      const userToReject = users.find(u => u.id === userId);

      if (!userToReject || userToReject.role !== 'business_owner') {
        reject(new Error('User not found or is not a business owner.'));
        return;
      }

      if (!userToReject.isApproved === false) {
        resolve(userToReject); // Already rejected or not approved
        return;
      }

      const updatedUser = authService.updateMockUser({ ...userToReject, isApproved: false });
      resolve(updatedUser);
    }, 500);
  });
};

// --- Product Management ---
export const getAllProducts = async (): Promise<Product[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(productService.getMockProducts());
    }, 300);
  });
};

export const adminUpdateProduct = async (
  productId: string,
  // Changed type to UpdateProductParams, which no longer requires 'id'
  updatedFields: UpdateProductParams
): Promise<Product | undefined> => {
  return new Promise((resolve) => {
    setTimeout(async () => {
      // Passed productId as the first argument as required by productService.updateProduct
      const updatedProduct = await productService.updateProduct(productId, updatedFields);
      resolve(updatedProduct);
    }, 500);
  });
};

export const adminDeleteProduct = async (productId: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(async () => {
      const success = await productService.deleteProduct(productId);
      resolve(success);
    }, 500);
  });
};

// --- Category Management ---
let currentCategories: Category[] = [...MOCK_CATEGORIES];

export const getCategories = async (): Promise<Category[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...currentCategories]);
    }, 300);
  });
};

export const addCategory = async (name: string): Promise<Category> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (currentCategories.some(cat => cat.name.toLowerCase() === name.toLowerCase())) {
        reject(new Error('Category already exists.'));
        return;
      }
      const newCategory: Category = { id: generateId(), name };
      currentCategories.push(newCategory);
      resolve(newCategory);
    }, 500);
  });
};

export const updateCategory = async (id: string, newName: string): Promise<Category | undefined> => {
  // Removed extra 'new' keyword
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = currentCategories.findIndex(cat => cat.id === id);
      if (index !== -1) {
        currentCategories[index] = { ...currentCategories[index], name: newName };
        resolve(currentCategories[index]);
      } else {
        resolve(undefined);
      }
    }, 500);
  });
};

export const deleteCategory = async (id: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const initialLength = currentCategories.length;
      currentCategories = currentCategories.filter(cat => cat.id !== id);
      resolve(currentCategories.length < initialLength);
    }, 300);
  });
};