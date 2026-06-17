import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Users, Package, ShoppingCart, ShieldCheck, UserCheck, Trash2, Edit2, Plus, AlertCircle, CheckCircle2, RefreshCw, Calendar, MapPin, X } from 'lucide-react';
import { formatCurrency } from '../utils/format';

const AdminDashboard = ({ view }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [stats, setStats] = useState({ userCount: 0, productCount: 0, orderCount: 0 });
  const [usersList, setUsersList] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertMsg, setAlertMsg] = useState({ type: '', text: '' });

  // Add Product Form state
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState('');

  // Edit Stock state
  const [editingStockId, setEditingStockId] = useState(null);
  const [editingStockVal, setEditingStockVal] = useState('');

  const categories = ['Electronics', 'Fashion', 'Home & Living', 'Sports & Outdoors', 'Books'];

  useEffect(() => {
    fetchData();
  }, [view]);

  const fetchData = async () => {
    setLoading(true);
    setAlertMsg({ type: '', text: '' });
    try {
      if (view === 'overview') {
        const res = await axios.get('/admin/stats');
        setStats(res.data);
      } else if (view === 'users') {
        const res = await axios.get('/admin/users');
        setUsersList(res.data);
      } else if (view === 'products') {
        const res = await axios.get('/products');
        setProductsList(res.data);
      } else if (view === 'orders') {
        const res = await axios.get('/admin/orders');
        setOrdersList(res.data);
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.response?.data?.message || 'Failed to fetch admin data' });
    } finally {
      setLoading(false);
    }
  };

  // User Actions
  const handlePromoteToSeller = async (userId) => {
    try {
      await axios.put(`/admin/users/${userId}/role`, { role: 'seller' });
      setAlertMsg({ type: 'success', text: 'User successfully promoted to seller.' });
      fetchData();
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update role' });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? All their details will be permanently removed.')) {
      try {
        await axios.delete(`/admin/users/${userId}`);
        setAlertMsg({ type: 'success', text: 'User successfully deleted.' });
        fetchData();
      } catch (err) {
        setAlertMsg({ type: 'error', text: err.response?.data?.message || 'Failed to delete user' });
      }
    }
  };

  // Product Actions
  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/products', {
        name,
        price: Number(price),
        description,
        category,
        stock: Number(stock),
        image,
      });
      setAlertMsg({ type: 'success', text: 'Product added successfully!' });
      setName('');
      setPrice('');
      setDescription('');
      setStock('');
      setImage('');
      setModalOpen(false);
      fetchData();
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.response?.data?.message || 'Failed to add product' });
    }
  };

  const handleSaveStockUpdate = async (productId) => {
    try {
      await axios.put(`/products/${productId}`, {
        stock: Number(editingStockVal),
      });
      setAlertMsg({ type: 'success', text: 'Product stock updated.' });
      setEditingStockId(null);
      fetchData();
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update stock' });
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`/products/${productId}`);
        setAlertMsg({ type: 'success', text: 'Product deleted.' });
        fetchData();
      } catch (err) {
        setAlertMsg({ type: 'error', text: err.response?.data?.message || 'Failed to delete product' });
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Processing': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Shipped': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-650';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Overview/Panel Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Global operations controller, user management and system audits</p>
        </div>
        <button
          onClick={fetchData}
          className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl transition-all"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {alertMsg.text && (
        <div
          className={`flex items-center gap-2 text-xs font-semibold p-4 rounded-xl border ${
            alertMsg.type === 'success'
              ? 'text-emerald-600 bg-emerald-50 border-emerald-100'
              : 'text-rose-600 bg-rose-50 border-rose-100'
          }`}
        >
          {alertMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {alertMsg.text}
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
        <Link
          to="/admin"
          className={`px-5 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
            view === 'overview' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Overview
        </Link>
        <Link
          to="/admin/users"
          className={`px-5 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
            view === 'users' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Manage Users
        </Link>
        <Link
          to="/admin/products"
          className={`px-5 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
            view === 'products' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Manage Products
        </Link>
        <Link
          to="/admin/orders"
          className={`px-5 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
            view === 'orders' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          All Orders
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 animate-pulse font-medium">Loading panel data...</div>
      ) : (
        <div className="space-y-6">
          {/* VIEW: OVERVIEW */}
          {view === 'overview' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Users size={28} />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Total Registered Users</span>
                  <span className="text-2xl font-black text-slate-900">{stats.userCount}</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
                <div className="p-4 bg-primary-50 text-primary-600 rounded-xl">
                  <Package size={28} />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Total listed Products</span>
                  <span className="text-2xl font-black text-slate-900">{stats.productCount}</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
                <div className="p-4 bg-indigo-50 text-indigo-600 rounded-xl">
                  <ShoppingCart size={28} />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Total Orders Placed</span>
                  <span className="text-2xl font-black text-slate-900">{stats.orderCount}</span>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: USERS */}
          {view === 'users' && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-150">
                      <th className="py-4 px-6">Name</th>
                      <th className="py-4 px-6">Email</th>
                      <th className="py-4 px-6">Role</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                    {usersList.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50/50">
                        <td className="py-4 px-6 font-bold text-slate-800">{u.name}</td>
                        <td className="py-4 px-6 font-mono text-xs">{u.email}</td>
                        <td className="py-4 px-6">
                          <span
                            className={`font-semibold px-2.5 py-0.5 rounded-full text-xs uppercase ${
                              u.role === 'admin'
                                ? 'bg-purple-100 text-purple-700'
                                : u.role === 'seller'
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-slate-150 text-slate-700'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-2">
                            {u.role === 'customer' && (
                              <button
                                onClick={() => handlePromoteToSeller(u._id)}
                                className="flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                                title="Promote User"
                              >
                                <UserCheck size={14} />
                                Make Seller
                              </button>
                            )}
                            {u._id !== user._id && (
                              <button
                                onClick={() => handleDeleteUser(u._id)}
                                className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                                title="Delete User"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW: PRODUCTS */}
          {view === 'products' && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button
                  onClick={() => setModalOpen(true)}
                  className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm"
                >
                  <Plus size={16} />
                  Add Product
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-150">
                        <th className="py-4 px-6">Product details</th>
                        <th className="py-4 px-6">Category</th>
                        <th className="py-4 px-6">Price</th>
                        <th className="py-4 px-6">Stock</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                      {productsList.map((prod) => (
                        <tr key={prod._id} className="hover:bg-slate-50/50">
                          <td className="py-4 px-6 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden border border-slate-200">
                              <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <span className="font-bold text-slate-800 block line-clamp-1">{prod.name}</span>
                              <span className="text-[10px] text-slate-400">Seller: {prod.seller?.name || 'Unknown'}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-xs font-semibold text-slate-650">{prod.category}</td>
                          <td className="py-4 px-6 font-extrabold">{formatCurrency(prod.price)}</td>
                          <td className="py-4 px-6">
                            {editingStockId === prod._id ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  value={editingStockVal}
                                  onChange={(e) => setEditingStockVal(e.target.value)}
                                  className="border border-slate-200 px-2 py-1 rounded w-16 text-center text-xs"
                                />
                                <button
                                  onClick={() => handleSaveStockUpdate(prod._id)}
                                  className="bg-emerald-600 text-white px-2 py-1 rounded text-xs font-bold hover:bg-emerald-700"
                                >
                                  Save
                                </button>
                                <button onClick={() => setEditingStockId(null)} className="text-slate-400 text-xs">
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2 py-0.5 rounded text-xs font-bold ${
                                    prod.stock === 0
                                      ? 'bg-rose-50 text-rose-600'
                                      : prod.stock <= 5
                                      ? 'bg-amber-50 text-amber-600'
                                      : 'bg-emerald-50 text-emerald-600'
                                  }`}
                                >
                                  {prod.stock === 0 ? 'Out of Stock' : `${prod.stock} Units`}
                                </span>
                                <button
                                  onClick={() => {
                                    setEditingStockId(prod._id);
                                    setEditingStockVal(prod.stock);
                                  }}
                                  className="text-slate-400 hover:text-slate-600"
                                >
                                  <Edit2 size={12} />
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => handleDeleteProduct(prod._id)}
                              className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: ORDERS */}
          {view === 'orders' && (
            <div className="space-y-6">
              {ordersList.map((order) => (
                <div key={order._id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                  {/* Order meta */}
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-150 flex flex-wrap gap-4 justify-between items-center text-xs text-slate-500">
                    <div>
                      <span className="font-bold text-slate-400 uppercase tracking-wider block">Order ID</span>
                      <span className="font-mono text-slate-800 font-semibold">{order._id}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-400 uppercase tracking-wider block">Customer</span>
                      <span className="text-slate-850 font-bold block">{order.customer?.name || 'Deleted Account'}</span>
                      <span className="text-[10px] text-slate-400 font-mono block">{order.customer?.email}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-400 uppercase tracking-wider block">Date</span>
                      <span className="text-slate-800 font-semibold flex items-center gap-1.5">
                        <Calendar size={14} className="text-slate-400" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-400 uppercase tracking-wider block">Total Amount</span>
                      <span className="text-slate-905 font-black">{formatCurrency(order.totalPrice)}</span>
                    </div>
                    <div>
                      <span className={`font-bold px-3 py-1 rounded-full border text-[10px] ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Order body details */}
                  <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    <div className="md:col-span-2 divide-y divide-slate-100">
                      {order.orderItems.map((item, idx) => (
                        <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex gap-4 items-center">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-50 shrink-0 border border-slate-200">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-grow">
                            <span className="font-bold text-slate-800 text-sm block line-clamp-1">{item.name}</span>
                            <span className="text-[10px] text-slate-400">{formatCurrency(item.price)} x {item.quantity}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="bg-slate-50/50 border border-slate-150 p-4 rounded-xl space-y-2">
                      <h4 className="font-bold text-slate-700 text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin size={14} className="text-slate-400" />
                        Shipping Address
                      </h4>
                      <p className="text-xs text-slate-650 leading-relaxed font-semibold">{order.shippingAddress}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Product Modal Overlay */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full"
            >
              <X size={20} />
            </button>

            <div>
              <h3 className="text-xl font-black text-slate-900">List New Product (Admin Bypass)</h3>
              <p className="text-xs text-slate-500 mt-1">Add items directly to inventory catalogs</p>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Product Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ergonomic Office Chair"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none transition-all text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Price (₹)</label>
                  <input
                    type="number"
                    step="1"
                    placeholder="e.g. 999"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none transition-all text-xs"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Initial Stock</label>
                  <input
                    type="number"
                    placeholder="e.g. 20"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none transition-all text-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none transition-all text-xs cursor-pointer font-semibold"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Image URL</label>
                <input
                  type="url"
                  placeholder="https://unsplash.com/... (Image URL)"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none transition-all text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Description</label>
                <textarea
                  rows="3"
                  placeholder="Specs description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none transition-all text-xs"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-sm"
              >
                List Product
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
