import React from 'react';
import { useApp } from '../context/AppContext';

const DashboardView = ({ setActiveTab, setFilters }) => {
  const { stats, statsLoading } = useApp();

  if (statsLoading || !stats) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2.5rem', color: 'var(--color-gold)' }}></i>
        <p style={{ color: 'var(--text-secondary)' }}>Loading Islamic library statistics...</p>
      </div>
    );
  }

  const handlePersonClick = (personName) => {
    setFilters(prev => ({ ...prev, person: personName, category: '', status: '', type: '' }));
    setActiveTab('explorer');
  };

  const handleCategoryClick = (categoryName) => {
    setFilters(prev => ({ ...prev, category: categoryName, person: '', status: '', type: '' }));
    setActiveTab('explorer');
  };

  // Convert categories object to sorted array
  const categoriesList = Object.entries(stats.categoryStats || {}).map(([name, val]) => ({
    name,
    ...val
  })).sort((a, b) => b.total - a.total);

  return (
    <div>
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-text">
          <p style={{ color: 'var(--color-gold-bright)', fontStyle: 'italic', marginBottom: '8px', fontSize: '0.9rem', letterSpacing: '1px' }}>
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
          <h1>Madaneeyam Document Compilation</h1>
          <p>
            Welcome to the Madaneeyam file management and proofreading workspace. Track progress, search contents, and coordinate the digital preservation of Islamic texts across team members.
          </p>
        </div>
        <div className="hero-arabic-calligraphy">مَدَنِيَّمْ</div>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-wrapper">
            <i className="fa-solid fa-book-quran"></i>
          </div>
          <div className="metric-info">
            <span className="metric-value">{stats.total}</span>
            <span className="metric-label">Total Files</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrapper">
            <i className="fa-solid fa-circle-check"></i>
          </div>
          <div className="metric-info">
            <span className="metric-value">{stats.completed}</span>
            <span className="metric-label">Completed ({stats.completionPercentage}%)</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrapper">
            <i className="fa-solid fa-list-check"></i>
          </div>
          <div className="metric-info">
            <span className="metric-value">{stats.total - stats.completed}</span>
            <span className="metric-label">Remaining</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrapper">
            <i className="fa-solid fa-file-invoice"></i>
          </div>
          <div className="metric-info">
            <span className="metric-value" style={{ fontSize: '1.25rem' }}>
              {stats.pdfCount} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>PDF</span> / {stats.docxCount} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Word</span>
            </span>
            <span className="metric-label">File Formats</span>
          </div>
        </div>
      </div>

      {/* Progress by Person Folder */}
      <h2 className="section-title">
        <i className="fa-solid fa-users" style={{ color: 'var(--color-gold)' }}></i> File Assignment by Editor
      </h2>
      <div className="persons-grid">
        {Object.entries(stats.personStats || {}).map(([name, data]) => {
          const pct = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
          return (
            <div key={name} className="person-card" onClick={() => handlePersonClick(name)}>
              <div className="person-header">
                <span className="person-name">{name}</span>
                <span className="person-progress-percent">{pct}%</span>
              </div>
              
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: `${pct}%` }}></div>
              </div>

              <div className="person-stats-row">
                <div className="person-stat-box">
                  <span className="person-stat-num">{data.completed}</span>
                  <span className="person-stat-label">Done</span>
                </div>
                <div className="person-stat-box">
                  <span className="person-stat-num">{data.total - data.completed}</span>
                  <span className="person-stat-label">Todo</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Categories Section */}
      <h2 className="section-title">
        <i className="fa-solid fa-cubes" style={{ color: 'var(--color-gold)' }}></i> Library Categories
      </h2>
      <div className="categories-grid">
        {categoriesList.map(cat => {
          const pct = cat.total > 0 ? Math.round((cat.completed / cat.total) * 100) : 0;
          return (
            <div key={cat.name} className="category-card" onClick={() => handleCategoryClick(cat.name)}>
              <div className="category-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{cat.name || 'Unassigned'}</span>
                <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                  {cat.total}
                </span>
              </div>
              <div className="category-stats-row">
                <span>Progress</span>
                <span style={{ color: pct === 100 ? 'var(--color-emerald-light)' : 'var(--text-secondary)', fontWeight: '600' }}>
                  {pct}% ({cat.completed}/{cat.total})
                </span>
              </div>
              <div className="progress-bar-container" style={{ height: '5px' }}>
                <div 
                  className="progress-bar-fill" 
                  style={{ 
                    width: `${pct}%`,
                    background: pct === 100 ? 'var(--color-emerald)' : 'linear-gradient(90deg, var(--color-emerald) 0%, var(--color-gold) 100%)' 
                  }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardView;
