
import { Helmet } from "react-helmet-async";
import { useEffect, useState, useRef } from "react";
import axios from "axios";

const API_BASE = "/api";
// const API_BASE = "http://127.0.0.1:8000";

export default function UploadQuestion() {
  const fileInputRef = useRef(null);

  const [universities, setUniversities] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [years, setYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [examTypes, setExamTypes] = useState([]);

  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedExamType, setSelectedExamType] = useState("");

  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploading, setUploading] = useState(false);

  // Helper function to get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  // ---------------- INIT ----------------
  useEffect(() => {
    // Check if user is authenticated
    const token = getAuthToken();
    if (!token) {
      alert('Please login first');
      // Optionally redirect to login page
      // window.location.href = '/login';
    }
    
    fetchUniversities();
    fetchSubjects();
    fetchCourses();
    fetchYears();
    fetchSemesters();
    fetchExamTypes();
  }, []);

  // ---------------- FETCH FUNCTIONS ----------------
  const fetchUniversities = async () => {
    try {
      const res = await axios.get(`${API_BASE}/fetch/upload/universities`);
      setUniversities(res.data);
    } catch (err) {
      console.error("Error fetching universities:", err);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await axios.get(`${API_BASE}/fetch/upload/subjects`);
      setSubjects(res.data);
    } catch (err) {
      console.error("Error fetching subjects:", err);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await axios.get(`${API_BASE}/fetch/upload/courses`);
      setCourses(res.data);
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  const fetchYears = async () => {
    try {
      const res = await axios.get(`${API_BASE}/fetch/upload/years`);
      setYears(res.data);
    } catch (err) {
      console.error("Error fetching years:", err);
    }
  };

  const fetchSemesters = async () => {
    try {
      const res = await axios.get(`${API_BASE}/fetch/upload/semesters`);
      setSemesters(res.data);
    } catch (err) {
      console.error("Error fetching semesters:", err);
    }
  };

  const fetchExamTypes = async () => {
    try {
      const res = await axios.get(`${API_BASE}/fetch/upload/exam_types`);
      setExamTypes(res.data);
    } catch (err) {
      console.error("Error fetching exam types:", err);
    }
  };

  // ---------------- INDEPENDENT FIELD HANDLERS ----------------
  const handleUniversityChange = (value) => {
    setSelectedUniversity(value);
  };

  const handleSubjectChange = (value) => {
    setSelectedSubject(value);
  };

  const handleCourseChange = (value) => {
    setSelectedCourse(value);
  };

  const handleYearChange = (value) => {
    setSelectedYear(value);
  };

  const handleSemesterChange = (value) => {
    setSelectedSemester(value);
  };

  const handleExamTypeChange = (value) => {
    setSelectedExamType(value);
  };
  
  // ---------------- ADD NEW VALUES (Extendable) ----------------
  const addUniversity = (value) => {
    if (!value || value.trim() === "") return;
    const trimmed = value.trim();
    
    setUniversities((prev) => {
      if (!prev.includes(trimmed)) {
        return [...prev, trimmed].sort();
      }
      return prev;
    });
    
    setSelectedUniversity(trimmed);
    return trimmed;
  };

  const addSubject = (value) => {
    if (!value || value.trim() === "") return;
    const trimmed = value.trim();
    
    setSubjects((prev) => {
      if (!prev.includes(trimmed)) {
        return [...prev, trimmed].sort();
      }
      return prev;
    });
    
    setSelectedSubject(trimmed);
    return trimmed;
  };

  const addCourse = (value) => {
    if (!value || value.trim() === "") return;
    const trimmed = value.trim();

    setCourses((prev) => {
      if (!prev.includes(trimmed)) {
        return [...prev, trimmed].sort();
      }
      return prev;
    });

    setSelectedCourse(trimmed);
    return trimmed;
  };

  const addYear = (value) => {
    if (!value || value.trim() === "") return;
    const trimmed = value.trim();
    
    setYears((prev) => {
      if (!prev.includes(trimmed)) {
        return [...prev, trimmed].sort();
      }
      return prev;
    });
    
    setSelectedYear(trimmed);
    return trimmed;
  };

  const addSemester = (value) => {
    if (!value || value.trim() === "") return;
    const trimmed = value.trim();
    
    setSemesters((prev) => {
      if (!prev.includes(trimmed)) {
        return [...prev, trimmed].sort();
      }
      return prev;
    });
    
    setSelectedSemester(trimmed);
    return trimmed;
  };

  const addExamType = (value) => {
    if (!value || value.trim() === "") return;
    const trimmed = value.trim();
    
    setExamTypes((prev) => {
      if (!prev.includes(trimmed)) {
        return [...prev, trimmed].sort();
      }
      return prev;
    });
    
    setSelectedExamType(trimmed);
    return trimmed;
  };

  // ---------------- FILE HANDLING ----------------
  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    const images = selected.filter((f) => f.type.startsWith("image/"));
    setFiles((prev) => [...prev, ...images]);
    e.target.value = "";
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // ---------------- DRAG & DROP ----------------
  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files);
    const images = dropped.filter((f) => f.type.startsWith("image/"));
    setFiles((prev) => [...prev, ...images]);
  };

  const handleDragOver = (e) => e.preventDefault();

  // ---------------- UPLOAD ----------------
  const handleUpload = async () => {
    const token = getAuthToken();
    
    if (!token) {
      alert('Please login first');
      return;
    }

    setUploading(true);
    setUploadProgress({});

    const formData = new FormData();
    formData.append("university", selectedUniversity);
    formData.append("subject", selectedSubject);
    formData.append("course", selectedCourse);
    formData.append("year", selectedYear);
    formData.append("semester", selectedSemester);
    formData.append("exam_type", selectedExamType);

    files.forEach((file) => formData.append("files", file));

    try {
      const response = await axios.post(`${API_BASE}/upload_file/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress({ total: percent });
        },
      });

      if (response.status === 200) {
        alert("Upload successful!");
        setFiles([]);
        setUploadProgress({});
        
        // Refresh data after successful upload
        fetchUniversities();
        fetchSubjects();
        fetchCourses();
        fetchYears();
        fetchSemesters();
        fetchExamTypes();
      }
    } catch (err) {
      console.error("Upload error:", err);
      
      if (err.response?.status === 401) {
        alert("Your session has expired. Please login again.");
        // Optionally redirect to login page
        // window.location.href = '/login';
      } else if (err.response?.status === 403) {
        alert("You don't have permission to upload.");
      } else {
        alert(`Upload failed: ${err.response?.data?.detail || 'Unknown error'}`);
      }
    } finally {
      setUploading(false);
    }
  };

  // Check if all fields are filled
  const canUpload =
    selectedUniversity &&
    selectedUniversity.trim() !== "" &&
    selectedSubject &&
    selectedSubject.trim() !== "" &&
    selectedCourse &&
    selectedCourse.trim() !== "" &&
    selectedYear &&
    selectedYear.trim() !== "" &&
    selectedSemester &&
    selectedSemester.trim() !== "" &&
    selectedExamType &&
    selectedExamType.trim() !== "" &&
    files.length > 0;

  // Helper function to handle Enter key press
  const handleKeyPress = (e, callback) => {
    if (e.key === "Enter") {
      const value = e.target.value;
      if (value && value.trim() !== "") {
        callback(value);
        e.target.value = "";
        
        setTimeout(() => {}, 0);
      }
    }
  };

  // ---------------- UI ----------------
  return (
    <>
    <Helmet>
      <title>Qbag - Questions Upload</title>
    </Helmet>

    <div style={{ maxWidth: 850, margin: "20px auto", padding: "20px" }}>
      <h2>🚀 Upload Question System</h2>

      {/* Debug info - shows current state */}
      <div style={{ 
        marginBottom: "15px", 
        padding: "10px", 
        backgroundColor: canUpload ? "#d4edda" : "#f8d7da",
        borderRadius: "4px",
        fontSize: "12px",
        border: canUpload ? "1px solid #c3e6cb" : "1px solid #f5c6cb"
      }}>
        <strong>Status:</strong> {canUpload ? "✅ All fields filled - Ready to upload" : "❌ Please fill all fields"} 
        <br />
        <strong>Values:</strong> Uni: "{selectedUniversity || "empty"}" | 
        Sub: "{selectedSubject || "empty"}" | 
        Course: "{selectedCourse || "empty"}" | 
        Year: "{selectedYear || "empty"}" | 
        Sem: "{selectedSemester || "empty"}" | 
        Exam: "{selectedExamType || "empty"}" | 
        Files: {files.length}
      </div>

      {/* UNIVERSITY */}
      <div style={{ marginBottom: "15px" }}>
        <label>University:</label>
        <div style={{ display: "flex", gap: "8px" }}>
          <select
            value={selectedUniversity}
            onChange={(e) => handleUniversityChange(e.target.value)}
            style={{ flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
          >
            <option value="">Select University</option>
            {universities.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Add new university (press Enter)"
            onKeyDown={(e) => handleKeyPress(e, addUniversity)}
            style={{ flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
          />
          <button
            onClick={() => {
              const input = document.querySelector('input[placeholder="Add new university (press Enter)"]');
              if (input && input.value) {
                addUniversity(input.value);
                input.value = "";
              }
            }}
            style={{ padding: "8px 16px", cursor: "pointer" }}
          >
            Add
          </button>
        </div>
      </div>

      {/* SUBJECT */}
      <div style={{ marginBottom: "15px" }}>
        <label>Subject:</label>
        <div style={{ display: "flex", gap: "8px" }}>
          <select
            value={selectedSubject}
            onChange={(e) => handleSubjectChange(e.target.value)}
            style={{ flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
          >
            <option value="">Select Subject</option>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Add new subject (press Enter)"
            onKeyDown={(e) => handleKeyPress(e, addSubject)}
            style={{ flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
          />
          <button
            onClick={() => {
              const input = document.querySelector('input[placeholder="Add new subject (press Enter)"]');
              if (input && input.value) {
                addSubject(input.value);
                input.value = "";
              }
            }}
            style={{ padding: "8px 16px", cursor: "pointer" }}
          >
            Add
          </button>
        </div>
      </div>

      {/* COURSE */}
      <div style={{ marginBottom: "15px" }}>
        <label>Course:</label>
        <div style={{ display: "flex", gap: "8px" }}>
          <select
            value={selectedCourse}
            onChange={(e) => handleCourseChange(e.target.value)}
            style={{ flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
          >
            <option value="">Select Course</option>
            {courses.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Add new course (press Enter)"
            onKeyDown={(e) => handleKeyPress(e, addCourse)}
            style={{ flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
          />
          <button
            onClick={() => {
              const input = document.querySelector('input[placeholder="Add new course (press Enter)"]');
              if (input && input.value) {
                addCourse(input.value);
                input.value = "";
              }
            }}
            style={{ padding: "8px 16px", cursor: "pointer" }}
          >
            Add
          </button>
        </div>
      </div>

      {/* YEAR */}
      <div style={{ marginBottom: "15px" }}>
        <label>Year:</label>
        <div style={{ display: "flex", gap: "8px" }}>
          <select
            value={selectedYear}
            onChange={(e) => handleYearChange(e.target.value)}
            style={{ flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
          >
            <option value="">Select Year</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Add new year (press Enter)"
            onKeyDown={(e) => handleKeyPress(e, addYear)}
            style={{ flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
          />
          <button
            onClick={() => {
              const input = document.querySelector('input[placeholder="Add new year (press Enter)"]');
              if (input && input.value) {
                addYear(input.value);
                input.value = "";
              }
            }}
            style={{ padding: "8px 16px", cursor: "pointer" }}
          >
            Add
          </button>
        </div>
      </div>

      {/* SEMESTER */}
      <div style={{ marginBottom: "15px" }}>
        <label>Semester:</label>
        <div style={{ display: "flex", gap: "8px" }}>
          <select
            value={selectedSemester}
            onChange={(e) => handleSemesterChange(e.target.value)}
            style={{ flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
          >
            <option value="">Select Semester</option>
            {semesters.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Add new semester (press Enter)"
            onKeyDown={(e) => handleKeyPress(e, addSemester)}
            style={{ flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
          />
          <button
            onClick={() => {
              const input = document.querySelector('input[placeholder="Add new semester (press Enter)"]');
              if (input && input.value) {
                addSemester(input.value);
                input.value = "";
              }
            }}
            style={{ padding: "8px 16px", cursor: "pointer" }}
          >
            Add
          </button>
        </div>
      </div>

      {/* EXAM TYPE */}
      <div style={{ marginBottom: "15px" }}>
        <label>Exam Type:</label>
        <div style={{ display: "flex", gap: "8px" }}>
          <select
            value={selectedExamType}
            onChange={(e) => handleExamTypeChange(e.target.value)}
            style={{ flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
          >
            <option value="">Select Exam Type</option>
            {examTypes.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Add new exam type (press Enter)"
            onKeyDown={(e) => handleKeyPress(e, addExamType)}
            style={{ flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
          />
          <button
            onClick={() => {
              const input = document.querySelector('input[placeholder="Add new exam type (press Enter)"]');
              if (input && input.value) {
                addExamType(input.value);
                input.value = "";
              }
            }}
            style={{ padding: "8px 16px", cursor: "pointer" }}
          >
            Add
          </button>
        </div>
      </div>

      {/* DROPZONE */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{
          border: "2px dashed #ccc",
          borderRadius: "8px",
          padding: "30px",
          marginTop: "20px",
          textAlign: "center",
          backgroundColor: "#f9f9f9",
        }}
      >
        <p>📁 Drag & Drop Images Here or</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          style={{ marginTop: "10px" }}
        />
        <p style={{ fontSize: "12px", color: "#666", marginTop: "8px" }}>
          Supported formats: JPG, PNG, GIF, etc.
        </p>
      </div>

      {/* PREVIEW GRID */}
      {files.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h4>Selected Images ({files.length})</h4>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {files.map((file, i) => (
              <div key={i} style={{ position: "relative" }}>
                <img
                  src={URL.createObjectURL(file)}
                  width={120}
                  height={120}
                  style={{
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                  }}
                  alt={`Preview ${i + 1}`}
                />
                <button
                  onClick={() => removeFile(i)}
                  style={{
                    position: "absolute",
                    top: "-8px",
                    right: "-8px",
                    background: "red",
                    color: "white",
                    border: "none",
                    borderRadius: "50%",
                    width: "24px",
                    height: "24px",
                    cursor: "pointer",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PROGRESS */}
      {uploading && (
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <div>Uploading... {uploadProgress.total || 0}%</div>
          <div
            style={{
              width: "100%",
              height: "20px",
              backgroundColor: "#f0f0f0",
              borderRadius: "10px",
              overflow: "hidden",
              marginTop: "8px",
            }}
          >
            <div
              style={{
                width: `${uploadProgress.total || 0}%`,
                height: "100%",
                backgroundColor: "#4CAF50",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>
      )}

      {/* UPLOAD BUTTON */}
      <button
        disabled={!canUpload || uploading}
        onClick={handleUpload}
        style={{
          marginTop: "20px",
          padding: "12px 30px",
          fontSize: "16px",
          backgroundColor: canUpload && !uploading ? "#4CAF50" : "#ccc",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: canUpload && !uploading ? "pointer" : "not-allowed",
          width: "100%",
        }}
      >
        {uploading ? "⏳ Uploading..." : "📤 Upload Files"}
      </button>

      {/* STATUS INFO */}
      <div style={{ marginTop: "10px", fontSize: "12px", color: "#666" }}>
        {!selectedUniversity && "⚠️ University required "}
        {!selectedSubject && "⚠️ Subject required "}
        {!selectedYear && "⚠️ Year required "}
        {!selectedSemester && "⚠️ Semester required "}
        {!selectedExamType && "⚠️ Exam type required "}
        {files.length === 0 && "⚠️ At least one image required"}
      </div>

      {/* LOGOUT BUTTON - Optional */}
      {/* <button
        onClick={() => {
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          alert('Logged out successfully');
          window.location.href = '/login';
        }}
        style={{
          marginTop: "10px",
          padding: "8px 16px",
          backgroundColor: "#dc3545",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          width: "100%",
        }}
      >
        Logout
      </button> */}
    </div>
    </>
  );
}