import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { AlertCircle, CheckCircle, Package, Truck, ClipboardList, RefreshCw, Calendar, MapPin, User as UserIcon } from 'lucide-react';
import { formatCurrency } from '../utils/format';

const Orders = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const endpoint = user.role === 'seller' ? '/orders/seller' : '/orders/myorders';
      const { data } = await axios.get(endpoint);
      setOrders(data);
    } catch (err) {
      setError('Failed to fetch orders history.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdateLoading(true);
      await axios.put(`/orders/${orderId}/status`, { status: newStatus });
      fetchOrders(); // reload
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdateLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Processing':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Shipped':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-600 border-rose-100';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-slate-500 font-medium animate-pulse">Loading orders history...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {user.role === 'seller' ? 'Seller Orders Manager' : 'My Orders History'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {user.role === 'seller'
              ? 'View orders containing your products and update delivery status'
              : 'Track shipping status and history of your recent purchases'}
          </p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={updateLoading}
          className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl transition-all"
          title="Refresh List"
        >
          <RefreshCw size={18} className={updateLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 border border-rose-100 p-4 rounded-xl font-semibold">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl shadow-sm">
          <div className="p-4 bg-slate-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto text-slate-400 mb-4">
            <ClipboardList size={28} />
          </div>
          <p className="text-slate-500 font-medium">No orders found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
              {/* Order Meta Header */}
              <div className="bg-slate-50 px-6 py-5 border-b border-slate-150 flex flex-wrap gap-y-4 gap-x-8 justify-between items-center text-xs text-slate-500">
                <div className="space-y-1">
                  <span className="font-bold text-slate-400 uppercase tracking-wider block">Order ID</span>
                  <span className="font-mono text-slate-800 font-semibold">{order._id}</span>
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-slate-400 uppercase tracking-wider block">Date Placed</span>
                  <span className="text-slate-800 font-semibold flex items-center gap-1.5">
                    <Calendar size={14} className="text-slate-400" />
                    {new Date(order.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-slate-400 uppercase tracking-wider block">Total Amount</span>
                  <span className="text-slate-900 font-black text-sm">{formatCurrency(order.totalPrice)}</span>
                </div>
                <div>
                  <span className={`font-bold px-3 py-1.5 rounded-full border text-xs ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Order Body Details */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                {/* Items list */}
                <div className="md:col-span-2 space-y-4">
                  <h4 className="font-bold text-slate-800 text-sm mb-2 uppercase tracking-wider">Ordered Items</h4>
                  <div className="divide-y divide-slate-100">
                    {order.orderItems.map((item, idx) => (
                      <div key={idx} className="py-3.5 first:pt-0 last:pb-0 flex gap-4 items-center">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-250">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-grow">
                          <span className="font-bold text-slate-800 text-sm block line-clamp-1">{item.name}</span>
                          <span className="text-xs text-slate-400">
                            {formatCurrency(item.price)} x {item.quantity}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold text-slate-900 text-sm">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery details & Seller action */}
                <div className="space-y-6 bg-slate-50/50 border border-slate-150 p-5 rounded-2xl">
                  {/* Customer Information (For Seller) */}
                  {user.role === 'seller' && order.customer && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-700 text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                        <UserIcon size={14} className="text-slate-400" />
                        Customer Information
                      </h4>
                      <div className="text-xs text-slate-600">
                        <p className="font-bold text-slate-800">{order.customer.name}</p>
                        <p className="mt-0.5">{order.customer.email}</p>
                      </div>
                    </div>
                  )}

                  {/* Shipping Address */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-700 text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin size={14} className="text-slate-400" />
                      Shipping Address
                    </h4>
                    <p className="text-xs text-slate-650 leading-relaxed font-semibold">{order.shippingAddress}</p>
                  </div>

                  {/* Seller Status Controls */}
                  {user.role === 'seller' && (
                    <div className="space-y-2.5 pt-3 border-t border-slate-200">
                      <h4 className="font-bold text-slate-700 text-[10px] uppercase tracking-wider">Update Order Status</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleUpdateStatus(order._id, 'Shipped')}
                          disabled={order.status === 'Shipped' || order.status === 'Delivered' || order.status === 'Cancelled'}
                          className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 rounded-lg text-[10px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Mark Shipped
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(order._id, 'Delivered')}
                          disabled={order.status === 'Delivered' || order.status === 'Cancelled'}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg text-[10px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Mark Delivered
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Customer Status Tracker Timeline */}
                  {user.role === 'customer' && (
                    <div className="space-y-4 pt-3 border-t border-slate-200">
                      <h4 className="font-bold text-slate-700 text-[10px] uppercase tracking-wider">Delivery Steps</h4>
                      <div className="relative pl-6 space-y-4 text-xs font-semibold text-slate-500">
                        {/* vertical track line */}
                        <div className="absolute left-2.5 top-1.5 bottom-1.5 w-0.5 bg-slate-200"></div>

                        {/* Step 1: Processing */}
                        <div className="relative">
                          <div className={`absolute -left-5.5 rounded-full w-3.5 h-3.5 border-2 ${
                            order.status === 'Processing' || order.status === 'Shipped' || order.status === 'Delivered'
                              ? 'bg-primary-600 border-primary-600'
                              : 'bg-white border-slate-300'
                          }`}></div>
                          <span className={`${
                            order.status === 'Processing' ? 'text-primary-600 font-bold' : ''
                          }`}>Processing order</span>
                        </div>

                        {/* Step 2: Shipped */}
                        <div className="relative">
                          <div className={`absolute -left-5.5 rounded-full w-3.5 h-3.5 border-2 ${
                            order.status === 'Shipped' || order.status === 'Delivered'
                              ? 'bg-amber-500 border-amber-500'
                              : 'bg-white border-slate-300'
                          }`}></div>
                          <span className={`${
                            order.status === 'Shipped' ? 'text-amber-600 font-bold' : ''
                          }`}>Shipped in transit</span>
                        </div>

                        {/* Step 3: Delivered */}
                        <div className="relative">
                          <div className={`absolute -left-5.5 rounded-full w-3.5 h-3.5 border-2 ${
                            order.status === 'Delivered'
                              ? 'bg-emerald-600 border-emerald-600'
                              : 'bg-white border-slate-300'
                          }`}></div>
                          <span className={`${
                            order.status === 'Delivered' ? 'text-emerald-600 font-bold' : ''
                          }`}>Delivered successfully</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
