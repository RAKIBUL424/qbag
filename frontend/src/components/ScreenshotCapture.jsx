

// components/ScreenshotCapture.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import html2canvas from 'html2canvas';
import axios from 'axios';

const API_BASE = "http://127.0.0.1:8000";

const ScreenshotCapture = ({ onClose, onTextExtracted }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // Selection states
  const [selectedArea, setSelectedArea] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  
  // Get position relative to image
  const getPosition = useCallback((e) => {
    const rect = imageRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }, []);

  // Step 1: Capture the entire screen
  const captureScreen = useCallback(async () => {
    try {
      setIsProcessing(true);
      setError('');
      setCapturedImage(null);
      setSelectedArea(null);
      
      // Hide any overlays for clean capture
      const overlays = document.querySelectorAll('.screenshot-overlay');
      overlays.forEach(el => el.style.display = 'none');
      
      // Wait for DOM update
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Get the actual dimensions of the page
      const body = document.body;
      const html = document.documentElement;
      
      const pageWidth = Math.max(
        body.scrollWidth,
        body.offsetWidth,
        html.clientWidth,
        html.scrollWidth,
        html.offsetWidth
      );
      
      const pageHeight = Math.max(
        body.scrollHeight,
        body.offsetHeight,
        html.clientHeight,
        html.scrollHeight,
        html.offsetHeight
      );
      
      console.log('📐 Page dimensions:', { pageWidth, pageHeight });
      
      // Capture with higher resolution
      const canvas = await html2canvas(document.body, {
        scale: 4,          // 🔥 Increased for better quality
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: pageWidth,
        height: pageHeight,
        windowWidth: pageWidth,
        windowHeight: pageHeight,
        x: 0,
        y: 0,
        scrollX: 100,
        scrollY: 100,
        imageTimeout: 0,
        removeContainer: true,
        foreignObjectRendering: false,
      });
      
      // Restore overlays
      overlays.forEach(el => el.style.display = 'flex');
      
      // Convert to data URL
      const imageData = canvas.toDataURL('image/png');
      setCapturedImage(imageData);
      setImageDimensions({
        width: canvas.width,
        height: canvas.height
      });
      setShowPreview(true);
      
      console.log('✅ Screenshot captured:', canvas.width, 'x', canvas.height);
      
    } catch (err) {
      console.error('Screenshot capture error:', err);
      const overlays = document.querySelectorAll('.screenshot-overlay');
      overlays.forEach(el => el.style.display = 'flex');
      setError('Failed to capture screen: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Handle mouse events for selection on the captured image
  const handleMouseDown = useCallback((e) => {
    if (!capturedImage || isProcessing) return;
    
    const pos = getPosition(e);
    setIsDragging(true);
    setStartPos(pos);
    setSelectedArea({
      left: pos.x,
      top: pos.y,
      width: 0,
      height: 0
    });
  }, [capturedImage, isProcessing, getPosition]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !capturedImage) return;
      
      const pos = getPosition(e);
      
      // Constrain to image bounds
      const rect = imageRef.current.getBoundingClientRect();
      const constrainedX = Math.max(0, Math.min(pos.x, rect.width));
      const constrainedY = Math.max(0, Math.min(pos.y, rect.height));
      
      const left = Math.min(startPos.x, constrainedX);
      const top = Math.min(startPos.y, constrainedY);
      const width = Math.abs(constrainedX - startPos.x);
      const height = Math.abs(constrainedY - startPos.y);
      
      setSelectedArea({
        left,
        top,
        width,
        height
      });
    };

    const handleMouseUp = () => {
      if (isDragging) {
        if (selectedArea && (selectedArea.width < 10 || selectedArea.height < 10)) {
          setSelectedArea(null);
        }
        setIsDragging(false);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, capturedImage, startPos, selectedArea, getPosition]);

  // Step 3: Crop the image based on selection
  const cropImage = useCallback(async () => {
    if (!selectedArea || selectedArea.width < 10 || selectedArea.height < 10) {
      setError('Please select a valid area (minimum 10x10 pixels)');
      return;
    }

    try {
      setIsProcessing(true);
      setError('');
      
      // Load the captured image
      const img = new Image();
      img.src = capturedImage;
      await new Promise(resolve => img.onload = resolve);
      
      // Get the display dimensions
      const rect = imageRef.current.getBoundingClientRect();
      const displayWidth = rect.width;
      const displayHeight = rect.height;
      
      // Calculate scale factors from actual image to display
      const scaleX = img.width / displayWidth;
      const scaleY = img.height / displayHeight;
      
      const x = selectedArea.left * scaleX;
      const y = selectedArea.top * scaleY;
      const width = selectedArea.width * scaleX;
      const height = selectedArea.height * scaleY;
      
      console.log('📐 Crop calculations:', {
        imageSize: `${img.width}x${img.height}`,
        displaySize: `${displayWidth}x${displayHeight}`,
        scale: `${scaleX}x${scaleY}`,
        crop: `${x},${y} ${width}x${height}`
      });
      
      // Create canvas for cropping
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(width);
      canvas.height = Math.round(height);
      const ctx = canvas.getContext('2d');
      
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, x, y, width, height, 0, 0, canvas.width, canvas.height);
      
      // Convert to blob
      const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, 'image/png');
      });
      
      // Send to backend
      const formData = new FormData();
      formData.append('file', blob, 'screenshot.png');
      
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE}/ocr/extract`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000,
        }
      );
      
      console.log('OCR Response:', response.data);
      
      const text = response.data.text || '';
      const trimmedText = text.trim();
      
      if (response.data.success && trimmedText) {
        setExtractedText(trimmedText);
        
        // Auto copy to clipboard
        try {
          await navigator.clipboard.writeText(trimmedText);
          console.log('✅ Text automatically copied to clipboard');
        } catch (clipError) {
          const textarea = document.createElement('textarea');
          textarea.value = trimmedText;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
        }
        
        if (onTextExtracted) {
          onTextExtracted(trimmedText, response.data.coins_spent);
        }
      } else {
        setError(response.data.message || 'No text detected in the selected area.');
      }
      
    } catch (err) {
      console.error('Crop error:', err);
      if (err.response?.status === 402) {
        setError('Insufficient coins! Required: 3 coins');
      } else {
        setError(err.response?.data?.detail || err.message || 'Failed to process image');
      }
    } finally {
      setIsProcessing(false);
    }
  }, [selectedArea, capturedImage, onTextExtracted]);

  // Copy to clipboard
  const copyToClipboard = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('✅ Text copied to clipboard!');
    } catch (err) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('✅ Text copied to clipboard!');
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if (e.key === 'Enter' && selectedArea && !isProcessing) {
        cropImage();
      }
      if (e.key === 'p' && capturedImage) {
        setShowPreview(prev => !prev);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedArea, isProcessing, cropImage, onClose, capturedImage]);

  return (
    <div className="screenshot-overlay" ref={containerRef}>
      <div className="screenshot-header">
        <h3>📷 Screenshot Capture</h3>
        <div className="header-actions">
          <span className="coin-info">Cost: 3 coins</span>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
      </div>
      
      <div className="screenshot-instructions">
        {!capturedImage ? (
          <p>Click "Take Screenshot" to capture your screen</p>
        ) : (
          <p>Click and drag on the image to select an area</p>
        )}
        <div className="shortcuts">
          {!capturedImage ? (
            <>
              <kbd>Enter</kbd> to capture &nbsp;|&nbsp; <kbd>Esc</kbd> to cancel
            </>
          ) : (
            <>
              <kbd>Enter</kbd> to crop &nbsp;|&nbsp; <kbd>Esc</kbd> to cancel
              {capturedImage && <span style={{marginLeft: '10px'}}><kbd>P</kbd> toggle preview</span>}
            </>
          )}
        </div>
      </div>
      
      <div className="screenshot-canvas">
        {!capturedImage ? (
          <div className="capture-section">
            <div className="capture-icon">📸</div>
            <h3>Capture Screen</h3>
            <p>Take a screenshot of your entire screen</p>
            <button 
              onClick={captureScreen}
              disabled={isProcessing}
              className="take-screenshot-btn"
            >
              {isProcessing ? (
                <>
                  <span className="spinner-small"></span>
                  Capturing...
                </>
              ) : (
                '🎯 Take Screenshot'
              )}
            </button>
            {error && (
              <div className="error-message" style={{position: 'relative', bottom: 'auto', left: 'auto', transform: 'none'}}>
                <span>❌ {error}</span>
                <button onClick={() => setError('')}>×</button>
              </div>
            )}
          </div>
        ) : (
          <div 
            className="image-container"
            style={{ 
              position: 'relative', 
              width: '100%', 
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#ffffff',
              padding: 0,
              margin: 0,
            }}
          >
            <img 
              ref={imageRef}
              src={capturedImage} 
              alt="Screenshot"
              className="captured-image"
              onMouseDown={handleMouseDown}
              style={{
                width: '100%',        // Fill container width
                height: '100%',       // Fill container height
                objectFit: 'contain', // Keep aspect ratio
                cursor: isProcessing ? 'default' : 'crosshair',
                userSelect: 'none',
                backgroundColor: '#ffffff',
                display: 'block',
              }}
            />
            
            {/* Selection rectangle */}
            {selectedArea && selectedArea.width > 0 && selectedArea.height > 0 && (
              <div
                style={{
                  position: 'absolute',
                  left: selectedArea.left,
                  top: selectedArea.top,
                  width: selectedArea.width,
                  height: selectedArea.height,
                  border: '3px solid #00ff00',
                  background: 'rgba(0, 255, 0, 0.1)',
                  pointerEvents: 'none',
                  zIndex: 5,
                }}
              >
                <div style={{
                  position: 'absolute',
                  bottom: '-28px',
                  left: '0',
                  color: '#00ff00',
                  fontSize: '12px',
                  background: 'rgba(0, 0, 0, 0.8)',
                  padding: '2px 10px',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  whiteSpace: 'nowrap',
                }}>
                  {Math.round(selectedArea.width)} × {Math.round(selectedArea.height)}
                </div>
              </div>
            )}
            
            {/* Crop button */}
            {selectedArea && selectedArea.width > 20 && selectedArea.height > 20 && !isProcessing && (
              <button
                className="crop-btn"
                onClick={cropImage}
                style={{
                  position: 'absolute',
                  left: selectedArea.left + selectedArea.width / 2,
                  top: selectedArea.top + selectedArea.height / 2,
                  padding: '12px 28px',
                  background: '#00ff00',
                  color: '#333',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '18px',
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 4px 20px rgba(0, 255, 0, 0.4)',
                  transition: 'all 0.3s ease',
                  zIndex: 10,
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translate(-50%, -50%) scale(1.08)';
                  e.target.style.boxShadow = '0 6px 30px rgba(0, 255, 0, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translate(-50%, -50%) scale(1)';
                  e.target.style.boxShadow = '0 4px 20px rgba(0, 255, 0, 0.4)';
                }}
              >
                ✂️ Crop
              </button>
            )}
            
            {/* Retake button */}
            {!isProcessing && (
              <button
                className="retake-btn"
                onClick={() => {
                  setCapturedImage(null);
                  setSelectedArea(null);
                  setShowPreview(false);
                  setImageDimensions({ width: 0, height: 0 });
                }}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  padding: '6px 16px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  color: '#333',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500',
                  zIndex: 10,
                }}
              >
                🔄 Retake
              </button>
            )}
            
            {/* Processing overlay */}
            {isProcessing && (
              <div className="processing-overlay">
                <div className="spinner"></div>
                <p>Processing...</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Error message */}
      {error && capturedImage && (
        <div className="error-message">
          <span>❌ {error}</span>
          <button onClick={() => setError('')}>×</button>
        </div>
      )}
      
      {/* Extracted Text */}
      {extractedText && extractedText.trim() && (
        <div className="extracted-text">
          <div className="text-header">
            <span>📝 Extracted Text</span>
            <div className="text-actions-header">
              <button 
                className="copy-btn"
                onClick={() => copyToClipboard(extractedText)}
              >
                📋 Copy
              </button>
              <button 
                className="close-text-btn"
                onClick={() => setExtractedText('')}
              >
                ✕
              </button>
            </div>
          </div>
          <div className="text-content">
            {extractedText}
          </div>
          <div className="text-actions-footer">
            <button 
              className="action-btn google"
              onClick={() => {
                window.open(`https://www.google.com/search?q=${encodeURIComponent(extractedText)}`, '_blank');
              }}
            >
              🔍 Search Google
            </button>
            <button 
              className="action-btn chatgpt"
              onClick={() => {
                window.open(`https://chat.openai.com/`, '_blank');
              }}
            >
              🤖 Ask ChatGPT
            </button>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .screenshot-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          z-index: 9999;
          display: flex;
          flex-direction: column;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        }
        
        .screenshot-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: white;
          padding: 10px 20px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          margin-bottom: 10px;
          flex-shrink: 0;
        }
        
        .screenshot-header h3 {
          margin: 0;
          font-size: 18px;
        }
        
        .header-actions {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .coin-info {
          background: #ffd700;
          color: #333;
          padding: 4px 12px;
          border-radius: 12px;
          font-weight: bold;
          font-size: 13px;
        }
        
        .close-btn {
          background: none;
          border: none;
          color: white;
          font-size: 28px;
          cursor: pointer;
          padding: 0 10px;
          transition: transform 0.2s;
        }
        
        .close-btn:hover {
          transform: scale(1.2);
        }
        
        .screenshot-instructions {
          color: #ccc;
          padding: 10px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
          flex-shrink: 0;
        }
        
        .screenshot-instructions p {
          margin: 0;
          font-size: 14px;
        }
        
        .shortcuts {
          font-size: 13px;
        }
        
        .shortcuts kbd {
          background: rgba(255, 255, 255, 0.1);
          padding: 2px 10px;
          border-radius: 4px;
          margin: 0 4px;
          font-size: 12px;
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }
        
        .screenshot-canvas {
          flex: 1;
          position: relative;
          border: 2px dashed rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          margin-top: 10px;
          min-height: 300px;
          overflow: hidden;
          background: rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 0;
          margin: 0;
        }
        
        .capture-section {
          text-align: center;
          color: white;
          padding: 40px;
        }
        
        .capture-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }
        
        .capture-section h3 {
          font-size: 24px;
          margin-bottom: 10px;
        }
        
        .capture-section p {
          color: #aaa;
          margin-bottom: 30px;
        }
        
        .take-screenshot-btn {
          padding: 14px 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .take-screenshot-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
        }
        
        .take-screenshot-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .spinner-small {
          display: inline-block;
          width: 18px;
          height: 18px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: #fff;
          animation: spin 0.8s linear infinite;
          margin-right: 10px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .image-container {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          padding: 0;
          margin: 0;
        }
        
        .captured-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          background: #ffffff;
          display: block;
        }
        
        .crop-btn {
          position: absolute;
          padding: 10px 24px;
          background: #00ff00;
          color: #333;
          border: none;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
          font-size: 16px;
          transform: translate(-50%, -50%);
          box-shadow: 0 4px 20px rgba(0, 255, 0, 0.4);
          transition: all 0.3s ease;
          z-index: 10;
        }
        
        .crop-btn:hover {
          transform: translate(-50%, -50%) scale(1.08);
          box-shadow: 0 6px 30px rgba(0, 255, 0, 0.6);
        }
        
        .retake-btn:hover {
          background: rgba(255, 255, 255, 1);
        }
        
        .processing-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          border-radius: 8px;
          z-index: 20;
        }
        
        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(255, 255, 255, 0.2);
          border-top: 4px solid #00ff00;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        .processing-overlay p {
          margin-top: 20px;
          color: #ccc;
        }
        
        .error-message {
          position: fixed;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          background: #dc3545;
          color: white;
          padding: 14px 24px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 15px;
          box-shadow: 0 4px 20px rgba(220, 53, 69, 0.4);
          max-width: 90%;
          z-index: 10000;
        }
        
        .error-message button {
          background: none;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          padding: 0 5px;
        }
        
        .extracted-text {
          position: fixed;
          bottom: 30px;
          right: 30px;
          max-width: 500px;
          min-width: 300px;
          max-height: 450px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 40px rgba(0, 0, 0, 0.4);
          overflow: hidden;
          animation: slideUp 0.3s ease;
          z-index: 10000;
          display: flex;
          flex-direction: column;
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(20px) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        
        .text-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
          flex-shrink: 0;
        }
        
        .text-header span {
          font-weight: bold;
          color: #333;
        }
        
        .text-actions-header {
          display: flex;
          gap: 8px;
        }
        
        .copy-btn {
          padding: 4px 14px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          transition: background 0.2s;
        }
        
        .copy-btn:hover {
          background: #0056b3;
        }
        
        .close-text-btn {
          padding: 4px 10px;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
          transition: background 0.2s;
        }
        
        .close-text-btn:hover {
          background: #c82333;
        }
        
        .text-content {
          padding: 16px;
          max-height: 150px;
          overflow-y: auto;
          white-space: pre-wrap;
          word-wrap: break-word;
          font-size: 14px;
          color: #333;
          line-height: 1.6;
          background: #fff;
          flex: 1;
        }
        
        .text-actions-footer {
          display: flex;
          gap: 8px;
          padding: 12px 16px;
          border-top: 1px solid #e9ecef;
          background: #f8f9fa;
          flex-wrap: wrap;
          flex-shrink: 0;
        }
        
        .action-btn {
          flex: 1;
          padding: 8px 12px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.2s ease;
          min-width: 80px;
          text-align: center;
        }
        
        .action-btn.google {
          background: #28a745;
          color: white;
        }
        
        .action-btn.google:hover {
          background: #218838;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
        }
        
        .action-btn.chatgpt {
          background: #6c5ce7;
          color: white;
        }
        
        .action-btn.chatgpt:hover {
          background: #5f3dc4;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(108, 92, 231, 0.3);
        }
        
        .text-content::-webkit-scrollbar {
          width: 6px;
        }
        
        .text-content::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        
        .text-content::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        
        .text-content::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
        
        @media (max-width: 768px) {
          .screenshot-overlay {
            padding: 10px;
          }
          
          .screenshot-instructions {
            flex-direction: column;
            align-items: flex-start;
            gap: 5px;
          }
          
          .extracted-text {
            max-width: calc(100% - 20px);
            min-width: calc(100% - 20px);
            right: 10px;
            bottom: 10px;
            max-height: 400px;
          }
          
          .text-actions-footer {
            flex-direction: column;
          }
          
          .action-btn {
            min-width: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default ScreenshotCapture;

