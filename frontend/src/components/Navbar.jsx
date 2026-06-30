import React, { useEffect, useState } from "react";
import { Link } from "react-router";

const Navbar = () => {
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  const isLoggedIn = true;
  const coinBalance = 125;

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      theme
    );

    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) =>
      prev === "light" ? "dark" : "light"
    );
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
          }

          [data-theme="dark"] {
            --bg: #0f172a;
            --navbar: #1e293b;
            --card: #334155;
            --text: #ffffff;
            --border: #475569;
            --primary: #22c55e;
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
          }

          .qbag-links a {
            text-decoration: none;
            color: var(--text);
            font-weight: 500;
          }

          .qbag-links a:hover {
            color: var(--primary);
          }

          .qbag-right {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .coin-badge {
            background: var(--primary);
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-weight: 600;
          }

          .theme-btn {
            border: 1px solid var(--border);
            background: var(--card);
            color: var(--text);
            padding: 8px 12px;
            border-radius: 8px;
            cursor: pointer;
          }

          .profile-img {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
          }

          @media(max-width:768px) {
            .qbag-navbar {
              flex-direction: column;
              gap: 15px;
            }

            .qbag-links {
              flex-wrap: wrap;
              justify-content: center;
            }
          }
        `}
      </style>

      <nav className="qbag-navbar">
        {/* Logo */}
        <div className="qbag-logo">
          QBag
        </div>

        {/* Center Links */}
        <div className="qbag-links">
          <Link to="/">Home</Link>
          <Link to="/upload">Upload</Link>
          <Link to="/premium">
            Premium Services
          </Link>
          <Link to="/pricing">Pricing</Link>

          {isLoggedIn && (
            <Link to="/coins">My Coins</Link>
          )}
        </div>

        {/* Right Side */}
        <div className="qbag-right">
          <button
            className="theme-btn"
            onClick={toggleTheme}
          >
            {theme === "light"
              ? "🌙 Dark"
              : "☀️ Light"}
          </button>

          {isLoggedIn ? (
            <>
              <div className="coin-badge">
                🪙 {coinBalance}
              </div>

              <img
                src="images/location.png"
                alt="profile"
                className="profile-img"
              />
            </>
          ) : (
            <>
              <button className="theme-btn">
                Login
              </button>

              <button
                style={{
                  background:
                    "var(--primary)",
                  color: "white",
                  border: "none",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
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