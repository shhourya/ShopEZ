import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { DollarSign, Package, ShoppingCart, TrendingUp, Trash2, Plus, Edit2, AlertCircle, CheckCircle2, X } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect if not a seller
  useEffect(() => {
    if (!user || user.role !== 'seller') {
      navigate('/login');
    }
  }, [user, navigate]);

  const [stats, setStats] = useState({
    productCount: 0,
    orderCount: 0,
    totalRevenue: 0,
    totalUnitsSold: 0,
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ type: '', text: '' });

  // Add Product Form state
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState('');

  // Edit Product stock state
  const [editingStockId, setEditingStockId] = useState(null);
  const [editingStockVal, setEditingStockVal] = useState('');

  const categories = ['Electronics', 'Fashion', 'Home & Living', 'Sports & Outdoors', 'Books'];

  useEffect(() => {
    if (user && user.role === 'seller') {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const statsRes = await axios.get('/stats/seller');
      setStats(statsRes.data);

      const productsRes = await axios.get(`/products?seller=${user._id}`);
      setProducts(productsRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || !description || !stock || !image) {
      setAlertMsg({ type: 'error', text: 'All fields are required' });
      return;
    }

    try {
      setAlertMsg({ type: '', text: '' });
      await axios.post('/products', {
        name,
        price: Number(price),
        description,
        category,
        stock: Number(stock),
        image,
      });

      setAlertMsg({ type: 'success', text: 'Product added successfully!' });
      // Reset form
      setName('');
      setPrice('');
      setDescription('');
      setCategory('Electronics');
      setStock('');
      setImage('');
      setModalOpen(false);

      // Reload
      fetchDashboardData();
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.response?.data?.message || 'Failed to add product' });
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product? This action is irreversible.')) {
      try {
        await axios.delete(`/products/${id}`);
        setAlertMsg({ type: 'success', text: 'Product deleted successfully.' });
        fetchDashboardData();
      } catch (err) {
        setAlertMsg({ type: 'error', text: err.response?.data?.message || 'Failed to delete product' });
      }
    }
  };

  const handleSaveStockUpdate = async (id) => {
    try {
      await axios.put(`/products/${id}`, {
        stock: Number(editingStockVal),
      });
      setAlertMsg({ type: 'success', text: 'Stock updated successfully.' });
      setEditingStockId(null);
      fetchDashboardData();
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update stock' });
    }
  };

  const triggerEditStockMode = (prod) => {
    setEditingStockId(prod._id);
    setEditingStockVal(prod.stock);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-slate-500 font-medium animate-pulse">Loading dashboard reports...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Seller Panel</h1>
          <p className="text-sm text-slate-500 mt-1">Monitor revenue, products, and edit inventory stock levels</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-5 rounded-xl shadow-lg hover:shadow-xl transition-all text-sm shrink-0"
        >
          <Plus size={18} />
          Add Product
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

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
            <DollarSign size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Total Revenue</span>
            <span className="text-xl font-extrabold text-slate-950">${stats.totalRevenue.toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-primary-50 text-primary-600 rounded-xl shrink-0">
            <Package size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Active Listings</span>
            <span className="text-xl font-extrabold text-slate-950">{stats.productCount}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
            <ShoppingCart size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Total Orders</span>
            <span className="text-xl font-extrabold text-slate-950">{stats.orderCount}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl shrink-0">
            <TrendingUp size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Units Sold</span>
            <span className="text-xl font-extrabold text-slate-950">{stats.totalUnitsSold}</span>
          </div>
        </div>
      </div>

      {/* Inventory Listings Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="font-extrabold text-slate-900 text-lg">My Product Inventory</h2>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-400 font-medium">You haven't listed any products yet.</p>
            <button onClick={() => setModalOpen(true)} className="text-primary-600 hover:underline text-sm font-bold mt-1">
              Create your first listing
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
                  <th className="py-4 px-6">Product Details</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6">Stock Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {products.map((prod) => (
                  <tr key={prod._id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Details Column */}
                    <td className="py-4 px-6 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                        <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 block line-clamp-1">{prod.name}</span>
                        <span className="text-xs text-slate-400">ID: {prod._id}</span>
                      </div>
                    </td>

                    {/* Category Column */}
                    <td className="py-4 px-6 font-semibold text-xs text-slate-600">{prod.category}</td>

                    {/* Price Column */}
                    <td className="py-4 px-6 font-extrabold text-slate-850">${prod.price.toFixed(2)}</td>

                    {/* Stock Column with Quick Editing inline */}
                    <td className="py-4 px-6">
                      {editingStockId === prod._id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={editingStockVal}
                            onChange={(e) => setEditingStockVal(e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-slate-800 px-2 py-1 rounded-lg w-20 text-center text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
                          />
                          <button
                            onClick={() => handleSaveStockUpdate(prod._id)}
                            className="bg-emerald-600 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-emerald-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingStockId(null)}
                            className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold px-2 py-1 rounded text-xs ${
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
                            onClick={() => triggerEditStockMode(prod)}
                            className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded transition-colors"
                            title="Update Stock"
                          >
                            <Edit2 size={12} />
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Actions Column */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleDeleteProduct(prod._id)}
                          className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Product Modal Overlay */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div>
              <h3 className="text-xl font-black text-slate-900">List New Product</h3>
              <p className="text-xs text-slate-500 mt-1">Provide pricing, specs, and default stock units</p>
            </div>

            {/* Form */}
            <form onSubmit={handleAddProductSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Product Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ergonomic Office Chair"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 199.99"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-xs"
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
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-xs cursor-pointer font-semibold"
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
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Description</label>
                <textarea
                  rows="4"
                  placeholder="Describe key specs, material properties, and warranty details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-xs"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all text-sm"
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

export default Dashboard;
