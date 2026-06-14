import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { Star, ShoppingCart } from 'lucide-react';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product, 1);
  };

  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isOutOfStock = product.stock === 0;

  return (
    <div className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full">
      <Link to={`/products/${product._id}`} className="relative block overflow-hidden aspect-[4/3] bg-slate-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {isOutOfStock && (
          <span className="absolute top-3 right-3 bg-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            Out of Stock
          </span>
        )}
        {!isOutOfStock && isLowStock && (
          <span className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            Only {product.stock} left
          </span>
        )}
      </Link>

      <div className="p-5 flex-grow flex flex-col justify-between">
        <div>
          {/* Category & Ratings */}
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-2.5 py-0.5 rounded-full">
              {product.category}
            </span>
            <div className="flex items-center gap-1">
              <Star className="text-amber-400 fill-amber-400" size={14} />
              <span className="text-xs font-semibold text-slate-700">{product.averageRating.toFixed(1)}</span>
              <span className="text-xs text-slate-400">({product.numReviews})</span>
            </div>
          </div>

          {/* Product Name */}
          <Link to={`/products/${product._id}`} className="block mb-2">
            <h3 className="font-bold text-slate-800 text-base line-clamp-1 group-hover:text-primary-600 transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Product Description */}
          <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Pricing and Action */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
          <div>
            <span className="text-xs text-slate-400 block">Price</span>
            <span className="text-lg font-extrabold text-slate-900">${product.price.toFixed(2)}</span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex items-center justify-center p-2.5 rounded-lg border transition-all ${
              isOutOfStock
                ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-primary-50 border-primary-100 text-primary-600 hover:bg-primary-600 hover:text-white hover:border-primary-600'
            }`}
            title="Add to Cart"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
