import React from 'react';
import { Product } from '../types';
import { ROUTES } from '../constants';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <a href={`${ROUTES.PRODUCT_DETAIL}${product.id}`} className="block">
        <img
          src={product.imageUrls[0]}
          alt={product.name}
          className="w-full h-48 object-cover object-center"
        />
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h3>
          <p className="text-sm text-gray-500 mt-1">{product.category}</p>
          <p className="text-xl font-bold text-indigo-600 mt-2">
            {product.price.toLocaleString('en-RW', { style: 'currency', currency: 'RWF' })}
          </p>
        </div>
      </a>
    </div>
  );
};

export default ProductCard;