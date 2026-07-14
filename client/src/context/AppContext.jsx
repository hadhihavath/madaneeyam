import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';

const AppContext = createContext();

const API_BASE = 'http://localhost:5000/api';

// Detect if we are running in static mode (GitHub Pages) or dynamic mode (Localhost backend)
const isStaticMode = typeof window !== 'undefined' && 
  window.location.hostname !== 'localhost' && 
  window.location.hostname !== '127.0.0.1';

export const AppProvider = ({ children }) => {
  // Authentication State
  const [user, setUser] = useState(() => {
    try {
      const data = localStorage.getItem('madaneeyam_current_user');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  });

  // Admin User List State
  const [usersList, setUsersList] = useState([]);

  // Global lists
  const [masterFilesList, setMasterFilesList] = useState([]); // Static mode complete cache
  const [files, setFiles] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  
  // Search & Filter State
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    person: '',
    category: '',
    status: '',
    type: ''
  });
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // Helper to load localStorage overlays in static mode
  const getLocalStorageOverlays = () => {
    try {
      const data = localStorage.getItem('madaneeyam_overlays');
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.error("Error reading localStorage:", e);
      return {};
    }
  };

  // Helper to save localStorage overlays
  const saveLocalStorageOverlays = (overlays) => {
    try {
      localStorage.setItem('madaneeyam_overlays', JSON.stringify(overlays));
    } catch (e) {
      console.error("Error saving localStorage:", e);
    }
  };

  // Authentication handlers
  const login = async (email, password) => {
    const adminEmails = ['hadihavath921@gmail.com', 'hadhihavath921@gmail.com'];
    const normalizedEmail = email.trim().toLowerCase();

    // Verify Admin credentials immediately for fast-track or local bypass
    if (adminEmails.includes(normalizedEmail) && password === 'Admin@madaneeyam100') {
      const loggedUser = { email: normalizedEmail, role: 'admin' };
      setUser(loggedUser);
      localStorage.setItem('madaneeyam_current_user', JSON.stringify(loggedUser));
      return { success: true };
    }

    if (isStaticMode) {
      try {
        const storedUsersData = localStorage.getItem('madaneeyam_users');
        const storedUsers = storedUsersData ? JSON.parse(storedUsersData) : [];
        const found = storedUsers.find(u => u.email.toLowerCase() === normalizedEmail && u.password === password);
        
        if (found) {
          const loggedUser = { email: found.email, role: found.role, assignedPerson: found.assignedPerson || '' };
          setUser(loggedUser);
          localStorage.setItem('madaneeyam_current_user', JSON.stringify(loggedUser));
          return { success: true };
        } else {
          return { success: false, error: 'Invalid email or password' };
        }
      } catch (e) {
        return { success: false, error: 'Auth system local storage access error' };
      }
    }

    // Local Node API Auth
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem('madaneeyam_current_user', JSON.stringify(data.user));
        return { success: true };
      } else {
        const err = await res.json();
        return { success: false, error: err.error || 'Invalid credentials' };
      }
    } catch (e) {
      console.error("Local login request failed:", e);
      return { success: false, error: 'Cannot connect to authentication server' };
    }
  };

  const register = async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();

    if (isStaticMode) {
      try {
        const storedUsersData = localStorage.getItem('madaneeyam_users');
        const storedUsers = storedUsersData ? JSON.parse(storedUsersData) : [];
        
        if (storedUsers.some(u => u.email.toLowerCase() === normalizedEmail) || 
            normalizedEmail === 'hadihavath921@gmail.com' || 
            normalizedEmail === 'hadhihavath921@gmail.com') {
          return { success: false, error: 'User already exists' };
        }

        const newUser = { email: email.trim(), password, role: 'user', assignedPerson: '' };
        storedUsers.push(newUser);
        localStorage.setItem('madaneeyam_users', JSON.stringify(storedUsers));
        return { success: true };
      } catch (e) {
        return { success: false, error: 'Local storage registration write failure' };
      }
    }

    // Local Node API Register
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        return { success: true };
      } else {
        const err = await res.json();
        return { success: false, error: err.error || 'Registration failed' };
      }
    } catch (e) {
      console.error("Local registration request failed:", e);
      return { success: false, error: 'Cannot connect to registration server' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('madaneeyam_current_user');
  };

  // Admin functions for user list and folder assignments
  const fetchUsers = useCallback(async () => {
    if (user?.role !== 'admin') return;

    if (isStaticMode) {
      try {
        const storedUsersData = localStorage.getItem('madaneeyam_users');
        const storedUsers = storedUsersData ? JSON.parse(storedUsersData) : [];
        const safeUsers = storedUsers.map(u => ({
          email: u.email,
          role: u.role,
          assignedPerson: u.assignedPerson || ''
        }));
        setUsersList(safeUsers);
      } catch (e) {
        console.error("Error reading users from local storage:", e);
      }
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/users`);
      if (res.ok) {
        const data = await res.json();
        setUsersList(data);
      }
    } catch (e) {
      console.error("Error fetching users list from API:", e);
    }
  }, [user]);

  const assignUserFolder = async (email, assignedPerson) => {
    if (user?.role !== 'admin') {
      alert("Access Denied: Only Administrators can modify user folder assignments.");
      return false;
    }

    if (isStaticMode) {
      try {
        const storedUsersData = localStorage.getItem('madaneeyam_users');
        const storedUsers = storedUsersData ? JSON.parse(storedUsersData) : [];
        const updatedUsers = storedUsers.map(u => {
          if (u.email.toLowerCase() === email.toLowerCase()) {
            return { ...u, assignedPerson: assignedPerson || '' };
          }
          return u;
        });
        localStorage.setItem('madaneeyam_users', JSON.stringify(updatedUsers));
        fetchUsers();
        return true;
      } catch (e) {
        console.error("Error writing user assignment to local storage:", e);
        return false;
      }
    }

    try {
      const res = await fetch(`${API_BASE}/users/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, assignedPerson })
      });
      if (res.ok) {
        fetchUsers();
        return true;
      }
    } catch (e) {
      console.error("Error assigning folder to user:", e);
    }
    return false;
  };

  // Calculate stats client-side (used in static mode)
  const calculateClientStats = (allFiles) => {
    const total = allFiles.length;
    let completed = 0;
    let inProgress = 0;
    let review = 0;
    let todo = 0;
    
    let docxCount = 0;
    let pdfCount = 0;
    
    const personStats = {};
    const categoryStats = {};

    allFiles.forEach(f => {
      if (f.status === 'Completed') completed++;
      else if (f.status === 'In Progress') inProgress++;
      else if (f.status === 'Under Review') review++;
      else todo++;

      if (f.extension === '.docx') docxCount++;
      else if (f.extension === '.pdf') pdfCount++;

      if (f.person) {
        if (!personStats[f.person]) personStats[f.person] = { total: 0, completed: 0 };
        personStats[f.person].total++;
        if (f.status === 'Completed') personStats[f.person].completed++;
      }

      if (f.category) {
        if (!categoryStats[f.category]) {
          categoryStats[f.category] = { total: 0, completed: 0 };
          categoryStats[f.category].total++;
        }
        if (f.status === 'Completed') categoryStats[f.category].completed++;
      }
    });

    return {
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
    };
  };

  // Fetch Stats
  const fetchStats = useCallback(async (currentFilesList = masterFilesList) => {
    // If a regular user has an assigned folder, filter counts to reflect their folder only on dashboard
    let targetedList = currentFilesList;
    if (user && user.role !== 'admin' && user.assignedPerson) {
      targetedList = currentFilesList.filter(f => f.person === user.assignedPerson);
    }

    if (isStaticMode) {
      const overlays = getLocalStorageOverlays();
      const mergedList = targetedList.map(f => {
        const overlay = overlays[f.relPath] || {};
        return { ...f, ...overlay };
      });
      const computedStats = calculateClientStats(mergedList);
      setStats(computedStats);
      return;
    }

    setStatsLoading(true);
    try {
      // In local mode, if proofreader has assigned person, we can filter backend stats on client or server. Let's fetch general stats.
      const response = await fetch(`${API_BASE}/stats`);
      if (response.ok) {
        let data = await response.json();
        if (user && user.role !== 'admin' && user.assignedPerson) {
          // Filter stats locally for the assigned folder
          const singlePersonTotal = data.personStats[user.assignedPerson] || { total: 0, completed: 0 };
          
          // Recompute basic stats to reflect their assigned folder
          data.total = singlePersonTotal.total;
          data.completed = singlePersonTotal.completed;
          data.completionPercentage = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
        }
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setStatsLoading(false);
    }
  }, [masterFilesList, user]);

  // Fetch Files
  const fetchFiles = useCallback(async () => {
    setLoading(true);
    
    // Role override logic: regular proofreader is forced to view only their assigned folder
    let activeFilters = { ...filters };
    if (user && user.role !== 'admin' && user.assignedPerson) {
      activeFilters.person = user.assignedPerson;
    }

    if (isStaticMode) {
      try {
        let rawList = masterFilesList;
        if (rawList.length === 0) {
          const dbUrl = `${window.location.origin}${import.meta.env.BASE_URL}files_db.json`;
          const res = await fetch(dbUrl);
          if (res.ok) {
            rawList = await res.json();
            setMasterFilesList(rawList);
            fetchStats(rawList);
          } else {
            console.error("Failed to load static database files_db.json");
            setLoading(false);
            return;
          }
        }

        const overlays = getLocalStorageOverlays();
        let merged = rawList.map(f => {
          const overlay = overlays[f.relPath] || {};
          return { ...f, ...overlay };
        });

        // Filter client-side
        if (activeFilters.person) {
          merged = merged.filter(f => f.person === activeFilters.person);
        }
        if (activeFilters.category) {
          merged = merged.filter(f => f.category === activeFilters.category);
        }
        if (activeFilters.status) {
          merged = merged.filter(f => f.status === activeFilters.status);
        }
        if (activeFilters.type) {
          merged = merged.filter(f => f.extension === (activeFilters.type.startsWith('.') ? activeFilters.type : `.${activeFilters.type}`));
        }
        if (search) {
          const q = search.toLowerCase();
          merged = merged.filter(f => 
            f.filename.toLowerCase().includes(q) || 
            (f.category && f.category.toLowerCase().includes(q)) ||
            (f.subcategory && f.subcategory.toLowerCase().includes(q)) ||
            (f.notes && f.notes.toLowerCase().includes(q))
          );
        }

        // Sort client-side
        merged.sort((a, b) => {
          if (a.person !== b.person) return a.person.localeCompare(b.person);
          if (a.category !== b.category) return a.category.localeCompare(b.category);
          return a.filename.localeCompare(b.filename);
        });

        const totalResults = merged.length;
        setTotalResults(totalResults);
        setTotalPages(Math.ceil(totalResults / limit) || 1);

        const startIndex = (page - 1) * limit;
        const sliced = merged.slice(startIndex, startIndex + limit);
        setFiles(sliced);

      } catch (e) {
        console.error("Error executing client-side filters:", e);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Local Node API Mode
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        search,
        ...activeFilters
      });
      
      const response = await fetch(`${API_BASE}/files?${queryParams.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files);
        setTotalPages(data.pagination.pages);
        setTotalResults(data.pagination.total);
      }
    } catch (error) {
      console.error("Error fetching files from API:", error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, filters, masterFilesList, fetchStats, user]);

  // Sync files
  const syncFiles = async () => {
    if (user?.role !== 'admin') {
      alert("Access Denied: Only Administrators can trigger filesystem scans.");
      return false;
    }
    if (isStaticMode) {
      alert("System synchronization is unavailable in static web mode. Please run locally to scan disk changes.");
      return false;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/files/sync`, { method: 'POST' });
      if (response.ok) {
        await fetchStats();
        await fetchFiles();
        return true;
      }
    } catch (error) {
      console.error("Error syncing files:", error);
    } finally {
      setLoading(false);
    }
    return false;
  };

  // Update file
  const updateFile = async (relPath, updates) => {
    // A regular proofreader can ONLY update files if they are assigned to that file's editor folder!
    const isAuthorized = user?.role === 'admin' || 
      (user?.role === 'user' && user.assignedPerson && files.some(f => f.relPath === relPath && f.person === user.assignedPerson));

    if (!isAuthorized) {
      alert("Access Denied: You are not authorized to update notes or status in this directory.");
      return false;
    }

    if (isStaticMode) {
      const overlays = getLocalStorageOverlays();
      overlays[relPath] = {
        ...(overlays[relPath] || {}),
        ...updates,
        lastUpdated: new Date()
      };
      saveLocalStorageOverlays(overlays);
      
      fetchStats();
      fetchFiles();
      return true;
    }

    try {
      const response = await fetch(`${API_BASE}/files`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ relPath, ...updates })
      });
      if (response.ok) {
        fetchStats();
        fetchFiles();
        return true;
      }
    } catch (error) {
      console.error("Error updating file:", error);
    }
    return false;
  };

  // Upload file
  const uploadFile = async (formData) => {
    if (user?.role !== 'admin') {
      alert("Access Denied: Only Administrators can upload documents.");
      return false;
    }

    if (isStaticMode) {
      alert("Uploading new files is disabled in static web mode. Please run locally (via npm run dev) to add files.");
      return false;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/files/upload`, {
        method: 'POST',
        body: formData
      });
      if (response.ok) {
        await fetchStats();
        await fetchFiles();
        return true;
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setLoading(false);
    }
    return false;
  };

  // Rename file
  const renameFile = async (relPath, newFilename) => {
    if (user?.role !== 'admin') {
      alert("Access Denied: Only Administrators can rename documents.");
      return false;
    }

    if (isStaticMode) {
      alert("Renaming files on disk is disabled in static web mode. Run locally to perform disk write actions.");
      return false;
    }
    try {
      const response = await fetch(`${API_BASE}/files/rename`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ relPath, newFilename })
      });
      if (response.ok) {
        await fetchStats();
        await fetchFiles();
        return true;
      }
    } catch (error) {
      console.error("Error renaming file:", error);
    }
    return false;
  };

  // Delete file
  const deleteFile = async (relPath) => {
    if (user?.role !== 'admin') {
      alert("Access Denied: Only Administrators can delete documents.");
      return false;
    }

    if (isStaticMode) {
      alert("Deleting files is disabled in static web mode. Run locally to delete files from your system.");
      return false;
    }
    try {
      const response = await fetch(`${API_BASE}/files/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ relPath })
      });
      if (response.ok) {
        await fetchStats();
        await fetchFiles();
        return true;
      }
    } catch (error) {
      console.error("Error deleting file:", error);
    }
    return false;
  };

  // Trigger reload on filter/search changes
  useEffect(() => {
    if (user) {
      fetchFiles();
    }
  }, [fetchFiles, user]);

  // Initial stats fetch
  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [fetchStats, user]);

  // Fetch users list for admin panel
  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchUsers();
    }
  }, [fetchUsers, user]);

  // Helper to construct download link
  const getDownloadUrl = (relPath) => {
    if (isStaticMode) {
      const encodedPath = relPath.split('/').map(segment => encodeURIComponent(segment)).join('/');
      return `https://raw.githubusercontent.com/hadhihavath/madaneeyam/main/Divided Files/${encodedPath}`;
    }
    return `${API_BASE}/files/download?path=${encodeURIComponent(relPath)}`;
  };

  return (
    <AppContext.Provider value={{
      isStaticMode,
      user,
      usersList,
      login,
      register,
      logout,
      fetchUsers,
      assignUserFolder,
      files,
      stats,
      loading,
      statsLoading,
      search,
      setSearch,
      filters,
      setFilters,
      page,
      setPage,
      limit,
      setLimit,
      totalPages,
      totalResults,
      fetchStats,
      fetchFiles,
      syncFiles,
      updateFile,
      uploadFile,
      renameFile,
      deleteFile,
      getDownloadUrl
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
