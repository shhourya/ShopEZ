import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Trash2, ShoppingBag, ArrowRight, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../utils/format';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, cartTotal } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [error, setError] = useState('');

  const shippingCost = cartTotal > 10000 || cartTotal === 0 ? 0.0 : 150.0;
  const taxCost = cartTotal * 0.18; // 18% GST rate
  const grandTotal = cartTotal + shippingCost + taxCost;

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!shippingAddress) {
      setError('Please provide a shipping address');
      return;
    }

    try {
      setCheckoutLoading(true);
      setError('');

      // Build items array matching Order schema
      const orderItems = cartItems.map((item) => ({
        product: item.product,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
      }));

      await axios.post('/orders', {
        orderItems,
        shippingAddress,
        totalPrice: grandTotal,
      });

      setCheckoutSuccess(true);
      clearCart();
      setTimeout(() => {
        navigate('/orders');
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (checkoutSuccess) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <CheckCircle2 size={64} className="text-emerald-500 mx-auto animate-bounce" />
        <h1 className="text-2xl font-black text-slate-800">Order Placed Successfully!</h1>
        <p className="text-sm text-slate-500">
          Thank you for shopping with ShopEZ. Redirection to your order tracking history...
        </p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="p-5 bg-slate-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto text-slate-400">
          <ShoppingBag size={36} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Your Cart is Empty</h1>
          <p className="text-sm text-slate-500 mt-2">
            Looks like you haven't added any products to your cart yet.
          </p>
        </div>
        <Link
          to="/catalog"
          className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg transition-all"
        >
          Start Shopping
          <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Shopping Cart</h1>
        <p className="text-sm text-slate-500 mt-1">Review items and fill in shipping details</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {cartItems.map((item) => (
                <div key={item.product} className="p-5 flex gap-4 sm:gap-6 items-center">
                  {/* Thumbnail */}
                  <div className="w-16 sm:w-20 aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-150 shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>

                  {/* Title & Controls */}
                  <div className="flex-grow grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                    <div className="sm:col-span-2">
                      <Link to={`/products/${item.product}`} className="font-bold text-slate-850 hover:text-primary-600 text-sm sm:text-base transition-colors line-clamp-1">
                        {item.name}
                      </Link>
                      <span className="text-xs text-slate-400 block mt-0.5">Price: {formatCurrency(item.price)}</span>
                    </div>

                    <div className="flex items-center gap-3 justify-start sm:justify-end">
                      {/* Quantity */}
                      <select
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.product, Number(e.target.value))}
                        className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold py-1.5 px-2 rounded-lg focus:outline-none"
                      >
                        {[...Array(item.stock)].map((_, idx) => (
                          <option key={idx + 1} value={idx + 1}>
                            Qty: {idx + 1}
                          </option>
                        ))}
                      </select>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.product)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50 transition-colors"
                        title="Remove Item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-slate-50 px-5 py-4 flex justify-between items-center border-t border-slate-100">
              <span className="text-xs text-slate-500 font-medium">Subtotal for {cartItems.length} items</span>
              <span className="text-base font-extrabold text-slate-900">{formatCurrency(cartTotal)}</span>
            </div>
          </div>
        </div>

        {/* Order Summary & Checkout Panel */}
        <div className="space-y-6">
          {/* Prices Summary Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3">Order Summary</h3>
            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">{formatCurrency(cartTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-semibold text-slate-800">
                  {shippingCost === 0 ? 'Free' : formatCurrency(shippingCost)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax (18% GST)</span>
                <span className="font-semibold text-slate-800">{formatCurrency(taxCost)}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-3 border-t border-slate-100">
                <span>Total</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Checkout Info */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            {user ? (
              <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center gap-1.5">
                  <MapPin size={18} className="text-slate-500" />
                  Shipping Information
                </h3>

                {error && (
                  <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 border border-rose-100 p-3.5 rounded-xl font-semibold">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Full Address</label>
                  <textarea
                    rows="3"
                    placeholder="Enter street, city, state, zip code..."
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-xs"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={checkoutLoading}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all text-sm flex items-center justify-center gap-2"
                >
                  {checkoutLoading ? 'Processing...' : 'Place Order'}
                </button>
              </form>
            ) : (
              <div className="text-center py-4 space-y-4">
                <p className="text-xs text-slate-500">You must be logged in to place an order.</p>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login?redirect=cart"
                    className="py-2.5 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 font-bold text-xs"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register?redirect=cart"
                    className="py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-bold text-xs"
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
