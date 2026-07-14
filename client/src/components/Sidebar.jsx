import React from 'react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-solid fa-chart-line' },
    { id: 'explorer', label: 'File Explorer', icon: 'fa-solid fa-folder-open' },
    { id: 'search', label: 'Advanced Search', icon: 'fa-solid fa-magnifying-glass' },
    { id: 'info', label: 'Project Info', icon: 'fa-solid fa-circle-info' }
  ];

  return (
    <div className="sidebar">
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
      <div style={{ marginTop: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', borderTop: '1px solid var(--border-white-light)', paddingTop: '16px' }}>
        <span>v1.0.0 • Islamic Theme</span>
      </div>
    </div>
  );
};

export default Sidebar;
