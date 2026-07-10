
// pages/Auth.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const API_URL = "http://127.0.0.1:8000/user";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

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

  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    mobile: "",
    password: "",
  });

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  // Register Input Change
  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value,
    });
  };

  // Login Input Change
  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  // Register User
  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      const res = await axios.post(
        `${API_URL}/registar`,
        registerData
      );

      setMessage("✅ Registration successful! Please login.");
      setRegisterData({
        username: "",
        email: "",
        mobile: "",
        password: "",
      });

      console.log(res.data);
      
      setTimeout(() => {
        setIsLogin(true);
        setMessage("👋 Welcome! Please login with your credentials");
      }, 1500);
      
    } catch (error) {
      setMessage(
        error.response?.data?.detail || "❌ Registration failed!"
      );
    } finally {
      setLoading(false);
    }
  };

  // Login User
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      const res = await axios.post(
        `${API_URL}/login`,
        loginData
      );

      login(res.data.token, { username: loginData.username });
      
      setMessage("✅ Login successful! Redirecting...");
      console.log(res.data);

      setTimeout(() => {
        navigate("/");
      }, 1000);
      
    } catch (error) {
      setMessage(
        error.response?.data?.detail || "❌ Login failed!"
      );
    } finally {
      setLoading(false);
    }
  };

  // Theme colors
  const theme = {
    background: isDarkMode ? '#0f172a' : '#f0f2f5',
    cardBg: isDarkMode ? '#1e293b' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#1a2332',
    textSecondary: isDarkMode ? '#94a3b8' : '#6b7280',
    border: isDarkMode ? '#475569' : '#e5e7eb',
    shadow: isDarkMode ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.08)',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    inputBg: isDarkMode ? '#0f172a' : '#ffffff',
    inputBorder: isDarkMode ? '#475569' : '#d1d5db',
    primary: '#667eea',
    success: '#10b981',
    danger: '#ef4444',
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 80px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.background,
      padding: '20px',
      transition: 'all 0.3s ease',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <div style={{
        backgroundColor: theme.cardBg,
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '450px',
        width: '100%',
        boxShadow: theme.shadow,
        border: `1px solid ${theme.border}`,
        transition: 'all 0.3s ease'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '10px',
            display: 'block'
          }}>
            {isLogin ? '🔐' : '✨'}
          </div>
          <h2 style={{
            color: theme.text,
            fontSize: '28px',
            fontWeight: '700',
            margin: '0',
            letterSpacing: '-0.5px'
          }}>
            {isLogin ? 'Welcome Back!' : 'Create Account'}
          </h2>
          <p style={{
            color: theme.textSecondary,
            fontSize: '14px',
            marginTop: '8px'
          }}>
            {isLogin ? 'Login to access premium content' : 'Join us and start learning today'}
          </p>
        </div>

        {/* Toggle Buttons */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          marginBottom: '25px',
          backgroundColor: isDarkMode ? '#0f172a' : '#f3f4f6',
          padding: '6px',
          borderRadius: '12px'
        }}>
          <button
            onClick={() => {
              setIsLogin(true);
              setMessage("");
            }}
            style={{
              padding: '12px',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              backgroundColor: isLogin ? theme.primary : 'transparent',
              color: isLogin ? 'white' : theme.textSecondary,
              transition: 'all 0.3s ease',
              position: 'relative'
            }}
          >
            Login
            {isLogin && (
              <span style={{
                position: 'absolute',
                bottom: '-2px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '30px',
                height: '3px',
                backgroundColor: 'white',
                borderRadius: '2px'
              }} />
            )}
          </button>

          <button
            onClick={() => {
              setIsLogin(false);
              setMessage("");
            }}
            style={{
              padding: '12px',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              backgroundColor: !isLogin ? theme.success : 'transparent',
              color: !isLogin ? 'white' : theme.textSecondary,
              transition: 'all 0.3s ease',
              position: 'relative'
            }}
          >
            Register
            {!isLogin && (
              <span style={{
                position: 'absolute',
                bottom: '-2px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '30px',
                height: '3px',
                backgroundColor: 'white',
                borderRadius: '2px'
              }} />
            )}
          </button>
        </div>

        {/* Message Alert */}
        {message && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '10px',
            marginBottom: '20px',
            fontSize: '14px',
            fontWeight: '500',
            backgroundColor: message.includes('✅') ? '#d1fae5' : 
                           message.includes('❌') ? '#fee2e2' : 
                           message.includes('👋') ? '#dbeafe' : '#fef3c7',
            color: message.includes('✅') ? '#065f46' : 
                   message.includes('❌') ? '#991b1b' : 
                   message.includes('👋') ? '#1e40af' : '#92400e',
            border: `1px solid ${
              message.includes('✅') ? '#bbf7d0' : 
              message.includes('❌') ? '#fca5a5' : 
              message.includes('👋') ? '#bfdbfe' : '#fde68a'
            }`,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>{message}</span>
          </div>
        )}

        {/* Login Form */}
        {isLogin ? (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                color: theme.text,
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '6px'
              }}>
                👤 Username
              </label>
              <input
                type="text"
                name="username"
                value={loginData.username}
                onChange={handleLoginChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: `2px solid ${theme.inputBorder}`,
                  backgroundColor: theme.inputBg,
                  color: theme.text,
                  fontSize: '15px',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = theme.primary;
                  e.target.style.boxShadow = `0 0 0 3px ${theme.primary}33`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = theme.inputBorder;
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="Enter your username"
              />
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{
                display: 'block',
                color: theme.text,
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '6px'
              }}>
                🔑 Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    paddingRight: '45px',
                    borderRadius: '10px',
                    border: `2px solid ${theme.inputBorder}`,
                    backgroundColor: theme.inputBg,
                    color: theme.text,
                    fontSize: '15px',
                    transition: 'all 0.3s ease',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = theme.primary;
                    e.target.style.boxShadow = `0 0 0 3px ${theme.primary}33`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = theme.inputBorder;
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: theme.textSecondary,
                    cursor: 'pointer',
                    fontSize: '18px',
                    padding: '4px'
                  }}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: theme.primary,
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.3s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span style={{
                    display: 'inline-block',
                    width: '18px',
                    height: '18px',
                    border: '3px solid rgba(255,255,255,0.3)',
                    borderRadius: '50%',
                    borderTopColor: 'white',
                    animation: 'spin 0.8s linear infinite'
                  }} />
                  Logging in...
                </span>
              ) : (
                '🚀 Login'
              )}
            </button>

            <div style={{
              textAlign: 'center',
              marginTop: '16px',
              color: theme.textSecondary,
              fontSize: '14px'
            }}>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setMessage("");
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: theme.primary,
                  fontWeight: '600',
                  cursor: 'pointer',
                  padding: '0',
                  fontSize: '14px',
                  textDecoration: 'underline'
                }}
              >
                Register here
              </button>
            </div>
          </form>
        ) : (
          // Register Form
          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{
                display: 'block',
                color: theme.text,
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '6px'
              }}>
                👤 Username
              </label>
              <input
                type="text"
                className="form-control"
                name="username"
                value={registerData.username}
                onChange={handleRegisterChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: `2px solid ${theme.inputBorder}`,
                  backgroundColor: theme.inputBg,
                  color: theme.text,
                  fontSize: '15px',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = theme.primary;
                  e.target.style.boxShadow = `0 0 0 3px ${theme.primary}33`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = theme.inputBorder;
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="Choose a username"
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{
                display: 'block',
                color: theme.text,
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '6px'
              }}>
                📧 Email
              </label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={registerData.email}
                onChange={handleRegisterChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: `2px solid ${theme.inputBorder}`,
                  backgroundColor: theme.inputBg,
                  color: theme.text,
                  fontSize: '15px',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = theme.primary;
                  e.target.style.boxShadow = `0 0 0 3px ${theme.primary}33`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = theme.inputBorder;
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="Enter your email"
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{
                display: 'block',
                color: theme.text,
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '6px'
              }}>
                📱 Mobile
              </label>
              <input
                type="text"
                className="form-control"
                name="mobile"
                value={registerData.mobile}
                onChange={handleRegisterChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: `2px solid ${theme.inputBorder}`,
                  backgroundColor: theme.inputBg,
                  color: theme.text,
                  fontSize: '15px',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = theme.primary;
                  e.target.style.boxShadow = `0 0 0 3px ${theme.primary}33`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = theme.inputBorder;
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="Enter your mobile number"
              />
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{
                display: 'block',
                color: theme.text,
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '6px'
              }}>
                🔑 Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  name="password"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    paddingRight: '45px',
                    borderRadius: '10px',
                    border: `2px solid ${theme.inputBorder}`,
                    backgroundColor: theme.inputBg,
                    color: theme.text,
                    fontSize: '15px',
                    transition: 'all 0.3s ease',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = theme.primary;
                    e.target.style.boxShadow = `0 0 0 3px ${theme.primary}33`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = theme.inputBorder;
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: theme.textSecondary,
                    cursor: 'pointer',
                    fontSize: '18px',
                    padding: '4px'
                  }}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-success w-100"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: theme.success,
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.3s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span style={{
                    display: 'inline-block',
                    width: '18px',
                    height: '18px',
                    border: '3px solid rgba(255,255,255,0.3)',
                    borderRadius: '50%',
                    borderTopColor: 'white',
                    animation: 'spin 0.8s linear infinite'
                  }} />
                  Registering...
                </span>
              ) : (
                '✨ Create Account'
              )}
            </button>

            <div style={{
              textAlign: 'center',
              marginTop: '16px',
              color: theme.textSecondary,
              fontSize: '14px'
            }}>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setMessage("");
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: theme.primary,
                  fontWeight: '600',
                  cursor: 'pointer',
                  padding: '0',
                  fontSize: '14px',
                  textDecoration: 'underline'
                }}
              >
                Login here
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Add spinning animation */}
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default Auth;