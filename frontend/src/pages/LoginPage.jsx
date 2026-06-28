import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';

// App Logo Icon
const AppLogoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="11" cy="11" r="3" stroke="currentColor" strokeWidth="2" />
  </svg>
);

// Lock Icon for Security Badge
const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
    <path
      d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get the page user was trying to access before being redirected to login
  const from = location.state?.from?.pathname || '/';

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await signInWithGoogle(credentialResponse.credential);
      
      if (result.success) {
        // Redirect to the page they were trying to access, or dashboard
        navigate(from, { replace: true });
      } else {
        setError(result.error || 'Authentication failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google Sign-In was cancelled or failed. Please try again.');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">
            <AppLogoIcon />
          </div>
          <h1 className="login-title">AI Object Detection</h1>
          <p className="login-subtitle">
            Detect and analyze objects in your images with the power of artificial intelligence
          </p>
        </div>

        {/* Welcome Text */}
        <div className="login-welcome">
          <h2>Welcome back</h2>
          <p>Sign in to continue to your dashboard</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="login-error">
            <span>{error}</span>
          </div>
        )}

        {/* Google Sign-In Button */}
        <div className="google-signin-wrapper">
          {isLoading ? (
            <div className="google-signin-loading">
              <div className="loading-spinner-small"></div>
              <span>Signing in...</span>
            </div>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              size="large"
              width="100%"
              text="signin_with"
              shape="rectangular"
              theme="outline"
              logo_alignment="left"
            />
          )}
        </div>

        {/* Security Badge */}
        <div className="security-badge">
          <LockIcon />
          <span>Secured with Google OAuth 2.0</span>
        </div>

        {/* Footer */}
        <div className="login-footer">
          <p>
            By signing in, you agree to our{' '}
            <a href="/terms" target="_blank" rel="noopener noreferrer">
              Terms of Service
            </a>
            {' '}and{' '}
            <a href="/privacy" target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
