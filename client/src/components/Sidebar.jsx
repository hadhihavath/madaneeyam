import React from 'react';
import { useApp } from '../context/AppContext';

const Sidebar = ({ activeTab, setActiveTab, isOpen, onClose }) => {
  const { user, logout } = useApp();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-solid fa-chart-line' },
    { id: 'explorer', label: 'File Explorer', icon: 'fa-solid fa-folder-open' },
    { id: 'search', label: 'Advanced Search', icon: 'fa-solid fa-magnifying-glass' },
    { id: 'info', label: 'Project Info', icon: 'fa-solid fa-circle-info' }
  ];

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Mobile Close Button inside Sidebar */}
      <button 
        className="mobile-sidebar-close" 
        onClick={onClose}
        aria-label="Close Sidebar Menu"
      >
        <i className="fa-solid fa-xmark"></i>
      </button>

      <div className="logo-section">
        <span className="logo-arabic">مَدَنِيَّمْ</span>
        <span className="logo-english">Madaneeyam</span>
        <span className="logo-sub">Project Manager</span>
      </div>

      <ul className="nav-links">
        {menuItems.map(item => (
          <li key={item.id}>
            <button
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
              style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none' }}
            >
              <i className={item.icon}></i>
              {item.label}
            </button>
          </li>
        ))}
      </ul>

      {/* User Profile Block */}
      {user && (
        <div className="sidebar-profile-card">
          <div className="profile-avatar">
            <i className="fa-solid fa-user-shield" style={{ color: user.role === 'admin' ? 'var(--color-gold-bright)' : 'var(--text-muted)' }}></i>
          </div>
          <div className="profile-info">
            <div className="profile-email-text" title={user.email}>{user.email}</div>
            <div className="profile-role-badge">
              {user.role === 'admin' ? 'Administrator' : 'Proofreader'}
            </div>
          </div>
          <button 
            className="btn-profile-logout" 
            onClick={logout} 
            title="Log Out"
            aria-label="Log Out"
          >
            <i className="fa-solid fa-power-off"></i>
          </button>
        </div>
      )}

      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', borderTop: '1px solid var(--border-white-light)', paddingTop: '12px', marginTop: '12px' }}>
        <span>v1.1.0 • Role Access</span>
      </div>
    </div>
  );
};

export default Sidebar;
