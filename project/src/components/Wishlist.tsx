import React from 'react';
import { X, Heart, ShoppingCart } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Wishlist() {
  const { state, dispatch } = useApp();
  
  const handleAddToCart = (productId: string) => {
    const wishlistItem = state.wishlist.find(item => item.product.id === productId);
    if (wishlistItem) {
      dispatch({
        type: 'ADD_TO_CART',
        payload: {
          product: wishlistItem.product,
          quantity: 1,
          selectedSize: wishlistItem.product.size[0],
          selectedColor: wishlistItem.product.color[0]
        }
      });
    }
  };

  if (!state.isWishlistOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-rose-200 shadow-lg">
        <div className="sticky top-0 bg-rose-100 z-10 flex items-center justify-between p-4 border-b border-rose-200">
          <h2 className="text-xl font-semibold text-slate-700 flex items-center">
            <Heart className="w-5 h-5 mr-2 text-rose-400" />
            Wishlist ({state.wishlist.length})
          </h2>
          <button
            onClick={() => dispatch({ type: 'CLOSE_WISHLIST' })}
            className="bg-white text-slate-500 p-2 hover:bg-rose-400 hover:text-white rounded-full transition-all duration-200 shadow-sm border border-rose-200 hover:scale-110 hover:rotate-90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {state.wishlist.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg font-semibold text-slate-700 mb-2">Your wishlist is empty</p>
              <p className="text-sm font-medium text-rose-400">Save items you love for later</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {state.wishlist.map((item) => (
                <div key={item.product.id} className="flex items-center space-x-3 bg-rose-25 rounded-xl p-3 shadow-sm border border-rose-200 hover:border-rose-300 transition-all duration-200 transform hover:scale-105">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-lg object-cover border border-rose-300"
                  />
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-700 text-base">{item.product.name}</h3>
                    <p className="text-xs font-medium text-rose-400 line-clamp-2">{item.product.description}</p>
                    <p className="text-slate-600 font-medium text-sm bg-white px-2 py-1 rounded-full inline-block border border-rose-200">${item.product.price}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleAddToCart(item.product.id)}
                      className="bg-blue-300 text-white p-2 rounded-full hover:bg-blue-400 transition-all duration-200 shadow-sm border border-blue-400 hover:scale-110 hover:-rotate-6"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: item.product.id })}
                      className="text-rose-400 hover:text-white hover:bg-rose-400 p-1 rounded-full transition-all duration-200 border border-rose-300 hover:scale-110"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}