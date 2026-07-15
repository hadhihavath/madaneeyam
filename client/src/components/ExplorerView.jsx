import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

const ExplorerView = ({ 
  onEditClick, 
  onRenameClick, 
  onUploadClick,
  onViewClick
}) => {
  const {
    user,
    files,
    stats,
    loading,
    filters,
    setFilters,
    page,
    setPage,
    totalPages,
    totalResults,
    syncFiles,
    deleteFile,
    getDownloadUrl,
    peopleList
  } = useApp();

  const [localSearch, setLocalSearch] = useState('');

  // Setup options (filter list based on user role to lock proofreader folders)
  const activePeopleList = (user && user.role !== 'admin' && user.assignedPerson)
    ? [user.assignedPerson]
    : peopleList;

  const categoriesList = [
    'Favorites', 
    'ഔറാദുകൾ', 
    'ഖസീദ ബൈത്ത്', 
    'ഖുർആൻ', 
    'തിരയുക', 
    'ദിക്ർ ദുആ', 
    'നിസ്കാരം', 
    'നോമ്പ്', 
    'മീലാദ്നബി(സ്വ)', 
    'മൗലിദ് സീറ', 
    'സ്വലാത്ത്', 
    'ഹജ്ജ് &ഉംറ'
  ];

  // Set default person and category if not already set, enforcing role restrictions
  useEffect(() => {
    if (user && user.role !== 'admin' && user.assignedPerson) {
      if (filters.person !== user.assignedPerson) {
        setFilters(prev => ({ ...prev, person: user.assignedPerson }));
      }
    } else if (!filters.person) {
      setFilters(prev => ({ ...prev, person: 'Person 1' }));
    }
  }, [filters.person, setFilters, user]);

  // Handle local search input
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: localSearch }));
    setPage(1);
  };

  const handleClearSearch = () => {
    setLocalSearch('');
    setFilters(prev => ({ ...prev, search: '' }));
    setPage(1);
  };

  const handlePersonSelect = (p) => {
    setFilters(prev => ({ ...prev, person: p }));
    setPage(1);
  };

  const handleCategorySelect = (cat) => {
    setFilters(prev => ({ ...prev, category: cat }));
    setPage(1);
  };

  const handleDelete = async (file) => {
    if (window.confirm(`Are you sure you want to delete ${file.filename}? This will remove it from disk.`)) {
      await deleteFile(file.relPath);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = 1;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Completed': return 'badge-completed';
      case 'In Progress': return 'badge-inprogress';
      case 'Under Review': return 'badge-review';
      default: return 'badge-todo';
    }
  };

  return (
    <div className="explorer-layout">
      {/* Explorer Sidebar */}
      <div className="explorer-sidebar">
        <div>
          <h3 className="explorer-menu-title" style={{ marginBottom: '12px' }}>Assigned Folders</h3>
          <ul className="explorer-menu-list horizontal-scroll-mobile">
            {activePeopleList.map(p => {
              const personData = stats?.personStats?.[p] || { total: 0, completed: 0 };
              return (
                <li 
                  key={p} 
                  className={`explorer-menu-item ${filters.person === p ? 'active' : ''}`}
                  onClick={() => handlePersonSelect(p)}
                >
                  <span>{p}</span>
                  <span className="hide-count-mobile" style={{ fontSize: '0.75rem', opacity: 0.7, marginLeft: '6px' }}>
                    ({personData.completed}/{personData.total})
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <h3 className="explorer-menu-title" style={{ marginBottom: '12px' }}>Categories</h3>
          <ul className="explorer-menu-list horizontal-scroll-mobile">
            <li 
              className={`explorer-menu-item ${!filters.category ? 'active' : ''}`}
              onClick={() => handleCategorySelect('')}
            >
              <span>All Categories</span>
            </li>
            {categoriesList.map(cat => (
              <li 
                key={cat} 
                className={`explorer-menu-item ${filters.category === cat ? 'active' : ''}`}
                onClick={() => handleCategorySelect(cat)}
              >
                <span>{cat}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Explorer Content Window */}
      <div style={{ flexGrow: 1, minWidth: 0 }}>
        {/* Breadcrumbs */}
        <div style={{ display: 'flex', gap: '8px', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px', fontFamily: 'var(--font-display)' }}>
          <span style={{ color: 'var(--color-gold-bright)' }}>Divided Files</span>
          <span>/</span>
          <span>{filters.person || 'All Editors'}</span>
          {filters.category && (
            <>
              <span>/</span>
              <span>{filters.category}</span>
            </>
          )}
        </div>

        {/* Action Toolbar */}
        <div className="toolbar">
          <form className="search-input-wrapper" onSubmit={handleSearchSubmit}>
            <i className="fa-solid fa-magnifying-glass"></i>
            <input 
              type="text" 
              className="search-field"
              placeholder="Search files in this folder..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
            {filters.search && (
              <button 
                type="button" 
                onClick={handleClearSearch}
                style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </form>

          {/* Sync / Upload actions only visible to admin */}
          <div className="toolbar-actions">
            {user?.role === 'admin' && (
              <>
                <button className="btn btn-secondary" onClick={syncFiles} title="Rescan Filesystem">
                  <i className="fa-solid fa-rotate"></i> <span className="hide-text-mobile">Sync Files</span>
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={() => onUploadClick(filters.person, filters.category)}
                >
                  <i className="fa-solid fa-cloud-arrow-up"></i> Upload File
                </button>
              </>
            )}
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh', flexDirection: 'column', gap: '16px' }}>
            <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '2rem', color: 'var(--color-gold)' }}></i>
            <span style={{ color: 'var(--text-secondary)' }}>Loading files...</span>
          </div>
        ) : files.length === 0 ? (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-white-light)', borderRadius: '20px', padding: '60px 20px', textAlign: 'center' }}>
            <i className="fa-regular fa-folder-open" style={{ fontSize: '3rem', color: 'var(--color-gold)', marginBottom: '16px', opacity: 0.5 }}></i>
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '8px' }}>No Files Found</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
              We couldn't find any files matching your current filters. Try relaxing your search terms or choosing a different folder.
            </p>
          </div>
        ) : (
          /* Files Containers (Responsive Split) */
          <div className="table-container">
            {/* Desktop Table View */}
            <div className="desktop-only-table">
              <table className="file-table">
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th style={{ width: '120px' }}>Size</th>
                    <th style={{ width: '150px' }}>Status</th>
                    <th style={{ width: '120px' }}>Modified</th>
                    <th style={{ width: user?.role === 'admin' ? '160px' : '80px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map(file => (
                    <tr key={file.relPath}>
                      <td>
                        <div className="file-name-cell">
                          <i className={`file-icon ${file.extension === '.pdf' ? 'fa-solid fa-file-pdf pdf' : 'fa-solid fa-file-word docx'}`}></i>
                          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                            <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={file.filename}>
                              {file.filename}
                            </span>
                            {!filters.category && (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {file.category || 'No Category'} {file.subcategory && `> ${file.subcategory}`}
                              </span>
                            )}
                            {file.notes && (
                              <span style={{ fontSize: '0.75rem', color: 'var(--color-gold-bright)', fontStyle: 'italic', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                Note: {file.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>{formatSize(file.sizeBytes)}</td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(file.status)}`}>
                          {file.status}
                        </span>
                      </td>
                      <td>{formatDate(file.modifiedTime)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            className="btn-icon"
                            title="View document inline"
                            onClick={() => onViewClick(file)}
                          >
                            <i className="fa-solid fa-eye"></i>
                          </button>
                          <a 
                            href={getDownloadUrl(file.relPath)}
                            className="btn-icon" 
                            title="Download file"
                            download
                          >
                            <i className="fa-solid fa-download"></i>
                          </a>
                          
                          {/* Write actions only visible to admin */}
                          {user?.role === 'admin' && (
                            <>
                              <button 
                                className="btn-icon" 
                                title="Edit review status & notes"
                                onClick={() => onEditClick(file)}
                              >
                                <i className="fa-solid fa-pen-to-square"></i>
                              </button>
                              <button 
                                className="btn-icon" 
                                title="Rename file"
                                onClick={() => onRenameClick(file)}
                              >
                                <i className="fa-solid fa-paragraph"></i>
                              </button>
                              <button 
                                className="btn-icon delete" 
                                title="Delete file"
                                onClick={() => handleDelete(file)}
                              >
                                <i className="fa-solid fa-trash-can"></i>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="mobile-only-cards">
              {files.map(file => (
                <div key={file.relPath} className="file-mobile-card">
                  <div className="file-mobile-card-header">
                    <div className="file-mobile-card-title-row">
                      <i className={`file-icon ${file.extension === '.pdf' ? 'fa-solid fa-file-pdf pdf' : 'fa-solid fa-file-word docx'}`}></i>
                      <span className="file-mobile-card-name" title={file.filename}>{file.filename}</span>
                    </div>
                    <span className={`badge ${getStatusBadgeClass(file.status)}`}>
                      {file.status}
                    </span>
                  </div>
                  
                  <div className="file-mobile-card-details">
                    {!filters.category && (
                      <div className="file-mobile-detail-item">
                        <span className="detail-label">Location:</span>
                        <span className="detail-value">{file.category || 'No Category'} {file.subcategory && `> ${file.subcategory}`}</span>
                      </div>
                    )}
                    <div className="file-mobile-detail-item">
                      <span className="detail-label">Size:</span>
                      <span className="detail-value">{formatSize(file.sizeBytes)}</span>
                    </div>
                    <div className="file-mobile-detail-item">
                      <span className="detail-label">Modified:</span>
                      <span className="detail-value">{formatDate(file.modifiedTime)}</span>
                    </div>
                    {file.notes && (
                      <div className="file-mobile-detail-notes">
                        <strong>Note:</strong> {file.notes}
                      </div>
                    )}
                  </div>

                  <div 
                    className="file-mobile-card-actions" 
                    style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}
                  >
                    <button 
                      type="button" 
                      className="btn btn-secondary btn-mobile-action" 
                      onClick={() => onViewClick(file)}
                    >
                      <i className="fa-solid fa-eye"></i> View
                    </button>
                    <a 
                      href={getDownloadUrl(file.relPath)}
                      className="btn btn-secondary btn-mobile-action" 
                      title="Download file"
                      download
                    >
                      <i className="fa-solid fa-download"></i> Download
                    </a>
                    
                    {/* Write actions only visible to admin */}
                    {user?.role === 'admin' && (
                      <>
                        <button 
                          className="btn btn-secondary btn-mobile-action" 
                          onClick={() => onEditClick(file)}
                        >
                          <i className="fa-solid fa-pen-to-square"></i> Notes
                        </button>
                        <button 
                          className="btn btn-secondary btn-mobile-action" 
                          onClick={() => onRenameClick(file)}
                        >
                          <i className="fa-solid fa-paragraph"></i> Rename
                        </button>
                        <button 
                          className="btn btn-secondary btn-mobile-action delete" 
                          onClick={() => handleDelete(file)}
                        >
                          <i className="fa-solid fa-trash-can"></i> Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Row */}
            <div className="pagination-container" style={{ padding: '16px 20px', background: 'rgba(0,0,0,0.1)', borderTop: '1px solid var(--border-white-light)' }}>
              <div className="pagination-info">
                Showing {files.length} of {totalResults} files
              </div>
              <div className="pagination-buttons">
                <button 
                  className="btn btn-secondary" 
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                >
                  <i className="fa-solid fa-chevron-left"></i> Prev
                </button>
                <span style={{ display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Page {page} of {totalPages}
                </span>
                <button 
                  className="btn btn-secondary" 
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                >
                  Next <i className="fa-solid fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorerView;
