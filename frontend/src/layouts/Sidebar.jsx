import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ isOpen, collapsed, onClose }) => {
  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/search', label: 'AI Search', icon: '🔍' },
    { path: '/photos', label: 'Site Photos', icon: '📷' },
    { path: '/analytics', label: 'Analytics', icon: '📈' },
  ];

  const recentQueries = [
    'Last 7 days concrete work',
    'Excavation progress',
    'Safety equipment violations',
    'Electrical installations',
    'Foundation photos',
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''} ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && <h2 className="sidebar-title">AI Site Monitor</h2>}
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            end={item.path === '/'}
            onClick={onClose}
            title={collapsed ? item.label : undefined}
          >
            <span className="sidebar-nav-icon">{item.icon}</span>
            {!collapsed && <span className="sidebar-nav-label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {!collapsed && (
        <div className="sidebar-recent">
          <h3 className="sidebar-recent-title">Recent Queries</h3>
          <div className="sidebar-recent-list">
            {recentQueries.map((query) => (
              <button
                key={query}
                className="sidebar-recent-item"
                onClick={() => console.log('Query:', query)}
                title={query}
              >
                {query}
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
