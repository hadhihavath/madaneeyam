import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { renderAsync } from 'docx-preview';

export const EditModal = ({ file, onClose }) => {
  const { updateFile } = useApp();
  const [status, setStatus] = useState(file.status || 'Todo');
  const [notes, setNotes] = useState(file.notes || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await updateFile(file.relPath, { status, notes });
    if (success) onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">Edit Documentation Details</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '12px', background: 'rgba(0,0,0,0.15)', borderRadius: '8px', border: '1px solid var(--border-white-light)' }}>
              <strong>File Path:</strong> <span style={{ fontFamily: 'monospace', color: 'var(--color-gold-bright)' }}>{file.relPath}</span>
            </div>
            
            <div className="form-group">
              <label className="form-label">Review Status</label>
              <select 
                className="filter-select" 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Todo">Todo (Pending)</option>
                <option value="In Progress">In Progress (Typing/Formatting)</option>
                <option value="Under Review">Under Review (Proofreading)</option>
                <option value="Completed">Completed (Finalized)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Reviewer Notes / Corrections</label>
              <textarea 
                className="form-textarea"
                placeholder="Log any spelling corrections, missing pages, or verification comments..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-gold">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const RenameModal = ({ file, onClose }) => {
  const { renameFile } = useApp();
  // Get filename without extension for easier editing
  const ext = file.extension || '';
  const initialName = file.filename ? file.filename.substring(0, file.filename.length - ext.length) : '';
  const [newFilename, setNewFilename] = useState(initialName);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newFilename.trim()) return;
    setLoading(true);
    const success = await renameFile(file.relPath, newFilename.trim());
    setLoading(false);
    if (success) onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">Rename File on Disk</h3>
          <button className="modal-close" onClick={onClose} disabled={loading}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Current Name: <strong style={{ color: 'var(--text-primary)' }}>{file.filename}</strong>
            </div>

            <div className="form-group">
              <label className="form-label">New Filename</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ flexGrow: 1 }}
                  placeholder="Enter new name"
                  value={newFilename}
                  onChange={(e) => setNewFilename(e.target.value)}
                  disabled={loading}
                  required
                />
                <span style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-muted)' }}>{ext}</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Your notes and review history will be safely preserved for this file.
              </span>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn-gold" disabled={loading}>
              {loading ? 'Renaming...' : 'Rename File'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const UploadModal = ({ defaultPerson, defaultCategory, onClose }) => {
  const { uploadFile, peopleList } = useApp();
  const [person, setPerson] = useState(defaultPerson || peopleList[0] || 'Person 1');
  const [category, setCategory] = useState(defaultCategory || 'Favorites');
  const [subcategory, setSubcategory] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const categoriesList = [
    'Favorites', 'ഔറാദുകൾ', 'ഖസീദ ബൈത്ത്', 'ഖുർആൻ', 'തിരയുക', 'ദിക്ർ ദുആ', 'നിസ്കാരം', 'നോമ്പ്', 'മീലാദ്നബി(സ്വ)', 'മൗലിദ് സീറ', 'സ്വലാത്ത്', 'ഹജ്ജ് &ഉംറ'
  ];

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Please select a file to upload");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('person', person);
    formData.append('category', category);
    formData.append('subcategory', subcategory);

    const success = await uploadFile(formData);
    setUploading(false);
    
    if (success) {
      onClose();
    } else {
      alert("Upload failed. Verify that all fields are correct.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">Upload New Document</h3>
          <button className="modal-close" onClick={onClose} disabled={uploading}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Editor Folder</label>
                <select 
                  className="filter-select"
                  value={person}
                  onChange={(e) => setPerson(e.target.value)}
                  disabled={uploading}
                >
                  {peopleList.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select 
                  className="filter-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={uploading}
                >
                  {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Subcategory (Optional)</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. പ്രധാനപ്പെട്ട സൂറത്തുകൾ"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                disabled={uploading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Select Document (.pdf, .docx)</label>
              <div className="file-drag-area" onClick={() => document.getElementById('file-upload-input').click()}>
                <i className="fa-solid fa-cloud-arrow-up file-drag-icon"></i>
                {selectedFile ? (
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>{selectedFile.name}</strong>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {(selectedFile.size / 1024).toFixed(1)} KB - Click to replace file
                    </p>
                  </div>
                ) : (
                  <div>
                    <strong style={{ color: 'var(--text-secondary)' }}>Click to browse files</strong>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Supports Word (.docx) or PDF (.pdf) formats
                    </p>
                  </div>
                )}
                <input 
                  id="file-upload-input"
                  type="file" 
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  disabled={uploading}
                />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={uploading}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Start Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ViewerModal = ({ file, onClose }) => {
  const { getViewUrl, getDownloadUrl } = useApp();
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isPdf = file.extension === '.pdf';
  const isDocx = file.extension === '.docx';
  const viewUrl = getViewUrl(file.relPath);

  useEffect(() => {
    if (isDocx && containerRef.current) {
      setLoading(true);
      setError(null);
      containerRef.current.innerHTML = ""; // Clear any previous contents

      fetch(viewUrl)
        .then(res => {
          if (!res.ok) throw new Error("Failed to load document");
          return res.blob();
        })
        .then(blob => {
          // Render DOCX dynamically using docx-preview
          return renderAsync(blob, containerRef.current, null, {
            className: "docx-preview-body",
            inWrapper: false
          });
        })
        .then(() => {
          setLoading(false);
        })
        .catch(err => {
          console.error("Docx render error:", err);
          setError("Failed to load/render Word document. You can still download the file using the button below.");
          setLoading(false);
        });
    }
  }, [viewUrl, isDocx]);

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div className="modal-content" style={{ maxWidth: '1000px', width: '95vw', height: '90vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        <div className="modal-header" style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className={`file-icon ${isPdf ? 'fa-solid fa-file-pdf pdf' : 'fa-solid fa-file-word docx'}`} style={{ fontSize: '1.25rem' }}></i>
            <h3 className="modal-title" style={{ fontSize: '1.1rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '60vw' }} title={file.filename}>
              {file.filename}
            </h3>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close Viewer">&times;</button>
        </div>

        <div className="modal-body" style={{ flexGrow: 1, padding: 0, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column', background: 'var(--bg-app)' }}>
          {isPdf ? (
            <iframe 
              src={`${viewUrl}#toolbar=1`} 
              width="100%" 
              height="100%" 
              style={{ border: 'none', background: 'var(--bg-app)' }} 
              title={file.filename}
            />
          ) : isDocx ? (
            <div style={{ flexGrow: 1, overflow: 'auto', padding: '24px', display: 'flex', justifyContent: 'center', background: '#e0e0e0' }}>
              <div 
                ref={containerRef}
                style={{ 
                  background: '#ffffff', 
                  color: '#333333', 
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)', 
                  borderRadius: '8px', 
                  width: '100%', 
                  maxWidth: '850px', 
                  minHeight: '100%', 
                  padding: '40px',
                  boxSizing: 'border-box'
                }}
              >
                {loading && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', flexDirection: 'column', gap: '16px', color: 'var(--text-muted)' }}>
                    <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '2rem', color: 'var(--color-gold)' }}></i>
                    <span>Parsing Word document layout...</span>
                  </div>
                )}
                {error && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', flexDirection: 'column', gap: '16px', padding: '20px', textAlign: 'center', color: '#ff4d4d' }}>
                    <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '2.5rem' }}></i>
                    <p style={{ fontWeight: '500' }}>{error}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', gap: '16px', color: 'var(--text-secondary)' }}>
              <i className="fa-solid fa-file-excel" style={{ fontSize: '3rem' }}></i>
              <span>Preview unavailable for this file type. Please download to view.</span>
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ padding: '12px 24px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Status: <span className={`badge ${file.status === 'Completed' ? 'badge-completed' : file.status === 'In Progress' ? 'badge-inprogress' : file.status === 'Under Review' ? 'badge-review' : 'badge-todo'}`} style={{ fontSize: '0.75rem', marginLeft: '4px' }}>{file.status}</span>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <a 
              href={getDownloadUrl(file.relPath)}
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem', padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', color: 'var(--color-gold)' }}
              download
            >
              <i className="fa-solid fa-download"></i> Download File
            </a>
            <button 
              type="button" 
              className="btn btn-gold" 
              onClick={onClose}
              style={{ fontSize: '0.85rem', padding: '6px 20px' }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
