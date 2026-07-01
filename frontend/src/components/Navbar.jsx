// components/Navbar.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );
  const { user, isLoggedIn, coinBalance, logout } = useAuth();
  const navigate = useNavigate();

  // Theme toggle
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => prev === "light" ? "dark" : "light");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      <style>
        {`
          :root {
            --bg: #ffffff;
            --navbar: #ffffff;
            --card: #f8fafc;
            --text: #111827;
            --border: #e5e7eb;
            --primary: #22c55e;
            --danger: #ef4444;
          }

          [data-theme="dark"] {
            --bg: #0f172a;
            --navbar: #1e293b;
            --card: #334155;
            --text: #ffffff;
            --border: #475569;
            --primary: #22c55e;
            --danger: #ef4444;
          }

          body {
            margin: 0;
            background: var(--bg);
            color: var(--text);
            transition: all .3s ease;
          }

          * {
            box-sizing: border-box;
          }

          .qbag-navbar {
            width: 100%;
            background: var(--navbar);
            border-bottom: 1px solid var(--border);
            padding: 14px 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: all .3s ease;
            flex-wrap: wrap;
            gap: 10px;
          }

          .qbag-logo {
            font-size: 24px;
            font-weight: bold;
            color: var(--primary);
            cursor: pointer;
          }

          .qbag-links {
            display: flex;
            gap: 24px;
            align-items: center;
            flex-wrap: wrap;
          }

          .qbag-links a {
            text-decoration: none;
            color: var(--text);
            font-weight: 500;
            transition: color 0.2s;
          }

          .qbag-links a:hover {
            color: var(--primary);
          }

          .qbag-right {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
          }

          .coin-badge {
            background: var(--primary);
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 4px;
          }

          .coin-badge:hover {
            transform: scale(1.05);
            box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
          }

          .theme-btn {
            border: 1px solid var(--border);
            background: var(--card);
            color: var(--text);
            padding: 8px 12px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
          }

          .theme-btn:hover {
            opacity: 0.8;
          }

          .auth-btn {
            padding: 8px 16px;
            border: none;
            border-radius: 8px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
          }

          .auth-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }

          .auth-btn.login {
            background: transparent;
            color: var(--text);
            border: 1px solid var(--border);
          }

          .auth-btn.signup {
            background: var(--primary);
            color: white;
          }

          .auth-btn.logout {
            background: var(--danger);
            color: white;
          }

          .profile-img {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
            object-fit: cover;
            border: 2px solid var(--border);
            transition: all 0.2s;
          }

          .profile-img:hover {
            border-color: var(--primary);
            transform: scale(1.05);
          }

          .user-name {
            font-weight: 500;
            color: var(--text);
          }

          @media(max-width: 768px) {
            .qbag-navbar {
              flex-direction: column;
              gap: 15px;
              padding: 14px 15px;
            }

            .qbag-links {
              justify-content: center;
              gap: 15px;
            }

            .qbag-right {
              justify-content: center;
            }

            .user-name {
              display: none;
            }

            .coin-badge {
              font-size: 12px;
              padding: 4px 10px;
            }
          }

          @media(max-width: 480px) {
            .qbag-links {
              gap: 10px;
              font-size: 14px;
            }
            
            .qbag-links a {
              font-size: 13px;
            }
          }
        `}
      </style>

      <nav className="qbag-navbar">
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div className="qbag-logo">QBag</div>
        </Link>

        <div className="qbag-links">
          <Link to="/">Home</Link>
          <Link to="/upload">Upload</Link>
          <Link to="/premium">Premium Services</Link>
          <Link to="/pricing">Pricing</Link>

          {isLoggedIn && (
            <>
              <Link to="/profile">Profile</Link>
              <Link to="/purchases">My Purchases</Link>
            </>
          )}
        </div>

        <div className="qbag-right">
          <button className="theme-btn" onClick={toggleTheme}>
            {theme === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>

          {isLoggedIn ? (
            <>
              <span className="user-name">
                {user?.username || "User"}
              </span>
              
              <div 
                className="coin-badge"
                onClick={() => navigate("/profile")}
                title="Click to view profile"
              >
                💰 {coinBalance}
              </div>

              <img
                src={`https://ui-avatars.com/api/?name=${user?.username || 'User'}&size=40&background=22c55e&color=fff&bold=true`}
                alt="profile"
                className="profile-img"
                onClick={() => navigate("/profile")}
                title="Click to view profile"
              />

              <button 
                className="auth-btn logout"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button 
                className="auth-btn login"
                onClick={() => navigate("/user")}
              >
                Login
              </button>

              <button 
                className="auth-btn signup"
                onClick={() => navigate("/user")}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;


