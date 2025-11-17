import { User, UserRole, LocationDetails } from '../types';
import { generateId } from '../constants';

// Mock in-memory database for users
const mockUsers: User[] = [
  {
    id: 'customer1',
    email: 'customer@example.com',
    phone: '0781234567',
    password: 'password123',
    role: UserRole.CUSTOMER,
  },
  {
    id: 'business1',
    email: 'business@example.com',
    phone: '0787654321',
    password: 'password123',
    role: UserRole.BUSINESS_OWNER,
    isApproved: true,
    businessName: 'My Awesome Shop',
    location: { district: 'Gasabo', sector: 'Remera', village: 'Kagugu' },
  },
  {
    id: 'unapproved_business',
    email: 'unapproved@example.com',
    phone: '0780000000',
    password: 'password123',
    role: UserRole.BUSINESS_OWNER,
    isApproved: false,
    businessName: 'Unapproved Biz',
    location: { district: 'Kicukiro', sector: 'Gatenga' },
  },
  {
    id: 'admin1',
    email: 'admin@example.com',
    phone: '0781112233',
    password: 'password123',
    role: UserRole.ADMIN,
  },
];

interface AuthResponse {
  token: string;
  user: User;
}

export const register = async (
  email: string,
  phone: string,
  password: string,
  role: UserRole,
  businessName?: string,
  location?: LocationDetails,
): Promise<AuthResponse> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (mockUsers.some((u) => u.email === email || u.phone === phone)) {
        reject(new Error('User with this email or phone already exists.'));
        return;
      }

      const newUser: User = {
        id: generateId(),
        email,
        phone,
        password, // In a real app, this would be hashed
        role,
        isApproved: role === UserRole.BUSINESS_OWNER ? false : undefined, // Business owners need admin approval
        businessName: role === UserRole.BUSINESS_OWNER ? businessName : undefined,
        location: role === UserRole.BUSINESS_OWNER ? location : undefined,
      };

      mockUsers.push(newUser);
      console.log('Registered user:', newUser);
      // Simulate JWT token
      const token = `mock-jwt-token-${newUser.id}`;
      const userWithoutPassword = { ...newUser };
      delete userWithoutPassword.password;
      resolve({ token, user: userWithoutPassword });
    }, 500);
  });
};

export const login = async (
  identifier: string, // Can be email or phone
  password: string,
): Promise<AuthResponse> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = mockUsers.find(
        (u) =>
          (u.email === identifier || u.phone === identifier) &&
          u.password === password,
      );

      if (user) {
        // Simulate JWT token
        const token = `mock-jwt-token-${user.id}`;
        const userWithoutPassword = { ...user };
        delete userWithoutPassword.password;
        resolve({ token, user: userWithoutPassword });
      } else {
        reject(new Error('Invalid credentials.'));
      }
    }, 500);
  });
};

export const logout = async (): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // On the frontend, this just clears local storage. Backend would invalidate token.
      resolve();
    }, 100);
  });
};

export const getMockUsers = (): User[] => {
  return mockUsers.map(user => {
    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;
    return userWithoutPassword;
  });
};

export const updateMockUser = (updatedUser: User): User | undefined => {
  const index = mockUsers.findIndex(u => u.id === updatedUser.id);
  if (index !== -1) {
    mockUsers[index] = { ...mockUsers[index], ...updatedUser };
    const userWithoutPassword = { ...mockUsers[index] };
    delete userWithoutPassword.password;
    return userWithoutPassword;
  }
  return undefined;
};