import React, { useState } from 'react';
import { Search, ShoppingCart, Heart, Menu, X, User, Package, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface HeaderProps {
  onSearch: (query: string) => void;
  searchQuery: string;
}

export default function Header({ onSearch, searchQuery }: HeaderProps) {
  const { state, dispatch } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const cartItemCount = state.cart.reduce((total, item) => total + item.quantity, 0);
  const wishlistItemCount = state.wishlist.length;

  const handleLogout = () => {
    dispatch({ type: 'SET_USER', payload: null });
    setShowUserMenu(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-pastel-blue-light border-b-2 border-pastel-blue shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="bg-white rounded-full p-2 shadow-sm border-2 border-pastel-blue transform hover:rotate-6 transition-transform duration-300">
              <span className="text-2xl font-bold text-pastel-blue-dark">N</span>
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-slate-700 transform -rotate-1">
                Nueve
              </h1>
              <p className="text-xs font-medium text-pastel-blue-dark transform rotate-1">Fashion</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="bg-white text-slate-600 px-4 py-2 rounded-full font-medium text-sm hover:bg-pastel-blue-light hover:scale-105 transition-all duration-200 shadow-sm border border-pastel-blue transform hover:-rotate-1">
              New Arrivals
            </a>
            <a href="#" className="bg-pastel-orange text-slate-600 px-4 py-2 rounded-full font-medium text-sm hover:bg-pastel-orange-dark hover:scale-105 transition-all duration-200 shadow-sm border border-pastel-orange-dark transform hover:rotate-1">
              Sale
            </a>
            <a href="#" className="bg-pastel-green text-slate-600 px-4 py-2 rounded-full font-medium text-sm hover:bg-pastel-green-dark hover:scale-105 transition-all duration-200 shadow-sm border border-pastel-green-dark transform hover:-rotate-1">
              About
            </a>
            <a href="#" className="bg-pastel-purple text-slate-600 px-4 py-2 rounded-full font-medium text-sm hover:bg-pastel-purple-dark hover:scale-105 transition-all duration-200 shadow-sm border border-pastel-purple-dark transform hover:rotate-1">
              Contact
            </a>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full transform rotate-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-pastel-blue rounded-full focus:outline-none focus:ring-2 focus:ring-pastel-blue-dark focus:border-pastel-blue-dark transition-all text-sm font-medium text-slate-600 placeholder-slate-400 shadow-sm"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            {/* Mobile Search */}
            <div className="md:hidden">
              <button className="bg-pastel-blue p-2 rounded-full hover:bg-pastel-blue-dark hover:scale-110 transition-all duration-200 shadow-sm border border-pastel-blue-dark">
                <Search className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            {/* User Menu */}
            {state.user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="bg-pastel-lemon p-2 rounded-full hover:bg-pastel-lemon-dark hover:scale-110 transition-all duration-200 shadow-sm border border-pastel-lemon-dark transform hover:rotate-6"
                >
                  <User className="w-4 h-4 text-slate-600" />
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-pastel-blue z-50">
                    <div className="p-3 border-b border-pastel-blue-light">
                      <p className="font-medium text-slate-700">{state.user.name || 'User'}</p>
                      <p className="text-sm text-slate-600">{state.user.phone}</p>
                    </div>
                    <div className="py-2">
                      <button
                        onClick={() => {
                          dispatch({ type: 'TOGGLE_ORDERS' });
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-slate-600 hover:bg-pastel-blue-light flex items-center space-x-2"
                      >
                        <Package className="w-4 h-4" />
                        <span>My Orders</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-slate-600 hover:bg-pastel-pink-light flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => dispatch({ type: 'TOGGLE_LOGIN' })}
                className="bg-pastel-lemon p-2 rounded-full hover:bg-pastel-lemon-dark hover:scale-110 transition-all duration-200 shadow-sm border border-pastel-lemon-dark transform hover:rotate-6"
              >
                <User className="w-4 h-4 text-slate-600" />
              </button>
            )}

            {/* Wishlist */}
            <button
              onClick={() => dispatch({ type: 'TOGGLE_WISHLIST' })}
              className="relative bg-pastel-orange p-2 rounded-full hover:bg-pastel-orange-dark hover:scale-110 transition-all duration-200 shadow-sm border border-pastel-orange-dark transform hover:rotate-6"
            >
              <Heart className="w-4 h-4 text-slate-600" />
              {wishlistItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pastel-pink-dark text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center border border-white shadow-sm animate-pulse">
                  {wishlistItemCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={() => dispatch({ type: 'TOGGLE_CART' })}
              className="relative bg-pastel-green p-2 rounded-full hover:bg-pastel-green-dark hover:scale-110 transition-all duration-200 shadow-sm border border-pastel-green-dark transform hover:-rotate-6"
            >
              <ShoppingCart className="w-4 h-4 text-slate-600" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pastel-blue-dark text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center border border-white shadow-sm animate-pulse">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden bg-pastel-purple p-2 rounded-full hover:bg-pastel-purple-dark hover:scale-110 transition-all duration-200 shadow-sm border border-pastel-purple-dark"
            >
              {isMenuOpen ? <X className="w-4 h-4 text-slate-600" /> : <Menu className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-pastel-blue bg-white/95 rounded-b-2xl mx-4 shadow-sm">
            <div className="flex flex-col space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => onSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-pastel-blue rounded-full focus:outline-none focus:ring-2 focus:ring-pastel-blue-dark text-sm font-medium text-slate-600 placeholder-slate-400 shadow-sm"
                />
              </div>
              <a href="#" className="bg-pastel-blue-light text-slate-600 px-4 py-2 rounded-full font-medium text-sm hover:bg-pastel-blue transition-all shadow-sm border border-pastel-blue text-center transform hover:scale-105">
                New Arrivals
              </a>
              <a href="#" className="bg-pastel-orange text-slate-600 px-4 py-2 rounded-full font-medium text-sm hover:bg-pastel-orange-dark transition-all shadow-sm border border-pastel-orange-dark text-center transform hover:scale-105">
                Sale
              </a>
              <a href="#" className="bg-pastel-green text-slate-600 px-4 py-2 rounded-full font-medium text-sm hover:bg-pastel-green-dark transition-all shadow-sm border border-pastel-green-dark text-center transform hover:scale-105">
                About
              </a>
              <a href="#" className="bg-pastel-purple text-slate-600 px-4 py-2 rounded-full font-medium text-sm hover:bg-pastel-purple-dark transition-all shadow-sm border border-pastel-purple-dark text-center transform hover:scale-105">
                Contact
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}