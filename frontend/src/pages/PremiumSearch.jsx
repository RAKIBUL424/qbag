
// PremiumSearch.jsx - Complete with Realtime Expiration Timer
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import CountdownTimer from "../components/CountdownTimer";

import { Link } from "react-router";

const API_BASE = "/api";

// Question Grid Component


// Question Grid Component - Complete with Full-Size Image Expansion
const QuestionGrid = ({ questions, purchase, API_BASE, onRefresh }) => {
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  const [expandedImage, setExpandedImage] = useState(null);

  if (!questions || questions.length === 0) {
    return <p style={{ padding: "20px", textAlign: "center", color: "#666" }}>No questions available.</p>;
  }

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    if (imagePath.startsWith('/uploads/') || imagePath.startsWith('/media/')) {
      return `${API_BASE}${imagePath}`;
    }
    if (!imagePath.includes('/')) {
      return `${API_BASE}/uploads/questions/${imagePath}`;
    }
    return `${API_BASE}/${imagePath}`;
  };

  const toggleQuestion = (questionId) => {
    setExpandedQuestion(expandedQuestion === questionId ? null : questionId);
  };

  const handleImageError = (questionId, imageIndex) => {
    setImageErrors(prev => ({
      ...prev,
      [`${questionId}-${imageIndex}`]: true
    }));
  };

  const getQuestionImages = (question) => {
    if (question.images && question.images.length > 0) {
      return question.images;
    }
    if (question.image_path) {
      return [{ url: question.image_path, id: 'single' }];
    }
    return [];
  };

  const handleImageClick = (e, imageUrl) => {
    e.stopPropagation();
    setExpandedImage(imageUrl);
  };

  const closeImageModal = () => {
    setExpandedImage(null);
  };

  // Close modal on Escape key press
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && expandedImage) {
        closeImageModal();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [expandedImage]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (expandedImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [expandedImage]);

  return (
    <div style={{ marginTop: "30px" }}>
      {/* Purchase Details with Timer */}
      {purchase && (
        <div style={{
          padding: "15px",
          backgroundColor: "#d4edda",
          borderRadius: "4px",
          marginBottom: "20px",
          border: "1px solid #c3e6cb"
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px"
          }}>
            <h3 style={{ margin: "0" }}>
              📚 {purchase.subject?.toUpperCase() || 'Subject'} - {purchase.exam_type?.toUpperCase() || 'Exam'}
            </h3>
            {purchase.expiry_date && (
              <div style={{
                padding: "5px 12px",
                backgroundColor: "white",
                borderRadius: "4px",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <span>⏰ Time Remaining:</span>
                <CountdownTimer
                  expiryDate={purchase.expiry_date}
                  onExpire={() => {
                    if (onRefresh) onRefresh();
                  }}
                />
              </div>
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px", marginTop: "10px" }}>
            <p style={{ margin: "5px 0" }}><strong>University:</strong> {purchase.university || 'N/A'}</p>
            <p style={{ margin: "5px 0" }}><strong>Year:</strong> {purchase.year || 'N/A'} | <strong>Semester:</strong> {purchase.semester || 'N/A'}</p>
            <p style={{ margin: "5px 0" }}><strong>Total Questions:</strong> {purchase.total_questions || questions.length}</p>
            <p style={{ margin: "5px 0" }}><strong>Coins Spent:</strong> {purchase.coins_spent || 0}</p>
          </div>
        </div>
      )}

      {/* Questions Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
        gap: "20px"
      }}>
        {questions.map((q, index) => {
          const images = getQuestionImages(q);
          const isExpanded = expandedQuestion === q.id;

          return (
            <div
              key={q.id || index}
              style={{
                border: isExpanded ? "2px solid #007bff" : "1px solid #ddd",
                borderRadius: "8px",
                padding: "15px",
                backgroundColor: isExpanded ? "#f8f9ff" : "#fff",
                boxShadow: isExpanded ? "0 4px 12px rgba(0,0,0,0.15)" : "0 2px 4px rgba(0,0,0,0.05)",
                transition: "all 0.3s ease",
                cursor: "pointer"
              }}
              onClick={() => toggleQuestion(q.id)}
              onMouseEnter={(e) => {
                if (!isExpanded) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isExpanded) {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
                }
              }}
            >
              {/* Question Header */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px"
              }}>
                <div style={{
                  fontWeight: "bold",
                  color: "#007bff",
                  fontSize: "16px"
                }}>
                  Question {index + 1}
                </div>
                {q.exam_type && (
                  <span style={{
                    padding: "2px 10px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    backgroundColor: q.exam_type === "Final" ? "#dc3545" :
                      q.exam_type === "Mid" ? "#ffc107" : "#28a745",
                    color: q.exam_type === "Mid" ? "#333" : "white"
                  }}>
                    {q.exam_type}
                  </span>
                )}
              </div>

              {/* Question Text */}
              {q.question_text && (
                <div style={{
                  marginBottom: "10px",
                  fontSize: "15px",
                  color: "#333",
                  lineHeight: "1.6"
                }}>
                  {q.question_text}
                </div>
              )}

              {/* Images */}
              {images.length > 0 ? (
                <div style={{ marginBottom: "10px" }}>
                  {images.map((image, imgIndex) => {
                    const errorKey = `${q.id}-${imgIndex}`;
                    const imageUrl = getImageUrl(image.url || image.image_path || image);

                    if (imageErrors[errorKey]) {
                      return (
                        <div key={imgIndex} style={{
                          padding: "20px",
                          backgroundColor: "#f8f9fa",
                          borderRadius: "4px",
                          textAlign: "center",
                          color: "#666",
                          marginBottom: "5px"
                        }}>
                          <p>⚠️ Image not available</p>
                          {image.file_name && (
                            <p style={{ fontSize: "12px", color: "#999" }}>{image.file_name}</p>
                          )}
                        </div>
                      );
                    }

                    return (
                      <div key={imgIndex} style={{ marginBottom: "10px" }}>
                        <img
                          src={imageUrl}
                          alt={`Question ${index + 1} - Image ${imgIndex + 1}`}
                          style={{
                            width: "100%",
                            height: "auto",
                            maxHeight: isExpanded ? "400px" : "200px",
                            objectFit: "contain",
                            borderRadius: "4px",
                            border: "1px solid #eee",
                            transition: "max-height 0.3s ease",
                            cursor: "pointer"
                          }}
                          onClick={(e) => handleImageClick(e, imageUrl)}
                          onError={() => handleImageError(q.id, imgIndex)}
                          loading="lazy"
                        />
                        <div style={{
                          fontSize: "11px",
                          color: "#999",
                          textAlign: "center",
                          marginTop: "4px"
                        }}>
                          🔍 Click image to enlarge
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{
                  padding: "15px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "4px",
                  textAlign: "center",
                  color: "#999",
                  marginBottom: "10px"
                }}>
                  <span>📷 No image</span>
                </div>
              )}

              {/* Expanded Content */}
              {isExpanded && (
                <div style={{
                  marginTop: "15px",
                  paddingTop: "15px",
                  borderTop: "1px solid #e9ecef"
                }}>
                  {q.options && q.options.length > 0 && (
                    <div style={{ marginBottom: "10px" }}>
                      <strong style={{ display: "block", marginBottom: "8px" }}>Options:</strong>
                      <ul style={{
                        listStyle: "none",
                        padding: "0",
                        margin: "0"
                      }}>
                        {q.options.map((option, optIndex) => {
                          const isCorrect = option === q.answer;
                          return (
                            <li key={optIndex} style={{
                              padding: "8px 12px",
                              marginBottom: "5px",
                              backgroundColor: isCorrect ? "#d4edda" : "#f8f9fa",
                              border: isCorrect ? "1px solid #28a745" : "1px solid #dee2e6",
                              borderRadius: "4px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center"
                            }}>
                              <span>{String.fromCharCode(65 + optIndex)}. {option}</span>
                              {isCorrect && (
                                <span style={{
                                  color: "#28a745",
                                  fontWeight: "bold",
                                  fontSize: "14px"
                                }}>
                                  ✅ Correct
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  {q.answer && !q.options && (
                    <div style={{
                      padding: "8px 12px",
                      backgroundColor: "#d4edda",
                      borderRadius: "4px",
                      marginBottom: "10px"
                    }}>
                      <strong>Answer:</strong> {q.answer}
                    </div>
                  )}

                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                    gap: "8px",
                    fontSize: "13px",
                    color: "#666",
                    backgroundColor: "#f8f9fa",
                    padding: "10px",
                    borderRadius: "4px"
                  }}>
                    {q.subject && <div><strong>Subject:</strong> {q.subject}</div>}
                    {q.course && <div><strong>Course:</strong> {q.course}</div>}
                    {q.year && <div><strong>Year:</strong> {q.year}</div>}
                    {q.semester && <div><strong>Semester:</strong> {q.semester}</div>}
                    {q.marks && <div><strong>Marks:</strong> {q.marks}</div>}
                  </div>
                </div>
              )}

              <div style={{
                marginTop: "10px",
                fontSize: "12px",
                color: isExpanded ? "#007bff" : "#999",
                textAlign: "center",
                borderTop: "1px solid #f0f0f0",
                paddingTop: "10px"
              }}>
                {isExpanded ? "👆 Click to collapse" : "👆 Click to view details"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Full-Size Image Modal */}
      {expandedImage && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.92)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            cursor: "pointer",
            animation: "fadeIn 0.3s ease"
          }}
          onClick={closeImageModal}
        >
          <div
            style={{
              position: "relative",
              maxWidth: "95vw",
              maxHeight: "95vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <img
              src={expandedImage}
              alt="Enlarged view"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                borderRadius: "8px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                animation: "zoomIn 0.3s ease"
              }}
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* Close Button */}
            <button
              onClick={closeImageModal}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                color: "white",
                border: "2px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "50%",
                width: "44px",
                height: "44px",
                fontSize: "24px",
                cursor: "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                transition: "all 0.3s ease",
                backdropFilter: "blur(4px)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
                e.currentTarget.style.transform = "scale(1.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.15)";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              ✕
            </button>

            {/* Navigation Hint */}
            <div style={{
              position: "absolute",
              bottom: "30px",
              left: "50%",
              transform: "translateX(-50%)",
              color: "rgba(255, 255, 255, 0.5)",
              fontSize: "13px",
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              padding: "8px 20px",
              borderRadius: "20px",
              backdropFilter: "blur(4px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              userSelect: "none"
            }}>
              Click anywhere or press ESC to close
            </div>

            {/* Image Counter/Info */}
            <div style={{
              position: "absolute",
              top: "20px",
              left: "20px",
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: "14px",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              padding: "6px 14px",
              borderRadius: "20px",
              backdropFilter: "blur(4px)",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}>
              🔍 Full Size View
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes zoomIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};


// const QuestionGrid = ({ questions, purchase, API_BASE, onRefresh }) => {
//   const [expandedQuestion, setExpandedQuestion] = useState(null);
//   const [imageErrors, setImageErrors] = useState({});

//   if (!questions || questions.length === 0) {
//     return <p style={{ padding: "20px", textAlign: "center", color: "#666" }}>No questions available.</p>;
//   }

//   const getImageUrl = (imagePath) => {
//     if (!imagePath) return null;
//     if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
//       return imagePath;
//     }
//     if (imagePath.startsWith('/uploads/') || imagePath.startsWith('/media/')) {
//       return `${API_BASE}${imagePath}`;
//     }
//     if (!imagePath.includes('/')) {
//       return `${API_BASE}/uploads/questions/${imagePath}`;
//     }
//     return `${API_BASE}/${imagePath}`;
//   };

//   const toggleQuestion = (questionId) => {
//     setExpandedQuestion(expandedQuestion === questionId ? null : questionId);
//   };

//   const handleImageError = (questionId, imageIndex) => {
//     setImageErrors(prev => ({
//       ...prev,
//       [`${questionId}-${imageIndex}`]: true
//     }));
//   };

//   const getQuestionImages = (question) => {
//     if (question.images && question.images.length > 0) {
//       return question.images;
//     }
//     if (question.image_path) {
//       return [{ url: question.image_path, id: 'single' }];
//     }
//     return [];
//   };

//   return (
//     <div style={{ marginTop: "30px" }}>
//       {/* Purchase Details with Timer */}
//       {purchase && (
//         <div style={{
//           padding: "15px",
//           backgroundColor: "#d4edda",
//           borderRadius: "4px",
//           marginBottom: "20px",
//           border: "1px solid #c3e6cb"
//         }}>
//           <div style={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//             flexWrap: "wrap",
//             gap: "10px"
//           }}>
//             <h3 style={{ margin: "0" }}>
//               📚 {purchase.subject?.toUpperCase() || 'Subject'} - {purchase.exam_type?.toUpperCase() || 'Exam'}
//             </h3>
//             {purchase.expiry_date && (
//               <div style={{
//                 padding: "5px 12px",
//                 backgroundColor: "white",
//                 borderRadius: "4px",
//                 fontSize: "14px",
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "8px"
//               }}>
//                 <span>⏰ Time Remaining:</span>
//                 <CountdownTimer
//                   expiryDate={purchase.expiry_date}
//                   onExpire={() => {
//                     if (onRefresh) onRefresh();
//                   }}
//                 />
//               </div>
//             )}
//           </div>
//           <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px", marginTop: "10px" }}>
//             <p style={{ margin: "5px 0" }}><strong>University:</strong> {purchase.university || 'N/A'}</p>
//             <p style={{ margin: "5px 0" }}><strong>Year:</strong> {purchase.year || 'N/A'} | <strong>Semester:</strong> {purchase.semester || 'N/A'}</p>
//             <p style={{ margin: "5px 0" }}><strong>Total Questions:</strong> {purchase.total_questions || questions.length}</p>
//             <p style={{ margin: "5px 0" }}><strong>Coins Spent:</strong> {purchase.coins_spent || 0}</p>
//           </div>
//         </div>
//       )}

//       {/* Questions Grid */}
//       <div style={{
//         display: "grid",
//         gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
//         gap: "20px"
//       }}>
//         {questions.map((q, index) => {
//           const images = getQuestionImages(q);
//           const isExpanded = expandedQuestion === q.id;

//           return (
//             <div
//               key={q.id || index}
//               style={{
//                 border: isExpanded ? "2px solid #007bff" : "1px solid #ddd",
//                 borderRadius: "8px",
//                 padding: "15px",
//                 backgroundColor: isExpanded ? "#f8f9ff" : "#fff",
//                 boxShadow: isExpanded ? "0 4px 12px rgba(0,0,0,0.15)" : "0 2px 4px rgba(0,0,0,0.05)",
//                 transition: "all 0.3s ease",
//                 cursor: "pointer"
//               }}
//               onClick={() => toggleQuestion(q.id)}
//               onMouseEnter={(e) => {
//                 if (!isExpanded) {
//                   e.currentTarget.style.transform = "translateY(-2px)";
//                   e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
//                 }
//               }}
//               onMouseLeave={(e) => {
//                 if (!isExpanded) {
//                   e.currentTarget.style.transform = "translateY(0)";
//                   e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
//                 }
//               }}
//             >
//               {/* Question Header */}
//               <div style={{
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//                 marginBottom: "10px"
//               }}>
//                 <div style={{
//                   fontWeight: "bold",
//                   color: "#007bff",
//                   fontSize: "16px"
//                 }}>
//                   Question {index + 1}
//                 </div>
//                 {q.exam_type && (
//                   <span style={{
//                     padding: "2px 10px",
//                     borderRadius: "12px",
//                     fontSize: "12px",
//                     fontWeight: "bold",
//                     backgroundColor: q.exam_type === "Final" ? "#dc3545" :
//                       q.exam_type === "Mid" ? "#ffc107" : "#28a745",
//                     color: q.exam_type === "Mid" ? "#333" : "white"
//                   }}>
//                     {q.exam_type}
//                   </span>
//                 )}
//               </div>

//               {/* Question Text */}
//               {q.question_text && (
//                 <div style={{
//                   marginBottom: "10px",
//                   fontSize: "15px",
//                   color: "#333",
//                   lineHeight: "1.6"
//                 }}>
//                   {q.question_text}
//                 </div>
//               )}

//               {/* Images */}
//               {images.length > 0 ? (
//                 <div style={{ marginBottom: "10px" }}>
//                   {images.map((image, imgIndex) => {
//                     const errorKey = `${q.id}-${imgIndex}`;
//                     const imageUrl = getImageUrl(image.url || image.image_path || image);

//                     if (imageErrors[errorKey]) {
//                       return (
//                         <div key={imgIndex} style={{
//                           padding: "20px",
//                           backgroundColor: "#f8f9fa",
//                           borderRadius: "4px",
//                           textAlign: "center",
//                           color: "#666",
//                           marginBottom: "5px"
//                         }}>
//                           <p>⚠️ Image not available</p>
//                           {image.file_name && (
//                             <p style={{ fontSize: "12px", color: "#999" }}>{image.file_name}</p>
//                           )}
//                         </div>
//                       );
//                     }

//                     return (
//                       <div key={imgIndex} style={{ marginBottom: "10px" }}>
//                         <img
//                           src={imageUrl}
//                           alt={`Question ${index + 1} - Image ${imgIndex + 1}`}
//                           style={{
//                             width: "100%",
//                             height: "auto",
//                             maxHeight: isExpanded ? "400px" : "200px",
//                             objectFit: "contain",
//                             borderRadius: "4px",
//                             border: "1px solid #eee",
//                             transition: "max-height 0.3s ease"
//                           }}
//                           onError={() => handleImageError(q.id, imgIndex)}
//                           loading="lazy"
//                         />
//                       </div>
//                     );
//                   })}
//                 </div>
//               ) : (
//                 <div style={{
//                   padding: "15px",
//                   backgroundColor: "#f8f9fa",
//                   borderRadius: "4px",
//                   textAlign: "center",
//                   color: "#999",
//                   marginBottom: "10px"
//                 }}>
//                   <span>📷 No image</span>
//                 </div>
//               )}

//               {/* Expanded Content */}
//               {isExpanded && (
//                 <div style={{
//                   marginTop: "15px",
//                   paddingTop: "15px",
//                   borderTop: "1px solid #e9ecef"
//                 }}>
//                   {q.options && q.options.length > 0 && (
//                     <div style={{ marginBottom: "10px" }}>
//                       <strong style={{ display: "block", marginBottom: "8px" }}>Options:</strong>
//                       <ul style={{
//                         listStyle: "none",
//                         padding: "0",
//                         margin: "0"
//                       }}>
//                         {q.options.map((option, optIndex) => {
//                           const isCorrect = option === q.answer;
//                           return (
//                             <li key={optIndex} style={{
//                               padding: "8px 12px",
//                               marginBottom: "5px",
//                               backgroundColor: isCorrect ? "#d4edda" : "#f8f9fa",
//                               border: isCorrect ? "1px solid #28a745" : "1px solid #dee2e6",
//                               borderRadius: "4px",
//                               display: "flex",
//                               justifyContent: "space-between",
//                               alignItems: "center"
//                             }}>
//                               <span>{String.fromCharCode(65 + optIndex)}. {option}</span>
//                               {isCorrect && (
//                                 <span style={{
//                                   color: "#28a745",
//                                   fontWeight: "bold",
//                                   fontSize: "14px"
//                                 }}>
//                                   ✅ Correct
//                                 </span>
//                               )}
//                             </li>
//                           );
//                         })}
//                       </ul>
//                     </div>
//                   )}

//                   {q.answer && !q.options && (
//                     <div style={{
//                       padding: "8px 12px",
//                       backgroundColor: "#d4edda",
//                       borderRadius: "4px",
//                       marginBottom: "10px"
//                     }}>
//                       <strong>Answer:</strong> {q.answer}
//                     </div>
//                   )}

//                   <div style={{
//                     display: "grid",
//                     gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
//                     gap: "8px",
//                     fontSize: "13px",
//                     color: "#666",
//                     backgroundColor: "#f8f9fa",
//                     padding: "10px",
//                     borderRadius: "4px"
//                   }}>
//                     {q.subject && <div><strong>Subject:</strong> {q.subject}</div>}
//                     {q.course && <div><strong>Course:</strong> {q.course}</div>}
//                     {q.year && <div><strong>Year:</strong> {q.year}</div>}
//                     {q.semester && <div><strong>Semester:</strong> {q.semester}</div>}
//                     {q.marks && <div><strong>Marks:</strong> {q.marks}</div>}
//                     {/* <div style={{ fontSize: "11px", color: "#999" }}>
//                       <strong>ID:</strong> {q.id || 'N/A'}
//                     </div> */}
//                   </div>
//                 </div>
//               )}

//               <div style={{
//                 marginTop: "10px",
//                 fontSize: "12px",
//                 color: isExpanded ? "#007bff" : "#999",
//                 textAlign: "center",
//                 borderTop: "1px solid #f0f0f0",
//                 paddingTop: "10px"
//               }}>
//                 {isExpanded ? "👆 Click to collapse" : "👆 Click to view details"}
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };






























// Main Component
export default function PremiumSearch() {
  const [filters, setFilters] = useState({
    university: "",
    subject: "",
    course: "",
    year: "",
    semester: "",
    examType: "",
  });

  const [dropdownData, setDropdownData] = useState({
    universities: [],
    subjects: [],
    courses: [],
    years: [],
    semesters: [],
    examTypes: [],
  });

  const [userCoins, setUserCoins] = useState({
    total_coins: 0,
    breakdown: []
  });
  const [searchResult, setSearchResult] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("search");
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      await Promise.all([
        fetchUniversities(),
        fetchYears(),
        fetchSemesters(),
        fetchExamTypes(),
        fetchUserCoins(),
        fetchPurchases()
      ]);
    };
    fetchInitialData();

    // Set up periodic refresh for coin balance and purchases (every 30 seconds)
    const interval = setInterval(() => {
      fetchUserCoins();
      fetchPurchases();
    }, 30000);

    setRefreshInterval(interval);

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);

  // Helper function to get auth headers
  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });

  // Fetch functions
  const fetchUniversities = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/fetch/upload/universities`);
      setDropdownData(prev => ({ ...prev, universities: res.data || [] }));
    } catch (error) {
      console.error("Error fetching universities:", error);
      setDropdownData(prev => ({ ...prev, universities: [] }));
    }
  }, []);

  const fetchSubjectsByUniversity = useCallback(async (university) => {
    if (!university) {
      setDropdownData(prev => ({ ...prev, subjects: [] }));
      return;
    }
    try {
      const res = await axios.get(
        `${API_BASE}/fetch/subjects/${encodeURIComponent(university)}`
      );
      setDropdownData(prev => ({ ...prev, subjects: res.data || [] }));
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setDropdownData(prev => ({ ...prev, subjects: [] }));
    }
  }, []);

  const fetchCoursesBySubject = useCallback(async (university, subject) => {
    if (!university || !subject) {
      setDropdownData(prev => ({ ...prev, courses: [] }));
      return;
    }
    try {
      const res = await axios.get(
        `${API_BASE}/fetch/courses/${encodeURIComponent(university)}/${encodeURIComponent(subject)}`
      );
      setDropdownData(prev => ({ ...prev, courses: res.data || [] }));
    } catch (error) {
      console.error("Error fetching courses:", error);
      setDropdownData(prev => ({ ...prev, courses: [] }));
    }
  }, []);

  const fetchYears = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/fetch/upload/years`);
      setDropdownData(prev => ({ ...prev, years: res.data || [] }));
    } catch (error) {
      console.error("Error fetching years:", error);
      setDropdownData(prev => ({ ...prev, years: [] }));
    }
  }, []);

  const fetchSemesters = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/fetch/upload/semesters`);
      setDropdownData(prev => ({ ...prev, semesters: res.data || [] }));
    } catch (error) {
      console.error("Error fetching semesters:", error);
      setDropdownData(prev => ({ ...prev, semesters: [] }));
    }
  }, []);

  const fetchExamTypes = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/fetch/upload/exam_types`);
      setDropdownData(prev => ({ ...prev, examTypes: res.data || [] }));
    } catch (error) {
      console.error("Error fetching exam types:", error);
      setDropdownData(prev => ({ ...prev, examTypes: [] }));
    }
  }, []);

  const fetchUserCoins = useCallback(async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/premium/coins/balance`,
        getAuthHeaders()
      );
      setUserCoins(res.data || { total_coins: 0, breakdown: [] });
    } catch (error) {
      console.error("Error fetching coins:", error);
      setUserCoins({ total_coins: 0, breakdown: [] });
    }
  }, []);

  const fetchPurchases = useCallback(async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/premium/purchases`,
        getAuthHeaders()
      );
      setPurchases(res.data?.purchases || []);
    } catch (error) {
      console.error("Error fetching purchases:", error);
      setPurchases([]);
    }
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback((field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));

    if (field === 'university') {
      setFilters(prev => ({ ...prev, subject: '', course: '' }));
      fetchSubjectsByUniversity(value);
      setDropdownData(prev => ({ ...prev, courses: [] }));
    } else if (field === 'subject') {
      setFilters(prev => ({ ...prev, course: '' }));
      if (filters.university && value) {
        fetchCoursesBySubject(filters.university, value);
      }
    }
  }, [filters.university, fetchSubjectsByUniversity, fetchCoursesBySubject]);

  // Handle search
  const handleSearch = useCallback(async () => {
    const { university, subject, course, year, semester, examType } = filters;

    if (!university || !subject) {
      setError("Please select University and Subject (minimum requirement)");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSearchResult(null);

      const params = { university, subject };

      if (course && course.trim()) params.course = course;
      if (year && year.trim()) params.year = parseInt(year);
      if (semester && semester.trim()) params.semester = semester;
      if (examType && examType.trim()) params.exam_type = examType;

      const response = await axios.post(
        `${API_BASE}/premium/search`,
        null,
        { params, ...getAuthHeaders() }
      );

      setSearchResult(response.data);
      await fetchUserCoins();
      await fetchPurchases();
      setActiveTab("search");

    } catch (error) {
      console.error("Search error:", error);

      let errorMessage = "Search failed. Please try again.";

      if (error.response) {
        if (error.response.status === 422) {
          const errors = error.response.data?.detail;
          if (Array.isArray(errors)) {
            const messages = errors.map(err => {
              const field = err.loc?.join('.') || 'unknown';
              return `${field}: ${err.msg}`;
            });
            errorMessage = `Validation Error: ${messages.join(', ')}`;
          } else if (typeof errors === 'string') {
            errorMessage = errors;
          } else {
            errorMessage = "Invalid request parameters. Please check your input.";
          }
        } else if (error.response.status === 402) {
          errorMessage = `Insufficient coins! Required: ${error.response.data?.detail || "unknown"}`;
        } else if (error.response.status === 400) {
          errorMessage = error.response.data?.detail || "Bad request. Please check your input.";
        } else if (error.response.status === 404) {
          errorMessage = "No questions found for the given criteria. Try different filters.";
        } else {
          errorMessage = error.response.data?.detail || errorMessage;
        }
      } else if (error.request) {
        errorMessage = "No response from server. Please check your connection.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters, fetchUserCoins, fetchPurchases]);

  // Load purchase
  const loadPurchase = useCallback(async (purchaseId) => {
    try {
      setLoading(true);
      setError("");
      setSelectedPurchase(purchaseId);

      const response = await axios.get(
        `${API_BASE}/premium/purchases/${purchaseId}`,
        getAuthHeaders()
      );
      setSearchResult({
        questions: response.data.questions || [],
        purchase: response.data.purchase,
        total_questions: response.data.questions?.length || 0,
        purchase_id: purchaseId
      });
      setActiveTab("search");
    } catch (error) {
      console.error("Error loading purchase:", error);
      setError(error.response?.data?.detail || "Failed to load purchase");
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle recharge
  // const handleRecharge = useCallback(async () => {
  //   const amount = prompt("Enter recharge amount (20, 50, 100, 200, 500):");
  //   const numAmount = parseInt(amount);

  //   if (!amount || !numAmount || ![20, 50, 100, 200, 500].includes(numAmount)) {
  //     alert("Please enter a valid amount (20, 50, 100, 200, or 500)");
  //     return;
  //   }

  //   try {
  //     await axios.post(
  //       `${API_BASE}/premium/coins/recharge`,
  //       null,
  //       {
  //         params: { amount_taka: numAmount },
  //         ...getAuthHeaders()
  //       }
  //     );
  //     await fetchUserCoins();
  //     alert("Recharge successful!");
  //   } catch (err) {
  //     alert("Recharge failed: " + (err.response?.data?.detail || err.message));
  //   }
  // }, [fetchUserCoins]);

  // Reset search
  const resetSearch = useCallback(() => {
    setFilters({
      university: "",
      subject: "",
      course: "",
      year: "",
      semester: "",
      examType: "",
    });
    setSearchResult(null);
    setError("");
    setDropdownData(prev => ({ ...prev, subjects: [], courses: [] }));
  }, []);

  // Check if all required fields are selected
  const isSearchDisabled = !filters.university || !filters.subject || loading;

  return (
    <div style={{ maxWidth: "1200px", margin: "20px auto", padding: "20px" }}>
      <h2>⭐ Premium Search</h2>

      {/* User Coin Balance with Breakdown */}
      <div style={{
        backgroundColor: "#e3f2fd",
        padding: "15px",
        borderRadius: "8px",
        marginBottom: "20px"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px"
        }}>
          <div>
            <strong>💰 Coin Balance:</strong> {userCoins.total_coins} coins
          </div>
          <Link
            to="/pricing"
            style={{
              padding: "8px 16px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            🔄 Recharge
          </Link>
        </div>

        {/* Coin Breakdown with Realtime Timer */}
        {userCoins.breakdown && userCoins.breakdown.length > 0 && (
          <div style={{ marginTop: "10px", fontSize: "14px" }}>
            <details>
              <summary style={{ cursor: "pointer", color: "#0066cc" }}>
                📊 View Coin Breakdown ({userCoins.breakdown.length} packages)
              </summary>
              <div style={{ marginTop: "10px" }}>
                {userCoins.breakdown.map((pkg) => (
                  <div key={pkg.package_id} style={{
                    padding: "8px",
                    marginBottom: "5px",
                    backgroundColor: pkg.is_expired ? "#f8d7da" : "#d4edda",
                    borderRadius: "4px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "5px"
                  }}>
                    <span>{pkg.coins_remaining} coins</span>
                    {pkg.is_expired ? (
                      <span style={{ color: "#dc3545" }}>⚠️ Expired</span>
                    ) : (
                      <CountdownTimer
                        expiryDate={pkg.expiry_date}
                        onExpire={() => {
                          fetchUserCoins();
                          fetchPurchases();
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex",
        gap: "10px",
        marginBottom: "20px",
        borderBottom: "1px solid #ddd",
        paddingBottom: "10px",
        flexWrap: "wrap"
      }}>
        <button
          onClick={() => {
            setActiveTab("search");
            if (!searchResult) resetSearch();
          }}
          style={{
            padding: "10px 20px",
            backgroundColor: activeTab === "search" ? "#007bff" : "#f0f0f0",
            color: activeTab === "search" ? "white" : "#333",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          🔍 New Search
        </button>
        <button
          onClick={() => {
            setActiveTab("purchases");
            setSearchResult(null);
            setSelectedPurchase(null);
          }}
          style={{
            padding: "10px 20px",
            backgroundColor: activeTab === "purchases" ? "#007bff" : "#f0f0f0",
            color: activeTab === "purchases" ? "white" : "#333",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          📋 My Purchases ({purchases.filter(p => p.is_active === "active").length})
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          padding: "15px",
          backgroundColor: "#f8d7da",
          border: "1px solid #f5c6cb",
          borderRadius: "4px",
          color: "#721c24",
          marginBottom: "15px"
        }}>
          <span>{typeof error === 'string' ? error : JSON.stringify(error)}</span>
          <button
            onClick={() => setError("")}
            style={{
              marginLeft: "10px",
              padding: "2px 8px",
              backgroundColor: "transparent",
              border: "none",
              color: "#721c24",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            ×
          </button>
        </div>
      )}

      {activeTab === "search" && (
        <>
          {/* Search Filters */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "10px",
            marginBottom: "20px"
          }}>
            <select
              value={filters.university}
              onChange={(e) => handleFilterChange('university', e.target.value)}
              style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
            >
              <option value="">University *</option>
              {dropdownData.universities.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>

            <select
              value={filters.subject}
              onChange={(e) => handleFilterChange('subject', e.target.value)}
              disabled={!filters.university}
              style={{
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ddd",
                backgroundColor: !filters.university ? "#f5f5f5" : "white"
              }}
            >
              <option value="">Subject *</option>
              {dropdownData.subjects.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <select
              value={filters.course}
              onChange={(e) => handleFilterChange('course', e.target.value)}
              disabled={!filters.subject}
              style={{
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ddd",
                backgroundColor: !filters.subject ? "#f5f5f5" : "white"
              }}
            >
              <option value="">Course</option>
              {dropdownData.courses.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={filters.year}
              onChange={(e) => handleFilterChange('year', e.target.value)}
              style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
            >
              <option value="">Year</option>
              {dropdownData.years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            <select
              value={filters.semester}
              onChange={(e) => handleFilterChange('semester', e.target.value)}
              style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
            >
              <option value="">Semester</option>
              {dropdownData.semesters.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <select
              value={filters.examType}
              onChange={(e) => handleFilterChange('examType', e.target.value)}
              style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
            >
              <option value="">Exam Type</option>
              {dropdownData.examTypes.map(e => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>

            <button
              onClick={handleSearch}
              disabled={isSearchDisabled}
              style={{
                padding: "8px 16px",
                backgroundColor: isSearchDisabled ? "#ccc" : "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: isSearchDisabled ? "not-allowed" : "pointer",
                fontWeight: "bold"
              }}
            >
              {loading ? "Searching..." : "🔍 Search"}
            </button>
          </div>

          {/* Price Info */}
          <div style={{
            padding: "10px",
            backgroundColor: "#fff3cd",
            borderRadius: "4px",
            marginBottom: "20px",
            fontSize: "14px"
          }}>
            <strong>📊 Pricing:</strong> Quiz: 1 coin | Mid: 3 coins | Final: 5 coins per question
            {searchResult?.price_breakdown && (
              <div style={{ marginTop: "5px" }}>
                <strong>Breakdown:</strong>
                {Object.entries(searchResult.price_breakdown).map(([exam, data]) => (
                  <span key={exam} style={{ marginLeft: "10px" }}>
                    {exam}: {data.count} × {data.price_per_question} = {data.subtotal} coins
                  </span>
                ))}
                <span style={{ marginLeft: "10px", fontWeight: "bold" }}>
                  Total: {searchResult.total_price} coins
                </span>
              </div>
            )}
          </div>

          {/* Search Results */}
          {searchResult && searchResult.questions && (
            <QuestionGrid
              questions={searchResult.questions}
              purchase={searchResult.purchase}
              API_BASE={API_BASE}
              onRefresh={() => {
                fetchPurchases();
                fetchUserCoins();
              }}
            />
          )}
        </>
      )}

      {activeTab === "purchases" && (
        <div>
          <h3>📋 Your Premium Purchases</h3>

          {purchases.length === 0 ? (
            <p style={{ color: "#666" }}>No purchases yet. Try searching for premium questions!</p>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "15px"
            }}>
              {purchases.map((purchase) => (
                <div
                  key={purchase.id}
                  style={{
                    border: purchase.is_active === "active" ? "1px solid #28a745" : "1px solid #dc3545",
                    borderRadius: "8px",
                    padding: "15px",
                    backgroundColor: purchase.is_active === "active" ? "#f0fff4" : "#fff5f5",
                    cursor: purchase.is_active === "active" ? "pointer" : "default",
                    transition: "all 0.3s ease"
                  }}
                  onClick={() => {
                    if (purchase.is_active === "active") {
                      loadPurchase(purchase.id);
                    }
                  }}
                  onMouseEnter={(e) => {
                    if (purchase.is_active === "active") {
                      e.currentTarget.style.transform = "scale(1.02)";
                      e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start"
                  }}>
                    <h4 style={{ margin: "0 0 10px 0" }}>
                      {purchase.subject?.toUpperCase() || "Unknown Subject"}
                    </h4>
                    <span style={{
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      backgroundColor: purchase.is_active === "active" ? "#28a745" : "#dc3545",
                      color: "white"
                    }}>
                      {purchase.is_active === "active" ? "Active" : "Expired"}
                    </span>
                  </div>

                  <p style={{ margin: "5px 0", fontSize: "14px" }}>
                    <strong>University:</strong> {purchase.university || "N/A"}
                  </p>
                  <p style={{ margin: "5px 0", fontSize: "14px" }}>
                    <strong>Year:</strong> {purchase.year || "N/A"} | <strong>Semester:</strong> {purchase.semester || "N/A"}
                  </p>
                  <p style={{ margin: "5px 0", fontSize: "14px" }}>
                    <strong>Exam Type:</strong> {purchase.exam_type || "N/A"}
                  </p>
                  <p style={{ margin: "5px 0", fontSize: "14px" }}>
                    <strong>Questions:</strong> {purchase.total_questions || 0}
                  </p>
                  <p style={{ margin: "5px 0", fontSize: "14px" }}>
                    <strong>Coins Spent:</strong> {purchase.coins_spent || 0}
                  </p>

                  {purchase.is_active === "active" && purchase.expiry_date && (
                    <div style={{
                      marginTop: "10px",
                      padding: "8px",
                      backgroundColor: "#e3f2fd",
                      borderRadius: "4px",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flexWrap: "wrap"
                    }}>
                      <strong>⏰ Time Remaining:</strong>
                      <CountdownTimer
                        expiryDate={purchase.expiry_date}
                        onExpire={() => {
                          fetchPurchases();
                          if (activeTab === "purchases") {
                            setActiveTab("purchases");
                          }
                        }}
                      />
                    </div>
                  )}

                  <div style={{
                    marginTop: "10px",
                    fontSize: "12px",
                    color: "#666"
                  }}>
                    Purchased: {purchase.purchase_date ? new Date(purchase.purchase_date).toLocaleDateString() : "N/A"}
                  </div>

                  {purchase.is_active === "active" && (
                    <div style={{
                      marginTop: "10px",
                      fontSize: "12px",
                      color: "#007bff"
                    }}>
                      👆 Click to view questions
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}