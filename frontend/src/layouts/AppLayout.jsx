import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './AppLayout.css';

const AppLayout = () => {
  const isMobile = () => window.innerWidth < 768;
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile());
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (isMobile()) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    if (isMobile()) {
      setSidebarOpen(prev => !prev);
    } else {
      setCollapsed(prev => !prev);
    }
  };

  const desktopMargin = collapsed ? 64 : 260;
  const mainMargin = isMobile() ? 0 : desktopMargin;

  return (
    <div className="app-layout">
      <Sidebar
        isOpen={sidebarOpen}
        collapsed={collapsed}
        onClose={() => setSidebarOpen(false)}
      />
      {/* Mobile overlay backdrop */}
      {sidebarOpen && isMobile() && (
        <button
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => e.key === 'Escape' && setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}
      <div className="app-main" style={{ marginLeft: mainMargin }}>
        <Topbar onMenuToggle={toggleSidebar} />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
