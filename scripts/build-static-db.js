const fs = require('fs');
const path = require('path');

const BASE_DIR = path.resolve(__dirname, '..', 'Divided Files');
const METADATA_PATH = path.resolve(__dirname, '..', 'scratch', 'metadata.json');
const OUTPUT_PATH = path.resolve(__dirname, '..', 'client', 'public', 'files_db.json');

// Ensure client public directory exists
fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });

function scanDirectory(basePath) {
  const fileList = [];
  
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        walk(fullPath);
      } else {
        const relPath = path.relative(basePath, fullPath).replace(/\\/g, '/');
        const parts = relPath.split('/');
        
        const person = parts[0] || '';
        const category = parts[1] || '';
        const filename = parts[parts.length - 1];
        const ext = path.extname(filename).toLowerCase();
        
        if (filename.startsWith('~$') || filename.startsWith('.')) return;
        if (ext === '.docx') return;

        fileList.push({
          relPath,
          person,
          category,
          subcategory: parts.length > 3 ? parts[2] : (parts.length === 3 && stat.size === 0 ? parts[2] : ''),
          filename,
          extension: ext,
          sizeBytes: stat.size,
          modifiedTime: stat.mtime
        });
      }
    });
  }
  
  walk(basePath);
  return fileList;
}

function buildStaticDb() {
  console.log("Generating static files database for GitHub Pages...");
  const diskFiles = scanDirectory(BASE_DIR);
  
  let db = {};
  if (fs.existsSync(METADATA_PATH)) {
    try {
      db = JSON.parse(fs.readFileSync(METADATA_PATH, 'utf8'));
    } catch (e) {
      console.error("Error reading metadata:", e);
    }
  }

  const mergedList = diskFiles.map(file => {
    const key = file.relPath;
    const metadata = db[key] || {};
    return {
      relPath: file.relPath,
      person: file.person,
      category: file.category,
      subcategory: file.subcategory,
      filename: file.filename,
      extension: file.extension,
      sizeBytes: file.sizeBytes,
      modifiedTime: file.modifiedTime,
      status: metadata.status || 'Todo',
      notes: metadata.notes || '',
      tags: metadata.tags || []
    };
  });

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(mergedList, null, 2), 'utf8');
  console.log(`Successfully generated static db with ${mergedList.length} files at: ${OUTPUT_PATH}`);
}

buildStaticDb();
