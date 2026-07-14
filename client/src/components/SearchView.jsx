import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const SearchView = ({ onEditClick, onRenameClick }) => {
  const {
    user,
    files,
    filters,
    setFilters,
    page,
    setPage,
    totalPages,
    totalResults,
    deleteFile,
    getDownloadUrl
  } = useApp();

  const [localSearch, setLocalSearch] = useState(filters.search || '');

  const peopleList = ['Person 1', 'Person 2', 'Person 3', 'Person 4', 'Person 5', 'Person 6', 'Person 7'];
  const categoriesList = [
    'Favorites', 'ഔറാദുകൾ', 'ഖസീദ ബൈത്ത്', 'ഖുർആൻ', 'തിരയുക', 'ദിക്ർ ദുആ', 'നിസ്കാരം', 'നോമ്പ്', 'മീലാദ്നബി(സ്വ)', 'മൗലിദ് സീറ', 'സ്വലാത്ത്', 'ഹജ്ജ് &ഉംറ'
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: localSearch }));
    setPage(1);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleResetFilters = () => {
    setLocalSearch('');
    setFilters({
      person: '',
      category: '',
      status: '',
      type: '',
      search: ''
    });
    setPage(1);
  };

  const handleDelete = async (file) => {
    if (window.confirm(`Are you sure you want to delete ${file.filename}? This will remove it from disk.`)) {
      await deleteFile(file.relPath);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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
    <div>
      <div className="section-title">
        <i className="fa-solid fa-magnifying-glass" style={{ color: 'var(--color-gold)' }}></i> Advanced Search & Filters
      </div>

      {/* Filter Row Panel */}
      <div className="search-grid">
        <div className="filter-group">
          <label className="filter-label">Search Keyword</label>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="filter-select"
              style={{ flexGrow: 1 }}
              placeholder="Search file name, notes..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '8px 12px' }}>
              Go
            </button>
          </form>
        </div>

        <div className="filter-group">
          <label className="filter-label">Assigned Editor</label>
          <select
            className="filter-select"
            value={filters.person}
            onChange={(e) => handleFilterChange('person', e.target.value)}
          >
            <option value="">All Editors</option>
            {peopleList.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Category</label>
          <select
            className="filter-select"
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">All Categories</option>
            {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Review Status</label>
          <select
            className="filter-select"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Todo">Todo</option>
            <option value="In Progress">In Progress</option>
            <option value="Under Review">Under Review</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">File Format</label>
          <select
            className="filter-select"
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
          >
            <option value="">All Formats</option>
            <option value="pdf">PDF (.pdf)</option>
            <option value="docx">Word (.docx)</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Found <strong>{totalResults}</strong> files matching your criteria.
        </span>
        <button className="btn btn-secondary" onClick={handleResetFilters} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
          <i className="fa-solid fa-arrow-rotate-left"></i> Reset All Filters
        </button>
      </div>

      {/* Results Container */}
      {files.length === 0 ? (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-white-light)', borderRadius: '20px', padding: '60px 20px', textAlign: 'center' }}>
          <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '3rem', color: 'var(--color-gold)', marginBottom: '16px', opacity: 0.3 }}></i>
          <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '8px' }}>No Results Match Your Search</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Try refining your keyword search or setting broader folder filters.
          </p>
        </div>
      ) : (
        <div className="table-container">
          {/* Desktop Table View */}
          <div className="desktop-only-table">
            <table className="file-table">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th style={{ width: '130px' }}>Folder Location</th>
                  <th style={{ width: '100px' }}>Size</th>
                  <th style={{ width: '130px' }}>Status</th>
                  <th style={{ width: user?.role === 'admin' ? '150px' : '80px', textAlign: 'right' }}>Actions</th>
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
                          {file.notes && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-gold-bright)', fontStyle: 'italic', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              Note: {file.notes}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <span>{file.person}</span>
                        <span>{file.category}</span>
                      </div>
                    </td>
                    <td>{formatSize(file.sizeBytes)}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(file.status)}`}>
                        {file.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
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
                              title="Edit status & notes"
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
                  <div className="file-mobile-detail-item">
                    <span className="detail-label">Location:</span>
                    <span className="detail-value">{file.person} &gt; {file.category || 'No Category'}</span>
                  </div>
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
                  style={{ gridTemplateColumns: user?.role === 'admin' ? 'repeat(2, 1fr)' : '1fr' }}
                >
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
  );
};

export default SearchView;
