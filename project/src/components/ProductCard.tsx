import React from 'react';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';

interface ProductCardProps {
  product: Product;
  onProductClick: (product: Product) => void;
}

export default function ProductCard({ product, onProductClick }: ProductCardProps) {
  const { state, dispatch } = useApp();
  
  const isInWishlist = state.wishlist.some(item => item.product.id === product.id);
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        product,
        quantity: 1,
        selectedSize: product.size[0],
        selectedColor: product.color[0]
      }
    });
  };
  
  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInWishlist) {
      dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: product.id });
    } else {
      dispatch({ type: 'ADD_TO_WISHLIST', payload: { product } });
    }
  };

  return (
    <div 
      onClick={() => onProductClick(product)}
      className="group cursor-pointer bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 hover:rotate-1 overflow-hidden border border-rose-200 hover:border-rose-300"
    >
      <div className="relative overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
        />
        
        {/* Sale Badge */}
        {product.isOnSale && (
          <div className="absolute top-3 left-3 bg-rose-400 text-white text-sm font-medium px-3 py-1 rounded-full shadow-sm border border-rose-500 animate-pulse transform -rotate-6">
            SALE
          </div>
        )}
        
        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 shadow-sm border transform hover:scale-110 hover:rotate-6 ${
            isInWishlist 
              ? 'bg-rose-300 text-white border-rose-400' 
              : 'bg-white text-rose-400 hover:bg-rose-300 hover:text-white border-rose-300'
          }`}
        >
          <Heart className="w-4 h-4" fill={isInWishlist ? 'currentColor' : 'none'} />
        </button>
        
        {/* Quick Add to Cart */}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-3 right-3 bg-blue-300 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-blue-400 transform translate-y-2 group-hover:translate-y-0 shadow-sm border border-blue-400 hover:scale-110 hover:-rotate-6"
        >
          <ShoppingCart className="w-4 h-4" />
        </button>
      </div>
      
      <div className="p-4 bg-rose-25">
        <h3 className="text-lg font-semibold text-slate-700 mb-2 group-hover:text-rose-500 transition-colors">
          {product.name}
        </h3>
        
        <p className="text-slate-500 text-sm font-medium mb-3 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center mb-2">
          <div className="flex items-center bg-rose-100 px-2 py-1 rounded-full border border-rose-200">
            <Star className="w-3 h-3 text-rose-400 fill-current" />
            <span className="text-xs font-medium text-slate-600 ml-1">
              {product.rating} ({product.reviews})
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-semibold text-slate-700 bg-white px-2 py-1 rounded-full border border-rose-200">${product.price}</span>
            {product.originalPrice && (
              <span className="text-sm font-medium text-rose-400 line-through bg-rose-50 px-2 py-1 rounded-full">
                ${product.originalPrice}
              </span>
            )}
          </div>
          
          <div className="flex space-x-1">
            {product.color.slice(0, 3).map((color, index) => (
              <div
                key={index}
                className={`w-6 h-6 rounded-full border border-white shadow-sm hover:scale-110 transition-transform cursor-pointer ${
                  color === 'Sky Blue' ? 'bg-blue-200' :
                  color === 'Mint Green' ? 'bg-green-200' :
                  color === 'Lavender' ? 'bg-purple-200' :
                  color === 'Sunset Orange' ? 'bg-orange-200' :
                  color === 'Pink Coral' ? 'bg-rose-200' :
                  color === 'Yellow Bliss' ? 'bg-yellow-200' :
                  'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}