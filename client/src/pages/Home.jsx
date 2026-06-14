import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { ArrowRight, Sparkles, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get('/products');
        // Slice first 4 products for featured section
        setProducts(data.slice(0, 4));
      } catch (err) {
        console.error('Error fetching featured products', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categories = [
    { name: 'Electronics', count: 'Electronics', color: 'from-blue-500 to-indigo-600', icon: '💻' },
    { name: 'Fashion', count: 'Fashion', color: 'from-pink-500 to-rose-600', icon: '👔' },
    { name: 'Home & Living', count: 'Home & Living', color: 'from-amber-500 to-orange-600', icon: '🏠' },
    { name: 'Sports & Outdoors', count: 'Sports & Outdoors', color: 'from-emerald-500 to-teal-600', icon: '⚽' },
    { name: 'Books', count: 'Books', color: 'from-violet-500 to-purple-600', icon: '📚' },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl overflow-hidden py-20 px-8 sm:px-16 mx-4 sm:mx-6 lg:mx-8 mt-6 shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.15),transparent)] pointer-events-none"></div>
        <div className="max-w-3xl relative z-10 space-y-6">
          <div className="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-400/20 px-3.5 py-1 rounded-full text-indigo-300 text-xs font-semibold">
            <Sparkles size={14} />
            Introducing ShopEZ 2.0
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            Elevate Your Shopping <br />
            <span className="bg-gradient-to-r from-primary-400 to-indigo-300 bg-clip-text text-transparent">
              Experience Effortlessly
            </span>
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed max-w-xl">
            Discover curated premium products from verified sellers, all with lightning-fast shipping and unparalleled customer support.
          </p>
          <div className="pt-4">
            <Link
              to="/catalog"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-900 font-bold px-8 py-4 rounded-xl shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
            >
              Explore Catalog
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Shop by Category</h2>
            <p className="text-sm text-slate-500">Pick from our curated classifications</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={`/catalog?category=${encodeURIComponent(cat.name)}`}
              className={`relative group h-32 rounded-2xl overflow-hidden p-5 flex flex-col justify-between bg-gradient-to-br ${cat.color} shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1`}
            >
              <div className="text-3xl">{cat.icon}</div>
              <div className="text-white">
                <span className="font-bold block tracking-wide">{cat.name}</span>
                <span className="text-xs text-white/80 group-hover:underline inline-flex items-center gap-1 mt-1 font-semibold">
                  Shop Now
                  <ArrowRight size={12} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Featured Products</h2>
            <p className="text-sm text-slate-500">Handpicked items popular this week</p>
          </div>
          <Link to="/catalog" className="text-sm font-bold text-primary-600 hover:text-primary-800 transition-colors inline-flex items-center gap-1">
            See All Products
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-xl border border-slate-200 h-80"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Value Prop Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-100 border border-slate-200/60 rounded-3xl p-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="p-4 bg-primary-50 rounded-2xl text-primary-600 shrink-0">
              <Truck size={28} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base mb-1">Free & Fast Shipping</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Free delivery on all orders over $150. Packaged securely.</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="p-4 bg-primary-50 rounded-2xl text-primary-600 shrink-0">
              <RotateCcw size={28} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base mb-1">30 Days Returns</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Not happy with your item? Easily return it within 30 days.</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="p-4 bg-primary-50 rounded-2xl text-primary-600 shrink-0">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base mb-1">100% Safe Payments</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Secure and encrypted transaction protocols for complete peace of mind.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
