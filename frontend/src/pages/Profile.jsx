
// pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import { Link } from "react-router";

const API_BASE = "/api";

const Profile = () => {
  // const { user, isLoggedIn, userCoins, updateCoins } = useAuth();
  const { user, isLoggedIn, userCoins, updateCoins, fetchUserCoins } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Watch for theme changes
  useEffect(() => {
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme');
      setIsDarkMode(theme === 'dark');
    };

    checkTheme();

    const observer = new MutationObserver(() => {
      checkTheme();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => observer.disconnect();
  }, []);

  // Fetch user data on mount
  useEffect(() => {
    if (isLoggedIn) {
      fetchUserData();
      fetchTransactions();
      fetchPurchases();
      fetchUserCoins();
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
  // const handleRecharge = async () => {
  //   const amount = prompt("Enter recharge amount (20, 50, 100, 200, 500):");
  //   const numAmount = parseInt(amount);
    
  //   if (!amount || !numAmount || ![20, 50, 100, 200, 500].includes(numAmount)) {
  //     alert("Please enter a valid amount (20, 50, 100, 200, or 500)");
  //     return;
  //   }

  //   try {
  //     setLoading(true);
  //     const token = localStorage.getItem('token');
  //     const response = await axios.post(
  //       `${API_BASE}/premium/coins/recharge`,
  //       null,
  //       {
  //         params: { amount_taka: numAmount },
  //         headers: { Authorization: `Bearer ${token}` }
  //       }
  //     );
      
  //     // updateCoins(response.data.new_balance);
  //     await fetchUserCoins(); // ✅ This refreshes coins from the server
  //     setMessage(`✅ Successfully recharged ${response.data.coins_received || numAmount * 2} coins!`);
  //     fetchTransactions();
      
  //     setTimeout(() => setMessage(""), 5000);
  //   } catch (err) {
  //     setMessage(`❌ Recharge failed: ${err.response?.data?.detail || err.message}`);
  //     setTimeout(() => setMessage(""), 5000);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('✅ Copied to clipboard!');
  };

  // Theme colors
  const theme = {
    background: isDarkMode ? '#0f172a' : '#f0f2f5',
    cardBg: isDarkMode ? '#1e293b' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#1a2332',
    textSecondary: isDarkMode ? '#94a3b8' : '#6b7280',
    border: isDarkMode ? '#475569' : '#e5e7eb',
    shadow: isDarkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.06)',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    success: '#10b981',
    danger: '#ef4444',
    primary: '#667eea',
    hoverBg: isDarkMode ? '#334155' : '#f3f4f6',
  };

  if (!isLoggedIn) {
    return (
      <div style={{
        minHeight: 'calc(100vh - 200px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.background,
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px',
          backgroundColor: theme.cardBg,
          borderRadius: '16px',
          boxShadow: theme.shadow,
          maxWidth: '400px',
          border: `1px solid ${theme.border}`
        }}>
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>🔒</div>
          <h2 style={{ color: theme.text, marginBottom: '10px' }}>Please Login</h2>
          <p style={{ color: theme.textSecondary, marginBottom: '20px' }}>
            You need to be logged in to view your profile.
          </p>
          <Link 
            to="/user" 
            style={{
              display: 'inline-block',
              padding: '12px 32px',
              background: theme.gradient,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            Login Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 200px)',
      backgroundColor: theme.background,
      padding: '30px 20px',
      transition: 'all 0.3s ease',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Profile Header */}
        <div style={{
          backgroundColor: theme.cardBg,
          borderRadius: '16px',
          padding: '30px',
          boxShadow: theme.shadow,
          marginBottom: '25px',
          border: `1px solid ${theme.border}`
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '25px',
            flexWrap: 'wrap'
          }}>
            <div style={{
              position: 'relative',
              display: 'inline-block'
            }}>
              <img
                src={`https://ui-avatars.com/api/?name=${user?.username || 'User'}&size=100&background=667eea&color=fff&bold=true`}
                alt="Profile"
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  border: '4px solid #667eea'
                }}
              />
              <div style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                backgroundColor: '#10b981',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                border: '3px solid white'
              }}></div>
            </div>

            <div style={{ flex: '1' }}>
              <h2 style={{ 
                color: theme.text, 
                marginBottom: '5px',
                fontSize: '28px',
                fontWeight: '700'
              }}>
                {user?.username || 'User'}
              </h2>
              <p style={{ color: theme.textSecondary, marginBottom: '5px' }}>
                📧 {user?.email || 'user@example.com'}
              </p>
              <p style={{ color: theme.textSecondary, fontSize: '14px' }}>
                Member since {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>

            <div style={{
              backgroundColor: isDarkMode ? '#0f172a' : '#f0fdf4',
              padding: '20px 30px',
              borderRadius: '12px',
              textAlign: 'center',
              border: `1px solid ${isDarkMode ? '#334155' : '#bbf7d0'}`
            }}>
              <div style={{ fontSize: '14px', color: theme.textSecondary, marginBottom: '5px' }}>
                💰 Coins Balance
              </div>
              <div style={{
                fontSize: '36px',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {/* {coinBalance} */}
                {userCoins.total_coins}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          marginBottom: '25px'
        }}>
          <div style={{
            backgroundColor: theme.cardBg,
            padding: '20px',
            borderRadius: '12px',
            border: `1px solid ${theme.border}`,
            boxShadow: theme.shadow,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: theme.primary }}>
              {purchases.length}
            </div>
            <div style={{ color: theme.textSecondary, fontSize: '14px' }}>
              📚 Total Purchases
            </div>
          </div>

          <div style={{
            backgroundColor: theme.cardBg,
            padding: '20px',
            borderRadius: '12px',
            border: `1px solid ${theme.border}`,
            boxShadow: theme.shadow,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: theme.success }}>
              {transactions.filter(t => t.amount > 0).length}
            </div>
            <div style={{ color: theme.textSecondary, fontSize: '14px' }}>
              💳 Recharges
            </div>
          </div>

          <div style={{
            backgroundColor: theme.cardBg,
            padding: '20px',
            borderRadius: '12px',
            border: `1px solid ${theme.border}`,
            boxShadow: theme.shadow,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b' }}>
              {purchases.filter(p => p.is_active === 'active').length}
            </div>
            <div style={{ color: theme.textSecondary, fontSize: '14px' }}>
              ✅ Active Purchases
            </div>
          </div>

          {/* <div style={{
            backgroundColor: theme.cardBg,
            padding: '20px',
            borderRadius: '12px',
            border: `1px solid ${theme.border}`,
            boxShadow: theme.shadow,
            textAlign: 'center'
          }}>
            <Link
              to="/price"
              
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? '⏳ Processing...' : '💰 Recharge'}
            </Link>
            {message && (
              <div style={{
                marginTop: '10px',
                padding: '10px',
                backgroundColor: message.includes('✅') ? '#d1fae5' : '#fee2e2',
                color: message.includes('✅') ? '#065f46' : '#991b1b',
                borderRadius: '6px',
                fontSize: '13px'
              }}>
                {message}
              </div>
            )}
          </div> */}
        </div>

        {/* Recent Transactions */}
        <div style={{
          backgroundColor: theme.cardBg,
          borderRadius: '16px',
          border: `1px solid ${theme.border}`,
          boxShadow: theme.shadow,
          marginBottom: '25px',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '20px',
            borderBottom: `1px solid ${theme.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h5 style={{ margin: 0, color: theme.text, fontWeight: '600' }}>
              📊 Recent Transactions
            </h5>
            <span style={{
              padding: '4px 12px',
              backgroundColor: theme.primary,
              color: 'white',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {transactions.length} Total
            </span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              color: theme.text
            }}>
              <thead>
                <tr style={{
                  backgroundColor: isDarkMode ? '#0f172a' : '#f9fafb',
                  borderBottom: `1px solid ${theme.border}`
                }}>
                  <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '13px', color: theme.textSecondary, fontWeight: '600' }}>Date</th>
                  <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '13px', color: theme.textSecondary, fontWeight: '600' }}>Type</th>
                  <th style={{ padding: '12px 20px', textAlign: 'right', fontSize: '13px', color: theme.textSecondary, fontWeight: '600' }}>Amount</th>
                  <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '13px', color: theme.textSecondary, fontWeight: '600' }}>Description</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? (
                  transactions.slice(0, 10).map((t, index) => (
                    <tr key={index} style={{
                      borderBottom: `1px solid ${theme.border}`,
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.hoverBg}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '12px 20px', fontSize: '14px', color: theme.textSecondary }}>
                        {new Date(t.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td style={{ padding: '12px 20px' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: t.amount > 0 ? '#d1fae5' : '#fee2e2',
                          color: t.amount > 0 ? '#065f46' : '#991b1b'
                        }}>
                          {t.transaction_type || (t.amount > 0 ? 'Credit' : 'Debit')}
                        </span>
                      </td>
                      <td style={{
                        padding: '12px 20px',
                        textAlign: 'right',
                        fontWeight: '600',
                        color: t.amount > 0 ? theme.success : theme.danger
                      }}>
                        {t.amount > 0 ? '+' : ''}{t.amount}
                      </td>
                      <td style={{ padding: '12px 20px', fontSize: '14px', color: theme.textSecondary }}>
                        {t.description || '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ padding: '40px 20px', textAlign: 'center', color: theme.textSecondary }}>
                      <div style={{ fontSize: '40px', marginBottom: '10px' }}>📭</div>
                      No transactions yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Purchases */}
        <div style={{
          backgroundColor: theme.cardBg,
          borderRadius: '16px',
          border: `1px solid ${theme.border}`,
          boxShadow: theme.shadow,
          marginBottom: '25px',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '20px',
            borderBottom: `1px solid ${theme.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h5 style={{ margin: 0, color: theme.text, fontWeight: '600' }}>
              📚 Recent Premium Purchases
            </h5>
            <span style={{
              padding: '4px 12px',
              backgroundColor: theme.primary,
              color: 'white',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {purchases.length} Total
            </span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              color: theme.text
            }}>
              <thead>
                <tr style={{
                  backgroundColor: isDarkMode ? '#0f172a' : '#f9fafb',
                  borderBottom: `1px solid ${theme.border}`
                }}>
                  <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '13px', color: theme.textSecondary, fontWeight: '600' }}>Date</th>
                  <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '13px', color: theme.textSecondary, fontWeight: '600' }}>Subject</th>
                  <th style={{ padding: '12px 20px', textAlign: 'center', fontSize: '13px', color: theme.textSecondary, fontWeight: '600' }}>Questions</th>
                  <th style={{ padding: '12px 20px', textAlign: 'right', fontSize: '13px', color: theme.textSecondary, fontWeight: '600' }}>Coins Spent</th>
                  <th style={{ padding: '12px 20px', textAlign: 'center', fontSize: '13px', color: theme.textSecondary, fontWeight: '600' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {purchases.length > 0 ? (
                  purchases.slice(0, 10).map((p, index) => (
                    <tr key={index} style={{
                      borderBottom: `1px solid ${theme.border}`,
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.hoverBg}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '12px 20px', fontSize: '14px', color: theme.textSecondary }}>
                        {new Date(p.purchase_date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td style={{ padding: '12px 20px', fontWeight: '500', color: theme.text }}>
                        {p.subject || 'N/A'}
                      </td>
                      <td style={{ padding: '12px 20px', textAlign: 'center', color: theme.text }}>
                        {p.total_questions || 0}
                      </td>
                      <td style={{ 
                        padding: '12px 20px', 
                        textAlign: 'right',
                        fontWeight: '600',
                        color: theme.danger
                      }}>
                        -{p.coins_spent || 0}
                      </td>
                      <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: p.is_active === 'active' ? '#d1fae5' : '#e5e7eb',
                          color: p.is_active === 'active' ? '#065f46' : '#6b7280'
                        }}>
                          {p.is_active === 'active' ? '✅ Active' : '⏰ Expired'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ padding: '40px 20px', textAlign: 'center', color: theme.textSecondary }}>
                      <div style={{ fontSize: '40px', marginBottom: '10px' }}>📭</div>
                      No purchases yet. Start searching for premium questions!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          backgroundColor: theme.cardBg,
          borderRadius: '16px',
          border: `1px solid ${theme.border}`,
          boxShadow: theme.shadow,
          padding: '25px'
        }}>
          <h5 style={{ 
            marginBottom: '20px', 
            color: theme.text,
            fontWeight: '600'
          }}>
            ⚡ Quick Actions
          </h5>
          <div style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <Link
              to="/premium"
              style={{
                padding: '10px 24px',
                backgroundColor: theme.primary,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              🔍 Premium Search
            </Link>
            
            <Link
              to="/upload"
              style={{
                padding: '10px 24px',
                backgroundColor: theme.success,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              📤 Upload Questions
            </Link>

            <Link
              to="/pricing"
              style={{
                padding: '10px 24px',
                backgroundColor: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              💰 Buy Coins
            </Link>
            
            <button
              onClick={() => {
                const referralLink = `${window.location.origin}/?ref=${user?.username}`;
                copyToClipboard(referralLink);
              }}
              style={{
                padding: '10px 24px',
                backgroundColor: 'transparent',
                color: theme.text,
                border: `2px solid ${theme.border}`,
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.hoverBg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              🔗 Share Referral
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;