import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const FolderRenameCard = ({ personName }) => {
  const { stats, renamePerson } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(personName);
  const [isSaving, setIsSaving] = useState(false);

  const fileCount = stats?.personStats?.[personName]?.total || 0;
  const completedCount = stats?.personStats?.[personName]?.completed || 0;

  const handleRenameSubmit = async (e) => {
    e.preventDefault();
    if (newName.trim() === personName) {
      setIsEditing(false);
      return;
    }
    if (!newName.trim()) {
      alert("Name cannot be empty");
      return;
    }
    setIsSaving(true);
    const success = await renamePerson(personName, newName.trim());
    setIsSaving(false);
    if (success) {
      setIsEditing(false);
    }
  };

  return (
    <div className="folder-rename-card" style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-white-light)',
      borderRadius: '16px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      position: 'relative',
      transition: 'var(--transition-fast)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: 'rgba(191, 165, 125, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-gold-bright)',
          fontSize: '1.2rem'
        }}>
          <i className="fa-solid fa-folder"></i>
        </div>
        <div style={{ flex: 1 }}>
          {isEditing ? (
            <form onSubmit={handleRenameSubmit} style={{ display: 'flex', gap: '6px', width: '100%' }}>
              <input
                type="text"
                className="filter-select"
                style={{ margin: 0, padding: '4px 8px', fontSize: '0.9rem', flex: 1, background: 'var(--bg-app)', color: 'var(--text-primary)' }}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                disabled={isSaving}
                autoFocus
              />
              <button
                type="submit"
                className="btn btn-gold"
                style={{ padding: '6px 10px', borderRadius: '8px', minWidth: 'auto' }}
                disabled={isSaving}
                title="Save Name"
              >
                {isSaving ? (
                  <i className="fa-solid fa-spinner fa-spin"></i>
                ) : (
                  <i className="fa-solid fa-check"></i>
                )}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '6px 10px', borderRadius: '8px', minWidth: 'auto', background: 'rgba(255, 255, 255, 0.05)' }}
                onClick={() => {
                  setNewName(personName);
                  setIsEditing(false);
                }}
                disabled={isSaving}
                title="Cancel"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </form>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '8px' }}>
              <span style={{ fontWeight: '600', fontSize: '1rem', color: 'var(--text-primary)', wordBreak: 'break-all' }}>{personName}</span>
              <button
                className="btn btn-secondary"
                style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem', minWidth: 'auto', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(191, 165, 125, 0.05)', border: '1px solid var(--border-light)', color: 'var(--color-gold)' }}
                onClick={() => setIsEditing(true)}
                title="Rename Folder"
              >
                <i className="fa-solid fa-pen-to-square"></i> Rename
              </button>
            </div>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-white-light)', paddingTop: '10px', marginTop: '4px' }}>
        <span>Files: <strong>{fileCount}</strong></span>
        <span>Completed: <strong style={{ color: 'var(--color-emerald-light)' }}>{completedCount}</strong></span>
      </div>
    </div>
  );
};

const AdminPanel = () => {
  const { usersList, assignUserFolder, isStaticMode, peopleList } = useApp();
  const [updatingUser, setUpdatingUser] = useState(null);

  const dropdownPeopleList = [
    { value: '', label: 'Unassigned (None)' },
    ...peopleList.map(p => ({ value: p, label: p }))
  ];

  const handleAssignmentChange = async (email, value) => {
    setUpdatingUser(email);
    try {
      await assignUserFolder(email, value);
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingUser(null);
    }
  };

  return (
    <div>
      <div className="section-title">
        <i className="fa-solid fa-users-gear" style={{ color: 'var(--color-gold)' }}></i> Proofreader Assignment Console
      </div>

      <div style={{ background: 'rgba(191, 165, 125, 0.02)', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '16px 20px', marginBottom: '24px', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
        <i className="fa-solid fa-circle-info" style={{ color: 'var(--color-gold-bright)', marginRight: '8px' }}></i>
        <strong>Admin Guidance:</strong> Use this panel to link registered proofreader accounts to their corresponding folder nodes. Once assigned, a proofreader will be locked into viewing only their assigned folder and will have permission to log reviewer notes and update verification statuses inside it.
        {isStaticMode && (
          <div style={{ marginTop: '8px', color: 'var(--color-gold-bright)' }}>
            ⚠️ <em>Currently running in static mode. Assignments are saved in this browser's local storage.</em>
          </div>
        )}
      </div>

      {usersList.length === 0 ? (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-white-light)', borderRadius: '20px', padding: '50px 20px', textAlign: 'center' }}>
          <i className="fa-solid fa-user-slash" style={{ fontSize: '3rem', color: 'var(--color-gold)', marginBottom: '16px', opacity: 0.3 }}></i>
          <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '8px' }}>No Registered Users</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            No proofreader accounts have registered yet. Tell them to open this site and click the "Register" tab to create their profiles.
          </p>
        </div>
      ) : (
        <div className="table-container">
          {/* Desktop Table View */}
          <div className="desktop-only-table">
            <table className="file-table">
              <thead>
                <tr>
                  <th>User Account</th>
                  <th style={{ width: '180px' }}>Access Role</th>
                  <th style={{ width: '320px' }}>Assigned Folder Directory</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map(u => (
                  <tr key={u.email}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="profile-avatar" style={{ width: '32px', height: '32px', fontSize: '0.9rem' }}>
                          <i className="fa-solid fa-user"></i>
                        </div>
                        <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{u.email}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-completed' : 'badge-todo'}`} style={{ textTransform: 'capitalize' }}>
                        {u.role === 'admin' ? 'Administrator' : 'Proofreader'}
                      </span>
                    </td>
                    <td>
                      {u.role === 'admin' ? (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          Super Admin (Full Directory Access)
                        </span>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <select
                            className="filter-select"
                            style={{ margin: 0, padding: '6px 12px', minWidth: '220px' }}
                            value={u.assignedPerson}
                            onChange={(e) => handleAssignmentChange(u.email, e.target.value)}
                            disabled={updatingUser === u.email}
                          >
                            {dropdownPeopleList.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                          {updatingUser === u.email && (
                            <i className="fa-solid fa-spinner fa-spin" style={{ color: 'var(--color-gold)' }}></i>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="mobile-only-cards">
            {usersList.map(u => (
              <div key={u.email} className="file-mobile-card" style={{ gap: '8px' }}>
                <div className="file-mobile-card-header" style={{ border: 'none', padding: 0 }}>
                  <div className="file-mobile-card-title-row">
                    <i className="fa-solid fa-user" style={{ color: 'var(--color-gold)', marginRight: '4px' }}></i>
                    <span className="file-mobile-card-name" style={{ fontSize: '0.9rem' }}>{u.email}</span>
                  </div>
                  <span className={`badge ${u.role === 'admin' ? 'badge-completed' : 'badge-todo'}`} style={{ fontSize: '0.75rem' }}>
                    {u.role === 'admin' ? 'Admin' : 'Proofreader'}
                  </span>
                </div>

                {u.role !== 'admin' && (
                  <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>Directory Assignment:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <select
                        className="filter-select"
                        style={{ margin: 0, padding: '8px 12px', width: '100%' }}
                        value={u.assignedPerson}
                        onChange={(e) => handleAssignmentChange(u.email, e.target.value)}
                        disabled={updatingUser === u.email}
                      >
                        {dropdownPeopleList.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      {updatingUser === u.email && (
                        <i className="fa-solid fa-spinner fa-spin" style={{ color: 'var(--color-gold)' }}></i>
                      )}
                    </div>
                  </div>
                )}

                {u.role === 'admin' && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '4px' }}>
                    Super Admin (Full Access)
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Folder Name Customization Console */}
      <div className="section-title" style={{ marginTop: '40px' }}>
        <i className="fa-solid fa-folder-open" style={{ color: 'var(--color-gold)' }}></i> Folder Customization Console
      </div>

      <div style={{ background: 'rgba(191, 165, 125, 0.02)', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '16px 20px', marginBottom: '24px', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
        <i className="fa-solid fa-circle-info" style={{ color: 'var(--color-gold-bright)', marginRight: '8px' }}></i>
        <strong>Admin Guidance:</strong> Use this console to rename the default folder names (e.g., "Person 1") to the real names of the corresponding persons. Renaming a folder will automatically rename the folder on disk, update the files' database path, and preserve all associated proofreader notes, statuses, and user assignments.
      </div>

      <div className="folders-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {peopleList.map(personName => (
          <FolderRenameCard key={personName} personName={personName} />
        ))}
      </div>
    </div>
  );
};

export default AdminPanel;
