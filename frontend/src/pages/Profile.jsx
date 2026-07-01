// pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";

const Profile = () => {
  const { user, isLoggedIn, coinBalance, updateCoins } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [purchases, setPurchases] = useState([]);

  // Fetch user data on mount
  useEffect(() => {
    if (isLoggedIn) {
      fetchUserData();
      fetchTransactions();
      fetchPurchases();
    }
  }, [isLoggedIn]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      // Fetch user details from backend
      // const response = await axios.get(`${API_BASE}/user/me`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // updateCoins(response.data.coins);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/premium/coins/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(response.data.transactions || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const fetchPurchases = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/premium/purchases`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPurchases(response.data.purchases || []);
    } catch (error) {
      console.error("Error fetching purchases:", error);
    }
  };

  // Handle coin recharge
  const handleRecharge = async () => {
    const amount = prompt("Enter recharge amount (20, 50, 100, 200, 500):");
    const numAmount = parseInt(amount);
    
    if (!amount || !numAmount || ![20, 50, 100, 200, 500].includes(numAmount)) {
      alert("Please enter a valid amount (20, 50, 100, 200, or 500)");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE}/premium/coins/recharge`,
        null,
        {
          params: { amount_taka: numAmount },
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      updateCoins(response.data.new_balance);
      setMessage(`✅ Successfully recharged ${response.data.coins_received || numAmount * 2} coins!`);
      fetchTransactions();
      
    } catch (err) {
      setMessage(`❌ Recharge failed: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('✅ Copied to clipboard!');
  };

  if (!isLoggedIn) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <h2>Please Login</h2>
          <p>You need to be logged in to view your profile.</p>
          <a href="/user" className="btn btn-primary">Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row">
        {/* Profile Header */}
        <div className="col-12">
          <div className="card shadow-sm mb-4">
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-4">
                <img
                  src={`https://ui-avatars.com/api/?name=${user?.username || 'User'}&size=80&background=22c55e&color=fff&bold=true`}
                  alt="Profile"
                  className="rounded-circle"
                  style={{ width: '80px', height: '80px' }}
                />
                <div className="flex-grow-1">
                  <h2 className="mb-1">{user?.username || 'User'}</h2>
                  <p className="text-muted mb-0">Member since {new Date().toLocaleDateString()}</p>
                </div>
                <div className="text-end">
                  <div className="bg-success text-white p-3 rounded-3">
                    <h4 className="mb-0">🪙 {coinBalance}</h4>
                    <small>Coins Balance</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-body text-center">
              <h3 className="text-primary">{purchases.length}</h3>
              <p className="text-muted mb-0">Total Purchases</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-body text-center">
              <h3 className="text-success">{transactions.filter(t => t.amount > 0).length}</h3>
              <p className="text-muted mb-0">Recharges</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-body text-center">
              <button 
                className="btn btn-success w-100"
                onClick={handleRecharge}
                disabled={loading}
              >
                {loading ? 'Processing...' : '💰 Recharge Coins'}
              </button>
              {message && (
                <div className={`mt-2 alert ${message.includes('✅') ? 'alert-success' : 'alert-danger'} p-2 small`}>
                  {message}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="col-12 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-transparent">
              <h5 className="mb-0">📊 Recent Transactions</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.length > 0 ? (
                      transactions.slice(0, 10).map((t, index) => (
                        <tr key={index}>
                          <td>{new Date(t.created_at).toLocaleDateString()}</td>
                          <td>
                            <span className={`badge ${t.amount > 0 ? 'bg-success' : 'bg-danger'}`}>
                              {t.transaction_type}
                            </span>
                          </td>
                          <td className={t.amount > 0 ? 'text-success' : 'text-danger'}>
                            {t.amount > 0 ? '+' : ''}{t.amount}
                          </td>
                          <td className="text-truncate" style={{ maxWidth: '200px' }}>
                            {t.description || '-'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center text-muted py-3">
                          No transactions yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Purchases */}
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-transparent d-flex justify-content-between align-items-center">
              <h5 className="mb-0">📚 Recent Premium Purchases</h5>
              <span className="badge bg-primary">{purchases.length}</span>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Subject</th>
                      <th>Questions</th>
                      <th>Coins Spent</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.length > 0 ? (
                      purchases.slice(0, 10).map((p, index) => (
                        <tr key={index}>
                          <td>{new Date(p.purchase_date).toLocaleDateString()}</td>
                          <td>{p.subject}</td>
                          <td>{p.total_questions}</td>
                          <td className="text-danger">-{p.coins_spent}</td>
                          <td>
                            <span className={`badge ${p.is_active === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                              {p.is_active}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center text-muted py-3">
                          No purchases yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-12 mt-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="mb-3">⚡ Quick Actions</h5>
              <div className="d-flex gap-2 flex-wrap">
                <button 
                  className="btn btn-outline-primary"
                  onClick={() => window.open('/premium', '_blank')}
                >
                  🔍 Premium Search
                </button>
                <button 
                  className="btn btn-outline-success"
                  onClick={() => window.open('/upload', '_blank')}
                >
                  📤 Upload Questions
                </button>
                <button 
                  className="btn btn-outline-info"
                  onClick={() => {
                    const referralLink = `${window.location.origin}/?ref=${user?.username}`;
                    copyToClipboard(referralLink);
                  }}
                >
                  🔗 Share Referral
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;