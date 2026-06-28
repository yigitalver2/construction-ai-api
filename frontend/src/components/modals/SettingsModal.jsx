import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Modal from '../common/Modal';
import './SettingsModal.css';

const SettingsModal = ({ isOpen, onClose, user, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    given_name: '',
    family_name: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        name: user.name || '',
        given_name: user.given_name || '',
        family_name: user.family_name || '',
      });
      setIsSaved(false);
      setError(null);
    }
  }, [isOpen, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setIsSaved(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await onSave(formData);
      setIsSaved(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to update settings');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings" size="md">
      <form className="settings-modal" onSubmit={handleSubmit}>
        {/* Profile Section */}
        <div className="settings-section">
          <h4 className="settings-section-title">
            <span className="settings-section-icon">👤</span>
            Profile Information
          </h4>
          <p className="settings-section-desc">
            Update your personal information. Your email address is managed by Google and cannot be changed here.
          </p>

          <div className="settings-form-group">
            <label className="settings-label" htmlFor="name">Display Name</label>
            <input
              type="text"
              id="name"
              name="name"
              className="settings-input"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your display name"
            />
            <span className="settings-hint">This is how your name will appear across the application</span>
          </div>

          <div className="settings-row">
            <div className="settings-form-group">
              <label className="settings-label" htmlFor="given_name">First Name</label>
              <input
                type="text"
                id="given_name"
                name="given_name"
                className="settings-input"
                value={formData.given_name}
                onChange={handleChange}
                placeholder="First name"
              />
            </div>

            <div className="settings-form-group">
              <label className="settings-label" htmlFor="family_name">Last Name</label>
              <input
                type="text"
                id="family_name"
                name="family_name"
                className="settings-input"
                value={formData.family_name}
                onChange={handleChange}
                placeholder="Last name"
              />
            </div>
          </div>
        </div>

        {/* Account Section */}
        <div className="settings-section">
          <h4 className="settings-section-title">
            <span className="settings-section-icon">🔒</span>
            Account Details
          </h4>

          <div className="settings-form-group">
            <label className="settings-label">Email Address</label>
            <div className="settings-input-readonly">
              <span>{user.email}</span>
              <span className="settings-badge google">Google Account</span>
            </div>
            <span className="settings-hint">Email is linked to your Google account and cannot be modified</span>
          </div>

          <div className="settings-form-group">
            <label className="settings-label">Account Status</label>
            <div className="settings-status-row">
              <span className={`settings-status ${user.is_active ? 'active' : 'inactive'}`}>
                {user.is_active ? '✓ Active' : '✗ Inactive'}
              </span>
              {user.is_verified && (
                <span className="settings-status verified">✓ Verified</span>
              )}
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="settings-section">
          <h4 className="settings-section-title">
            <span className="settings-section-icon">⚙️</span>
            Preferences
          </h4>

          <div className="settings-preference-item">
            <div className="settings-preference-info">
              <span className="settings-preference-label">Email Notifications</span>
              <span className="settings-preference-desc">Receive email updates about your detection results</span>
            </div>
            <label className="settings-toggle">
              <input type="checkbox" defaultChecked />
              <span className="settings-toggle-slider"></span>
            </label>
          </div>

          <div className="settings-preference-item">
            <div className="settings-preference-info">
              <span className="settings-preference-label">Auto-save Results</span>
              <span className="settings-preference-desc">Automatically save detection results to your library</span>
            </div>
            <label className="settings-toggle">
              <input type="checkbox" defaultChecked />
              <span className="settings-toggle-slider"></span>
            </label>
          </div>

          <div className="settings-preference-item">
            <div className="settings-preference-info">
              <span className="settings-preference-label">Show Confidence Scores</span>
              <span className="settings-preference-desc">Display AI confidence scores on detected objects</span>
            </div>
            <label className="settings-toggle">
              <input type="checkbox" defaultChecked />
              <span className="settings-toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="settings-error">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Success Message */}
        {isSaved && (
          <div className="settings-success">
            <span>✓</span> Settings saved successfully!
          </div>
        )}

        {/* Actions */}
        <div className="settings-actions">
          <button
            type="button"
            className="settings-btn settings-btn-secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="settings-btn settings-btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="settings-spinner"></span>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

SettingsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    given_name: PropTypes.string,
    family_name: PropTypes.string,
    is_active: PropTypes.bool,
    is_verified: PropTypes.bool,
  }),
};

export default SettingsModal;
