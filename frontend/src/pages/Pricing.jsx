// Pricing.jsx
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router';

const Pricing = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check initial theme
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme');
      setIsDarkMode(theme === 'dark');
    };

    checkTheme();

    // Watch for theme changes on the html element
    const observer = new MutationObserver(() => {
      checkTheme();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => observer.disconnect();
  }, []);

  // Theme colors based on CSS variables
  const theme = {
    background: isDarkMode ? '#0f172a' : '#f8f9fa',
    cardBackground: isDarkMode ? '#1e293b' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#111827',
    textSecondary: isDarkMode ? '#94a3b8' : '#4a5568',
    border: isDarkMode ? '#475569' : '#e5e7eb',
    shadow: isDarkMode ? '0 4px 16px rgba(0,0,0,0.4)' : '0 4px 16px rgba(0,0,0,0.06)',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    bKash: '#e2136e',
    cardBg: isDarkMode ? '#1e293b' : '#ffffff',
    hoverBg: isDarkMode ? '#334155' : '#f8fafc',
  };

  const packages = [
    {
      id: 1,
      name: 'Starter Pack',
      price: 20,
      coins: 60,
      totalCoins: 60,
      features: ['60 Coins', 'Valid 20 days', 'All questions'],
      popular: false,
      icon: '🌟',
    },
    {
      id: 2,
      name: 'Pro Pack',
      price: 50,
      coins: 200,
      totalCoins: 200,
      features: ['200 Coins', 'Valid 20 days', 'All questions'],
      popular: true,
      icon: '🚀',
    }
  ];

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      minHeight: 'calc(100vh - 100px)',
      backgroundColor: theme.background,
      color: theme.text,
      transition: 'all 0.3s ease',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    },
    header: {
      textAlign: 'center',
      padding: '20px 20px 15px',
      position: 'relative'
    },
    title: {
      fontSize: '32px',
      fontWeight: '800',
      background: theme.gradient,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '5px',
      letterSpacing: '-0.5px'
    },
    subtitle: {
      fontSize: '15px',
      color: theme.textSecondary,
      marginBottom: '20px'
    },
    packagesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '20px',
      maxWidth: '750px',
      margin: '0 auto 25px'
    },
    packageCard: (isPopular) => ({
      backgroundColor: theme.cardBackground,
      borderRadius: '14px',
      padding: '20px',
      boxShadow: isPopular ? '0 6px 24px rgba(102, 126, 234, 0.25)' : theme.shadow,
      border: isPopular ? '2px solid #667eea' : `1px solid ${theme.border}`,
      transition: 'all 0.3s ease',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      transform: isPopular ? 'scale(1.02)' : 'scale(1)',
    }),
    popularBadge: {
      position: 'absolute',
      top: '-10px',
      right: '15px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '3px 14px',
      borderRadius: '16px',
      fontSize: '11px',
      fontWeight: '600',
      letterSpacing: '0.3px'
    },
    packageIcon: {
      fontSize: '32px',
      textAlign: 'center',
      marginBottom: '5px'
    },
    packageName: {
      fontSize: '20px',
      fontWeight: '700',
      textAlign: 'center',
      color: theme.text,
      marginBottom: '5px'
    },
    priceSection: {
      textAlign: 'center',
      padding: '12px 0',
      borderBottom: `1px solid ${theme.border}`,
      marginBottom: '12px'
    },
    price: {
      fontSize: '32px',
      fontWeight: '800',
      color: theme.text
    },
    priceCurrency: {
      fontSize: '18px',
      fontWeight: '600',
      color: theme.textSecondary
    },
    coinsDisplay: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      marginTop: '5px'
    },
    coinsNumber: {
      fontSize: '22px',
      fontWeight: '700',
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    },
    features: {
      listStyle: 'none',
      padding: '0',
      margin: '10px 0',
      flex: '1'
    },
    featureItem: {
      padding: '6px 0',
      color: theme.textSecondary,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '13px',
      borderBottom: `1px solid ${theme.border}`
    },
    bKashSection: {
      marginTop: '20px',
      padding: '20px',
      backgroundColor: theme.cardBackground,
      borderRadius: '14px',
      border: `1px solid ${theme.border}`,
      maxWidth: '650px',
      marginLeft: 'auto',
      marginRight: 'auto'
    },
    bKashHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      marginBottom: '12px'
    },
    bKashLogo: {
      fontSize: '28px'
    },
    bKashTitle: {
      fontSize: '20px',
      fontWeight: '700',
      color: theme.bKash,
      margin: 0
    },
    paymentInfo: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '10px',
      marginTop: '12px'
    },
    paymentItem: {
      padding: '10px',
      backgroundColor: isDarkMode ? '#334155' : '#f8f9fa',
      borderRadius: '8px',
      textAlign: 'center',
      border: `1px solid ${theme.border}`
    },
    paymentLabel: {
      fontSize: '12px',
      color: theme.textSecondary,
      marginBottom: '3px'
    },
    paymentValue: {
      fontSize: '15px',
      fontWeight: '600',
      color: theme.text
    },
    instructionBox: {
      marginTop: '12px',
      padding: '15px',
      backgroundColor: isDarkMode ? '#1e293b' : '#f0f8ff',
      borderRadius: '8px',
      border: `1px solid ${theme.border}`
    },
    instructionStep: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px',
      marginBottom: '5px',
      color: theme.textSecondary,
      fontSize: '13px',
      lineHeight: '1.4'
    },
    instructionNumber: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '20px',
      height: '20px',
      backgroundColor: theme.bKash,
      color: 'white',
      borderRadius: '50%',
      fontSize: '11px',
      fontWeight: '600',
      flexShrink: 0
    },
    facebookButton: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 20px',
      backgroundColor: '#1877f2',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      textDecoration: 'none',
      transition: 'all 0.3s ease'
    },
    backButton: {
      display: 'inline-block',
      marginTop: '15px',
      padding: '8px 20px',
      backgroundColor: 'transparent',
      border: `2px solid ${theme.border}`,
      borderRadius: '8px',
      color: theme.text,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textDecoration: 'none',
      fontSize: '14px',
      fontWeight: '500'
    },
    footer: {
      textAlign: 'center',
      marginTop: '30px',
      padding: '15px',
      color: theme.textSecondary,
      fontSize: '12px',
      borderTop: `1px solid ${theme.border}`
    },
    contactRow: {
      textAlign: 'center',
      marginTop: '12px'
    }
  };

  return (
    <>
    <Helmet>
      <title>Qbag - Pricing</title>
    </Helmet>
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>💰 Coin Packages</div>
        <p style={styles.subtitle}>
          Choose your package and start searching!
        </p>
        <p style={styles.coinsNumber}>
          The app is currently in development. Currently we are not automatically processing payments. If you need, you can contact the admin to purchase a package.
        </p>
      </div>

      <div style={styles.packagesGrid}>
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            style={styles.packageCard(pkg.popular)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = pkg.popular ? 'scale(1.04)' : 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = pkg.popular ? 'scale(1.02)' : 'scale(1)';
            }}
          >
            {pkg.popular && <div style={styles.popularBadge}>⭐ Popular</div>}
            
            <div style={styles.packageIcon}>{pkg.icon}</div>
            <h3 style={styles.packageName}>{pkg.name}</h3>
            
            <div style={styles.priceSection}>
              <div>
                <span style={styles.priceCurrency}>৳</span>
                <span style={styles.price}>{pkg.price}</span>
              </div>
              <div style={styles.coinsDisplay}>
                <span style={{ fontSize: '14px' }}>Get</span>
                <span style={styles.coinsNumber}>{pkg.totalCoins}</span>
                <span style={{ fontSize: '14px' }}>Coins</span>
              </div>
            </div>

            <ul style={styles.features}>
              {pkg.features.map((feature, index) => (
                <li key={index} style={styles.featureItem}>
                  <span>✓</span> {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div style={styles.bKashSection}>
        <div style={styles.bKashHeader}>
          <span style={styles.bKashLogo}>💳</span>
          <h3 style={styles.bKashTitle}>bKash Payment</h3>
        </div>

        <div style={styles.paymentInfo}>
          <div style={styles.paymentItem}>
            {/* <div style={styles.paymentLabel}>📱 bKash Number</div>
            <div style={styles.paymentValue}>017XX-XXXXXX</div> */}
            <div style={styles.paymentLabel}>Before Payment send message to the admin. If the admin is availabel or not.</div>
            {/* <div style={styles.paymentValue}>017XX-XXXXXX</div> */}
          </div>
          <div style={styles.paymentItem}>
            {/* <div style={styles.paymentLabel}>💰 Reference</div>
            <div style={styles.paymentValue}>Name + Package</div> */}
            <div style={styles.paymentLabel}>Without getting response from the admin, we discurage to make payment.</div>
            {/* <div style={styles.paymentValue}>017XX-XXXXXX</div> */}
          </div>
          <div style={styles.paymentItem}>
            {/* <div style={styles.paymentLabel}>⏱️ Processing</div>
            <div style={styles.paymentValue}>5-10 min</div> */}
            <div style={styles.paymentLabel}>After getting response from the admin, you can make payment.</div>
            <div style={styles.paymentValue}>5-10 min could take to process</div>
          </div>
        </div>

        <div style={styles.instructionBox}>
          <div style={styles.instructionStep}>
            <span style={styles.instructionNumber}>1</span>
            <span>Send ৳20 (60 coins) or ৳50 (200 coins) to the bKash number</span>
          </div>
          {/* <div style={styles.instructionStep}>
            <span style={styles.instructionNumber}>2</span>
            <span>Send transaction ID & email to our Facebook page</span>
          </div> */}
          <div style={styles.instructionStep}>
            <span style={styles.instructionNumber}>2</span>
            <span>Send userID & screenshot of your transaction to our Facebook page</span>
          </div>
          <div style={styles.instructionStep}>
            <span style={styles.instructionNumber}>3</span>
            <span>Coins added within 5-10 minutes</span>
          </div>
        </div>

        <div style={styles.contactRow}>
          <a
            href="https://www.facebook.com/profile.php?id=100079347506277"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.facebookButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(24, 119, 242, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            📘 Contact on Facebook
          </a>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <Link to="/premium" style={styles.backButton}>
          ← Back
        </Link>
      </div>

      <div style={styles.footer}>
        <p>Coins valid for 20 days • Questions? Contact on Facebook</p>
      </div>
    </div>
    </>
  );
};

export default Pricing;