import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import AdminRoute from './components/AdminRoute';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            {/* Header Navbar */}
            <Navbar />

            {/* Main Content Body */}
            <main className="flex-grow bg-slate-50">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/products/:id" element={<ProductDetails />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/orders" element={<Orders />} />
                
                {/* Admin Dashboard Protected Routes */}
                <Route path="/admin" element={<AdminRoute><AdminDashboard view="overview" /></AdminRoute>} />
                <Route path="/admin/users" element={<AdminRoute><AdminDashboard view="users" /></AdminRoute>} />
                <Route path="/admin/products" element={<AdminRoute><AdminDashboard view="products" /></AdminRoute>} />
                <Route path="/admin/orders" element={<AdminRoute><AdminDashboard view="orders" /></AdminRoute>} />
              </Routes>
            </main>

            {/* Footer */}
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
