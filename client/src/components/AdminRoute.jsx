import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <p className="text-slate-500 font-medium animate-pulse">Checking authorization...</p>
      </div>
    );
  }

  // Redirect to home if user is not logged in or is not an admin
  return user && user.role === 'admin' ? children : <Navigate to="/" replace />;
};

export default AdminRoute;
