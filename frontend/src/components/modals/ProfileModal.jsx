import React from 'react';
import PropTypes from 'prop-types';
import Modal from '../common/Modal';
import './ProfileModal.css';

// Icons
const EmailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const ProfileModal = ({ isOpen, onClose, user }) => {
  if (!user) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Profile" size="md">
      <div className="profile-modal">
        {/* Profile Header */}
        <div className="profile-header">
          {user.picture ? (
            <img src={user.picture} alt={user.name} className="profile-avatar-lg" />
          ) : (
            <div className="profile-avatar-lg profile-avatar-placeholder">
              {user.name ? user.name[0].toUpperCase() : 'U'}
            </div>
          )}
          <div className="profile-header-info">
            <h3 className="profile-name">{user.name || 'User'}</h3>
            <span className="profile-email">{user.email}</span>
            <div className="profile-badges">
              {user.is_verified && (
                <span className="profile-badge verified">
                  <ShieldIcon /> Verified
                </span>
              )}
              {user.is_active && (
                <span className="profile-badge active">Active</span>
              )}
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="profile-section">
          <h4 className="profile-section-title">Account Information</h4>
          <div className="profile-details">
            <div className="profile-detail-item">
              <div className="profile-detail-icon">
                <UserIcon />
              </div>
              <div className="profile-detail-content">
                <span className="profile-detail-label">Full Name</span>
                <span className="profile-detail-value">{user.name || 'Not set'}</span>
              </div>
            </div>

            <div className="profile-detail-item">
              <div className="profile-detail-icon">
                <EmailIcon />
              </div>
              <div className="profile-detail-content">
                <span className="profile-detail-label">Email Address</span>
                <span className="profile-detail-value">{user.email}</span>
              </div>
            </div>

            {user.given_name && (
              <div className="profile-detail-item">
                <div className="profile-detail-icon">
                  <UserIcon />
                </div>
                <div className="profile-detail-content">
                  <span className="profile-detail-label">First Name</span>
                  <span className="profile-detail-value">{user.given_name}</span>
                </div>
              </div>
            )}

            {user.family_name && (
              <div className="profile-detail-item">
                <div className="profile-detail-icon">
                  <UserIcon />
                </div>
                <div className="profile-detail-content">
                  <span className="profile-detail-label">Last Name</span>
                  <span className="profile-detail-value">{user.family_name}</span>
                </div>
              </div>
            )}

            <div className="profile-detail-item">
              <div className="profile-detail-icon">
                <CalendarIcon />
              </div>
              <div className="profile-detail-content">
                <span className="profile-detail-label">Member Since</span>
                <span className="profile-detail-value">{formatDate(user.created_at)}</span>
              </div>
            </div>

            <div className="profile-detail-item">
              <div className="profile-detail-icon">
                <ClockIcon />
              </div>
              <div className="profile-detail-content">
                <span className="profile-detail-label">Last Login</span>
                <span className="profile-detail-value">{formatDateTime(user.last_login)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Google Account Info */}
        <div className="profile-section">
          <h4 className="profile-section-title">Connected Account</h4>
          <div className="profile-connected-account">
            <div className="profile-google-icon">
              <svg viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/>
                <path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24z"/>
                <path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 000 10.76l3.98-3.09z"/>
                <path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.69 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/>
              </svg>
            </div>
            <div className="profile-google-info">
              <span className="profile-google-label">Google Account</span>
              <span className="profile-google-email">{user.email}</span>
            </div>
            <span className="profile-connected-badge">Connected</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

ProfileModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    picture: PropTypes.string,
    given_name: PropTypes.string,
    family_name: PropTypes.string,
    is_active: PropTypes.bool,
    is_verified: PropTypes.bool,
    created_at: PropTypes.string,
    last_login: PropTypes.string,
  }),
};

export default ProfileModal;
