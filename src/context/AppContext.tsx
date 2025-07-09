import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { CartItem, WishlistItem, User, Address, Order } from '../types';

interface AppState {
  cart: CartItem[];
  wishlist: WishlistItem[];
  isCartOpen: boolean;
  isWishlistOpen: boolean;
  user: User | null;
  isLoginOpen: boolean;
  addresses: Address[];
  orders: Order[];
  isCheckoutOpen: boolean;
  isOrdersOpen: boolean;
}

type AppAction = 
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_CART_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'ADD_TO_WISHLIST'; payload: WishlistItem }
  | { type: 'REMOVE_FROM_WISHLIST'; payload: string }
  | { type: 'TOGGLE_CART' }
  | { type: 'TOGGLE_WISHLIST' }
  | { type: 'CLOSE_CART' }
  | { type: 'CLOSE_WISHLIST' }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'TOGGLE_LOGIN' }
  | { type: 'CLOSE_LOGIN' }
  | { type: 'SET_ADDRESSES'; payload: Address[] }
  | { type: 'ADD_ADDRESS'; payload: Address }
  | { type: 'SET_ORDERS'; payload: Order[] }
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'TOGGLE_CHECKOUT' }
  | { type: 'CLOSE_CHECKOUT' }
  | { type: 'TOGGLE_ORDERS' }
  | { type: 'CLOSE_ORDERS' };

const initialState: AppState = {
  cart: [],
  wishlist: [],
  isCartOpen: false,
  isWishlistOpen: false,
  user: null,
  isLoginOpen: false,
  addresses: [],
  orders: [],
  isCheckoutOpen: false,
  isOrdersOpen: false
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

    case 'CLEAR_CART':
      return {
        ...state,
        cart: []
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
        isWishlistOpen: false,
        isCheckoutOpen: false,
        isOrdersOpen: false
      };
      
    case 'TOGGLE_WISHLIST':
      return {
        ...state,
        isWishlistOpen: !state.isWishlistOpen,
        isCartOpen: false,
        isCheckoutOpen: false,
        isOrdersOpen: false
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

    case 'SET_USER':
      return {
        ...state,
        user: action.payload
      };

    case 'TOGGLE_LOGIN':
      return {
        ...state,
        isLoginOpen: !state.isLoginOpen
      };

    case 'CLOSE_LOGIN':
      return {
        ...state,
        isLoginOpen: false
      };

    case 'SET_ADDRESSES':
      return {
        ...state,
        addresses: action.payload
      };

    case 'ADD_ADDRESS':
      return {
        ...state,
        addresses: [...state.addresses, action.payload]
      };

    case 'SET_ORDERS':
      return {
        ...state,
        orders: action.payload
      };

    case 'ADD_ORDER':
      return {
        ...state,
        orders: [action.payload, ...state.orders]
      };

    case 'TOGGLE_CHECKOUT':
      return {
        ...state,
        isCheckoutOpen: !state.isCheckoutOpen,
        isCartOpen: false,
        isWishlistOpen: false,
        isOrdersOpen: false
      };

    case 'CLOSE_CHECKOUT':
      return {
        ...state,
        isCheckoutOpen: false
      };

    case 'TOGGLE_ORDERS':
      return {
        ...state,
        isOrdersOpen: !state.isOrdersOpen,
        isCartOpen: false,
        isWishlistOpen: false,
        isCheckoutOpen: false
      };

    case 'CLOSE_ORDERS':
      return {
        ...state,
        isOrdersOpen: false
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