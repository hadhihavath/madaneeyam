import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import ExplorerView from './components/ExplorerView';
import SearchView from './components/SearchView';
import InfoView from './components/InfoView';
import AuthView from './components/AuthView';
import { EditModal, RenameModal, UploadModal } from './components/Modals';

function MainAppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editFile, setEditFile] = useState(null);
  const [renameFile, setRenameFile] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadPerson, setUploadPerson] = useState('');
  const [uploadCategory, setUploadCategory] = useState('');

  const { user, setFilters } = useApp();

  if (!user) {
    return <AuthView />;
  }

  const handleOpenUpload = (person, category) => {
    setUploadPerson(person || 'Person 1');
    setUploadCategory(category || 'Favorites');
    setShowUpload(true);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setIsSidebarOpen(false); // Auto-close sidebar on mobile
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView setActiveTab={setActiveTab} setFilters={setFilters} />;
      case 'explorer':
        return (
          <ExplorerView 
            onEditClick={setEditFile} 
            onRenameClick={setRenameFile} 
            onUploadClick={handleOpenUpload}
          />
        );
      case 'search':
        return (
          <SearchView 
            onEditClick={setEditFile} 
            onRenameClick={setRenameFile} 
          />
        );
      case 'info':
        return <InfoView />;
      default:
        return <DashboardView setActiveTab={setActiveTab} setFilters={setFilters} />;
    }
  };

  return (
    <div className="app-container">
      {/* Mobile Top Header */}
      <header className="mobile-header">
        <div className="mobile-header-logo">
          <span className="mobile-logo-text">مَدَنِيَّمْ</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-gold)', marginLeft: '8px', fontFamily: 'var(--font-display)', fontWeight: 'bold' }}>PROJECT</span>
        </div>
        <button 
          className="mobile-menu-toggle" 
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Toggle Sidebar Menu"
        >
          <i className="fa-solid fa-bars"></i>
        </button>
      </header>

      {/* Sidebar Backdrop Overlay on Mobile */}
      {isSidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Sidebar Component with open/close triggers */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={handleTabChange} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="main-content">
        {renderContent()}
      </main>

      {editFile && (
        <EditModal file={editFile} onClose={() => setEditFile(null)} />
      )}

      {renameFile && (
        <RenameModal file={renameFile} onClose={() => setRenameFile(null)} />
      )}

      {showUpload && (
        <UploadModal 
          defaultPerson={uploadPerson} 
          defaultCategory={uploadCategory} 
          onClose={() => setShowUpload(false)} 
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}

export default App;
