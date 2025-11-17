import { Product, LocationDetails, UpdateProductParams } from '../types';
import { generateId, PLACEHOLDER_IMAGE_URL, MOCK_CATEGORIES } from '../constants';
// Added import for getMockUsers to resolve 'Cannot find name 'require'' error.
import { getMockUsers } from './authService';

// Mock in-memory database for products
let mockProducts: Product[] = [
  {
    id: 'prod1',
    ownerId: 'business1',
    name: 'Smart TV 4K UHD 55"',
    category: 'Electronics',
    description: 'Vibrant 4K UHD display with smart features. Perfect for home entertainment.',
    price: 350000,
    imageUrls: [PLACEHOLDER_IMAGE_URL(600, 400), PLACEHOLDER_IMAGE_URL(600, 401)],
    phoneNumber: '0787654321',
    location: { district: 'Gasabo', sector: 'Remera', village: 'Kagugu' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod2',
    ownerId: 'business1',
    name: 'Men\'s Casual Shirt',
    category: 'Clothes & Fashion',
    description: 'Comfortable cotton shirt, available in various sizes and colors. Ideal for everyday wear.',
    price: 15000,
    imageUrls: [PLACEHOLDER_IMAGE_URL(600, 402)],
    phoneNumber: '0787654321',
    location: { district: 'Gasabo', sector: 'Remera', village: 'Kagugu' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod3',
    ownerId: 'business1',
    name: 'Delicious Local Coffee Beans',
    category: 'Food & Beverages',
    description: 'Freshly roasted Rwandan coffee beans, rich aroma and full-bodied taste. 500g pack.',
    price: 8000,
    imageUrls: [PLACEHOLDER_IMAGE_URL(600, 403)],
    phoneNumber: '0787654321',
    location: { district: 'Gasabo', sector: 'Remera', village: 'Kagugu' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod4',
    ownerId: 'unapproved_business', // Example product from an unapproved business
    name: 'Vintage Wooden Chair',
    category: 'Furniture & Home Decor',
    description: 'Hand-carved vintage wooden chair, perfect for adding a rustic touch to your home.',
    price: 60000,
    imageUrls: [PLACEHOLDER_IMAGE_URL(600, 404)],
    phoneNumber: '0780000000',
    location: { district: 'Kicukiro', sector: 'Gatenga' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const getProducts = async (
  ownerId?: string,
  searchQuery?: string,
  category?: string,
  minPrice?: number,
  maxPrice?: number,
  location?: string,
  onlyApprovedBusinesses?: boolean // New parameter to filter products by approved businesses
): Promise<Product[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredProducts = [...mockProducts];

      if (ownerId) {
        filteredProducts = filteredProducts.filter((p) => p.ownerId === ownerId);
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredProducts = filteredProducts.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query),
        );
      }

      if (category) {
        filteredProducts = filteredProducts.filter(
          (p) => p.category.toLowerCase() === category.toLowerCase(),
        );
      }

      if (minPrice !== undefined) {
        filteredProducts = filteredProducts.filter((p) => p.price >= minPrice);
      }

      if (maxPrice !== undefined) {
        filteredProducts = filteredProducts.filter((p) => p.price <= maxPrice);
      }

      if (location) {
        const locQuery = location.toLowerCase();
        filteredProducts = filteredProducts.filter(
          (p) =>
            p.location.district.toLowerCase().includes(locQuery) ||
            p.location.sector.toLowerCase().includes(locQuery) ||
            (p.location.village && p.location.village.toLowerCase().includes(locQuery)),
        );
      }

      // If onlyApprovedBusinesses is true, filter out products from unapproved businesses
      if (onlyApprovedBusinesses) {
        // Removed `require` and using direct import
        const approvedBusinessIds = getMockUsers()
          .filter(u => u.role === 'business_owner' && u.isApproved)
          .map(u => u.id);
        filteredProducts = filteredProducts.filter(p => approvedBusinessIds.includes(p.ownerId));
      }

      resolve(filteredProducts);
    }, 300);
  });
};

export const getProductById = async (id: string): Promise<Product | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockProducts.find((p) => p.id === id));
    }, 300);
  });
};

interface AddProductParams {
  ownerId: string;
  name: string;
  category: string;
  description: string;
  price: number;
  imageUrls: string[];
  phoneNumber: string;
  location: LocationDetails;
}

export const addProduct = async (productData: AddProductParams): Promise<Product> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newProduct: Product = {
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...productData,
      };
      mockProducts.push(newProduct);
      resolve(newProduct);
    }, 500);
  });
};

export const updateProduct = async (
  id: string,
  updatedFields: UpdateProductParams,
): Promise<Product | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockProducts.findIndex((p) => p.id === id);
      if (index !== -1) {
        mockProducts[index] = {
          ...mockProducts[index],
          ...updatedFields,
          updatedAt: new Date().toISOString(),
        };
        resolve(mockProducts[index]);
      } else {
        resolve(undefined);
      }
    }, 500);
  });
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const initialLength = mockProducts.length;
      mockProducts = mockProducts.filter((p) => p.id !== id);
      resolve(mockProducts.length < initialLength);
    }, 300);
  });
};

export const getMockProducts = (): Product[] => [...mockProducts];