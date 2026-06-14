import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keywordInput, setKeywordInput] = useState('');

  // Read search filters from URL parameters
  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || '';

  const categories = ['All', 'Electronics', 'Fashion', 'Home & Living', 'Sports & Outdoors', 'Books'];

  useEffect(() => {
    // Sync keyword input field with URL search query
    setKeywordInput(currentSearch);
    fetchProducts();
  }, [currentCategory, currentSearch, currentSort]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (currentCategory && currentCategory !== 'All') {
        params.category = currentCategory;
      }
      if (currentSearch) {
        params.keyword = currentSearch;
      }
      if (currentSort) {
        params.sort = currentSort;
      }

      const { data } = await axios.get('/products', { params });
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (keywordInput) {
      newParams.set('search', keywordInput);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  const handleCategorySelect = (category) => {
    const newParams = new URLSearchParams(searchParams);
    if (category && category !== 'All') {
      newParams.set('category', category);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
  };

  const handleSortSelect = (sortVal) => {
    const newParams = new URLSearchParams(searchParams);
    if (sortVal) {
      newParams.set('sort', sortVal);
    } else {
      newParams.delete('sort');
    }
    setSearchParams(newParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Product Catalog</h1>
        <p className="text-sm text-slate-500 mt-1">Explore our range of premium products</p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-grow max-w-lg">
          <input
            type="text"
            placeholder="Search products..."
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 pl-11 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm"
          />
          <button type="submit" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <Search size={18} />
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-4">
          {/* Sorting */}
          <div className="relative inline-flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl">
            <ArrowUpDown size={16} className="text-slate-400" />
            <select
              value={currentSort}
              onChange={(e) => handleSortSelect(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-700 focus:outline-none pr-6 cursor-pointer"
            >
              <option value="">Sort by: Newest</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Categories Tabs & Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Category Sidebar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 lg:sticky lg:top-24">
          <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-100 pb-3">
            <SlidersHorizontal size={18} />
            Categories
          </div>
          <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1 pb-2 lg:pb-0">
            {categories.map((cat) => {
              const isActive = (cat === 'All' && !currentCategory) || currentCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-primary-600 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-xl border border-slate-200 h-80"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <p className="text-slate-400 mb-2 font-medium">No products found matching your criteria.</p>
              <button
                onClick={() => setSearchParams({})}
                className="text-primary-600 hover:underline font-semibold text-sm"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Catalog;
