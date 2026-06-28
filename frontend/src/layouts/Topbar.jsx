import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProfileModal from '../components/modals/ProfileModal';
import SettingsModal from '../components/modals/SettingsModal';
import { authService } from '../services/authService';
import './Topbar.css';

const Topbar = ({ title = 'AI-Powered Reporting' }) => {
  const navigate = useNavigate();
  const { user, signOut, updateUser } = useAuth();
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const handleExport = (format) => {
    alert(`Export as ${format} - Feature coming soon!`);
    setShowExportMenu(false);
  };

  const handleScheduleReport = () => {
    alert('Schedule Report - Feature coming soon!');
  };

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  const handleOpenProfile = () => {
    setShowUserMenu(false);
    setShowProfileModal(true);
  };

  const handleOpenSettings = () => {
    setShowUserMenu(false);
    setShowSettingsModal(true);
  };

  const handleSaveSettings = async (formData) => {
    const updatedUser = await authService.updateProfile(formData);
    updateUser(updatedUser);
    return updatedUser;
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return 'U';
    if (user.given_name && user.family_name) {
      return `${user.given_name[0]}${user.family_name[0]}`.toUpperCase();
    }
    if (user.name) {
      const parts = user.name.split(' ');
      return parts.length > 1 
        ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
        : user.name[0].toUpperCase();
    }
    return user.email ? user.email[0].toUpperCase() : 'U';
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">{title}</h1>
      </div>

      <div className="topbar-right">
        {/* Export Dropdown */}
        <div className="topbar-dropdown">
          <button
            className="topbar-btn"
            onClick={() => setShowExportMenu(!showExportMenu)}
          >
            <span className="topbar-btn-icon">📥</span>
            Export
          </button>
          {showExportMenu && (
            <div className="topbar-dropdown-menu">
              <button onClick={() => handleExport('ZIP')}>
                Export as ZIP
              </button>
              <button onClick={() => handleExport('CSV')}>
                Export as CSV
              </button>
              <button onClick={() => handleExport('JSON')}>
                Export as JSON
              </button>
              <button onClick={() => handleExport('PDF')}>
                Export as PDF
              </button>
            </div>
          )}
        </div>

        {/* Schedule Report Button */}
        <button className="topbar-btn primary" onClick={handleScheduleReport}>
          <span className="topbar-btn-icon">📅</span>
          Schedule Report
        </button>

        {/* User Menu */}
        <div className="topbar-dropdown">
          <button
            className="topbar-user-btn"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            {user?.picture ? (
              <img 
                src={user.picture} 
                alt={user.name || 'User'} 
                className="topbar-avatar-img"
              />
            ) : (
              <div className="topbar-avatar">
                <span>{getUserInitials()}</span>
              </div>
            )}
            <div className="topbar-user-info">
              <span className="topbar-user-name">{user?.name || 'User'}</span>
              <span className="topbar-user-role">{user?.email || ''}</span>
            </div>
          </button>
          {showUserMenu && (
            <div className="topbar-dropdown-menu right">
              <button onClick={handleOpenProfile}>Profile</button>
              <button onClick={handleOpenSettings}>Settings</button>
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showExportMenu || showUserMenu) && (
        <div
          className="topbar-overlay"
          onClick={() => {
            setShowExportMenu(false);
            setShowUserMenu(false);
          }}
        />
      )}

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        user={user}
        onSave={handleSaveSettings}
      />
    </header>
  );
};

export default Topbar;
