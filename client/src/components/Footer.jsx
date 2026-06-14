import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link to="/" className="text-2xl font-extrabold bg-gradient-to-r from-primary-400 to-indigo-400 bg-clip-text text-transparent">
              ShopEZ
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Your one-stop destination for premium products. Fast shipping, secure payments, and 24/7 customer support.
            </p>
          </div>

          {/* Quick Links Column */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Shop</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/catalog" className="hover:text-white transition-colors">All Products</Link>
              </li>
              <li>
                <Link to="/catalog?category=Electronics" className="hover:text-white transition-colors">Electronics</Link>
              </li>
              <li>
                <Link to="/catalog?category=Fashion" className="hover:text-white transition-colors">Fashion</Link>
              </li>
              <li>
                <Link to="/catalog?category=Home & Living" className="hover:text-white transition-colors">Home & Living</Link>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Support</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors">Contact Us</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">FAQ</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Shipping & Returns</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              </li>
            </ul>
          </div>

          {/* Contact Details Column */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Company</h3>
            <p className="text-sm text-slate-400 mb-2">ShopEZ Inc.</p>
            <p className="text-sm text-slate-400 mb-2">Email: support@shopez.com</p>
            <p className="text-sm text-slate-400">Phone: +1 (555) 019-2834</p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} ShopEZ. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
