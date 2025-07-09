import React, { useState } from 'react';
import { Search, ShoppingCart, Heart, Menu, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface HeaderProps {
  onSearch: (query: string) => void;
  searchQuery: string;
}

export default function Header({ onSearch, searchQuery }: HeaderProps) {
  const { state, dispatch } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const cartItemCount = state.cart.reduce((total, item) => total + item.quantity, 0);
  const wishlistItemCount = state.wishlist.length;

  return (
    <header className="sticky top-0 z-50 bg-rose-50 border-b-2 border-rose-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="bg-white rounded-full p-2 shadow-sm border-2 border-rose-200 transform hover:rotate-6 transition-transform duration-300">
              <span className="text-2xl font-bold text-rose-400">N</span>
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-slate-700 transform -rotate-1">
                Nueve
              </h1>
              <p className="text-xs font-medium text-rose-400 transform rotate-1">Fashion</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="bg-white text-slate-600 px-4 py-2 rounded-full font-medium text-sm hover:bg-rose-50 hover:scale-105 transition-all duration-200 shadow-sm border border-rose-200 transform hover:-rotate-1">
              New Arrivals
            </a>
            <a href="#" className="bg-rose-200 text-slate-600 px-4 py-2 rounded-full font-medium text-sm hover:bg-rose-300 hover:scale-105 transition-all duration-200 shadow-sm border border-rose-300 transform hover:rotate-1">
              Sale
            </a>
            <a href="#" className="bg-blue-100 text-slate-600 px-4 py-2 rounded-full font-medium text-sm hover:bg-blue-200 hover:scale-105 transition-all duration-200 shadow-sm border border-blue-200 transform hover:-rotate-1">
              About
            </a>
            <a href="#" className="bg-purple-100 text-slate-600 px-4 py-2 rounded-full font-medium text-sm hover:bg-purple-200 hover:scale-105 transition-all duration-200 shadow-sm border border-purple-200 transform hover:rotate-1">
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
                className="w-full pl-10 pr-4 py-2 bg-white border border-rose-200 rounded-full focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 transition-all text-sm font-medium text-slate-600 placeholder-slate-400 shadow-sm"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            {/* Mobile Search */}
            <div className="md:hidden">
              <button className="bg-rose-100 p-2 rounded-full hover:bg-rose-200 hover:scale-110 transition-all duration-200 shadow-sm border border-rose-200">
                <Search className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            {/* Wishlist */}
            <button
              onClick={() => dispatch({ type: 'TOGGLE_WISHLIST' })}
              className="relative bg-rose-200 p-2 rounded-full hover:bg-rose-300 hover:scale-110 transition-all duration-200 shadow-sm border border-rose-300 transform hover:rotate-6"
            >
              <Heart className="w-4 h-4 text-slate-600" />
              {wishlistItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-400 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center border border-white shadow-sm animate-pulse">
                  {wishlistItemCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={() => dispatch({ type: 'TOGGLE_CART' })}
              className="relative bg-blue-200 p-2 rounded-full hover:bg-blue-300 hover:scale-110 transition-all duration-200 shadow-sm border border-blue-300 transform hover:-rotate-6"
            >
              <ShoppingCart className="w-4 h-4 text-slate-600" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-400 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center border border-white shadow-sm animate-pulse">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden bg-purple-200 p-2 rounded-full hover:bg-purple-300 hover:scale-110 transition-all duration-200 shadow-sm border border-purple-300"
            >
              {isMenuOpen ? <X className="w-4 h-4 text-slate-600" /> : <Menu className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-rose-200 bg-white/95 rounded-b-2xl mx-4 shadow-sm">
            <div className="flex flex-col space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => onSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-rose-200 rounded-full focus:outline-none focus:ring-2 focus:ring-rose-200 text-sm font-medium text-slate-600 placeholder-slate-400 shadow-sm"
                />
              </div>
              <a href="#" className="bg-rose-50 text-slate-600 px-4 py-2 rounded-full font-medium text-sm hover:bg-rose-100 transition-all shadow-sm border border-rose-200 text-center transform hover:scale-105">
                New Arrivals
              </a>
              <a href="#" className="bg-rose-200 text-slate-600 px-4 py-2 rounded-full font-medium text-sm hover:bg-rose-300 transition-all shadow-sm border border-rose-300 text-center transform hover:scale-105">
                Sale
              </a>
              <a href="#" className="bg-blue-100 text-slate-600 px-4 py-2 rounded-full font-medium text-sm hover:bg-blue-200 transition-all shadow-sm border border-blue-200 text-center transform hover:scale-105">
                About
              </a>
              <a href="#" className="bg-purple-100 text-slate-600 px-4 py-2 rounded-full font-medium text-sm hover:bg-purple-200 transition-all shadow-sm border border-purple-200 text-center transform hover:scale-105">
                Contact
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}