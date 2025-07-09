import React, { useState, useMemo } from 'react';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import ProductCard from './components/ProductCard';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import Wishlist from './components/Wishlist';
import Filters from './components/Filters';
import { products } from './data/products';
import { Product } from './types';

function AppContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      
      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [searchQuery, selectedCategory, priceRange]);

  return (
    <div className="min-h-screen bg-rose-25">
      <Header onSearch={setSearchQuery} searchQuery={searchQuery} />
      
      {/* Hero Section */}
      <section className="relative py-16 px-4 bg-rose-50">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 transform -rotate-1">
            <span className="bg-white text-slate-700 px-6 py-3 rounded-2xl shadow-sm border-2 border-rose-200 inline-block transform hover:rotate-1 transition-transform duration-300">
              Nueve Collection
            </span>
          </h1>
          <p className="text-lg md:text-xl font-medium text-slate-600 mb-8 max-w-2xl mx-auto bg-white px-6 py-3 rounded-full shadow-sm border border-rose-200 transform rotate-1">
            Discover timeless pieces that define your style
          </p>
          <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-6">
            <button className="bg-rose-300 text-white px-8 py-3 rounded-full font-medium text-base hover:bg-rose-400 transition-all transform hover:scale-105 hover:-rotate-2 shadow-sm border border-rose-400">
              Shop Now
            </button>
            <button className="bg-white text-slate-600 px-8 py-3 rounded-full font-medium text-base hover:bg-rose-50 transition-all transform hover:scale-105 hover:rotate-2 shadow-sm border border-rose-200">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Filters
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
            />
          </div>
          
          {/* Products Grid */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-semibold text-slate-700 bg-white px-4 py-2 rounded-full shadow-sm border border-rose-200 transform -rotate-1">
                {selectedCategory === 'all' ? 'All Products' : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`}
              </h2>
              <p className="text-sm font-medium text-slate-600 bg-white px-3 py-2 rounded-full shadow-sm border border-rose-200">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
              </p>
            </div>
            
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-rose-200">
                <p className="text-xl font-semibold text-slate-700 mb-2">No products found</p>
                <p className="text-base font-medium text-rose-400">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onProductClick={setSelectedProduct}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Modals */}
      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
      
      <Cart />
      <Wishlist />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;