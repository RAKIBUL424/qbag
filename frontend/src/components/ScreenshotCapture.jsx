// // components/ScreenshotCapture.jsx
// import React, { useState, useRef, useEffect, useCallback } from 'react';
// import axios from 'axios';

// const API_BASE = "http://127.0.0.1:8000";

// const ScreenshotCapture = ({ onClose, onTextExtracted }) => {
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [error, setError] = useState('');
//   const [extractedText, setExtractedText] = useState('');
//   const [capturedImage, setCapturedImage] = useState(null);
//   const [showPreview, setShowPreview] = useState(false);
//   const [isCapturing, setIsCapturing] = useState(false);
//   const [zoomLevel, setZoomLevel] = useState(1);
  
//   // Selection states
//   const [selectedArea, setSelectedArea] = useState(null);
//   const [isDragging, setIsDragging] = useState(false);
//   const [startPos, setStartPos] = useState({ x: 0, y: 0 });
//   const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
//   const [imageNaturalSize, setImageNaturalSize] = useState({ width: 0, height: 0 });
  
//   const canvasRef = useRef(null);
//   const containerRef = useRef(null);
//   const imageRef = useRef(null);
  
//   // Get position relative to image with zoom correction
//   const getPosition = useCallback((e) => {
//     if (!imageRef.current) return { x: 0, y: 0 };
    
//     const rect = imageRef.current.getBoundingClientRect();
    
//     // Get the actual displayed size of the image
//     const displayWidth = rect.width;
//     const displayHeight = rect.height;
    
//     // Calculate position in the image's natural coordinates
//     const x = ((e.clientX - rect.left) / displayWidth) * imageNaturalSize.width;
//     const y = ((e.clientY - rect.top) / displayHeight) * imageNaturalSize.height;
    
//     return {
//       x: Math.max(0, Math.min(x, imageNaturalSize.width)),
//       y: Math.max(0, Math.min(y, imageNaturalSize.height))
//     };
//   }, [imageNaturalSize]);

//   // Step 1: Capture the screen using native API with better quality
//   const captureScreen = useCallback(async () => {
//     try {
//       setIsProcessing(true);
//       setError('');
//       setCapturedImage(null);
//       setSelectedArea(null);
//       setIsCapturing(true);
      
//       // Temporarily hide the overlay to avoid capturing it
//       const overlay = containerRef.current;
//       if (overlay) {
//         overlay.style.opacity = '0';
//         overlay.style.pointerEvents = 'none';
//       }
      
//       // Wait for DOM update
//       await new Promise(resolve => setTimeout(resolve, 200));
      
//       // Get the screen dimensions for optimal quality
//       const screenWidth = window.screen.width * window.devicePixelRatio;
//       const screenHeight = window.screen.height * window.devicePixelRatio;
      
//       // Use the Screen Capture API with higher quality settings
//       const stream = await navigator.mediaDevices.getDisplayMedia({
//         video: {
//           displaySurface: 'monitor',
//           cursor: 'always',
//           width: { ideal: Math.max(1920, screenWidth) },
//           height: { ideal: Math.max(1080, screenHeight) },
//           frameRate: { ideal: 30 }
//         },
//         audio: false,
//         preferCurrentTab: false,
//       });
      
//       // Create video element to capture frames
//       const video = document.createElement('video');
//       video.srcObject = stream;
      
//       // Wait for video to be ready
//       await new Promise((resolve) => {
//         video.onloadedmetadata = () => {
//           video.play();
//           resolve();
//         };
//       });
      
//       // Wait a moment for the video to be ready
//       await new Promise(resolve => setTimeout(resolve, 500));
      
//       // Create canvas with the video dimensions (high quality)
//       const canvas = document.createElement('canvas');
//       canvas.width = video.videoWidth || screenWidth;
//       canvas.height = video.videoHeight || screenHeight;
//       const ctx = canvas.getContext('2d');
      
//       // Enable high-quality rendering
//       ctx.imageSmoothingEnabled = true;
//       ctx.imageSmoothingQuality = 'high';
      
//       // Draw the video frame to canvas
//       ctx.drawImage(video, 0, 0);
      
//       // Stop all tracks
//       stream.getTracks().forEach(track => track.stop());
//       video.srcObject = null;
      
//       // Restore the overlay
//       if (overlay) {
//         overlay.style.opacity = '1';
//         overlay.style.pointerEvents = 'auto';
//       }
      
//       // Convert to data URL with high quality
//       const imageData = canvas.toDataURL('image/png', 1.0);
//       setCapturedImage(imageData);
//       setImageNaturalSize({
//         width: canvas.width,
//         height: canvas.height
//       });
//       setShowPreview(true);
//       setIsCapturing(false);
//       setZoomLevel(1); // Reset zoom when new image is captured
      
//       console.log('✅ Screenshot captured:', canvas.width, 'x', canvas.height);
      
//     } catch (err) {
//       console.error('Screen capture error:', err);
//       setIsCapturing(false);
      
//       // Restore the overlay
//       const overlay = containerRef.current;
//       if (overlay) {
//         overlay.style.opacity = '1';
//         overlay.style.pointerEvents = 'auto';
//       }
      
//       if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
//         setError('Permission denied. Please allow screen sharing to capture the image.');
//       } else if (err.name === 'AbortError' || err.message?.includes('aborted')) {
//         setError('Screen capture was cancelled.');
//       } else {
//         setError('Failed to capture screen: ' + (err.message || 'Unknown error'));
//       }
//     } finally {
//       setIsProcessing(false);
//     }
//   }, []);

//   // Handle mouse events for selection on the captured image
//   const handleMouseDown = useCallback((e) => {
//     if (!capturedImage || isProcessing) return;
    
//     const pos = getPosition(e);
//     setIsDragging(true);
//     setStartPos(pos);
//     setSelectedArea({
//       x: pos.x,
//       y: pos.y,
//       width: 0,
//       height: 0
//     });
//   }, [capturedImage, isProcessing, getPosition]);

//   useEffect(() => {
//     const handleMouseMove = (e) => {
//       if (!isDragging || !capturedImage) return;
      
//       const pos = getPosition(e);
      
//       const x = Math.min(startPos.x, pos.x);
//       const y = Math.min(startPos.y, pos.y);
//       const width = Math.abs(pos.x - startPos.x);
//       const height = Math.abs(pos.y - startPos.y);
      
//       setSelectedArea({
//         x,
//         y,
//         width,
//         height
//       });
//     };

//     const handleMouseUp = () => {
//       if (isDragging) {
//         if (selectedArea && (selectedArea.width < 10 || selectedArea.height < 10)) {
//           setSelectedArea(null);
//         }
//         setIsDragging(false);
//       }
//     };

//     document.addEventListener('mousemove', handleMouseMove);
//     document.addEventListener('mouseup', handleMouseUp);

//     return () => {
//       document.removeEventListener('mousemove', handleMouseMove);
//       document.removeEventListener('mouseup', handleMouseUp);
//     };
//   }, [isDragging, capturedImage, startPos, selectedArea, getPosition]);

//   // Zoom controls
//   const handleZoomIn = useCallback(() => {
//     setZoomLevel(prev => Math.min(prev + 0.2, 3));
//   }, []);

//   const handleZoomOut = useCallback(() => {
//     setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
//   }, []);

//   const handleZoomReset = useCallback(() => {
//     setZoomLevel(1);
//   }, []);

//   // Step 3: Crop the image based on selection
//   const cropImage = useCallback(async () => {
//     if (!selectedArea || selectedArea.width < 10 || selectedArea.height < 10) {
//       setError('Please select a valid area (minimum 10x10 pixels)');
//       return;
//     }

//     try {
//       setIsProcessing(true);
//       setError('');
      
//       // Load the captured image
//       const img = new Image();
//       img.src = capturedImage;
//       await new Promise(resolve => img.onload = resolve);
      
//       // Use the selection coordinates directly (already in image coordinates)
//       const x = Math.round(selectedArea.x);
//       const y = Math.round(selectedArea.y);
//       const width = Math.round(selectedArea.width);
//       const height = Math.round(selectedArea.height);
      
//       console.log('📐 Crop calculations:', {
//         imageSize: `${img.width}x${img.height}`,
//         crop: `${x},${y} ${width}x${height}`
//       });
      
//       // Create canvas for cropping
//       const canvas = document.createElement('canvas');
//       canvas.width = width;
//       canvas.height = height;
//       const ctx = canvas.getContext('2d');
      
//       ctx.imageSmoothingEnabled = true;
//       ctx.imageSmoothingQuality = 'high';
//       ctx.drawImage(img, x, y, width, height, 0, 0, canvas.width, canvas.height);
      
//       // Convert to blob
//       const blob = await new Promise(resolve => {
//         canvas.toBlob(resolve, 'image/png', 1.0);
//       });
      
//       // Send to backend
//       const formData = new FormData();
//       formData.append('file', blob, 'screenshot.png');
      
//       const token = localStorage.getItem('token');
//       const response = await axios.post(
//         `${API_BASE}/ocr/extract`,
//         formData,
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'multipart/form-data',
//           },
//           timeout: 30000,
//         }
//       );
      
//       console.log('OCR Response:', response.data);
      
//       const text = response.data.text || '';
//       const trimmedText = text.trim();
      
//       if (response.data.success && trimmedText) {
//         setExtractedText(trimmedText);
        
//         // Auto copy to clipboard
//         try {
//           await navigator.clipboard.writeText(trimmedText);
//           console.log('✅ Text automatically copied to clipboard');
//         } catch (clipError) {
//           const textarea = document.createElement('textarea');
//           textarea.value = trimmedText;
//           document.body.appendChild(textarea);
//           textarea.select();
//           document.execCommand('copy');
//           document.body.removeChild(textarea);
//         }
        
//         if (onTextExtracted) {
//           onTextExtracted(trimmedText, response.data.coins_spent);
//         }
//       } else {
//         setError(response.data.message || 'No text detected in the selected area.');
//       }
      
//     } catch (err) {
//       console.error('Crop error:', err);
//       if (err.response?.status === 402) {
//         setError('Insufficient coins! Required: 3 coins');
//       } else {
//         setError(err.response?.data?.detail || err.message || 'Failed to process image');
//       }
//     } finally {
//       setIsProcessing(false);
//     }
//   }, [selectedArea, capturedImage, onTextExtracted]);

//   // Copy to clipboard
//   const copyToClipboard = useCallback(async (text) => {
//     try {
//       await navigator.clipboard.writeText(text);
//       alert('✅ Text copied to clipboard!');
//     } catch (err) {
//       const textarea = document.createElement('textarea');
//       textarea.value = text;
//       document.body.appendChild(textarea);
//       textarea.select();
//       document.execCommand('copy');
//       document.body.removeChild(textarea);
//       alert('✅ Text copied to clipboard!');
//     }
//   }, []);

//   // Keyboard shortcuts
//   useEffect(() => {
//     const handleKeyDown = (e) => {
//       if (e.key === 'Escape') {
//         onClose();
//       }
//       if (e.key === 'Enter' && selectedArea && !isProcessing) {
//         cropImage();
//       }
//       if (e.key === 'p' && capturedImage) {
//         setShowPreview(prev => !prev);
//       }
//       if (e.key === '=' && capturedImage) {
//         handleZoomIn();
//       }
//       if (e.key === '-' && capturedImage) {
//         handleZoomOut();
//       }
//       if (e.key === '0' && capturedImage) {
//         handleZoomReset();
//       }
//     };
    
//     document.addEventListener('keydown', handleKeyDown);
//     return () => document.removeEventListener('keydown', handleKeyDown);
//   }, [selectedArea, isProcessing, cropImage, onClose, capturedImage, handleZoomIn, handleZoomOut, handleZoomReset]);

//   // Get the display coordinates for the selection rectangle
//   const getDisplayRect = useCallback(() => {
//     if (!selectedArea || !imageRef.current) return null;
    
//     const rect = imageRef.current.getBoundingClientRect();
//     const displayWidth = rect.width;
//     const displayHeight = rect.height;
    
//     const scaleX = displayWidth / imageNaturalSize.width;
//     const scaleY = displayHeight / imageNaturalSize.height;
    
//     return {
//       left: selectedArea.x * scaleX,
//       top: selectedArea.y * scaleY,
//       width: selectedArea.width * scaleX,
//       height: selectedArea.height * scaleY
//     };
//   }, [selectedArea, imageNaturalSize]);

//   const displayRect = getDisplayRect();

//   return (
//     <div className="screenshot-overlay" ref={containerRef}>
//       <div className="screenshot-header">
//         <h3>📷 Extract Text from Screen</h3>
//         <div className="header-actions">
//           <span className="coin-info">Cost: 3 coins</span>
//           <button className="close-btn" onClick={onClose}>×</button>
//         </div>
//       </div>
      
//       <div className="screenshot-instructions">
//         {!capturedImage ? (
//           <p>Click "Capture Screen" to select an area of your screen containing text</p>
//         ) : (
//           <p>Click and drag on the image to select the text area</p>
//         )}
//         <div className="shortcuts">
//           {!capturedImage ? (
//             <>
//               <kbd>Esc</kbd> to cancel
//             </>
//           ) : (
//             <>
//               <kbd>Enter</kbd> to extract &nbsp;|&nbsp; <kbd>Esc</kbd> to cancel
//               {capturedImage && (
//                 <>
//                   <span style={{marginLeft: '10px'}}><kbd>+</kbd> Zoom in</span>
//                   <span style={{marginLeft: '5px'}}><kbd>-</kbd> Zoom out</span>
//                   <span style={{marginLeft: '5px'}}><kbd>0</kbd> Reset</span>
//                 </>
//               )}
//             </>
//           )}
//         </div>
//       </div>
      
//       <div className="screenshot-canvas">
//         {!capturedImage ? (
//           <div className="capture-section">
//             <div className="capture-icon">🖥️</div>
//             <h3>Capture Screen</h3>
//             <p>This will open your system's screen selection dialog.</p>
//             <p style={{ fontSize: '14px', color: '#888', marginBottom: '20px' }}>
//               Choose the window or screen containing the text you want to extract
//             </p>
//             <button 
//               onClick={captureScreen}
//               disabled={isProcessing || isCapturing}
//               className="take-screenshot-btn"
//             >
//               {isProcessing || isCapturing ? (
//                 <>
//                   <span className="spinner-small"></span>
//                   {isCapturing ? 'Selecting screen...' : 'Processing...'}
//                 </>
//               ) : (
//                 '🎯 Capture Screen'
//               )}
//             </button>
//             {error && (
//               <div className="error-message" style={{position: 'relative', bottom: 'auto', left: 'auto', transform: 'none'}}>
//                 <span>❌ {error}</span>
//                 <button onClick={() => setError('')}>×</button>
//               </div>
//             )}
//           </div>
//         ) : (
//           <div 
//             className="image-container"
//             style={{ 
//               position: 'relative', 
//               width: '100%', 
//               height: '100%',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               background: '#ffffff',
//               padding: 20,
//               margin: 0,
//               overflow: 'auto',
//             }}
//           >
//             {/* Zoom Controls */}
//             <div className="zoom-controls">
//               <button onClick={handleZoomOut} title="Zoom Out (-)">🔍−</button>
//               <span className="zoom-level">{Math.round(zoomLevel * 100)}%</span>
//               <button onClick={handleZoomIn} title="Zoom In (+)">🔍+</button>
//               <button onClick={handleZoomReset} title="Reset Zoom (0)">⟲</button>
//             </div>
            
//             <div style={{
//               position: 'relative',
//               display: 'inline-block',
//               transform: `scale(${zoomLevel})`,
//               transformOrigin: 'center center',
//               transition: 'transform 0.3s ease',
//             }}>
//               <img 
//                 ref={imageRef}
//                 src={capturedImage} 
//                 alt="Screenshot"
//                 className="captured-image"
//                 onMouseDown={handleMouseDown}
//                 style={{
//                   display: 'block',
//                   maxWidth: '100%',
//                   maxHeight: '100%',
//                   cursor: isProcessing ? 'default' : 'crosshair',
//                   userSelect: 'none',
//                   backgroundColor: '#ffffff',
//                 }}
//                 draggable={false}
//                 onLoad={(e) => {
//                   // Store natural size when image loads
//                   const img = e.target;
//                   setImageNaturalSize({
//                     width: img.naturalWidth,
//                     height: img.naturalHeight
//                   });
//                 }}
//               />
              
//               {/* Selection rectangle - using display coordinates */}
//               {displayRect && displayRect.width > 0 && displayRect.height > 0 && (
//                 <div
//                   style={{
//                     position: 'absolute',
//                     left: displayRect.left,
//                     top: displayRect.top,
//                     width: displayRect.width,
//                     height: displayRect.height,
//                     border: '3px solid #00ff00',
//                     background: 'rgba(0, 255, 0, 0.1)',
//                     pointerEvents: 'none',
//                     zIndex: 5,
//                   }}
//                 >
//                   <div style={{
//                     position: 'absolute',
//                     bottom: '-28px',
//                     left: '0',
//                     color: '#00ff00',
//                     fontSize: '12px',
//                     background: 'rgba(0, 0, 0, 0.8)',
//                     padding: '2px 10px',
//                     borderRadius: '4px',
//                     fontFamily: 'monospace',
//                     whiteSpace: 'nowrap',
//                   }}>
//                     {Math.round(selectedArea.width)} × {Math.round(selectedArea.height)}
//                   </div>
//                 </div>
//               )}
//             </div>
            
//             {/* Crop button */}
//             {selectedArea && selectedArea.width > 20 && selectedArea.height > 20 && !isProcessing && (
//               <button
//                 className="crop-btn"
//                 onClick={cropImage}
//                 style={{
//                   position: 'absolute',
//                   left: '50%',
//                   top: '50%',
//                   padding: '14px 32px',
//                   background: '#00ff00',
//                   color: '#333',
//                   border: 'none',
//                   borderRadius: '10px',
//                   fontWeight: 'bold',
//                   cursor: 'pointer',
//                   fontSize: '20px',
//                   transform: 'translate(-50%, -50%)',
//                   boxShadow: '0 4px 30px rgba(0, 255, 0, 0.5)',
//                   transition: 'all 0.3s ease',
//                   zIndex: 10,
//                 }}
//                 onMouseEnter={(e) => {
//                   e.target.style.transform = 'translate(-50%, -50%) scale(1.1)';
//                   e.target.style.boxShadow = '0 6px 40px rgba(0, 255, 0, 0.7)';
//                 }}
//                 onMouseLeave={(e) => {
//                   e.target.style.transform = 'translate(-50%, -50%) scale(1)';
//                   e.target.style.boxShadow = '0 4px 30px rgba(0, 255, 0, 0.5)';
//                 }}
//               >
//                 ✂️ Extract Text
//               </button>
//             )}
            
//             {/* Retake button */}
//             {!isProcessing && (
//               <button
//                 className="retake-btn"
//                 onClick={() => {
//                   setCapturedImage(null);
//                   setSelectedArea(null);
//                   setShowPreview(false);
//                   setImageNaturalSize({ width: 0, height: 0 });
//                   setZoomLevel(1);
//                 }}
//                 style={{
//                   position: 'absolute',
//                   top: '10px',
//                   right: '10px',
//                   padding: '8px 20px',
//                   background: 'rgba(255, 255, 255, 0.95)',
//                   color: '#333',
//                   border: 'none',
//                   borderRadius: '8px',
//                   cursor: 'pointer',
//                   fontSize: '14px',
//                   fontWeight: '500',
//                   zIndex: 10,
//                   boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
//                 }}
//               >
//                 🔄 Retake
//               </button>
//             )}
            
//             {/* Processing overlay */}
//             {isProcessing && (
//               <div className="processing-overlay">
//                 <div className="spinner"></div>
//                 <p>Processing...</p>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
      
//       {/* Error message */}
//       {error && capturedImage && (
//         <div className="error-message">
//           <span>❌ {error}</span>
//           <button onClick={() => setError('')}>×</button>
//         </div>
//       )}
      
//       {/* Extracted Text */}
//       {extractedText && extractedText.trim() && (
//         <div className="extracted-text">
//           <div className="text-header">
//             <span>📝 Extracted Text</span>
//             <div className="text-actions-header">
//               <button 
//                 className="copy-btn"
//                 onClick={() => copyToClipboard(extractedText)}
//               >
//                 📋 Copy
//               </button>
//               <button 
//                 className="close-text-btn"
//                 onClick={() => setExtractedText('')}
//               >
//                 ✕
//               </button>
//             </div>
//           </div>
//           <div className="text-content">
//             {extractedText}
//           </div>
//           <div className="text-actions-footer">
//             <button 
//               className="action-btn google"
//               onClick={() => {
//                 window.open(`https://www.google.com/search?q=${encodeURIComponent(extractedText)}`, '_blank');
//               }}
//             >
//               🔍 Search Google
//             </button>
//             <button 
//               className="action-btn chatgpt"
//               onClick={() => {
//                 window.open(`https://chat.openai.com/`, '_blank');
//               }}
//             >
//               🤖 Ask ChatGPT
//             </button>
//           </div>
//         </div>
//       )}
      
//       <style jsx>{`
//         .screenshot-overlay {
//           position: fixed;
//           top: 0;
//           left: 0;
//           right: 0;
//           bottom: 0;
//           background: rgba(0, 0, 0, 0.9);
//           z-index: 9999;
//           display: flex;
//           flex-direction: column;
//           padding: 20px;
//           font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
//           transition: opacity 0.3s ease;
//         }
        
//         .screenshot-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           color: white;
//           padding: 10px 20px;
//           background: rgba(255, 255, 255, 0.05);
//           border-radius: 8px;
//           margin-bottom: 10px;
//           flex-shrink: 0;
//         }
        
//         .screenshot-header h3 {
//           margin: 0;
//           font-size: 18px;
//         }
        
//         .header-actions {
//           display: flex;
//           align-items: center;
//           gap: 15px;
//         }
        
//         .coin-info {
//           background: #ffd700;
//           color: #333;
//           padding: 4px 12px;
//           border-radius: 12px;
//           font-weight: bold;
//           font-size: 13px;
//         }
        
//         .close-btn {
//           background: none;
//           border: none;
//           color: white;
//           font-size: 28px;
//           cursor: pointer;
//           padding: 0 10px;
//           transition: transform 0.2s;
//         }
        
//         .close-btn:hover {
//           transform: scale(1.2);
//         }
        
//         .screenshot-instructions {
//           color: #ccc;
//           padding: 10px 20px;
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           flex-wrap: wrap;
//           gap: 10px;
//           flex-shrink: 0;
//         }
        
//         .screenshot-instructions p {
//           margin: 0;
//           font-size: 14px;
//         }
        
//         .shortcuts {
//           font-size: 13px;
//         }
        
//         .shortcuts kbd {
//           background: rgba(255, 255, 255, 0.1);
//           padding: 2px 10px;
//           border-radius: 4px;
//           margin: 0 4px;
//           font-size: 12px;
//           color: #fff;
//           border: 1px solid rgba(255, 255, 255, 0.15);
//         }
        
//         .screenshot-canvas {
//           flex: 1;
//           position: relative;
//           border: 2px dashed rgba(255, 255, 255, 0.1);
//           border-radius: 8px;
//           margin-top: 10px;
//           min-height: 300px;
//           overflow: hidden;
//           background: rgba(0, 0, 0, 0.3);
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           width: 100%;
//           padding: 0;
//           margin: 0;
//         }
        
//         .capture-section {
//           text-align: center;
//           color: white;
//           padding: 40px;
//           max-width: 500px;
//         }
        
//         .capture-icon {
//           font-size: 64px;
//           margin-bottom: 20px;
//         }
        
//         .capture-section h3 {
//           font-size: 24px;
//           margin-bottom: 10px;
//         }
        
//         .capture-section p {
//           color: #aaa;
//           margin-bottom: 10px;
//           line-height: 1.6;
//         }
        
//         .take-screenshot-btn {
//           padding: 14px 40px;
//           background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//           color: white;
//           border: none;
//           border-radius: 12px;
//           font-size: 18px;
//           font-weight: bold;
//           cursor: pointer;
//           transition: all 0.3s ease;
//           margin-top: 10px;
//         }
        
//         .take-screenshot-btn:hover:not(:disabled) {
//           transform: translateY(-2px);
//           box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
//         }
        
//         .take-screenshot-btn:disabled {
//           opacity: 0.7;
//           cursor: not-allowed;
//         }
        
//         .spinner-small {
//           display: inline-block;
//           width: 18px;
//           height: 18px;
//           border: 3px solid rgba(255, 255, 255, 0.3);
//           border-radius: 50%;
//           border-top-color: #fff;
//           animation: spin 0.8s linear infinite;
//           margin-right: 10px;
//         }
        
//         @keyframes spin {
//           to { transform: rotate(360deg); }
//         }
        
//         .image-container {
//           position: relative;
//           width: 100%;
//           height: 100%;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           background: #ffffff;
//           padding: 20px;
//           margin: 0;
//           overflow: auto;
//         }
        
//         .captured-image {
//           display: block;
//           max-width: 100%;
//           max-height: 100%;
//           cursor: crosshair;
//           user-select: none;
//           background-color: #ffffff;
//         }
        
//         .zoom-controls {
//           position: absolute;
//           bottom: 20px;
//           left: 50%;
//           transform: translateX(-50%);
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           background: rgba(0, 0, 0, 0.7);
//           padding: 8px 12px;
//           border-radius: 10px;
//           z-index: 15;
//           backdrop-filter: blur(10px);
//           border: 1px solid rgba(255, 255, 255, 0.1);
//         }
        
//         .zoom-controls button {
//           background: rgba(255, 255, 255, 0.1);
//           border: none;
//           color: white;
//           padding: 4px 10px;
//           border-radius: 6px;
//           cursor: pointer;
//           font-size: 14px;
//           transition: all 0.2s;
//         }
        
//         .zoom-controls button:hover {
//           background: rgba(255, 255, 255, 0.2);
//           transform: scale(1.05);
//         }
        
//         .zoom-level {
//           color: white;
//           font-size: 13px;
//           font-weight: bold;
//           min-width: 50px;
//           text-align: center;
//         }
        
//         .crop-btn {
//           position: absolute;
//           padding: 14px 32px;
//           background: #00ff00;
//           color: #333;
//           border: none;
//           border-radius: 10px;
//           font-weight: bold;
//           cursor: pointer;
//           font-size: 20px;
//           transform: translate(-50%, -50%);
//           box-shadow: 0 4px 30px rgba(0, 255, 0, 0.5);
//           transition: all 0.3s ease;
//           z-index: 10;
//         }
        
//         .crop-btn:hover {
//           transform: translate(-50%, -50%) scale(1.1);
//           box-shadow: 0 6px 40px rgba(0, 255, 0, 0.7);
//         }
        
//         .retake-btn:hover {
//           background: rgba(255, 255, 255, 1);
//         }
        
//         .processing-overlay {
//           position: absolute;
//           top: 0;
//           left: 0;
//           right: 0;
//           bottom: 0;
//           background: rgba(0, 0, 0, 0.8);
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           justify-content: center;
//           color: white;
//           border-radius: 8px;
//           z-index: 20;
//         }
        
//         .spinner {
//           width: 50px;
//           height: 50px;
//           border: 4px solid rgba(255, 255, 255, 0.2);
//           border-top: 4px solid #00ff00;
//           border-radius: 50%;
//           animation: spin 1s linear infinite;
//         }
        
//         .processing-overlay p {
//           margin-top: 20px;
//           color: #ccc;
//         }
        
//         .error-message {
//           position: fixed;
//           bottom: 30px;
//           left: 50%;
//           transform: translateX(-50%);
//           background: #dc3545;
//           color: white;
//           padding: 14px 24px;
//           border-radius: 10px;
//           display: flex;
//           align-items: center;
//           gap: 15px;
//           box-shadow: 0 4px 20px rgba(220, 53, 69, 0.4);
//           max-width: 90%;
//           z-index: 10000;
//         }
        
//         .error-message button {
//           background: none;
//           border: none;
//           color: white;
//           font-size: 24px;
//           cursor: pointer;
//           padding: 0 5px;
//         }
        
//         .extracted-text {
//           position: fixed;
//           bottom: 30px;
//           right: 30px;
//           max-width: 500px;
//           min-width: 300px;
//           max-height: 450px;
//           background: white;
//           border-radius: 12px;
//           box-shadow: 0 8px 40px rgba(0, 0, 0, 0.4);
//           overflow: hidden;
//           animation: slideUp 0.3s ease;
//           z-index: 10000;
//           display: flex;
//           flex-direction: column;
//         }
        
//         @keyframes slideUp {
//           from {
//             transform: translateY(20px) scale(0.95);
//             opacity: 0;
//           }
//           to {
//             transform: translateY(0) scale(1);
//             opacity: 1;
//           }
//         }
        
//         .text-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           padding: 12px 16px;
//           background: #f8f9fa;
//           border-bottom: 1px solid #e9ecef;
//           flex-shrink: 0;
//         }
        
//         .text-header span {
//           font-weight: bold;
//           color: #333;
//         }
        
//         .text-actions-header {
//           display: flex;
//           gap: 8px;
//         }
        
//         .copy-btn {
//           padding: 4px 14px;
//           background: #007bff;
//           color: white;
//           border: none;
//           border-radius: 6px;
//           cursor: pointer;
//           font-size: 13px;
//           transition: background 0.2s;
//         }
        
//         .copy-btn:hover {
//           background: #0056b3;
//         }
        
//         .close-text-btn {
//           padding: 4px 10px;
//           background: #dc3545;
//           color: white;
//           border: none;
//           border-radius: 6px;
//           cursor: pointer;
//           font-size: 16px;
//           transition: background 0.2s;
//         }
        
//         .close-text-btn:hover {
//           background: #c82333;
//         }
        
//         .text-content {
//           padding: 16px;
//           max-height: 150px;
//           overflow-y: auto;
//           white-space: pre-wrap;
//           word-wrap: break-word;
//           font-size: 14px;
//           color: #333;
//           line-height: 1.6;
//           background: #fff;
//           flex: 1;
//         }
        
//         .text-actions-footer {
//           display: flex;
//           gap: 8px;
//           padding: 12px 16px;
//           border-top: 1px solid #e9ecef;
//           background: #f8f9fa;
//           flex-wrap: wrap;
//           flex-shrink: 0;
//         }
        
//         .action-btn {
//           flex: 1;
//           padding: 8px 12px;
//           border: none;
//           border-radius: 6px;
//           cursor: pointer;
//           font-size: 13px;
//           font-weight: 500;
//           transition: all 0.2s ease;
//           min-width: 80px;
//           text-align: center;
//         }
        
//         .action-btn.google {
//           background: #28a745;
//           color: white;
//         }
        
//         .action-btn.google:hover {
//           background: #218838;
//           transform: translateY(-2px);
//           box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
//         }
        
//         .action-btn.chatgpt {
//           background: #6c5ce7;
//           color: white;
//         }
        
//         .action-btn.chatgpt:hover {
//           background: #5f3dc4;
//           transform: translateY(-2px);
//           box-shadow: 0 4px 12px rgba(108, 92, 231, 0.3);
//         }
        
//         .text-content::-webkit-scrollbar {
//           width: 6px;
//         }
        
//         .text-content::-webkit-scrollbar-track {
//           background: #f1f1f1;
//           border-radius: 3px;
//         }
        
//         .text-content::-webkit-scrollbar-thumb {
//           background: #c1c1c1;
//           border-radius: 3px;
//         }
        
//         .text-content::-webkit-scrollbar-thumb:hover {
//           background: #a8a8a8;
//         }
        
//         @media (max-width: 768px) {
//           .screenshot-overlay {
//             padding: 10px;
//           }
          
//           .screenshot-instructions {
//             flex-direction: column;
//             align-items: flex-start;
//             gap: 5px;
//           }
          
//           .extracted-text {
//             max-width: calc(100% - 20px);
//             min-width: calc(100% - 20px);
//             right: 10px;
//             bottom: 10px;
//             max-height: 400px;
//           }
          
//           .text-actions-footer {
//             flex-direction: column;
//           }
          
//           .action-btn {
//             min-width: auto;
//           }
          
//           .zoom-controls {
//             bottom: 10px;
//             padding: 6px 10px;
//           }
          
//           .zoom-controls button {
//             padding: 2px 8px;
//             font-size: 12px;
//           }
          
//           .zoom-level {
//             min-width: 40px;
//             font-size: 11px;
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default ScreenshotCapture;




// components/ScreenshotCapture.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE = "http://127.0.0.1:8000";

const ScreenshotCapture = ({ onClose, onTextExtracted }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  // Selection states
  const [selectedArea, setSelectedArea] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [imageNaturalSize, setImageNaturalSize] = useState({ width: 0, height: 0 });
  
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  
  // Get position relative to image with zoom correction
  const getPosition = useCallback((e) => {
    if (!imageRef.current) return { x: 0, y: 0 };
    
    const rect = imageRef.current.getBoundingClientRect();
    
    // Get the actual displayed size of the image
    const displayWidth = rect.width;
    const displayHeight = rect.height;
    
    // Calculate position in the image's natural coordinates
    const x = ((e.clientX - rect.left) / displayWidth) * imageNaturalSize.width;
    const y = ((e.clientY - rect.top) / displayHeight) * imageNaturalSize.height;
    
    return {
      x: Math.max(0, Math.min(x, imageNaturalSize.width)),
      y: Math.max(0, Math.min(y, imageNaturalSize.height))
    };
  }, [imageNaturalSize]);

  // Step 1: Capture the screen using native API with better quality
  const captureScreen = useCallback(async () => {
    try {
      setIsProcessing(true);
      setError('');
      setCapturedImage(null);
      setSelectedArea(null);
      setIsCapturing(true);
      
      // Temporarily hide the overlay to avoid capturing it
      const overlay = containerRef.current;
      if (overlay) {
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
      }
      
      // Wait for DOM update
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Get the screen dimensions for optimal quality
      const screenWidth = window.screen.width * window.devicePixelRatio;
      const screenHeight = window.screen.height * window.devicePixelRatio;
      
      // Use the Screen Capture API with higher quality settings
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor',
          cursor: 'always',
          width: { ideal: Math.max(1920, screenWidth) },
          height: { ideal: Math.max(1080, screenHeight) },
          frameRate: { ideal: 30 }
        },
        audio: false,
        preferCurrentTab: false,
      });
      
      // Create video element to capture frames
      const video = document.createElement('video');
      video.srcObject = stream;
      
      // Wait for video to be ready
      await new Promise((resolve) => {
        video.onloadedmetadata = () => {
          video.play();
          resolve();
        };
      });
      
      // Wait a moment for the video to be ready
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create canvas with the video dimensions (high quality)
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || screenWidth;
      canvas.height = video.videoHeight || screenHeight;
      const ctx = canvas.getContext('2d');
      
      // Enable high-quality rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Draw the video frame to canvas
      ctx.drawImage(video, 0, 0);
      
      // Stop all tracks
      stream.getTracks().forEach(track => track.stop());
      video.srcObject = null;
      
      // Restore the overlay
      if (overlay) {
        overlay.style.opacity = '1';
        overlay.style.pointerEvents = 'auto';
      }
      
      // Convert to data URL with high quality
      const imageData = canvas.toDataURL('image/png', 1.0);
      setCapturedImage(imageData);
      setImageNaturalSize({
        width: canvas.width,
        height: canvas.height
      });
      setShowPreview(true);
      setIsCapturing(false);
      setZoomLevel(1); // Reset zoom when new image is captured
      
      console.log('✅ Screenshot captured:', canvas.width, 'x', canvas.height);
      
    } catch (err) {
      console.error('Screen capture error:', err);
      setIsCapturing(false);
      
      // Restore the overlay
      const overlay = containerRef.current;
      if (overlay) {
        overlay.style.opacity = '1';
        overlay.style.pointerEvents = 'auto';
      }
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Permission denied. Please allow screen sharing to capture the image.');
      } else if (err.name === 'AbortError' || err.message?.includes('aborted')) {
        setError('Screen capture was cancelled.');
      } else {
        setError('Failed to capture screen: ' + (err.message || 'Unknown error'));
      }
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
      x: pos.x,
      y: pos.y,
      width: 0,
      height: 0
    });
  }, [capturedImage, isProcessing, getPosition]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !capturedImage) return;
      
      const pos = getPosition(e);
      
      const x = Math.min(startPos.x, pos.x);
      const y = Math.min(startPos.y, pos.y);
      const width = Math.abs(pos.x - startPos.x);
      const height = Math.abs(pos.y - startPos.y);
      
      setSelectedArea({
        x,
        y,
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

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 0.2, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoomLevel(1);
  }, []);

  // Get the display coordinates for the selection rectangle - FIXED FOR ZOOM
  const getDisplayRect = useCallback(() => {
    if (!selectedArea || !imageRef.current) return null;
    
    const rect = imageRef.current.getBoundingClientRect();
    const displayWidth = rect.width;
    const displayHeight = rect.height;
    
    // Calculate the scale from natural to display
    const scaleX = displayWidth / imageNaturalSize.width;
    const scaleY = displayHeight / imageNaturalSize.height;
    
    // Apply zoom to the scale
    const zoomedScaleX = scaleX * zoomLevel;
    const zoomedScaleY = scaleY * zoomLevel;
    
    // Get the container to calculate centering offsets
    const containerRect = imageRef.current.parentElement.getBoundingClientRect();
    const imageDisplayWidth = rect.width;
    const imageDisplayHeight = rect.height;
    
    // Calculate the offset due to centering (the image is centered in the container)
    const offsetX = (containerRect.width - imageDisplayWidth) / 2;
    const offsetY = (containerRect.height - imageDisplayHeight) / 2;
    
    // The image might be scaled down to fit the container, so we need to adjust
    // The actual displayed size of the image in the container
    const actualDisplayWidth = imageDisplayWidth;
    const actualDisplayHeight = imageDisplayHeight;
    
    // Calculate the position of the selection in display coordinates
    // The selection coordinates are in image space, we need to convert to display space
    // with the zoom factor applied and centering offset
    const left = (selectedArea.x * (actualDisplayWidth / imageNaturalSize.width)) + offsetX;
    const top = (selectedArea.y * (actualDisplayHeight / imageNaturalSize.height)) + offsetY;
    const width = selectedArea.width * (actualDisplayWidth / imageNaturalSize.width);
    const height = selectedArea.height * (actualDisplayHeight / imageNaturalSize.height);
    
    return {
      left,
      top,
      width,
      height
    };
  }, [selectedArea, imageNaturalSize, zoomLevel]);

  const displayRect = getDisplayRect();

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
      
      // Use the selection coordinates directly (already in image coordinates)
      const x = Math.round(selectedArea.x);
      const y = Math.round(selectedArea.y);
      const width = Math.round(selectedArea.width);
      const height = Math.round(selectedArea.height);
      
      console.log('📐 Crop calculations:', {
        imageSize: `${img.width}x${img.height}`,
        crop: `${x},${y} ${width}x${height}`
      });
      
      // Create canvas for cropping
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, x, y, width, height, 0, 0, canvas.width, canvas.height);
      
      // Convert to blob
      const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, 'image/png', 1.0);
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
      if (e.key === '=' && capturedImage) {
        handleZoomIn();
      }
      if (e.key === '-' && capturedImage) {
        handleZoomOut();
      }
      if (e.key === '0' && capturedImage) {
        handleZoomReset();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedArea, isProcessing, cropImage, onClose, capturedImage, handleZoomIn, handleZoomOut, handleZoomReset]);

  return (
    <div className="screenshot-overlay" ref={containerRef}>
      <div className="screenshot-header">
        <h3>📷 Extract Text from Screen</h3>
        <div className="header-actions">
          <span className="coin-info">Cost: 3 coins</span>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
      </div>
      
      <div className="screenshot-instructions">
        {!capturedImage ? (
          <p>Click "Capture Screen" to select an area of your screen containing text</p>
        ) : (
          <p>Click and drag on the image to select the text area</p>
        )}
        <div className="shortcuts">
          {!capturedImage ? (
            <>
              <kbd>Esc</kbd> to cancel
            </>
          ) : (
            <>
              <kbd>Enter</kbd> to extract &nbsp;|&nbsp; <kbd>Esc</kbd> to cancel
              {capturedImage && (
                <>
                  <span style={{marginLeft: '10px'}}><kbd>+</kbd> Zoom in</span>
                  <span style={{marginLeft: '5px'}}><kbd>-</kbd> Zoom out</span>
                  <span style={{marginLeft: '5px'}}><kbd>0</kbd> Reset</span>
                </>
              )}
            </>
          )}
        </div>
      </div>
      
      <div className="screenshot-canvas">
        {!capturedImage ? (
          <div className="capture-section">
            <div className="capture-icon">🖥️</div>
            <h3>Capture Screen</h3>
            <p>This will open your system's screen selection dialog.</p>
            <p style={{ fontSize: '14px', color: '#888', marginBottom: '20px' }}>
              Choose the window or screen containing the text you want to extract
            </p>
            <button 
              onClick={captureScreen}
              disabled={isProcessing || isCapturing}
              className="take-screenshot-btn"
            >
              {isProcessing || isCapturing ? (
                <>
                  <span className="spinner-small"></span>
                  {isCapturing ? 'Selecting screen...' : 'Processing...'}
                </>
              ) : (
                '🎯 Capture Screen'
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
              padding: 20,
              margin: 0,
              overflow: 'auto',
            }}
          >
            {/* Zoom Controls */}
            <div className="zoom-controls">
              <button onClick={handleZoomOut} title="Zoom Out (-)">🔍−</button>
              <span className="zoom-level">{Math.round(zoomLevel * 100)}%</span>
              <button onClick={handleZoomIn} title="Zoom In (+)">🔍+</button>
              <button onClick={handleZoomReset} title="Reset Zoom (0)">⟲</button>
            </div>
            
            <div style={{
              position: 'relative',
              display: 'inline-block',
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center center',
              transition: 'transform 0.3s ease',
            }}>
              <img 
                ref={imageRef}
                src={capturedImage} 
                alt="Screenshot"
                className="captured-image"
                onMouseDown={handleMouseDown}
                style={{
                  display: 'block',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  cursor: isProcessing ? 'default' : 'crosshair',
                  userSelect: 'none',
                  backgroundColor: '#ffffff',
                }}
                draggable={false}
                onLoad={(e) => {
                  // Store natural size when image loads
                  const img = e.target;
                  setImageNaturalSize({
                    width: img.naturalWidth,
                    height: img.naturalHeight
                  });
                }}
              />
              
              {/* Selection rectangle - using display coordinates */}
              {displayRect && displayRect.width > 0 && displayRect.height > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    left: displayRect.left,
                    top: displayRect.top,
                    width: displayRect.width,
                    height: displayRect.height,
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
            </div>
            
            {/* Crop button */}
            {selectedArea && selectedArea.width > 20 && selectedArea.height > 20 && !isProcessing && (
              <button
                className="crop-btn"
                onClick={cropImage}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  padding: '14px 32px',
                  background: '#00ff00',
                  color: '#333',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '20px',
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 4px 30px rgba(0, 255, 0, 0.5)',
                  transition: 'all 0.3s ease',
                  zIndex: 10,
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translate(-50%, -50%) scale(1.1)';
                  e.target.style.boxShadow = '0 6px 40px rgba(0, 255, 0, 0.7)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translate(-50%, -50%) scale(1)';
                  e.target.style.boxShadow = '0 4px 30px rgba(0, 255, 0, 0.5)';
                }}
              >
                ✂️ Extract Text
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
                  setImageNaturalSize({ width: 0, height: 0 });
                  setZoomLevel(1);
                }}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  padding: '8px 20px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  color: '#333',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  zIndex: 10,
                  boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
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
          transition: opacity 0.3s ease;
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
          max-width: 500px;
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
          margin-bottom: 10px;
          line-height: 1.6;
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
          margin-top: 10px;
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
          padding: 20px;
          margin: 0;
          overflow: auto;
        }
        
        .captured-image {
          display: block;
          max-width: 100%;
          max-height: 100%;
          cursor: crosshair;
          user-select: none;
          background-color: #ffffff;
        }
        
        .zoom-controls {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(0, 0, 0, 0.7);
          padding: 8px 12px;
          border-radius: 10px;
          z-index: 15;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .zoom-controls button {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: white;
          padding: 4px 10px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }
        
        .zoom-controls button:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.05);
        }
        
        .zoom-level {
          color: white;
          font-size: 13px;
          font-weight: bold;
          min-width: 50px;
          text-align: center;
        }
        
        .crop-btn {
          position: absolute;
          padding: 14px 32px;
          background: #00ff00;
          color: #333;
          border: none;
          border-radius: 10px;
          font-weight: bold;
          cursor: pointer;
          font-size: 20px;
          transform: translate(-50%, -50%);
          box-shadow: 0 4px 30px rgba(0, 255, 0, 0.5);
          transition: all 0.3s ease;
          z-index: 10;
        }
        
        .crop-btn:hover {
          transform: translate(-50%, -50%) scale(1.1);
          box-shadow: 0 6px 40px rgba(0, 255, 0, 0.7);
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
          
          .zoom-controls {
            bottom: 10px;
            padding: 6px 10px;
          }
          
          .zoom-controls button {
            padding: 2px 8px;
            font-size: 12px;
          }
          
          .zoom-level {
            min-width: 40px;
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
};

export default ScreenshotCapture;