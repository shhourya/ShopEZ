import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { Star, ShoppingCart, MessageSquare, AlertCircle, Sparkles, Check, CornerDownRight } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Review Form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/products/${id}`);
      setProduct(data);
    } catch (err) {
      setError('Failed to fetch product details.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/cart');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment) {
      setReviewError('Please enter a review comment');
      return;
    }
    try {
      setReviewError('');
      setReviewSuccess('');
      await axios.post(`/products/${id}/reviews`, { rating, comment });
      setReviewSuccess('Review submitted successfully!');
      setComment('');
      setRating(5);
      fetchProductDetails(); // reload product details to display new review
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="animate-pulse space-y-8 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-200 aspect-[4/3] rounded-2xl"></div>
            <div className="space-y-4">
              <div className="h-4 bg-slate-200 rounded w-1/4"></div>
              <div className="h-8 bg-slate-200 rounded w-3/4"></div>
              <div className="h-6 bg-slate-200 rounded w-1/3"></div>
              <div className="h-20 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4">
        <AlertCircle size={48} className="text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-800">{error || 'Product not found'}</h2>
        <Link to="/catalog" className="text-primary-600 hover:underline font-bold text-sm">
          Return to Catalog
        </Link>
      </div>
    );
  }

  // Calculate rating distributions
  const starsBreakdown = [5, 4, 3, 2, 1].map((starVal) => {
    const matchingReviews = product.reviews.filter((r) => r.rating === starVal);
    const percentage = product.reviews.length > 0 ? (matchingReviews.length / product.reviews.length) * 100 : 0;
    return { starVal, percentage, count: matchingReviews.length };
  });

  const isOutOfStock = product.stock === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Product Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm">
        {/* Product Image */}
        <div className="overflow-hidden rounded-2xl bg-slate-100 border border-slate-200 aspect-[4/3]">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        </div>

        {/* Info Area */}
        <div className="space-y-6">
          {/* Category & Rating */}
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-xs font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-3 py-1 rounded-full">
              {product.category}
            </span>
            <div className="flex items-center gap-1">
              <Star className="text-amber-400 fill-amber-400" size={16} />
              <span className="text-sm font-semibold text-slate-700">{product.averageRating.toFixed(1)}</span>
              <span className="text-sm text-slate-400">({product.numReviews} ratings)</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 leading-tight">{product.name}</h1>

          {/* Price & Stock */}
          <div className="flex items-baseline gap-4 py-2 border-y border-slate-100">
            <span className="text-3xl font-extrabold text-slate-900">${product.price.toFixed(2)}</span>
            {isOutOfStock ? (
              <span className="text-sm text-rose-600 font-bold bg-rose-50 px-3.5 py-1 rounded-full uppercase">
                Out of Stock
              </span>
            ) : product.stock <= 5 ? (
              <span className="text-sm text-amber-600 font-bold bg-amber-50 px-3.5 py-1 rounded-full uppercase">
                Only {product.stock} units remaining!
              </span>
            ) : (
              <span className="text-sm text-emerald-600 font-bold bg-emerald-50 px-3.5 py-1 rounded-full uppercase">
                In Stock ({product.stock} units)
              </span>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-800 text-sm">Product Description</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Seller details */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 p-4 rounded-xl">
            <CornerDownRight size={16} className="text-slate-400" />
            <span className="text-xs text-slate-500">
              Sold by <span className="font-bold text-slate-800">{product.seller?.name || 'ShopEZ Verified Seller'}</span>
            </span>
          </div>

          {/* Action Buttons */}
          {!isOutOfStock && (
            <div className="space-y-4 pt-4">
              {/* Quantity Selector */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-700">Quantity</span>
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 font-bold transition-all"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-sm font-semibold text-slate-800 w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 font-bold transition-all"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add / Buy buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handleAddToCart}
                  className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold py-3.5 px-6 rounded-xl transition-all"
                >
                  <ShoppingCart size={18} />
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Buy Now
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews and Ratings Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Rating Breakdown Analytics */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-lg font-extrabold text-slate-900">Customer Ratings</h2>

          {/* Large Average score */}
          <div className="flex items-center gap-4">
            <span className="text-5xl font-black text-slate-900">{product.averageRating.toFixed(1)}</span>
            <div>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, idx) => (
                  <Star
                    key={idx}
                    className={
                      idx < Math.round(product.averageRating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                    }
                    size={18}
                  />
                ))}
              </div>
              <span className="text-xs text-slate-400 block mt-1">Based on {product.numReviews} reviews</span>
            </div>
          </div>

          {/* Bar breakdown list */}
          <div className="space-y-3 pt-2">
            {starsBreakdown.map((row) => (
              <div key={row.starVal} className="flex items-center gap-3 text-xs text-slate-600">
                <span className="w-3 text-right font-bold">{row.starVal}</span>
                <Star className="text-amber-400 fill-amber-400" size={12} />
                <div className="flex-grow bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: `${row.percentage}%` }}></div>
                </div>
                <span className="w-8 text-right text-slate-400">{row.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews List & Submission */}
        <div className="lg:col-span-2 space-y-6">
          {/* Reviews List */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-2 font-extrabold text-slate-900 text-lg border-b border-slate-100 pb-4">
              <MessageSquare size={20} className="text-slate-500" />
              Reviews ({product.reviews.length})
            </div>

            {product.reviews.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No reviews yet for this product. Be the first to leave one!</p>
            ) : (
              <div className="divide-y divide-slate-100 space-y-6">
                {product.reviews.map((rev) => (
                  <div key={rev._id} className="pt-6 first:pt-0 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800 text-sm">{rev.name}</span>
                      <span className="text-xs text-slate-400">
                        {new Date(rev.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, idx) => (
                        <Star
                          key={idx}
                          className={idx < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}
                          size={14}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Leave a review form */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="text-lg font-extrabold text-slate-900">Write a Review</h3>

            {user ? (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                {reviewSuccess && (
                  <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl font-semibold">
                    <Check size={16} />
                    {reviewSuccess}
                  </div>
                )}
                {reviewError && (
                  <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 border border-rose-100 p-3.5 rounded-xl font-semibold">
                    <AlertCircle size={16} />
                    {reviewError}
                  </div>
                )}

                {/* Rating selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Rating Score</label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((starVal) => (
                      <button
                        key={starVal}
                        type="button"
                        onClick={() => setRating(starVal)}
                        className="p-1 focus:outline-none transition-transform active:scale-95"
                      >
                        <Star
                          className={starVal <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}
                          size={24}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment area */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Your Comment</label>
                  <textarea
                    rows="4"
                    placeholder="Tell us what you liked or disliked about this product..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow-sm hover:shadow"
                >
                  Submit Review
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-100/60 p-4 rounded-xl">
                <AlertCircle size={18} className="text-indigo-500 shrink-0" />
                <p className="text-xs text-slate-600">
                  Please{' '}
                  <Link to="/login" className="font-bold text-primary-600 hover:underline">
                    Sign In
                  </Link>{' '}
                  to leave a product rating and review.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
