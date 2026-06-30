// // frontend/src/components/AdminPanel.jsx
// import React, { useState, useEffect, useCallback } from 'react';
// import axios from 'axios';

// const API_BASE = "http://127.0.0.1:8000";
// const ADMIN_SECRET = "x7k9m2p4q8w5v3n1";

// const AdminPanel = () => {
//   const [activeTab, setActiveTab] = useState('dashboard');
//   const [loading, setLoading] = useState(false);
//   const [data, setData] = useState({
//     stats: null,
//     pendingQuestions: [],
//     allQuestions: [],
//     users: []
//   });
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [selectedQuestion, setSelectedQuestion] = useState(null);
//   const [previewData, setPreviewData] = useState(null);
//   const [showPreview, setShowPreview] = useState(false);
//   const [rewardCoins, setRewardCoins] = useState('');
//   const [showRewardModal, setShowRewardModal] = useState(false);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [manualCoins, setManualCoins] = useState('');

//   const getAuthHeaders = () => ({
//     headers: { 
//       Authorization: `Bearer ${localStorage.getItem('token')}` 
//     }
//   });

//   // Fetch data
//   const fetchStats = useCallback(async () => {
//     try {
//       const res = await axios.get(
//         `${API_BASE}/${ADMIN_SECRET}/admin/stats`,
//         getAuthHeaders()
//       );
//       setData(prev => ({ ...prev, stats: res.data }));
//     } catch (err) {
//       setError('Failed to fetch stats');
//     }
//   }, []);

//   const fetchPendingQuestions = useCallback(async () => {
//     try {
//       const res = await axios.get(
//         `${API_BASE}/${ADMIN_SECRET}/admin/questions/pending`,
//         getAuthHeaders()
//       );
//       setData(prev => ({ ...prev, pendingQuestions: res.data.questions || [] }));
//     } catch (err) {
//       setError('Failed to fetch pending questions');
//     }
//   }, []);

//   const fetchAllQuestions = useCallback(async () => {
//     try {
//       const res = await axios.get(
//         `${API_BASE}/${ADMIN_SECRET}/admin/questions?limit=100`,
//         getAuthHeaders()
//       );
//       setData(prev => ({ ...prev, allQuestions: res.data.questions || [] }));
//     } catch (err) {
//       setError('Failed to fetch questions');
//     }
//   }, []);

//   const fetchUsers = useCallback(async () => {
//     try {
//       const res = await axios.get(
//         `${API_BASE}/${ADMIN_SECRET}/admin/users?limit=100`,
//         getAuthHeaders()
//       );
//       setData(prev => ({ ...prev, users: res.data.users || [] }));
//     } catch (err) {
//       setError('Failed to fetch users');
//     }
//   }, []);

//   const loadAllData = useCallback(async () => {
//     setLoading(true);
//     setError('');
//     try {
//       await Promise.all([
//         fetchStats(),
//         fetchPendingQuestions(),
//         fetchAllQuestions(),
//         fetchUsers()
//       ]);
//     } catch (err) {
//       setError('Failed to load data');
//     } finally {
//       setLoading(false);
//     }
//   }, [fetchStats, fetchPendingQuestions, fetchAllQuestions, fetchUsers]);

//   useEffect(() => {
//     loadAllData();
//   }, [loadAllData]);

//   // Preview question
//   const handlePreview = async (questionId) => {
//     try {
//       const res = await axios.get(
//         `${API_BASE}/${ADMIN_SECRET}/admin/questions/pending/${questionId}/preview`,
//         getAuthHeaders()
//       );
//       setPreviewData(res.data);
//       setShowPreview(true);
//     } catch (err) {
//       setError('Failed to preview question');
//     }
//   };

//   // Check duplicate
//   const handleCheckDuplicate = async (questionId) => {
//     try {
//       const res = await axios.post(
//         `${API_BASE}/${ADMIN_SECRET}/admin/questions/pending/${questionId}/check-duplicate`,
//         {},
//         getAuthHeaders()
//       );
      
//       if (res.data.is_duplicate) {
//         alert(`⚠️ DUPLICATE FOUND!\n\nFound ${res.data.count} similar question(s):\n${res.data.duplicates.map(d => 
//           `- ${d.subject} (${d.exam_type}) - Uploaded by: ${d.uploaded_by}`
//         ).join('\n')}`);
//       } else {
//         alert('✅ No duplicate found. You can approve this question.');
//       }
//     } catch (err) {
//       setError('Failed to check duplicate');
//     }
//   };

//   // Approve with reward
//   const handleApprove = async (questionId) => {
//     // Show reward options
//     const examType = data.pendingQuestions.find(q => q.id === questionId)?.exam_type || '';
//     let defaultReward = 5;
//     if (examType.toLowerCase() === 'mid') defaultReward = 10;
//     if (examType.toLowerCase() === 'final') defaultReward = 15;
    
//     const reward = prompt(`Enter reward coins for this question (Default: ${defaultReward}):`, defaultReward);
//     if (reward === null) return;
    
//     const coins = parseInt(reward);
//     if (isNaN(coins) || coins < 0) {
//       alert('Please enter a valid number');
//       return;
//     }
    
//     try {
//       const formData = new FormData();
//       formData.append('reward_coins', coins);
      
//       await axios.post(
//         `${API_BASE}/${ADMIN_SECRET}/admin/questions/pending/${questionId}/approve`,
//         formData,
//         getAuthHeaders()
//       );
      
//       setSuccess(`Question approved! ${coins} coins rewarded to uploader.`);
//       await loadAllData();
//     } catch (err) {
//       setError('Failed to approve question');
//     }
//   };

//   // Reject
//   const handleReject = async (questionId) => {
//     const reason = prompt('Reason for rejection:');
//     if (!reason) return;
    
//     try {
//       await axios.post(
//         `${API_BASE}/${ADMIN_SECRET}/admin/questions/pending/${questionId}/reject`,
//         { reason },
//         getAuthHeaders()
//       );
//       setSuccess('Question rejected!');
//       await loadAllData();
//     } catch (err) {
//       setError('Failed to reject question');
//     }
//   };

//   // Delete
//   const handleDelete = async (questionId) => {
//     if (!window.confirm('Delete this question permanently?')) return;
    
//     try {
//       await axios.delete(
//         `${API_BASE}/${ADMIN_SECRET}/admin/questions/pending/${questionId}`,
//         getAuthHeaders()
//       );
//       setSuccess('Question deleted!');
//       await loadAllData();
//     } catch (err) {
//       setError('Failed to delete question');
//     }
//   };

//   // Manual reward
//   const handleManualReward = async (userId) => {
//     const coins = prompt('Enter coins to reward:');
//     if (!coins) return;
    
//     const amount = parseInt(coins);
//     if (isNaN(amount) || amount <= 0) {
//       alert('Please enter a valid number');
//       return;
//     }
    
//     const description = prompt('Description:');
//     if (description === null) return;
    
//     try {
//       const formData = new FormData();
//       formData.append('coins', amount);
//       formData.append('description', description || 'Manual reward');
      
//       await axios.post(
//         `${API_BASE}/${ADMIN_SECRET}/admin/users/${userId}/reward`,
//         formData,
//         getAuthHeaders()
//       );
      
//       setSuccess(`Rewarded ${amount} coins to user!`);
//       await loadAllData();
//     } catch (err) {
//       setError('Failed to reward user');
//     }
//   };

//   // Render dashboard
//   const renderDashboard = () => {
//     const { stats } = data;
//     if (!stats) return <p>No data</p>;

//     return (
//       <div>
//         <div style={{
//           display: 'grid',
//           gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
//           gap: '20px',
//           marginBottom: '30px'
//         }}>
//           <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
//             <h4>Total Users</h4>
//             <p style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.users?.total || 0}</p>
//           </div>
//           <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
//             <h4>Total Questions</h4>
//             <p style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.questions?.total || 0}</p>
//             <small style={{ color: '#ffc107' }}>⏳ {stats.questions?.pending || 0} pending</small>
//           </div>
//           <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
//             <h4>Approved</h4>
//             <p style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.questions?.approved || 0}</p>
//           </div>
//           <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
//             <h4>Total Coins</h4>
//             <p style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.coins?.total_available || 0}</p>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // Render pending questions
//   const renderPendingQuestions = () => {
//     const { pendingQuestions } = data;

//     return (
//       <div>
//         <h3>Pending Approvals ({pendingQuestions.length})</h3>
//         {pendingQuestions.length === 0 ? (
//           <p>No pending questions</p>
//         ) : (
//           <div style={{
//             display: 'grid',
//             gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
//             gap: '20px'
//           }}>
//             {pendingQuestions.map(q => (
//               <div key={q.id} style={{
//                 border: '1px solid #ddd',
//                 borderRadius: '8px',
//                 padding: '20px',
//                 background: '#fff',
//                 boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
//               }}>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
//                   <h4 style={{ margin: '0 0 10px 0' }}>{q.subject} - {q.exam_type}</h4>
//                   <span style={{
//                     padding: '2px 8px',
//                     borderRadius: '12px',
//                     fontSize: '12px',
//                     background: '#ffc107',
//                     color: '#333'
//                   }}>
//                     Pending
//                   </span>
//                 </div>
                
//                 <p style={{ margin: '5px 0' }}><strong>University:</strong> {q.university}</p>
//                 <p style={{ margin: '5px 0' }}><strong>Course:</strong> {q.course}</p>
//                 <p style={{ margin: '5px 0' }}><strong>Year:</strong> {q.year} | <strong>Semester:</strong> {q.semester}</p>
//                 <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
//                   <strong>Uploaded by:</strong> {q.uploaded_by || 'Unknown'}
//                 </p>
//                 <p style={{ margin: '5px 0', fontSize: '12px', color: '#999' }}>
//                   Uploaded: {q.uploaded_at ? new Date(q.uploaded_at).toLocaleString() : 'N/A'}
//                 </p>

//                 {q.images && q.images.length > 0 && (
//                   <div style={{ 
//                     marginTop: '10px', 
//                     padding: '10px', 
//                     background: '#f8f9fa', 
//                     borderRadius: '4px',
//                     display: 'flex',
//                     alignItems: 'center',
//                     gap: '10px',
//                     flexWrap: 'wrap'
//                   }}>
//                     <img
//                       src={`${API_BASE}/uploads/${q.images[0].file_name}`}
//                       alt="Question"
//                       style={{ 
//                         maxWidth: '100px', 
//                         maxHeight: '100px', 
//                         objectFit: 'contain',
//                         border: '1px solid #ddd',
//                         borderRadius: '4px'
//                       }}
//                       onError={(e) => e.target.style.display = 'none'}
//                     />
//                     <button
//                       onClick={() => handlePreview(q.id)}
//                       style={{
//                         padding: '6px 12px',
//                         background: '#007bff',
//                         color: 'white',
//                         border: 'none',
//                         borderRadius: '4px',
//                         cursor: 'pointer',
//                         fontSize: '12px'
//                       }}
//                     >
//                       🔍 Preview Full
//                     </button>
//                   </div>
//                 )}

//                 <div style={{ 
//                   display: 'flex', 
//                   gap: '8px', 
//                   marginTop: '15px',
//                   flexWrap: 'wrap'
//                 }}>
//                   <button
//                     onClick={() => handleCheckDuplicate(q.id)}
//                     style={{
//                       padding: '6px 12px',
//                       background: '#6c757d',
//                       color: 'white',
//                       border: 'none',
//                       borderRadius: '4px',
//                       cursor: 'pointer',
//                       fontSize: '12px'
//                     }}
//                   >
//                     🔄 Check Duplicate
//                   </button>
//                   <button
//                     onClick={() => handleApprove(q.id)}
//                     style={{
//                       padding: '6px 12px',
//                       background: '#28a745',
//                       color: 'white',
//                       border: 'none',
//                       borderRadius: '4px',
//                       cursor: 'pointer',
//                       fontSize: '12px'
//                     }}
//                   >
//                     ✅ Approve & Reward
//                   </button>
//                   <button
//                     onClick={() => handleReject(q.id)}
//                     style={{
//                       padding: '6px 12px',
//                       background: '#dc3545',
//                       color: 'white',
//                       border: 'none',
//                       borderRadius: '4px',
//                       cursor: 'pointer',
//                       fontSize: '12px'
//                     }}
//                   >
//                     ❌ Reject
//                   </button>
//                   <button
//                     onClick={() => handleDelete(q.id)}
//                     style={{
//                       padding: '6px 12px',
//                       background: '#ffc107',
//                       color: '#333',
//                       border: 'none',
//                       borderRadius: '4px',
//                       cursor: 'pointer',
//                       fontSize: '12px'
//                     }}
//                   >
//                     🗑️ Delete
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     );
//   };

//   // Preview Modal
//   const renderPreviewModal = () => {
//     if (!showPreview || !previewData) return null;

//     return (
//       <div style={{
//         position: 'fixed',
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         background: 'rgba(0,0,0,0.8)',
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center',
//         zIndex: 9999
//       }}>
//         <div style={{
//           background: 'white',
//           padding: '30px',
//           borderRadius: '8px',
//           maxWidth: '90%',
//           maxHeight: '90vh',
//           overflow: 'auto'
//         }}>
//           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
//             <h2>Question Preview</h2>
//             <button
//               onClick={() => setShowPreview(false)}
//               style={{
//                 fontSize: '24px',
//                 background: 'none',
//                 border: 'none',
//                 cursor: 'pointer'
//               }}
//             >
//               ×
//             </button>
//           </div>

//           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
//             <div>
//               <p><strong>ID:</strong> {previewData.question.id}</p>
//               <p><strong>University:</strong> {previewData.question.university}</p>
//               <p><strong>Subject:</strong> {previewData.question.subject}</p>
//               <p><strong>Course:</strong> {previewData.question.course}</p>
//               <p><strong>Year:</strong> {previewData.question.year}</p>
//               <p><strong>Semester:</strong> {previewData.question.semester}</p>
//               <p><strong>Exam Type:</strong> {previewData.question.exam_type}</p>
//               <p><strong>Status:</strong> {previewData.question.status}</p>
//               <p><strong>Uploaded by:</strong> {previewData.question.uploaded_by}</p>
//               <p><strong>Uploaded at:</strong> {previewData.question.uploaded_at ? new Date(previewData.question.uploaded_at).toLocaleString() : 'N/A'}</p>
//             </div>
//             <div>
//               {previewData.images && previewData.images.length > 0 && (
//                 <div>
//                   <h4>Image</h4>
//                   <img
//                     src={previewData.images[0].image_data}
//                     alt="Question"
//                     style={{
//                       maxWidth: '100%',
//                       maxHeight: '500px',
//                       objectFit: 'contain',
//                       border: '1px solid #ddd',
//                       borderRadius: '4px'
//                     }}
//                   />
//                 </div>
//               )}
//             </div>
//           </div>

//           <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
//             <button
//               onClick={() => {
//                 setShowPreview(false);
//                 handleApprove(previewData.question.id);
//               }}
//               style={{
//                 padding: '10px 20px',
//                 background: '#28a745',
//                 color: 'white',
//                 border: 'none',
//                 borderRadius: '4px',
//                 cursor: 'pointer'
//               }}
//             >
//               ✅ Approve & Reward
//             </button>
//             <button
//               onClick={() => {
//                 setShowPreview(false);
//                 handleReject(previewData.question.id);
//               }}
//               style={{
//                 padding: '10px 20px',
//                 background: '#dc3545',
//                 color: 'white',
//                 border: 'none',
//                 borderRadius: '4px',
//                 cursor: 'pointer'
//               }}
//             >
//               ❌ Reject
//             </button>
//             <button
//               onClick={() => {
//                 setShowPreview(false);
//                 handleDelete(previewData.question.id);
//               }}
//               style={{
//                 padding: '10px 20px',
//                 background: '#ffc107',
//                 color: '#333',
//                 border: 'none',
//                 borderRadius: '4px',
//                 cursor: 'pointer'
//               }}
//             >
//               🗑️ Delete
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // Render users
//   const renderUsers = () => {
//     const { users } = data;

//     return (
//       <div>
//         <h3>All Users ({users.length})</h3>
//         <div style={{ overflowX: 'auto' }}>
//           <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px' }}>
//             <thead style={{ background: '#f8f9fa' }}>
//               <tr>
//                 <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
//                 <th style={{ padding: '12px', textAlign: 'left' }}>Username</th>
//                 <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
//                 <th style={{ padding: '12px', textAlign: 'left' }}>Coins</th>
//                 <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {users.map(u => (
//                 <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
//                   <td style={{ padding: '12px' }}>{u.id}</td>
//                   <td style={{ padding: '12px' }}>{u.username}</td>
//                   <td style={{ padding: '12px' }}>{u.email}</td>
//                   <td style={{ padding: '12px' }}>{u.coins}</td>
//                   <td style={{ padding: '12px' }}>
//                     <button
//                       onClick={() => handleManualReward(u.id)}
//                       style={{
//                         padding: '4px 8px',
//                         background: '#28a745',
//                         color: 'white',
//                         border: 'none',
//                         borderRadius: '4px',
//                         cursor: 'pointer',
//                         fontSize: '12px'
//                       }}
//                     >
//                       🎁 Reward Coins
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     );
//   };

//   // Tabs
//   const tabs = [
//     { id: 'dashboard', label: '📊 Dashboard' },
//     { id: 'pending', label: `⏳ Pending (${data.pendingQuestions.length})` },
//     { id: 'questions', label: `📝 All Questions (${data.allQuestions.length})` },
//     { id: 'users', label: `👥 Users (${data.users.length})` },
//   ];

//   return (
//     <div style={{ maxWidth: '1400px', margin: '20px auto', padding: '20px' }}>
//       <h1 style={{ marginBottom: '20px' }}>🛠️ Admin Panel</h1>

//       {error && (
//         <div style={{
//           padding: '10px',
//           backgroundColor: '#f8d7da',
//           borderRadius: '4px',
//           color: '#721c24',
//           marginBottom: '10px'
//         }}>
//           ❌ {error}
//           <button onClick={() => setError('')} style={{ marginLeft: '10px', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
//         </div>
//       )}
      
//       {success && (
//         <div style={{
//           padding: '10px',
//           backgroundColor: '#d4edda',
//           borderRadius: '4px',
//           color: '#155724',
//           marginBottom: '10px'
//         }}>
//           ✅ {success}
//           <button onClick={() => setSuccess('')} style={{ marginLeft: '10px', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
//         </div>
//       )}

//       <div style={{
//         display: 'flex',
//         gap: '10px',
//         marginBottom: '20px',
//         borderBottom: '2px solid #eee',
//         paddingBottom: '10px',
//         flexWrap: 'wrap'
//       }}>
//         {tabs.map(tab => (
//           <button
//             key={tab.id}
//             onClick={() => setActiveTab(tab.id)}
//             style={{
//               padding: '10px 20px',
//               backgroundColor: activeTab === tab.id ? '#007bff' : 'transparent',
//               color: activeTab === tab.id ? 'white' : '#333',
//               border: activeTab === tab.id ? 'none' : '1px solid #ddd',
//               borderRadius: '4px',
//               cursor: 'pointer',
//               fontWeight: activeTab === tab.id ? 'bold' : 'normal'
//             }}
//           >
//             {tab.label}
//           </button>
//         ))}
//       </div>

//       {loading ? (
//         <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>
//       ) : (
//         <>
//           {activeTab === 'dashboard' && renderDashboard()}
//           {activeTab === 'pending' && renderPendingQuestions()}
//           {activeTab === 'questions' && (
//             <div>
//               <h3>All Questions ({data.allQuestions.length})</h3>
//               <div style={{ overflowX: 'auto' }}>
//                 <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px' }}>
//                   <thead style={{ background: '#f8f9fa' }}>
//                     <tr>
//                       <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
//                       <th style={{ padding: '12px', textAlign: 'left' }}>Subject</th>
//                       <th style={{ padding: '12px', textAlign: 'left' }}>Exam</th>
//                       <th style={{ padding: '12px', textAlign: 'left' }}>University</th>
//                       <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
//                       <th style={{ padding: '12px', textAlign: 'left' }}>Uploaded By</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {data.allQuestions.map(q => (
//                       <tr key={q.id} style={{ borderBottom: '1px solid #eee' }}>
//                         <td style={{ padding: '12px' }}>{q.id}</td>
//                         <td style={{ padding: '12px' }}>{q.subject}</td>
//                         <td style={{ padding: '12px' }}>{q.exam_type}</td>
//                         <td style={{ padding: '12px' }}>{q.university}</td>
//                         <td style={{ padding: '12px' }}>
//                           <span style={{
//                             padding: '2px 8px',
//                             borderRadius: '12px',
//                             fontSize: '12px',
//                             backgroundColor: q.status === 'approved' ? '#28a745' : 
//                                           q.status === 'pending' ? '#ffc107' : '#dc3545',
//                             color: q.status === 'pending' ? '#333' : 'white'
//                           }}>
//                             {q.status}
//                           </span>
//                         </td>
//                         <td style={{ padding: '12px' }}>{q.uploaded_by}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}
//           {activeTab === 'users' && renderUsers()}
//         </>
//       )}

//       {renderPreviewModal()}
//     </div>
//   );
// };

// export default AdminPanel;




// frontend/src/components/AdminPanel.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE = "http://127.0.0.1:8000";
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
        `${API_BASE}/${ADMIN_SECRET}/admin/questions?limit=100`,
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

  // Tabs
  const tabs = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'approvals', label: `⏳ Approvals (${pendingQuestions.length})` },
    { id: 'questions', label: `📝 Questions (${allQuestions.length})` },
    { id: 'users', label: `👥 Users (${users.length})` },
    { id: 'backup', label: '💾 Backup' },
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
        </>
      )}
    </div>
  );
};

export default AdminPanel;