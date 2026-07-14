import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const AdminPanel = () => {
  const { usersList, assignUserFolder, isStaticMode } = useApp();
  const [updatingUser, setUpdatingUser] = useState(null);

  const peopleList = [
    { value: '', label: 'Unassigned (None)' },
    { value: 'Person 1', label: 'Person 1' },
    { value: 'Person 2', label: 'Person 2' },
    { value: 'Person 3', label: 'Person 3' },
    { value: 'Person 4', label: 'Person 4' },
    { value: 'Person 5', label: 'Person 5' },
    { value: 'Person 6', label: 'Person 6' },
    { value: 'Person 7', label: 'Person 7' }
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
        <strong>Admin Guidance:</strong> Use this panel to link registered proofreader accounts to their corresponding folder nodes (Person 1 - Person 7). Once assigned, a proofreader will be locked into viewing only their assigned folder and will have permission to log reviewer notes and update verification statuses inside it.
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
                            {peopleList.map(opt => (
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
                  <span className={`badge ${u.role === 'admin' ? 'badge-completed' : 'badge-todo'}`} style={{ fontSize: '0.7rem' }}>
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
                        {peopleList.map(opt => (
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
    </div>
  );
};

export default AdminPanel;
