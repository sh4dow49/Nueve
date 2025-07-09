import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { CartItem, WishlistItem, Product } from '../types';

interface AppState {
  cart: CartItem[];
  wishlist: WishlistItem[];
  isCartOpen: boolean;
  isWishlistOpen: boolean;
}

type AppAction = 
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_CART_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'ADD_TO_WISHLIST'; payload: WishlistItem }
  | { type: 'REMOVE_FROM_WISHLIST'; payload: string }
  | { type: 'TOGGLE_CART' }
  | { type: 'TOGGLE_WISHLIST' }
  | { type: 'CLOSE_CART' }
  | { type: 'CLOSE_WISHLIST' };

const initialState: AppState = {
  cart: [],
  wishlist: [],
  isCartOpen: false,
  isWishlistOpen: false
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | undefined>(undefined);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_TO_CART':
      const existingItem = state.cart.find(
        item => item.product.id === action.payload.product.id &&
                item.selectedSize === action.payload.selectedSize &&
                item.selectedColor === action.payload.selectedColor
      );
      
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map(item =>
            item.product.id === action.payload.product.id &&
            item.selectedSize === action.payload.selectedSize &&
            item.selectedColor === action.payload.selectedColor
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        };
      }
      
      return {
        ...state,
        cart: [...state.cart, action.payload]
      };
      
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.filter((_, index) => index !== parseInt(action.payload))
      };
      
    case 'UPDATE_CART_QUANTITY':
      return {
        ...state,
        cart: state.cart.map((item, index) =>
          index === parseInt(action.payload.id)
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };
      
    case 'ADD_TO_WISHLIST':
      const wishlistExists = state.wishlist.find(
        item => item.product.id === action.payload.product.id
      );
      
      if (wishlistExists) return state;
      
      return {
        ...state,
        wishlist: [...state.wishlist, action.payload]
      };
      
    case 'REMOVE_FROM_WISHLIST':
      return {
        ...state,
        wishlist: state.wishlist.filter(item => item.product.id !== action.payload)
      };
      
    case 'TOGGLE_CART':
      return {
        ...state,
        isCartOpen: !state.isCartOpen,
        isWishlistOpen: false
      };
      
    case 'TOGGLE_WISHLIST':
      return {
        ...state,
        isWishlistOpen: !state.isWishlistOpen,
        isCartOpen: false
      };
      
    case 'CLOSE_CART':
      return {
        ...state,
        isCartOpen: false
      };
      
    case 'CLOSE_WISHLIST':
      return {
        ...state,
        isWishlistOpen: false
      };
      
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}