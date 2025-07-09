import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { categories } from '../data/products';

interface FiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
}

export default function Filters({ 
  selectedCategory, 
  onCategoryChange, 
  priceRange, 
  onPriceRangeChange 
}: FiltersProps) {
  const [openDropdowns, setOpenDropdowns] = useState({
    categories: true,
    price: false,
    size: false,
    color: false
  });

  const toggleDropdown = (dropdown: keyof typeof openDropdowns) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [dropdown]: !prev[dropdown]
    }));
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-200">
      <h3 className="text-lg font-semibold mb-4 text-slate-700 bg-rose-50 px-3 py-2 rounded-full text-center border border-rose-200 transform -rotate-1">Filters</h3>
      
      {/* Categories Dropdown */}
      <div className="mb-4">
        <button
          onClick={() => toggleDropdown('categories')}
          className="w-full flex items-center justify-between text-sm font-medium text-slate-600 mb-3 bg-rose-100 px-3 py-2 rounded-full border border-rose-200 hover:bg-rose-200 transition-colors"
        >
          <span>Categories</span>
          {openDropdowns.categories ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {openDropdowns.categories && (
          <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`w-full text-left px-3 py-2 rounded-xl transition-all duration-200 font-medium border transform hover:scale-105 ${
                  selectedCategory === category.id
                    ? 'bg-rose-300 text-white border-rose-400 shadow-sm scale-105'
                    : 'bg-slate-50 hover:bg-rose-50 text-slate-600 border-slate-200 hover:border-rose-200'
                }`}
              >
                <span className="text-sm">{category.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Price Range Dropdown */}
      <div className="mb-4">
        <button
          onClick={() => toggleDropdown('price')}
          className="w-full flex items-center justify-between text-sm font-medium text-slate-600 mb-3 bg-blue-100 px-3 py-2 rounded-full border border-blue-200 hover:bg-blue-200 transition-colors"
        >
          <span>Price Range</span>
          {openDropdowns.price ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {openDropdowns.price && (
          <div className="space-y-3 bg-blue-50 p-3 rounded-xl border border-blue-200 animate-in slide-in-from-top-2 duration-200">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-600">Min: ${priceRange[0]}</label>
              <input
                type="range"
                min="0"
                max="200"
                value={priceRange[0]}
                onChange={(e) => onPriceRangeChange([parseInt(e.target.value), priceRange[1]])}
                className="w-full h-2 bg-rose-200 rounded-full appearance-none cursor-pointer slider"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-600">Max: ${priceRange[1]}</label>
              <input
                type="range"
                min="0"
                max="200"
                value={priceRange[1]}
                onChange={(e) => onPriceRangeChange([priceRange[0], parseInt(e.target.value)])}
                className="w-full h-2 bg-rose-200 rounded-full appearance-none cursor-pointer slider"
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="bg-rose-300 text-white px-2 py-1 rounded-full font-medium border border-rose-400 text-xs">${priceRange[0]}</span>
              <span className="text-xs text-slate-500">to</span>
              <span className="bg-rose-300 text-white px-2 py-1 rounded-full font-medium border border-rose-400 text-xs">${priceRange[1]}</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Size Filter Dropdown */}
      <div className="mb-4">
        <button
          onClick={() => toggleDropdown('size')}
          className="w-full flex items-center justify-between text-sm font-medium text-slate-600 mb-3 bg-purple-100 px-3 py-2 rounded-full border border-purple-200 hover:bg-purple-200 transition-colors"
        >
          <span>Size</span>
          {openDropdowns.size ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {openDropdowns.size && (
          <div className="grid grid-cols-3 gap-2 animate-in slide-in-from-top-2 duration-200">
            {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
              <button
                key={size}
                className="px-2 py-2 font-medium text-slate-600 bg-white border border-purple-300 rounded-xl hover:bg-purple-200 hover:text-slate-700 hover:scale-105 transition-all duration-200 shadow-sm text-xs"
              >
                {size}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Color Filter Dropdown */}
      <div>
        <button
          onClick={() => toggleDropdown('color')}
          className="w-full flex items-center justify-between text-sm font-medium text-slate-600 mb-3 bg-rose-100 px-3 py-2 rounded-full border border-rose-200 hover:bg-rose-200 transition-colors"
        >
          <span>Colors</span>
          {openDropdowns.color ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {openDropdowns.color && (
          <div className="grid grid-cols-4 gap-2 animate-in slide-in-from-top-2 duration-200">
            {[
              { name: 'Blue', class: 'bg-blue-200' },
              { name: 'Green', class: 'bg-green-200' },
              { name: 'Purple', class: 'bg-purple-200' },
              { name: 'Pink', class: 'bg-rose-200' },
              { name: 'Orange', class: 'bg-orange-200' },
              { name: 'Yellow', class: 'bg-yellow-200' },
              { name: 'Gray', class: 'bg-slate-200' },
              { name: 'Beige', class: 'bg-amber-200' },
            ].map((color) => (
              <button
                key={color.name}
                className={`w-8 h-8 rounded-full border-2 border-white shadow-sm hover:scale-110 hover:rotate-12 transition-all duration-200 ${color.class}`}
                title={color.name}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}