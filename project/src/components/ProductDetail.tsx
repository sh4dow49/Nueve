import React, { useState } from 'react';
import { X, Heart, ShoppingCart, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
}

export default function ProductDetail({ product, onClose }: ProductDetailProps) {
  const { state, dispatch } = useApp();
  const [selectedSize, setSelectedSize] = useState(product.size[0]);
  const [selectedColor, setSelectedColor] = useState(product.color[0]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  
  const isInWishlist = state.wishlist.some(item => item.product.id === product.id);
  
  const handleAddToCart = () => {
    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        product,
        quantity,
        selectedSize,
        selectedColor
      }
    });
  };
  
  const handleWishlistToggle = () => {
    if (isInWishlist) {
      dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: product.id });
    } else {
      dispatch({ type: 'ADD_TO_WISHLIST', payload: { product } });
    }
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-y-auto border border-rose-200 shadow-lg">
        <div className="sticky top-0 bg-rose-100 z-10 flex items-center justify-between p-4 border-b border-rose-200">
          <h2 className="text-xl font-semibold text-slate-700">{product.name}</h2>
          <button
            onClick={onClose}
            className="bg-white text-slate-500 p-2 hover:bg-rose-400 hover:text-white rounded-full transition-all duration-200 shadow-sm border border-rose-200 hover:scale-110 hover:rotate-90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 p-4">
          {/* Image Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-square rounded-xl overflow-hidden border border-rose-200 shadow-sm">
              <img
                src={product.images[selectedImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white hover:bg-rose-50 rounded-full p-2 transition-all duration-200 shadow-sm border border-rose-200 hover:scale-110"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white hover:bg-rose-50 rounded-full p-2 transition-all duration-200 shadow-sm border border-rose-200 hover:scale-110"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </button>
                </>
              )}
              
              {product.isOnSale && (
                <div className="absolute top-3 left-3 bg-rose-400 text-white text-sm font-medium px-3 py-1 rounded-full shadow-sm border border-rose-500 animate-pulse transform -rotate-6">
                  SALE
                </div>
              )}
            </div>
            
            {/* Image Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex space-x-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 hover:scale-105 ${
                      index === selectedImageIndex ? 'border-rose-300 shadow-sm' : 'border-slate-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <div className="space-y-4 bg-rose-25 p-4 rounded-xl border border-rose-200 shadow-sm">
            <div className="flex items-center space-x-1">
              <div className="flex items-center bg-rose-100 px-3 py-1 rounded-full border border-rose-200">
                <Star className="w-4 h-4 text-rose-400 fill-current" />
                <span className="text-sm font-medium text-slate-600 ml-1">
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-2xl font-semibold text-slate-700 bg-white px-3 py-2 rounded-full border border-rose-200">${product.price}</span>
              {product.originalPrice && (
                <span className="text-lg font-medium text-rose-400 line-through bg-rose-50 px-2 py-1 rounded-full border border-rose-200">
                  ${product.originalPrice}
                </span>
              )}
            </div>
            
            <p className="text-slate-600 text-sm font-medium leading-relaxed bg-white p-3 rounded-xl border border-rose-200">
              {product.description}
            </p>
            
            {/* Size Selection */}
            <div>
              <h3 className="text-base font-medium mb-3 text-slate-600 bg-blue-100 px-3 py-1 rounded-full border border-blue-200 inline-block">Size</h3>
              <div className="flex space-x-2">
                {product.size.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-xl border transition-all duration-200 font-medium hover:scale-105 ${
                      selectedSize === size
                        ? 'border-rose-300 bg-rose-300 text-white shadow-sm'
                        : 'border-rose-200 bg-white text-slate-600 hover:bg-rose-50'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Color Selection */}
            <div>
              <h3 className="text-base font-medium mb-3 text-slate-600 bg-purple-100 px-3 py-1 rounded-full border border-purple-200 inline-block">Color</h3>
              <div className="flex space-x-2">
                {product.color.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded-xl border transition-all duration-200 font-medium hover:scale-105 ${
                      selectedColor === color
                        ? 'border-purple-300 bg-purple-300 text-white shadow-sm'
                        : 'border-purple-200 bg-white text-slate-600 hover:bg-purple-50'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Quantity */}
            <div>
              <h3 className="text-base font-medium mb-3 text-slate-600 bg-blue-100 px-3 py-1 rounded-full border border-blue-200 inline-block">Quantity</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-full bg-rose-300 hover:bg-rose-400 text-white flex items-center justify-center transition-all duration-200 shadow-sm border border-rose-400 hover:scale-110 font-medium"
                >
                  -
                </button>
                <span className="text-base font-medium w-8 text-center bg-white py-1 rounded-full border border-rose-200">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-full bg-blue-300 hover:bg-blue-400 text-white flex items-center justify-center transition-all duration-200 shadow-sm border border-blue-400 hover:scale-110 font-medium"
                >
                  +
                </button>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-rose-400 text-white px-6 py-3 rounded-full hover:bg-rose-500 transition-all duration-200 flex items-center justify-center space-x-2 font-medium text-base shadow-sm border border-rose-500 hover:scale-105 transform hover:-rotate-1"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>
              
              <button
                onClick={handleWishlistToggle}
                className={`px-6 py-3 rounded-full border transition-all duration-200 flex items-center justify-center shadow-sm hover:scale-105 ${
                  isInWishlist
                    ? 'border-rose-300 bg-rose-300 text-white'
                    : 'border-rose-200 bg-white hover:bg-rose-300 hover:text-white text-rose-400'
                }`}
              >
                <Heart className="w-4 h-4" fill={isInWishlist ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}