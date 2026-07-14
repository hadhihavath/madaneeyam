import React from 'react';

const InfoView = () => {
  const categoryDefinitions = [
    { name: 'Favorites', desc: 'Frequently accessed and primary litanies compiled for daily usage.' },
    { name: 'ഔറാദുകൾ (Awrad)', desc: 'Standard litanies, adhkar sequences, and regular spiritual exercises.' },
    { name: 'ഖസീദ ബൈത്ത് (Qaseeda)', desc: 'Islamic poetry, odes, and eulogies (e.g. Al-Mudariyyah, Aqidat-ul-Awam).' },
    { name: 'ഖുർആൻ (Quran)', desc: 'Important Quranic chapters (Surahs Al-Kahf, Yaseen, etc.) and Tajweed instructions.' },
    { name: 'ദിക്ർ ദുആ (Dhikr & Dua)', desc: 'Supplications for general, specific, and seasonal situations.' },
    { name: 'നിസ്കാരം (Prayer)', desc: 'Complete descriptions of sunnah prayers, funeral prayers, and post-prayer adhkar.' },
    { name: '노മ്പ് (Fasting / Ramadan)', desc: 'Ramadan handbooks, vitr prayer supplications, and fasting rules.' },
    { name: 'മീലാദ്നബി (Mawlid Nabiyy)', desc: 'Celebratory odes, panegyrics, and scripts commemorating the Prophet\'s birth.' },
    { name: 'മൗലിദ് സീറ (Mawlid & Seerah)', desc: 'Eulogies of Sahabas and Awliyas (e.g. CM Mawlid, Badar Mawlid, Muhyiddin Mala).' },
    { name: 'സ്വലാത്ത് (Salawat)', desc: 'Salutations upon the Prophet (e.g. Salawat Nariyah, Salawat Fath, Salawat Shifa).' },
    { name: 'ഹജ്ജ് & ഉംറ (Hajj & Umrah)', desc: 'Practical step-by-step guides, maps (Baqi, Rawdah), and dhikrs for pilgrimage.' }
  ];

  return (
    <div className="info-section">
      <div className="info-header">
        <h2 className="info-title">About Madaneeyam Project</h2>
        <p style={{ color: 'var(--color-emerald-light)', fontSize: '0.9rem', marginTop: '4px', letterSpacing: '0.5px' }}>
          DIGITAL WORKSPACE FOR COLLABORATIVE TRANSLATION & PROOFREADING
        </p>
      </div>

      <div className="info-content">
        <p>
          The <strong>Madaneeyam Project</strong> is a digital management system created to organize, proofread, and prepare a vast library of 1,290 Islamic documents. The files (available in both Microsoft Word <code>.docx</code> and Adobe PDF <code>.pdf</code> formats) are divided systematically across 7 folders (designated <code>Person 1</code> through <code>Person 7</code>) to distribute the editing workload.
        </p>
        <p>
          Each folder mirrors the same structural classification, housing spiritual litanies, prayers, historical mawlids, and guidebooks written in Malayalam and Arabic script.
        </p>
      </div>

      <div>
        <h3 className="section-title" style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Category Guide</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {categoryDefinitions.map(cat => (
            <div 
              key={cat.name} 
              style={{ 
                background: 'rgba(0, 0, 0, 0.2)', 
                border: '1px solid var(--border-white-light)', 
                borderRadius: '12px', 
                padding: '16px',
                transition: 'var(--transition-fast)'
              }}
              className="info-card-hover"
            >
              <h4 style={{ color: 'var(--color-gold-bright)', fontFamily: 'var(--font-display)', marginBottom: '6px' }}>{cat.name}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{cat.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '24px', background: 'rgba(198, 162, 95, 0.03)', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '24px' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-gold-bright)', marginBottom: '12px' }}>
          <i className="fa-solid fa-circle-question"></i> Editing Workspace Instructions
        </h3>
        <ul style={{ paddingLeft: '20px', fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li>
            <strong>Synchronization:</strong> When you modify files outside the web application directly in the folders, click the <strong>Sync Files</strong> button in the File Explorer. This will scan the filesystem and reflect all changes.
          </li>
          <li>
            <strong>Status Tracking:</strong> Keep track of proofreading by editing the status badge. Mark files as <em>In Progress</em> when typing, <em>Under Review</em> when proofreading, and <em>Completed</em> when ready for publication.
          </li>
          <li>
            <strong>Preserving Notes:</strong> Use the Edit Notes action on any file to log corrections, reference source books, or write questions for other editors. Renaming a file will safely preserve these notes.
          </li>
          <li>
            <strong>Format Integrity:</strong> When uploading new versions of files, ensure the extension (<code>.pdf</code> or <code>.docx</code>) matches. Renaming will automatically maintain file extensions to avoid breaking file handles.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default InfoView;
