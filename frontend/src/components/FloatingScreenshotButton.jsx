
// components/FloatingScreenshotButton.jsx (updated)
import React, { useState } from 'react';
import { useLocation } from 'react-router';
import ScreenshotCapture from './ScreenshotCapture';
import './FloatingScreenshotButton.css';

const FloatingScreenshotButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  // Check if we're on home or premium search page
  const showButton = location.pathname === '/' || location.pathname === '/premium';
  
  const handleTextExtracted = (text, coins) => {
    console.log(`Text extracted: ${text.substring(0, 50)}... (${coins} coins spent)`);
    setTimeout(() => {
      setIsOpen(false);
    }, 10000);
  };

  // Don't render anything if not on allowed pages
  if (!showButton) return null;

  return (
    <>
      <button
        className="floating-screenshot-btn"
        onClick={() => setIsOpen(true)}
        title="Take Screenshot (3 coins)"
      >
        <span className="btn-icon">📷</span>
        <span className="btn-text">Snap & Extract</span>
        <span className="btn-cost">3 coins</span>
      </button>
      
      {isOpen && (
        <ScreenshotCapture 
          onClose={() => setIsOpen(false)}
          onTextExtracted={handleTextExtracted}
        />
      )}
    </>
  );
};

export default FloatingScreenshotButton;