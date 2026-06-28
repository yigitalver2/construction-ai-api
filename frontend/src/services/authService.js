import apiClient from './apiClient';

const AUTH_TOKEN_KEY = 'auth_token';
const USER_KEY = 'user';

/**
 * Auth Service - Handles all authentication related operations
 */
const authService = {
  /**
   * Send Google credential to backend for verification
   * @param {string} credential - Google OAuth credential (ID token)
   * @returns {Promise} - User data and JWT token
   */
  async googleSignIn(credential) {
    try {
      const response = await apiClient.post('/auth/google', {
        token: credential
      });
      
      const { access_token, user } = response.data;
      
      // Store token and user info
      this.setToken(access_token);
      this.setUser(user);
      
      return { success: true, user, token: access_token };
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      const message = error.response?.data?.detail || 'Authentication failed. Please try again.';
      return { success: false, error: message };
    }
  },

  /**
   * Sign out the current user
   */
  signOut() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Get the stored JWT token
   * @returns {string|null}
   */
  getToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  /**
   * Set the JWT token
   * @param {string} token 
   */
  setToken(token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  },

  /**
   * Get the stored user info
   * @returns {Object|null}
   */
  getUser() {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  /**
   * Set the user info
   * @param {Object} user 
   */
  setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;
    
    // Check if token is expired (basic check)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      return Date.now() < expirationTime;
    } catch {
      return false;
    }
  },

  /**
   * Get current user from backend (verify token)
   * @returns {Promise}
   */
  async getCurrentUser() {
    try {
      const response = await apiClient.get('/auth/me');
      const user = response.data;
      this.setUser(user);
      return { success: true, user };
    } catch (error) {
      this.signOut();
      return { success: false, error: 'Session expired' };
    }
  },

  /**
   * Update user profile
   * @param {Object} profileData - { name, given_name, family_name }
   * @returns {Promise}
   */
  async updateProfile(profileData) {
    try {
      const response = await apiClient.put('/auth/me', profileData);
      const user = response.data;
      this.setUser(user);
      return user;
    } catch (error) {
      console.error('Update Profile Error:', error);
      const message = error.response?.data?.detail || 'Failed to update profile';
      throw new Error(message);
    }
  }
};

export { authService };
export default authService;
