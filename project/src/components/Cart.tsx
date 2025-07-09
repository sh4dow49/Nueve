import React from 'react';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Cart() {
  const { state, dispatch } = useApp();
  
  const total = state.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  
  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity === 0) {
      dispatch({ type: 'REMOVE_FROM_CART', payload: index.toString() });
    } else {
      dispatch({ type: 'UPDATE_CART_QUANTITY', payload: { id: index.toString(), quantity: newQuantity } });
    }
  };

  if (!state.isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-rose-200 shadow-lg">
        <div className="sticky top-0 bg-rose-100 z-10 flex items-center justify-between p-4 border-b border-rose-200">
          <h2 className="text-xl font-semibold text-slate-700 flex items-center">
            <ShoppingBag className="w-5 h-5 mr-2" />
            Shopping Cart ({state.cart.length})
          </h2>
          <button
            onClick={() => dispatch({ type: 'CLOSE_CART' })}
            className="bg-white text-slate-500 p-2 hover:bg-rose-400 hover:text-white rounded-full transition-all duration-200 shadow-sm border border-rose-200 hover:scale-110 hover:rotate-90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {state.cart.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg font-semibold text-slate-700 mb-2">Your cart is empty</p>
              <p className="text-sm font-medium text-rose-400">Add some items to get started</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {state.cart.map((item, index) => (
                <div key={index} className="flex items-center space-x-3 bg-rose-25 rounded-xl p-3 shadow-sm border border-rose-200 hover:border-rose-300 transition-all duration-200 transform hover:scale-105">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-lg object-cover border border-rose-300"
                  />
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-700 text-base">{item.product.name}</h3>
                    <p className="text-xs font-medium text-rose-400">
                      {item.selectedSize} • {item.selectedColor}
                    </p>
                    <p className="text-slate-600 font-medium text-sm bg-white px-2 py-1 rounded-full inline-block border border-rose-200">${item.product.price}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(index, item.quantity - 1)}
                      className="w-8 h-8 rounded-full bg-rose-300 hover:bg-rose-400 text-white flex items-center justify-center transition-all duration-200 shadow-sm border border-rose-400 hover:scale-110 font-medium"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    
                    <span className="font-medium text-base w-8 text-center bg-white py-1 rounded-full border border-rose-200">{item.quantity}</span>
                    
                    <button
                      onClick={() => updateQuantity(index, item.quantity + 1)}
                      className="w-8 h-8 rounded-full bg-blue-300 hover:bg-blue-400 text-white flex items-center justify-center transition-all duration-200 shadow-sm border border-blue-400 hover:scale-110 font-medium"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => dispatch({ type: 'REMOVE_FROM_CART', payload: index.toString() })}
                    className="text-rose-400 hover:text-white hover:bg-rose-400 p-1 rounded-full transition-all duration-200 border border-rose-300 hover:scale-110"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {state.cart.length > 0 && (
          <div className="border-t border-rose-200 p-4 bg-rose-50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-slate-700">Total:</span>
              <span className="text-2xl font-semibold text-slate-700 bg-white px-3 py-2 rounded-full border border-rose-200">${total.toFixed(2)}</span>
            </div>
            
            <button className="w-full bg-rose-400 text-white py-3 rounded-full font-medium text-base hover:bg-rose-500 transition-all duration-200 shadow-sm border border-rose-500 hover:scale-105 transform hover:-rotate-1">
              Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}