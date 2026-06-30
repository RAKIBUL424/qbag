import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";

export default function PremiumQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Dropdown data
  const [universities, setUniversities] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [years, setYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [examTypes, setExamTypes] = useState([]);

  // Selected values
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedExamType, setSelectedExamType] = useState("");

  // Fetch universities on component mount
  useEffect(() => {
    fetchUniversities();
    fetchYears();
    fetchSemesters();
    fetchExamTypes();
  }, []);

  // Fetch subjects when university changes
  useEffect(() => {
    if (selectedUniversity) {
      fetchSubjectsByUniversity(selectedUniversity);
    } else {
      setSubjects([]);
      setSelectedSubject("");
    }
  }, [selectedUniversity]);

  useEffect(() => {
    if (selectedSubject) {
      fetchCoursesBySubject(selectedUniversity, selectedSubject);
    } else {
      setCourses([]);
      setSelectedCourse("");
    }
  }, [selectedSubject]);

  // ---------------- FETCH FUNCTIONS ----------------
  const fetchUniversities = async () => {
    try {
      const res = await axios.get(`${API_BASE}/fetch/upload/universities`);
      setUniversities(res.data);
    } catch (error) {
      console.error("Error fetching universities:", error);
    }
  };

  const fetchSubjectsByUniversity = async (university) => {
    try {
      const res = await axios.get(
        `${API_BASE}/fetch/subjects/${encodeURIComponent(university)}`
      );
      setSubjects(res.data);
      // Reset subject selection when new subjects are loaded
      setSelectedSubject("");
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setSubjects([]);
    }
  };

  const fetchCoursesBySubject = async (university, subject) => {
    try {
      const res = await axios.get(
        `${API_BASE}/fetch/courses/${encodeURIComponent(university)}/${encodeURIComponent(subject)}`
      );
      setCourses(res.data);
      // Reset course selection when new courses are loaded
      setSelectedCourse("");
    } catch (error) {
      console.error("Error fetching courses:", error);
      setCourses([]);
    }
  };

  // const fetchCourses = async () => {
  //   try {
  //     const res = await axios.get(`${API_BASE}/fetch/upload/courses`);
  //     setCourses(res.data);
  //   } catch (error) {
  //     console.error("Error fetching courses:", error);
  //   }
  // };

  const fetchYears = async () => {
    try {
      const res = await axios.get(`${API_BASE}/fetch/upload/years`);
      setYears(res.data);
    } catch (error) {
      console.error("Error fetching years:", error);
    }
  };

  const fetchSemesters = async () => {
    try {
      const res = await axios.get(`${API_BASE}/fetch/upload/semesters`);
      setSemesters(res.data);
    } catch (error) {
      console.error("Error fetching semesters:", error);
    }
  };

  const fetchExamTypes = async () => {
    try {
      const res = await axios.get(`${API_BASE}/fetch/upload/exam_types`);
      setExamTypes(res.data);
    } catch (error) {
      console.error("Error fetching exam types:", error);
    }
  };

  // ---------------- FIELD HANDLERS ----------------
  const handleUniversityChange = (value) => {
    setSelectedUniversity(value);
    // Subject will be fetched by the useEffect above
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

  // ---------------- SEARCH FUNCTION ----------------
  const handleSearch = async () => {
    // Validate required fields
    if (!selectedUniversity || !selectedSubject) {
      setError("University and Subject are required");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setQuestions([]);

      // Build params - only include non-empty values
      const params = {
        university: selectedUniversity,
        subject: selectedSubject,
        course: selectedCourse || undefined, // Include course if selected
      };

      if (selectedYear) {
        params.year = parseInt(selectedYear);
      }

      if (selectedSemester) {
        params.semester = selectedSemester;
      }

      if (selectedExamType) {
        params.exam_type = selectedExamType;
      }

      const res = await axios.get(
        `${API_BASE}/fetch/premium_question`,
        { params }
      );

      if (res.data && res.data.length > 0) {
        setQuestions(res.data);
      } else {
        setError("No premium questions found for the selected criteria. Note: Questions need to be 'approved' status to appear as premium.");
        setQuestions([]);
      }

    } catch (error) {
      console.error("Error fetching premium questions:", error);
      if (error.response && error.response.status === 404) {
        setError("No premium questions found for the selected criteria. Questions need to be 'approved' status to appear as premium.");
      } else if (error.response && error.response.status === 500) {
        setError("Server error. Please try again later.");
      } else {
        setError("Failed to fetch questions. Please try again.");
      }
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- HANDLE IMAGE ERROR ----------------
  const handleImageError = (index) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  // Check if required fields are selected
  const canSearch = selectedUniversity && selectedSubject;

  // ---------------- UI ----------------
  return (
    <div style={{ maxWidth: "850px", margin: "20px auto", padding: "20px" }}>
      <h2>⭐ Premium Questions</h2>

      {/* Info Banner */}
      <div style={{ 
        marginBottom: "15px", 
        padding: "10px", 
        backgroundColor: "#fff3cd",
        borderRadius: "4px",
        fontSize: "13px",
        border: "1px solid #ffeeba",
        color: "#856404"
      }}>
        <strong>ℹ️ Note:</strong> Only questions with <strong>"approved"</strong> status appear as premium questions. 
        Uploaded questions have "pending" status by default.
      </div>

      {/* Status Bar */}
      <div style={{ 
        marginBottom: "15px", 
        padding: "10px", 
        backgroundColor: canSearch ? "#d4edda" : "#f8d7da",
        borderRadius: "4px",
        fontSize: "12px",
        border: canSearch ? "1px solid #c3e6cb" : "1px solid #f5c6cb"
      }}>
        <strong>Status:</strong> {canSearch ? "✅ Ready to search" : "❌ University and Subject are required"} 
        <br />
        <strong>Selected:</strong> Uni: "{selectedUniversity || "empty"}" | 
        Sub: "{selectedSubject || "empty"}" | 
        Course: "{selectedCourse || "empty"}" | 
        Year: "{selectedYear || "all"}" | 
        Sem: "{selectedSemester || "all"}" | 
        Exam: "{selectedExamType || "all"}"
        <br />
        <strong>Results:</strong> {questions.length} premium question{questions.length !== 1 ? "s" : ""} found
      </div>

      {/* Filters Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        {/* University - Required */}
        <select
          value={selectedUniversity}
          onChange={(e) => handleUniversityChange(e.target.value)}
          style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
        >
          <option value="">University *</option>
          {universities.map((uni) => (
            <option key={uni} value={uni}>
              {uni}
            </option>
          ))}
        </select>

        {/* Subject - Required - Depends on University */}
        <select
          value={selectedSubject}
          onChange={(e) => handleSubjectChange(e.target.value)}
          disabled={!selectedUniversity}
          style={{ 
            padding: "8px", 
            borderRadius: "4px", 
            border: "1px solid #ddd",
            backgroundColor: !selectedUniversity ? "#f5f5f5" : "white"
          }}
        >
          <option value="">Subject *</option>
          {subjects.map((sub) => (
            <option key={sub} value={sub}>
              {sub}
            </option>
          ))}
        </select>
        {/* Course - Optional - Depends on Subject */}
        <select
          value={selectedCourse}
          onChange={(e) => handleCourseChange(e.target.value)}
          disabled={!selectedSubject}
          style={{ 
            padding: "8px", 
            borderRadius: "4px", 
            border: "1px solid #ddd",
            backgroundColor: !selectedSubject ? "#f5f5f5" : "white"
          }}
        >
          <option value="">Course</option>
          {courses.map((course) => (
            <option key={course} value={course}>
              {course}
            </option>
          ))}
        </select>

        {/* Year - Optional */}
        <select
          value={selectedYear}
          onChange={(e) => handleYearChange(e.target.value)}
          style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
        >
          <option value="">All Years</option>
          {years.map((yr) => (
            <option key={yr} value={yr}>
              {yr}
            </option>
          ))}
        </select>

        {/* Semester - Optional */}
        <select
          value={selectedSemester}
          onChange={(e) => handleSemesterChange(e.target.value)}
          style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
        >
          <option value="">All Semesters</option>
          {semesters.map((sem) => (
            <option key={sem} value={sem}>
              {sem}
            </option>
          ))}
        </select>

        {/* Exam Type - Optional */}
        <select
          value={selectedExamType}
          onChange={(e) => handleExamTypeChange(e.target.value)}
          style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
        >
          <option value="">All Exam Types</option>
          {examTypes.map((exam) => (
            <option key={exam} value={exam}>
              {exam}
            </option>
          ))}
        </select>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={!canSearch || loading}
          style={{
            padding: "8px 16px",
            backgroundColor: canSearch && !loading ? "#007bff" : "#ccc",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: canSearch && !loading ? "pointer" : "not-allowed",
            fontWeight: "bold",
          }}
        >
          {loading ? "⏳ Searching..." : "🔍 Search"}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{ 
          marginTop: "15px", 
          padding: "15px", 
          backgroundColor: "#f8d7da",
          border: "1px solid #f5c6cb",
          borderRadius: "4px",
          color: "#721c24"
        }}>
          {error}
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <p>Loading premium questions...</p>
          <div style={{ 
            width: "40px", 
            height: "40px", 
            margin: "0 auto",
            border: "4px solid #f3f3f3",
            borderTop: "4px solid #007bff",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }} />
        </div>
      )}

      {/* Results Grid */}
      {!loading && questions.length > 0 && (
        <div style={{ marginTop: "30px" }}>
          <h3>
            Found {questions.length} premium question{questions.length > 1 ? "s" : ""}
          </h3>
          
          <div
            
          >
            {questions.map((question, index) => (
              <div
                
              >
                {/* Premium Badge */}
                <div style={{
                  position: "relative",
                  marginBottom: "10px",
                }}>
                  <span style={{
                    position: "absolute",
                    top: "5px",
                    right: "5px",
                    backgroundColor: "#e7f63c",
                    color: "#000",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    zIndex: 1,
                  }}>
                    ⭐ QBag Premium
                  </span>
                </div>

                {/* Image */}
                <img
                  src={`${API_BASE}${question.image_url}`}
                  alt={`${question.subject} - ${question.year}`}
                  style={{
                    width: "100%",
                    
                    border: "1px solid #eee",
                    borderRadius: "8px",
                  }}
                  onError={() => handleImageError(index)}
                />

                

               
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && !error && questions.length === 0 && canSearch && (
        <div style={{ 
          marginTop: "20px", 
          padding: "30px", 
          textAlign: "center",
          backgroundColor: "#f0f0f0",
          borderRadius: "4px",
          color: "#666"
        }}>
          <p style={{ fontSize: "16px" }}>No premium questions found</p>
          <p style={{ fontSize: "14px" }}>Try adjusting your search criteria or select different filters.</p>
          <p style={{ fontSize: "12px", marginTop: "10px", color: "#999" }}>
            💡 Tip: Questions need to have <strong>"approved"</strong> status to appear as premium.
          </p>
        </div>
      )}

      {/* Initial State */}
      {!loading && !error && questions.length === 0 && !canSearch && (
        <div style={{ 
          marginTop: "20px", 
          padding: "30px", 
          textAlign: "center",
          backgroundColor: "#f8f9fa",
          borderRadius: "4px",
          color: "#666"
        }}>
          <p style={{ fontSize: "16px" }}>Select University and Subject to search for premium questions</p>
          <p style={{ fontSize: "14px" }}>Use the filters above to narrow down your search.</p>
        </div>
      )}

      {/* CSS for loading spinner */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}