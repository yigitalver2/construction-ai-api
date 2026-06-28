import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import './ProtectedRoute.css';

/**
 * PublicRoute - Wrapper for routes that should only be accessible when NOT authenticated
 * 
 * - If user is NOT authenticated: renders the children (e.g., login page)
 * - If user IS authenticated: redirects to dashboard or previous page
 */
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="auth-loading">
        <LoadingSpinner size="large" />
        <p>Loading...</p>
      </div>
    );
  }

  // If authenticated, redirect to the page they came from or dashboard
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  // Not authenticated, render the public content (login page)
  return children;
};

export default PublicRoute;
