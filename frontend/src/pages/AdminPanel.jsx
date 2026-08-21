
// frontend/src/components/AdminPanel.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE = "/api";
// SECRET ADMIN PATH - Change this to match your backend secret!
const ADMIN_SECRET = "x7k9m2p4q8w5v3n1";

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [pendingQuestions, setPendingQuestions] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [users, setUsers] = useState([]);
  const [backups, setBackups] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Bulk upload states
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResults, setUploadResults] = useState([]);
  const [uploadSummary, setUploadSummary] = useState(null);
  const [skipDuplicates, setSkipDuplicates] = useState(true);

  // Coin management states
  const [coinUsername, setCoinUsername] = useState('');
  const [coinAmount, setCoinAmount] = useState('');
  const [coinDescription, setCoinDescription] = useState('');
  const [customCoins, setCustomCoins] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Coin packages from config
  const COIN_PACKAGES = {
    0: { coins: 100, label: 'Free Bonus' },
    20: { coins: 60, label: '20 Taka' },
    50: { coins: 160, label: '50 Taka' },
    100: { coins: 330, label: '100 Taka' },
    200: { coins: 680, label: '200 Taka' },
    500: { coins: 1750, label: '500 Taka' }
  };

  // Get auth token
  const getAuthHeaders = () => ({
    headers: { 
      Authorization: `Bearer ${localStorage.getItem('token')}` 
    }
  });

  // Fetch data
  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/${ADMIN_SECRET}/admin/stats`,
        getAuthHeaders()
      );
      setStats(res.data);
    } catch (err) {
      setError('Failed to fetch stats');
    }
  }, []);

  const fetchPendingQuestions = useCallback(async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/${ADMIN_SECRET}/admin/questions/pending`,
        getAuthHeaders()
      );
      setPendingQuestions(res.data.questions || []);
    } catch (err) {
      setError('Failed to fetch pending questions');
    }
  }, []);

  const fetchAllQuestions = useCallback(async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/${ADMIN_SECRET}/admin/questions?limit=1000`,
        getAuthHeaders()
      );
      setAllQuestions(res.data.questions || []);
    } catch (err) {
      setError('Failed to fetch questions');
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/${ADMIN_SECRET}/admin/users?limit=100`,
        getAuthHeaders()
      );
      setUsers(res.data.users || []);
    } catch (err) {
      setError('Failed to fetch users');
    }
  }, []);

  const fetchBackups = useCallback(async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/${ADMIN_SECRET}/admin/backup/list`,
        getAuthHeaders()
      );
      setBackups(res.data.backups || []);
    } catch (err) {
      setError('Failed to fetch backups');
    }
  }, []);

  // Load all data
  const loadAllData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      await Promise.all([
        fetchStats(),
        fetchPendingQuestions(),
        fetchAllQuestions(),
        fetchUsers(),
        fetchBackups()
      ]);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [fetchStats, fetchPendingQuestions, fetchAllQuestions, fetchUsers, fetchBackups]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Filter users for dropdown
  useEffect(() => {
    if (userSearchTerm.trim()) {
      const filtered = users.filter(user => 
        user.username.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
      );
      setFilteredUsers(filtered.slice(0, 10));
      setShowUserDropdown(true);
    } else {
      setFilteredUsers([]);
      setShowUserDropdown(false);
    }
  }, [userSearchTerm, users]);

  // Approve question
  const handleApprove = async (questionId) => {
    if (!window.confirm('Approve this question?')) return;
    
    try {
      await axios.post(
        `${API_BASE}/${ADMIN_SECRET}/admin/questions/${questionId}/approve`,
        {},
        getAuthHeaders()
      );
      setSuccess('Question approved successfully!');
      await fetchPendingQuestions();
      await fetchAllQuestions();
      await fetchStats();
    } catch (err) {
      setError('Failed to approve question');
    }
  };

  // Reject question
  const handleReject = async (questionId) => {
    const reason = prompt('Reason for rejection:');
    if (!reason) return;
    
    try {
      await axios.post(
        `${API_BASE}/${ADMIN_SECRET}/admin/questions/${questionId}/reject`,
        { reason },
        getAuthHeaders()
      );
      setSuccess('Question rejected successfully!');
      await fetchPendingQuestions();
      await fetchAllQuestions();
      await fetchStats();
    } catch (err) {
      setError('Failed to reject question');
    }
  };

  // Delete question
  const handleDelete = async (questionId) => {
    if (!window.confirm('Delete this question permanently?')) return;
    
    try {
      await axios.delete(
        `${API_BASE}/${ADMIN_SECRET}/admin/questions/${questionId}`,
        getAuthHeaders()
      );
      setSuccess('Question deleted successfully!');
      await fetchAllQuestions();
      await fetchPendingQuestions();
      await fetchStats();
    } catch (err) {
      setError('Failed to delete question');
    }
  };

  // Create backup
  const handleCreateBackup = async () => {
    try {
      const res = await axios.post(
        `${API_BASE}/${ADMIN_SECRET}/admin/backup/create`,
        {},
        getAuthHeaders()
      );
      setSuccess(`Backup created: ${res.data.filename}`);
      await fetchBackups();
    } catch (err) {
      setError('Failed to create backup');
    }
  };

  // Download backup
  const handleDownloadBackup = async (filename) => {
    try {
      const res = await axios.get(
        `${API_BASE}/${ADMIN_SECRET}/admin/backup/download/${filename}`,
        {
          ...getAuthHeaders(),
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to download backup');
    }
  };

  // Delete backup
  const handleDeleteBackup = async (filename) => {
    if (!window.confirm(`Delete backup ${filename}?`)) return;
    
    try {
      await axios.delete(
        `${API_BASE}/${ADMIN_SECRET}/admin/backup/${filename}`,
        getAuthHeaders()
      );
      setSuccess('Backup deleted successfully!');
      await fetchBackups();
    } catch (err) {
      setError('Failed to delete backup');
    }
  };

  // ==================== COIN MANAGEMENT FUNCTIONS ====================

  // Add coins using package
  const handleAddCoins = async (e) => {
    e.preventDefault();
    
    if (!coinUsername) {
      setError('Please select a user');
      return;
    }
    
    if (!coinAmount) {
      setError('Please select a package');
      return;
    }

    const amountNum = parseInt(coinAmount);
    const packageInfo = COIN_PACKAGES[amountNum];
    
    if (!packageInfo) {
      setError('Invalid package selected');
      return;
    }

    if (!window.confirm(`Add ${packageInfo.coins} coins to user "${coinUsername}"? ${amountNum === 0 ? '(Free Bonus)' : `Package: ${amountNum} Taka`}`)) {
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('username', coinUsername);
      formData.append('amount_taka', amountNum);
      formData.append('description', coinDescription || (amountNum === 0 ? 'Free bonus coins' : `Package: ${amountNum} Taka`));

      const res = await axios.post(
        `${API_BASE}/${ADMIN_SECRET}/admin/users/add-coins`,
        formData,
        {
          ...getAuthHeaders(),
          headers: {
            ...getAuthHeaders().headers,
            'Content-Type': 'multipart/form-data',
          }
        }
      );

      setSuccess(`✅ ${res.data.message}`);
      setCoinUsername('');
      setCoinAmount('');
      setCoinDescription('');
      setUserSearchTerm('');
      setSelectedUser(null);
      await fetchUsers();
      await fetchStats();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add coins');
    } finally {
      setLoading(false);
    }
  };

  // Add custom coins
  const handleAddCustomCoins = async (e) => {
    e.preventDefault();
    
    if (!coinUsername) {
      setError('Please select a user');
      return;
    }
    
    if (!customCoins || parseInt(customCoins) <= 0) {
      setError('Please enter a valid number of coins (positive integer)');
      return;
    }

    const coinsNum = parseInt(customCoins);
    if (!window.confirm(`Add ${coinsNum} custom coins to user "${coinUsername}"?`)) {
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('username', coinUsername);
      formData.append('custom_coins', coinsNum);
      formData.append('description', coinDescription || 'Admin added custom coins');

      const res = await axios.post(
        `${API_BASE}/${ADMIN_SECRET}/admin/users/add-custom-coins`,
        formData,
        {
          ...getAuthHeaders(),
          headers: {
            ...getAuthHeaders().headers,
            'Content-Type': 'multipart/form-data',
          }
        }
      );

      setSuccess(`✅ ${res.data.message}`);
      setCoinUsername('');
      setCustomCoins('');
      setCoinDescription('');
      setUserSearchTerm('');
      setSelectedUser(null);
      await fetchUsers();
      await fetchStats();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add custom coins');
    } finally {
      setLoading(false);
    }
  };

  // Handle user selection from dropdown
  const handleSelectUser = (user) => {
    setCoinUsername(user.username);
    setSelectedUser(user);
    setUserSearchTerm(user.username);
    setShowUserDropdown(false);
  };

  // Handle bulk upload
  const handleBulkUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    // Validate file count
    if (files.length > 100) {
      setError('Maximum 100 files allowed per upload');
      event.target.value = '';
      return;
    }
    
    // Validate file types and sizes
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    for (let file of files) {
      if (!allowedTypes.includes(file.type)) {
        setError(`File ${file.name} has unsupported format. Only PNG, JPG, JPEG, and WEBP are allowed.`);
        event.target.value = '';
        return;
      }
      if (file.size > maxSize) {
        setError(`File ${file.name} exceeds 10MB limit.`);
        event.target.value = '';
        return;
      }
    }
    
    setUploading(true);
    setUploadProgress(0);
    setUploadResults([]);
    setUploadSummary(null);
    setError('');
    
    const formData = new FormData();
    for (let file of files) {
      formData.append('files', file);
    }
    
    // Add skip duplicates flag
    formData.append('skip_duplicates', skipDuplicates.toString());
    
    try {
      const res = await axios.post(
        `${API_BASE}/${ADMIN_SECRET}/admin/bulk-upload`,
        formData,
        {
          ...getAuthHeaders(),
          headers: {
            ...getAuthHeaders().headers,
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        }
      );
      
      setUploadResults(res.data.results || []);
      setUploadSummary({
        totalQuestions: res.data.total_questions || 0,
        totalFiles: res.data.total_files || 0,
        successful: res.data.successful || 0,
        failed: res.data.failed || 0,
        skipped: res.data.skipped || 0
      });
      
      if (res.data.successful > 0) {
        setSuccess(`Successfully uploaded ${res.data.successful} questions!`);
        // Refresh data
        await loadAllData();
      }
      
      if (res.data.failed > 0 && res.data.successful === 0 && res.data.skipped === 0) {
        setError('All questions failed to upload. Please check the results for details.');
      }
      
      if (res.data.skipped > 0 && res.data.successful === 0 && res.data.failed === 0) {
        setSuccess(`All questions were duplicates and were skipped. No new questions added.`);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.error || 'Failed to upload files. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      event.target.value = ''; // Reset input
    }
  };

  // Tabs
  const tabs = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'approvals', label: `⏳ Approvals (${pendingQuestions.length})` },
    { id: 'questions', label: `📝 Questions (${allQuestions.length})` },
    { id: 'users', label: `👥 Users (${users.length})` },
    { id: 'coins', label: '🪙 Manage Coins' },
    { id: 'backup', label: '💾 Backup' },
    { id: 'bulk_upload', label: '📤 Bulk Upload' }
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '20px auto', padding: '20px' }}>
      <h1 style={{ marginBottom: '20px' }}>🛠️ Admin Panel</h1>

      {/* Messages */}
      {error && (
        <div style={{
          padding: '10px',
          backgroundColor: '#f8d7da',
          borderRadius: '4px',
          color: '#721c24',
          marginBottom: '10px'
        }}>
          ❌ {error}
          <button
            onClick={() => setError('')}
            style={{ marginLeft: '10px', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
      )}
      
      {success && (
        <div style={{
          padding: '10px',
          backgroundColor: '#d4edda',
          borderRadius: '4px',
          color: '#155724',
          marginBottom: '10px'
        }}>
          ✅ {success}
          <button
            onClick={() => setSuccess('')}
            style={{ marginLeft: '10px', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
      )}

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        borderBottom: '2px solid #eee',
        paddingBottom: '10px',
        flexWrap: 'wrap'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 20px',
              backgroundColor: activeTab === tab.id ? '#007bff' : 'transparent',
              color: activeTab === tab.id ? 'white' : '#333',
              border: activeTab === tab.id ? 'none' : '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: activeTab === tab.id ? 'bold' : 'normal'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>
      ) : (
        <>
          {/* Dashboard */}
          {activeTab === 'dashboard' && stats && (
            <div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                marginBottom: '30px'
              }}>
                <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <h4>Total Users</h4>
                  <p style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.users?.total || 0}</p>
                </div>
                <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <h4>Total Questions</h4>
                  <p style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.questions?.total || 0}</p>
                  <small>Pending: {stats.questions?.pending || 0}</small>
                </div>
                <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <h4>Total Purchases</h4>
                  <p style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.purchases?.total || 0}</p>
                  <small>Active: {stats.purchases?.active || 0}</small>
                </div>
                <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <h4>Coins</h4>
                  <p style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.coins?.total_available || 0}</p>
                  <small>Spent: {stats.coins?.total_spent || 0}</small>
                </div>
              </div>

              {/* Recent Purchases */}
              <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h4>Recent Purchases</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #ddd' }}>
                      <th style={{ padding: '10px', textAlign: 'left' }}>User</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Subject</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Exam</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Coins</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recent_purchases?.map(p => (
                      <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '10px' }}>{p.username}</td>
                        <td style={{ padding: '10px' }}>{p.subject}</td>
                        <td style={{ padding: '10px' }}>{p.exam_type}</td>
                        <td style={{ padding: '10px' }}>{p.coins_spent}</td>
                        <td style={{ padding: '10px' }}>{new Date(p.purchase_date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Approvals */}
          {activeTab === 'approvals' && (
            <div>
              <h3>Pending Approvals ({pendingQuestions.length})</h3>
              {pendingQuestions.length === 0 ? (
                <p>No pending questions</p>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                  gap: '20px'
                }}>
                  {pendingQuestions.map(q => (
                    <div key={q.id} style={{
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      padding: '15px',
                      background: '#fff'
                    }}>
                      <h4>{q.subject} - {q.exam_type}</h4>
                      <p><strong>University:</strong> {q.university}</p>
                      <p><strong>Course:</strong> {q.course}</p>
                      <p><strong>Year:</strong> {q.year} | <strong>Semester:</strong> {q.semester}</p>
                      {q.images && q.images.length > 0 && (
                        <div style={{ marginTop: '10px' }}>
                          <img
                            src={`${API_BASE}/uploads/${q.images[0].file_name}`}
                            alt="Question"
                            style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'contain' }}
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button
                          onClick={() => handleApprove(q.id)}
                          style={{ flex: 1, padding: '8px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          ✅ Approve
                        </button>
                        <button
                          onClick={() => handleReject(q.id)}
                          style={{ flex: 1, padding: '8px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          ❌ Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Questions */}
          {activeTab === 'questions' && (
            <div>
              <h3>All Questions ({allQuestions.length})</h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '20px'
              }}>
                {allQuestions.map(q => (
                  <div key={q.id} style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '15px',
                    background: '#fff'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: 0 }}>{q.subject}</h4>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        backgroundColor: q.status === 'approved' ? '#28a745' : 
                                      q.status === 'pending' ? '#ffc107' : '#dc3545',
                        color: q.status === 'pending' ? '#333' : 'white'
                      }}>
                        {q.status}
                      </span>
                    </div>
                    <p><strong>Exam:</strong> {q.exam_type}</p>
                    <p><strong>Course:</strong> {q.course}</p>
                    <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
                      <button
                        onClick={() => handleDelete(q.id)}
                        style={{ padding: '4px 8px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                      >
                        🗑️ Delete
                      </button>
                      {q.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(q.id)}
                            style={{ padding: '4px 8px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                          >
                            ✅ Approve
                          </button>
                          <button
                            onClick={() => handleReject(q.id)}
                            style={{ padding: '4px 8px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                          >
                            ❌ Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Users */}
          {activeTab === 'users' && (
            <div>
              <h3>All Users ({users.length})</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden' }}>
                  <thead style={{ background: '#f8f9fa' }}>
                    <tr>
                      <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Username</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Mobile</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Coins</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px' }}>{u.id}</td>
                        <td style={{ padding: '12px' }}>{u.username}</td>
                        <td style={{ padding: '12px' }}>{u.email}</td>
                        <td style={{ padding: '12px' }}>{u.mobile}</td>
                        <td style={{ padding: '12px' }}>{u.coins}</td>
                        <td style={{ padding: '12px' }}>{u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 🪙 Manage Coins - UPDATED WITH NEW PACKAGES */}
          {activeTab === 'coins' && (
            <div>
              <h3>🪙 Manage User Coins</h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px'
              }}>
                {/* Add Coins with Package */}
                <div style={{
                  background: '#fff',
                  padding: '20px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <h4>💰 Add Coins (Package)</h4>
                  <p style={{ color: '#666', fontSize: '14px' }}>
                    Add coins using predefined packages
                  </p>
                  
                  <form onSubmit={handleAddCoins}>
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Username *
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          value={userSearchTerm}
                          onChange={(e) => setUserSearchTerm(e.target.value)}
                          onFocus={() => userSearchTerm && setShowUserDropdown(true)}
                          placeholder="Search username..."
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            boxSizing: 'border-box'
                          }}
                        />
                        {showUserDropdown && filteredUsers.length > 0 && (
                          <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            background: 'white',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            maxHeight: '200px',
                            overflowY: 'auto',
                            zIndex: 10,
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                          }}>
                            {filteredUsers.map(user => (
                              <div
                                key={user.id}
                                onClick={() => handleSelectUser(user)}
                                style={{
                                  padding: '8px 12px',
                                  cursor: 'pointer',
                                  borderBottom: '1px solid #eee',
                                  display: 'flex',
                                  justifyContent: 'space-between'
                                }}
                                onMouseEnter={(e) => e.target.style.background = '#f0f0f0'}
                                onMouseLeave={(e) => e.target.style.background = 'white'}
                              >
                                <span>{user.username}</span>
                                <span style={{ color: '#666', fontSize: '12px' }}>
                                  {user.coins} coins
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {selectedUser && (
                        <div style={{ marginTop: '5px', fontSize: '12px', color: '#28a745' }}>
                          ✅ Selected: {selectedUser.username} (Current coins: {selectedUser.coins})
                        </div>
                      )}
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Select Package *
                      </label>
                      <select
                        value={coinAmount}
                        onChange={(e) => setCoinAmount(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          boxSizing: 'border-box'
                        }}
                        required
                      >
                        <option value="">Select package</option>
                        {Object.entries(COIN_PACKAGES).map(([amount, info]) => (
                          <option key={amount} value={amount}>
                            {amount === '0' ? `🎁 Free Bonus (${info.coins} coins)` : `${info.label} (${info.coins} coins)`}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Description (Optional)
                      </label>
                      <input
                        type="text"
                        value={coinDescription}
                        onChange={(e) => setCoinDescription(e.target.value)}
                        placeholder="e.g., Bonus for good performance"
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !coinUsername || !coinAmount}
                      style={{
                        width: '100%',
                        padding: '10px',
                        background: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading || !coinUsername || !coinAmount ? 'not-allowed' : 'pointer',
                        opacity: loading || !coinUsername || !coinAmount ? 0.6 : 1
                      }}
                    >
                      {loading ? 'Processing...' : '💰 Add Package Coins'}
                    </button>
                  </form>
                </div>

                {/* Add Custom Coins */}
                <div style={{
                  background: '#fff',
                  padding: '20px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <h4>⭐ Add Custom Coins</h4>
                  <p style={{ color: '#666', fontSize: '14px' }}>
                    Add any number of coins (overrides package system)
                  </p>
                  
                  <form onSubmit={handleAddCustomCoins}>
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Username *
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          value={userSearchTerm}
                          onChange={(e) => setUserSearchTerm(e.target.value)}
                          onFocus={() => userSearchTerm && setShowUserDropdown(true)}
                          placeholder="Search username..."
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            boxSizing: 'border-box'
                          }}
                        />
                        {showUserDropdown && filteredUsers.length > 0 && (
                          <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            background: 'white',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            maxHeight: '200px',
                            overflowY: 'auto',
                            zIndex: 10,
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                          }}>
                            {filteredUsers.map(user => (
                              <div
                                key={user.id}
                                onClick={() => handleSelectUser(user)}
                                style={{
                                  padding: '8px 12px',
                                  cursor: 'pointer',
                                  borderBottom: '1px solid #eee',
                                  display: 'flex',
                                  justifyContent: 'space-between'
                                }}
                                onMouseEnter={(e) => e.target.style.background = '#f0f0f0'}
                                onMouseLeave={(e) => e.target.style.background = 'white'}
                              >
                                <span>{user.username}</span>
                                <span style={{ color: '#666', fontSize: '12px' }}>
                                  {user.coins} coins
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {selectedUser && (
                        <div style={{ marginTop: '5px', fontSize: '12px', color: '#28a745' }}>
                          ✅ Selected: {selectedUser.username} (Current coins: {selectedUser.coins})
                        </div>
                      )}
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Number of Coins *
                      </label>
                      <input
                        type="number"
                        value={customCoins}
                        onChange={(e) => setCustomCoins(e.target.value)}
                        placeholder="Enter number of coins"
                        min="1"
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          boxSizing: 'border-box'
                        }}
                        required
                      />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Description (Optional)
                      </label>
                      <input
                        type="text"
                        value={coinDescription}
                        onChange={(e) => setCoinDescription(e.target.value)}
                        placeholder="e.g., Special bonus"
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !coinUsername || !customCoins}
                      style={{
                        width: '100%',
                        padding: '10px',
                        background: '#6c5ce7',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading || !coinUsername || !customCoins ? 'not-allowed' : 'pointer',
                        opacity: loading || !coinUsername || !customCoins ? 0.6 : 1
                      }}
                    >
                      {loading ? 'Processing...' : '⭐ Add Custom Coins'}
                    </button>
                  </form>
                </div>
              </div>

              {/* Quick Stats & Package Reference */}
              <div style={{
                marginTop: '20px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px'
              }}>
                <div style={{
                  padding: '15px',
                  background: '#e3f2fd',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                    {users.reduce((sum, u) => sum + (u.coins || 0), 0)}
                  </div>
                  <div style={{ color: '#666' }}>Total Coins in System</div>
                </div>
                <div style={{
                  padding: '15px',
                  background: '#e8f5e9',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                    {users.filter(u => (u.coins || 0) > 0).length}
                  </div>
                  <div style={{ color: '#666' }}>Users with Coins</div>
                </div>
                <div style={{
                  padding: '15px',
                  background: '#fff3e0',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                    {users.length}
                  </div>
                  <div style={{ color: '#666' }}>Total Users</div>
                </div>
              </div>

              {/* Coin Packages Reference - UPDATED */}
              <div style={{
                marginTop: '20px',
                padding: '20px',
                background: '#fff',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <h4>📦 Coin Packages Reference</h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '10px',
                  marginTop: '10px'
                }}>
                  {Object.entries(COIN_PACKAGES).map(([amount, info]) => (
                    <div 
                      key={amount} 
                      style={{ 
                        padding: '10px', 
                        background: amount === '0' ? '#fff3cd' : '#f8f9fa', 
                        borderRadius: '4px', 
                        textAlign: 'center',
                        border: amount === '0' ? '2px solid #ffc107' : '1px solid #eee'
                      }}
                    >
                      <div>
                        <strong>{amount === '0' ? '🎁 Free' : `${amount} Taka`}</strong>
                      </div>
                      <div style={{ color: '#28a745', fontSize: '18px', fontWeight: 'bold' }}>
                        {info.coins} coins
                      </div>
                      {amount !== '0' && (
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {Math.round(info.coins / amount)} coins/Taka
                        </div>
                      )}
                      {amount === '0' && (
                        <div style={{ fontSize: '12px', color: '#856404' }}>
                          Welcome Bonus
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div style={{ 
                  marginTop: '10px', 
                  padding: '10px', 
                  background: '#f8f9fa', 
                  borderRadius: '4px',
                  fontSize: '14px',
                  color: '#666'
                }}>
                  💡 <strong>Note:</strong> Coins expire after {parseFloat(0.5 * 24)} hours (0.5 days) of inactivity
                </div>
              </div>
            </div>
          )}

          {/* Backup */}
          {activeTab === 'backup' && (
            <div>
              <h3>💾 Backup & Restore</h3>
              
              <div style={{ marginBottom: '20px' }}>
                <button
                  onClick={handleCreateBackup}
                  style={{
                    padding: '10px 20px',
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  💾 Create Backup
                </button>
              </div>

              <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h4>Available Backups ({backups.length})</h4>
                {backups.length === 0 ? (
                  <p>No backups found</p>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #ddd' }}>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Filename</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Size</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Created</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {backups.map(b => (
                        <tr key={b.filename} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '10px' }}>{b.filename}</td>
                          <td style={{ padding: '10px' }}>{(b.size / 1024).toFixed(2)} KB</td>
                          <td style={{ padding: '10px' }}>{new Date(b.created_at).toLocaleString()}</td>
                          <td style={{ padding: '10px' }}>
                            <button
                              onClick={() => handleDownloadBackup(b.filename)}
                              style={{ marginRight: '5px', padding: '4px 8px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                            >
                              ⬇️ Download
                            </button>
                            <button
                              onClick={() => handleDeleteBackup(b.filename)}
                              style={{ padding: '4px 8px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                            >
                              🗑️ Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* Bulk Upload */}
          {activeTab === 'bulk_upload' && (
            <div>
              <h3>📤 Bulk Upload Questions</h3>
              
              <div style={{
                background: '#fff',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                marginBottom: '20px'
              }}>
                <div style={{ marginBottom: '15px' }}>
                  <h4>📋 Instructions:</h4>
                  <ul style={{ lineHeight: '1.8' }}>
                    <li><strong>Multi-page support:</strong> Questions can have multiple pages</li>
                    <li><strong>Filename format:</strong> <code>university_subject_course_year_semester_examtype_pagenumber.extension</code></li>
                    <li><strong>Example:</strong> <code>HSTU_ECE_Digital Communication_2025_5_1.jpg</code></li>
                    <li><strong>Multi-page example:</strong> 
                      <br/><code>HSTU_ECE_Digital Communication_2025_5_1.jpg</code> (page 1)
                      <br/><code>HSTU_ECE_Digital Communication_2025_5_2.jpg</code> (page 2)
                    </li>
                    <li><strong>Page numbers:</strong> Must start from 1 and be consecutive</li>
                    <li><strong>Auto-approved:</strong> Admin uploads are automatically approved</li>
                    <li><strong>Duplicate Detection:</strong> Questions with same university, subject, course, year, semester, and exam type will be automatically skipped</li>
                    <li>Maximum 100 files per upload</li>
                    <li>Each file must be less than 10MB</li>
                    <li>Supported formats: PNG, JPG, JPEG, WEBP</li>
                  </ul>
                </div>

                {/* Skip Duplicates Toggle */}
                <div style={{ 
                  marginBottom: '15px', 
                  padding: '15px', 
                  background: '#f8f9fa', 
                  borderRadius: '8px',
                  border: '1px solid #dee2e6'
                }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={skipDuplicates}
                      onChange={(e) => setSkipDuplicates(e.target.checked)}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <span style={{ fontWeight: 'bold' }}>Skip duplicate questions (recommended)</span>
                  </label>
                  {!skipDuplicates && (
                    <div style={{ 
                      fontSize: '13px', 
                      color: '#dc3545', 
                      marginTop: '5px',
                      padding: '8px',
                      background: '#fff3f3',
                      borderRadius: '4px'
                    }}>
                      ⚠️ Warning: Re-uploading duplicates will create duplicate entries in the database
                    </div>
                  )}
                  {skipDuplicates && (
                    <div style={{ 
                      fontSize: '13px', 
                      color: '#28a745', 
                      marginTop: '5px',
                      padding: '8px',
                      background: '#f0fff0',
                      borderRadius: '4px'
                    }}>
                      ✅ Questions already existing in the database will be automatically skipped
                    </div>
                  )}
                </div>
                
                <div style={{
                  border: '2px dashed #ddd',
                  padding: '40px',
                  textAlign: 'center',
                  borderRadius: '8px',
                  background: '#fafafa'
                }}>
                  <input
                    type="file"
                    multiple
                    accept=".png,.jpg,.jpeg,.webp"
                    onChange={handleBulkUpload}
                    style={{
                      display: 'none',
                    }}
                    id="bulk-upload-input"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="bulk-upload-input"
                    style={{
                      cursor: uploading ? 'not-allowed' : 'pointer',
                      display: 'block',
                      padding: '20px'
                    }}
                  >
                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>📁</div>
                    <div style={{ fontSize: '16px', color: '#666' }}>
                      {uploading ? 'Uploading...' : 'Click or drag files here to upload'}
                    </div>
                    <div style={{ fontSize: '14px', color: '#999', marginTop: '10px' }}>
                      Supported formats: PNG, JPG, JPEG, WEBP (Max 10MB each)
                    </div>
                    <div style={{ fontSize: '14px', color: '#999', marginTop: '5px' }}>
                      Max 100 files per upload
                    </div>
                  </label>
                </div>
                
                {/* Upload Progress */}
                {uploading && (
                  <div style={{ marginTop: '20px' }}>
                    <div style={{
                      width: '100%',
                      height: '20px',
                      backgroundColor: '#f0f0f0',
                      borderRadius: '10px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${uploadProgress}%`,
                        height: '100%',
                        backgroundColor: '#007bff',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                    <div style={{ marginTop: '5px', color: '#666' }}>
                      Uploading: {uploadProgress}%
                    </div>
                  </div>
                )}
              </div>
              
              {/* Upload Summary */}
              {uploadSummary && (
                <div style={{
                  background: '#fff',
                  padding: '20px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  marginBottom: '20px'
                }}>
                  <h4>📊 Upload Summary</h4>
                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    <div>
                      <span style={{ color: '#666' }}>Questions: </span>
                      <strong>{uploadSummary.totalQuestions}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#666' }}>Files: </span>
                      <strong>{uploadSummary.totalFiles}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#28a745' }}>✅ Successful: </span>
                      <strong>{uploadSummary.successful}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#ffc107' }}>⏭️ Skipped (Duplicates): </span>
                      <strong>{uploadSummary.skipped || 0}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#dc3545' }}>❌ Failed: </span>
                      <strong>{uploadSummary.failed}</strong>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Upload Results */}
              {uploadResults && uploadResults.length > 0 && (
                <div style={{
                  background: '#fff',
                  padding: '20px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <h4>📝 Upload Details</h4>
                  
                  <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    {uploadResults.map((result, index) => (
                      <div
                        key={index}
                        style={{
                          padding: '12px',
                          borderBottom: '1px solid #eee',
                          backgroundColor: result.status === 'success' ? '#f8fff8' : 
                                         result.status === 'skipped' ? '#fffbf0' : '#fff8f8'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                          <span style={{
                            fontSize: '20px',
                            color: result.status === 'success' ? '#28a745' : 
                                   result.status === 'skipped' ? '#ffc107' : '#dc3545'
                          }}>
                            {result.status === 'success' ? '✅' : 
                             result.status === 'skipped' ? '⏭️' : '❌'}
                          </span>
                          <div style={{ flex: 1 }}>
                            <div>
                              <strong>{result.question || result.file || 'Unknown'}</strong>
                            </div>
                            {result.status === 'success' && (
                              <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                                <div>Question ID: {result.question_id}</div>
                                <div>Total Pages: {result.total_pages || 1}</div>
                                {result.parsed_data && (
                                  <div style={{ fontSize: '12px', color: '#999' }}>
                                    {result.parsed_data.university} | {result.parsed_data.subject} | {result.parsed_data.course}
                                    <br />
                                    Year: {result.parsed_data.year} | Semester: {result.parsed_data.semester} | Exam: {result.parsed_data.exam_type}
                                  </div>
                                )}
                                <div style={{ fontSize: '12px', color: '#28a745', marginTop: '4px' }}>
                                  Status: Approved ✓
                                </div>
                              </div>
                            )}
                            {result.status === 'skipped' && (
                              <div style={{ fontSize: '13px', color: '#856404', marginTop: '4px' }}>
                                <div>⏭️ {result.message}</div>
                                {result.existing_id && (
                                  <div style={{ fontSize: '12px', color: '#999' }}>
                                    Existing Question ID: {result.existing_id}
                                  </div>
                                )}
                              </div>
                            )}
                            {result.status === 'error' && (
                              <div style={{ fontSize: '13px', color: '#dc3545', marginTop: '4px' }}>
                                {result.message}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminPanel;