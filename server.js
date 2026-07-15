const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON body parser
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const BASE_DIR = path.resolve(__dirname, 'Divided Files');
const METADATA_PATH = path.resolve(__dirname, 'scratch', 'metadata.json');
const USERS_PATH = path.resolve(__dirname, 'scratch', 'users.json');

// Ensure directories exist
if (!fs.existsSync(BASE_DIR)) {
  fs.mkdirSync(BASE_DIR, { recursive: true });
}
fs.mkdirSync(path.dirname(METADATA_PATH), { recursive: true });

// Load users database
function loadUsers() {
  if (fs.existsSync(USERS_PATH)) {
    try {
      const data = fs.readFileSync(USERS_PATH, 'utf8');
      return JSON.parse(data);
    } catch (e) {
      console.error("Error reading users file, initializing empty:", e);
      return [];
    }
  }
  return [];
}

// Save users database
function saveUsers(users) {
  try {
    fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2), 'utf8');
  } catch (e) {
    console.error("Error writing users file:", e);
  }
}

// Seed admin credentials
function seedAdmin() {
  const users = loadUsers();
  const adminEmails = ['hadihavath921@gmail.com', 'hadhihavath921@gmail.com'];
  let updated = false;

  adminEmails.forEach(email => {
    const adminExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (!adminExists) {
      users.push({
        email: email,
        password: 'Admin@madaneeyam100',
        role: 'admin'
      });
      updated = true;
      console.log(`Seeded admin credentials for: ${email}`);
    }
  });

  if (updated) {
    saveUsers(users);
  }
}

// Perform admin seeding
seedAdmin();

// API: Register a user
app.post('/api/auth/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const users = loadUsers();
  const normalizedEmail = email.trim().toLowerCase();
  
  if (users.some(u => u.email.toLowerCase() === normalizedEmail)) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const newUser = {
    email: email.trim(),
    password: password,
    role: 'user'
  };

  users.push(newUser);
  saveUsers(users);

  res.status(201).json({ success: true, user: { email: newUser.email, role: newUser.role } });
});

// API: Login a user
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const users = loadUsers();
  const normalizedEmail = email.trim().toLowerCase();

  const user = users.find(u => u.email.toLowerCase() === normalizedEmail && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  res.json({ success: true, user: { email: user.email, role: user.role } });
});

// Load metadata from disk
function loadMetadata() {
  if (fs.existsSync(METADATA_PATH)) {
    try {
      const data = fs.readFileSync(METADATA_PATH, 'utf8');
      return JSON.parse(data);
    } catch (e) {
      console.error("Error reading metadata file, initializing empty:", e);
      return {};
    }
  }
  return {};
}

// Save metadata to disk
function saveMetadata(metadata) {
  try {
    fs.writeFileSync(METADATA_PATH, JSON.stringify(metadata, null, 2), 'utf8');
  } catch (e) {
    console.error("Error writing metadata file:", e);
  }
}

// Scan the filesystem recursively and return the files
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
        
        // Parts: [Person, Category, Subcategory/Filename, ...]
        const person = parts[0] || '';
        const category = parts[1] || '';
        const subcategory = parts.length > 3 ? parts.slice(2, -1).join('/') : (parts.length === 3 ? parts[2] : '');
        const filename = parts[parts.length - 1];
        const ext = path.extname(filename).toLowerCase();
        
        // Skip temporary files and Word documents (.docx) for now
        if (filename.startsWith('~$') || filename.startsWith('.')) return;
        if (ext === '.docx') return;

        fileList.append = fileList.push({
          relPath,
          person,
          category,
          subcategory: parts.length > 3 ? parts[2] : (parts.length === 3 && stat.size === 0 ? parts[2] : ''), // adjust if it's subcategory
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

// Refactored walk directory to extract category & subcategory correctly
function getFilesFromDisk() {
  const diskFiles = scanDirectory(BASE_DIR);
  return diskFiles;
}

// Synchronize filesystem and metadata.json
function syncFilesystem() {
  console.log("Synchronizing filesystem with database...");
  const diskFiles = getFilesFromDisk();
  const db = loadMetadata();
  const updatedDb = {};

  diskFiles.forEach(file => {
    const key = file.relPath;
    if (db[key]) {
      // Keep existing status/notes, update size and timestamp
      updatedDb[key] = {
        ...db[key],
        filename: file.filename,
        sizeBytes: file.sizeBytes,
        modifiedTime: file.modifiedTime,
        person: file.person,
        category: file.category,
        subcategory: file.subcategory,
        extension: file.extension
      };
    } else {
      // New file found on disk
      updatedDb[key] = {
        relPath: file.relPath,
        person: file.person,
        category: file.category,
        subcategory: file.subcategory,
        filename: file.filename,
        extension: file.extension,
        sizeBytes: file.sizeBytes,
        modifiedTime: file.modifiedTime,
        status: 'Todo',
        notes: '',
        tags: []
      };
    }
  });

  // Keep a record of deleted files or clean them up?
  // We clean them up since they are deleted from disk.
  saveMetadata(updatedDb);
  console.log(`Synced successfully. Total files in DB: ${Object.keys(updatedDb).length}`);
  return updatedDb;
}

// Perform initial sync
let cachedMetadata = syncFilesystem();

// Helper to check if file path is valid and within BASE_DIR
function getSafePath(relativePath) {
  if (!relativePath) return null;
  const resolvedPath = path.resolve(BASE_DIR, relativePath);
  if (resolvedPath.startsWith(BASE_DIR)) {
    return resolvedPath;
  }
  return null;
}

// API: Get stats
app.get('/api/stats', (req, res) => {
  const db = loadMetadata();
  const files = Object.values(db);
  
  const total = files.length;
  let completed = 0;
  let inProgress = 0;
  let review = 0;
  let todo = 0;
  
  let docxCount = 0;
  let pdfCount = 0;
  
  const personStats = {};
  const categoryStats = {};

  files.forEach(f => {
    // Progress status counts
    if (f.status === 'Completed') completed++;
    else if (f.status === 'In Progress') inProgress++;
    else if (f.status === 'Under Review') review++;
    else todo++;

    // File extensions
    if (f.extension === '.docx') docxCount++;
    else if (f.extension === '.pdf') pdfCount++;

    // Group by Person
    if (f.person) {
      if (!personStats[f.person]) {
        personStats[f.person] = { total: 0, completed: 0 };
      }
      personStats[f.person].total++;
      if (f.status === 'Completed') personStats[f.person].completed++;
    }

    // Group by Category
    if (f.category) {
      if (!categoryStats[f.category]) {
        categoryStats[f.category] = { total: 0, completed: 0 };
      }
      categoryStats[f.category].total++;
      if (f.status === 'Completed') categoryStats[f.category].completed++;
    }
  });

  res.json({
    total,
    completed,
    inProgress,
    review,
    todo,
    docxCount,
    pdfCount,
    personStats,
    categoryStats,
    completionPercentage: total > 0 ? Math.round((completed / total) * 100) : 0
  });
});

// API: Get files (paginated, filtered, searched)
app.get('/api/files', (req, res) => {
  const db = loadMetadata();
  let files = Object.values(db);

  const { person, category, status, type, search } = req.query;

  // Filtering
  if (person) {
    files = files.filter(f => f.person === person);
  }
  if (category) {
    files = files.filter(f => f.category === category);
  }
  if (status) {
    files = files.filter(f => f.status === status);
  }
  if (type) {
    files = files.filter(f => f.extension === (type.startsWith('.') ? type : `.${type}`));
  }
  if (search) {
    const q = search.toLowerCase();
    files = files.filter(f => 
      f.filename.toLowerCase().includes(q) || 
      (f.category && f.category.toLowerCase().includes(q)) ||
      (f.subcategory && f.subcategory.toLowerCase().includes(q)) ||
      (f.notes && f.notes.toLowerCase().includes(q))
    );
  }

  // Sort files by person, category, filename
  files.sort((a, b) => {
    if (a.person !== b.person) return a.person.localeCompare(b.person);
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return a.filename.localeCompare(b.filename);
  });

  const totalResults = files.length;

  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const paginatedFiles = files.slice(startIndex, endIndex);

  res.json({
    files: paginatedFiles,
    pagination: {
      total: totalResults,
      page,
      limit,
      pages: Math.ceil(totalResults / limit)
    }
  });
});

// API: Update file metadata (status, notes)
app.put('/api/files', (req, res) => {
  const { relPath, status, notes, tags } = req.body;
  if (!relPath) {
    return res.status(400).json({ error: "Missing file relative path" });
  }

  const db = loadMetadata();
  if (!db[relPath]) {
    return res.status(404).json({ error: "File not found in database" });
  }

  if (status !== undefined) db[relPath].status = status;
  if (notes !== undefined) db[relPath].notes = notes;
  if (tags !== undefined) db[relPath].tags = tags;
  db[relPath].lastUpdated = new Date();

  saveMetadata(db);
  res.json({ success: true, file: db[relPath] });
});

// API: Sync files manually
app.post('/api/files/sync', (req, res) => {
  const updatedDb = syncFilesystem();
  res.json({ success: true, count: Object.keys(updatedDb).length });
});

// API: Download file
app.get('/api/files/download', (req, res) => {
  const { path: relPath } = req.query;
  if (!relPath) {
    return res.status(400).json({ error: "Missing file path" });
  }

  const safePath = getSafePath(relPath);
  if (!safePath || !fs.existsSync(safePath)) {
    return res.status(404).json({ error: "File not found on disk" });
  }

  res.download(safePath, path.basename(safePath));
});

// API: View file inline (useful for PDF/Docx view in iframe)
app.get('/api/files/view', (req, res) => {
  const { path: relPath } = req.query;
  if (!relPath) {
    return res.status(400).json({ error: "Missing file path" });
  }

  const safePath = getSafePath(relPath);
  if (!safePath || !fs.existsSync(safePath)) {
    return res.status(404).json({ error: "File not found on disk" });
  }

  const ext = path.extname(safePath).toLowerCase();
  let contentType = 'application/octet-stream';
  if (ext === '.pdf') {
    contentType = 'application/pdf';
  } else if (ext === '.docx') {
    contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }

  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', 'inline');
  res.sendFile(safePath);
});

// Multer storage configuration for uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const { person, category, subcategory } = req.body;
    if (!person || !category) {
      return cb(new Error("Person and Category are required for upload"));
    }
    
    // Construct folder path: Divided Files/Person X/Category/Subcategory
    let destPath = path.join(BASE_DIR, person, category);
    if (subcategory) {
      destPath = path.join(destPath, subcategory);
    }
    
    fs.mkdirSync(destPath, { recursive: true });
    cb(null, destPath);
  },
  filename: function (req, file, cb) {
    // Keep the original filename
    // Express Multer handles UTF-8 filenames if we decode them correctly
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    cb(null, originalName);
  }
});

const upload = multer({ storage: storage });

// API: Upload file
app.post('/api/files/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  
  // Rescan filesystem to update database
  syncFilesystem();
  res.json({ success: true, message: "File uploaded and database updated successfully" });
});

// API: Rename file
app.post('/api/files/rename', (req, res) => {
  const { relPath, newFilename } = req.body;
  if (!relPath || !newFilename) {
    return res.status(400).json({ error: "Missing relPath or newFilename" });
  }

  const safeOldPath = getSafePath(relPath);
  if (!safeOldPath || !fs.existsSync(safeOldPath)) {
    return res.status(404).json({ error: "Source file not found on disk" });
  }

  const ext = path.extname(safeOldPath);
  let finalFilename = newFilename;
  if (!newFilename.toLowerCase().endsWith(ext.toLowerCase())) {
    finalFilename += ext; // ensure extension is preserved
  }

  const fileDir = path.dirname(safeOldPath);
  const safeNewPath = path.join(fileDir, finalFilename);
  const newRelPath = path.relative(BASE_DIR, safeNewPath).replace(/\\/g, '/');

  try {
    fs.renameSync(safeOldPath, safeNewPath);
    
    // Update metadata JSON key to preserve user input
    const db = loadMetadata();
    if (db[relPath]) {
      const fileData = { ...db[relPath] };
      delete db[relPath];
      
      fileData.relPath = newRelPath;
      fileData.filename = finalFilename;
      fileData.lastUpdated = new Date();
      db[newRelPath] = fileData;
      
      saveMetadata(db);
    } else {
      syncFilesystem();
    }

    res.json({ success: true, newRelPath });
  } catch (err) {
    console.error("Error renaming file:", err);
    res.status(500).json({ error: "Failed to rename file on disk" });
  }
});

// API: Delete file
app.delete('/api/files/delete', (req, res) => {
  const { relPath } = req.body;
  if (!relPath) {
    return res.status(400).json({ error: "Missing relPath" });
  }

  const safePath = getSafePath(relPath);
  if (!safePath || !fs.existsSync(safePath)) {
    return res.status(404).json({ error: "File not found on disk" });
  }

  try {
    fs.unlinkSync(safePath);
    
    // Remove from metadata database
    const db = loadMetadata();
    if (db[relPath]) {
      delete db[relPath];
      saveMetadata(db);
    }

    res.json({ success: true, message: "File deleted successfully" });
  } catch (err) {
    console.error("Error deleting file:", err);
    res.status(500).json({ error: "Failed to delete file from disk" });
  }
});

// API: Get all users (Admin only)
app.get('/api/users', (req, res) => {
  const users = loadUsers();
  const safeUsers = users.map(u => ({
    email: u.email,
    role: u.role,
    assignedPerson: u.assignedPerson || ''
  }));
  res.json(safeUsers);
});

// API: Assign user to Person folder (Admin only)
app.post('/api/users/assign', (req, res) => {
  const { email, assignedPerson } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const users = loadUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  user.assignedPerson = assignedPerson || '';
  saveUsers(users);
  res.json({ success: true, user: { email: user.email, role: user.role, assignedPerson: user.assignedPerson } });
});

// API: Rename a person folder (Admin only)
app.post('/api/people/rename', (req, res) => {
  const { oldName, newName } = req.body;
  if (!oldName || !newName) {
    return res.status(400).json({ error: "Missing oldName or newName" });
  }

  const oldPath = path.join(BASE_DIR, oldName);
  const newPath = path.join(BASE_DIR, newName);

  if (!oldPath.startsWith(BASE_DIR) || !newPath.startsWith(BASE_DIR)) {
    return res.status(400).json({ error: "Invalid path arguments" });
  }

  if (!fs.existsSync(oldPath)) {
    return res.status(404).json({ error: `Folder '${oldName}' does not exist on disk` });
  }

  if (fs.existsSync(newPath)) {
    return res.status(400).json({ error: `Folder '${newName}' already exists on disk` });
  }

  try {
    // Rename directory on disk
    fs.renameSync(oldPath, newPath);

    // Update metadata.json database keys and values
    const db = loadMetadata();
    const updatedDb = {};
    Object.keys(db).forEach(key => {
      if (key.startsWith(oldName + '/')) {
        const newKey = key.replace(oldName + '/', newName + '/');
        const fileData = { ...db[key] };
        fileData.relPath = newKey;
        fileData.person = newName;
        updatedDb[newKey] = fileData;
      } else {
        updatedDb[key] = db[key];
      }
    });
    saveMetadata(updatedDb);

    // Update users.json assignments
    const users = loadUsers();
    let usersUpdated = false;
    users.forEach(u => {
      if (u.assignedPerson === oldName) {
        u.assignedPerson = newName;
        usersUpdated = true;
      }
    });
    if (usersUpdated) {
      saveUsers(users);
    }

    // Force filesystem scan cache refresh
    cachedMetadata = syncFilesystem();

    res.json({ success: true, message: `Successfully renamed folder '${oldName}' to '${newName}'` });
  } catch (err) {
    console.error("Error renaming person folder:", err);
    res.status(500).json({ error: "Failed to rename folder on disk" });
  }
});


// Serve frontend build static files in production
app.use('/madaneeyam', express.static(path.join(__dirname, 'client', 'dist')));

// Redirect root request to subfolder for Vite base path compatibility
app.get('/', (req, res) => {
  res.redirect('/madaneeyam/');
});

app.get('*', (req, res) => {
  // If the request is for a static file that is missing, return 404 instead of index.html
  if (path.extname(req.path)) {
    return res.status(404).send("File not found");
  }
  const indexHTML = path.join(__dirname, 'client', 'dist', 'index.html');
  if (fs.existsSync(indexHTML)) {
    res.sendFile(indexHTML);
  } else {
    res.status(404).send("Front-end not built yet.");
  }
});

app.listen(PORT, () => {
  console.log(`Madaneeyam backend listening at http://localhost:${PORT}`);
});
