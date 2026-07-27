
import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "/api";
// const API_BASE = "http://127.0.0.1:8000";

export default function QuestionSearch() {
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

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    try {
      const res = await axios.get(`${API_BASE}/fetch/universities`);
      setUniversities(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setUniversities([]);
    }
  };

  const handleUniversityChange = async (value) => {
    setSelectedUniversity(value);
    setSelectedSubject("");
    setSelectedCourse("");
    setSelectedYear("");
    setSelectedSemester("");
    setSelectedExamType("");
    
    setSubjects([]);
    setCourses([]);
    setYears([]);
    setSemesters([]);
    setExamTypes([]);
    setImages([]);

    if (!value) return;

    try {
      const res = await axios.get(
        `${API_BASE}/fetch/subjects/${encodeURIComponent(value)}`
      );
      setSubjects(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setSubjects([]);
    }
  };

  const handleSubjectChange = async (value) => {
    setSelectedSubject(value);
    setSelectedCourse("");
    setSelectedYear("");
    setSelectedSemester("");
    setSelectedExamType("");

    setCourses([]);
    setYears([]);
    setSemesters([]);
    setExamTypes([]);
    setImages([]);

    if (!value || !selectedUniversity) return;

    try {
      const res = await axios.get(
        `${API_BASE}/fetch/semesters/${encodeURIComponent(selectedUniversity)}/${encodeURIComponent(value)}`
      );
      setSemesters(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setSemesters([]);
    }
  };

  const handleSemesterChange = async (value) => {
    setSelectedSemester(value);
    setSelectedCourse("");
    setSelectedYear("");
    setSelectedExamType("");

    setCourses([]);
    setYears([]);
    setExamTypes([]);
    setImages([]);

    if (!value || !selectedUniversity || !selectedSubject) return;

    try {
      const res = await axios.get(
        `${API_BASE}/fetch/courses/${encodeURIComponent(selectedUniversity)}/${encodeURIComponent(selectedSubject)}/${encodeURIComponent(value)}`
      );
      setCourses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setCourses([]);
    }
  };

  const handleCourseChange = async (value) => {
    setSelectedCourse(value);
    setSelectedYear("");
    setSelectedExamType("");

    setYears([]);
    setExamTypes([]);
    setImages([]);

    if (!value || !selectedUniversity || !selectedSubject || !selectedSemester) return;

    try {
      const res = await axios.get(
        `${API_BASE}/fetch/year/${encodeURIComponent(selectedUniversity)}/${encodeURIComponent(selectedSubject)}/${encodeURIComponent(selectedSemester)}/${encodeURIComponent(value)}`
      );
      setYears(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setYears([]);
    }
  };

  const handleYearChange = async (value) => {
    setSelectedYear(value);
    setSelectedExamType("");
    setExamTypes([]);
    setImages([]);

    // ✅ FIXED: Correct order - university/subject/semester/course/year
    if (!value || !selectedUniversity || !selectedSubject || !selectedSemester || !selectedCourse) return;

    try {
      const res = await axios.get(
        `${API_BASE}/fetch/exam_types/${encodeURIComponent(selectedUniversity)}/${encodeURIComponent(selectedSubject)}/${encodeURIComponent(selectedSemester)}/${encodeURIComponent(selectedCourse)}/${encodeURIComponent(value)}`
      );
      setExamTypes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setExamTypes([]);
    }
  };

  const handleSearch = async () => {
    if (!selectedUniversity || !selectedSubject || !selectedCourse || !selectedYear || !selectedSemester || !selectedExamType) {
      alert("Please select all fields");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/fetch/question`, {
        params: {
          university: selectedUniversity,
          subject: selectedSubject,
          semester: selectedSemester,  // ✅ Match backend parameter name
          course: selectedCourse,
          year: selectedYear,
          exam_type: selectedExamType,
        },
      });
      setImages(res.data?.images || []);
    } catch (err) {
      console.error(err);
      setImages([]);
      alert("Question not found");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "20px auto",
      }}
    >
      <h2>Find Question</h2>

      <select
        value={selectedUniversity}
        onChange={(e) => handleUniversityChange(e.target.value)}
      >
        <option value="">Select University</option>
        {universities.map((uni) => (
          <option key={uni} value={uni}>
            {uni}
          </option>
        ))}
      </select>

      <br />
      <br />

      <select
        value={selectedSubject}
        onChange={(e) => handleSubjectChange(e.target.value)}
        disabled={!selectedUniversity}
      >
        <option value="">Select Subject</option>
        {subjects.map((sub) => (
          <option key={sub} value={sub}>
            {sub}
          </option>
        ))}
      </select>

      <br />
      <br />

      <select
        value={selectedSemester}
        onChange={(e) => handleSemesterChange(e.target.value)}
        disabled={!selectedSubject}
      >
        <option value="">Select Semester</option>
        {semesters.map((semester) => (
          <option key={semester} value={semester}>
            {semester}
          </option>
        ))}
      </select>

      <br />
      <br />

      <select
        value={selectedCourse}
        onChange={(e) => handleCourseChange(e.target.value)}
        disabled={!selectedSemester}
      >
        <option value="">Select Course</option>
        {courses.map((course) => (
          <option key={course} value={course}>
            {course}
          </option>
        ))}
      </select>

      <br />
      <br />

      <select
        value={selectedYear}
        onChange={(e) => handleYearChange(e.target.value)}
        disabled={!selectedCourse}
      >
        <option value="">Select Year</option>
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>

      <br />
      <br />

      <select
        value={selectedExamType}
        onChange={(e) => setSelectedExamType(e.target.value)}
        disabled={!selectedYear}
      >
        <option value="">Select Exam Type</option>
        {examTypes.map((exam) => (
          <option key={exam} value={exam}>
            {exam}
          </option>
        ))}
      </select>

      <br />
      <br />

      <button
        onClick={handleSearch}
        disabled={
          !selectedUniversity ||
          !selectedSubject ||
          !selectedCourse ||
          !selectedYear ||
          !selectedSemester ||
          !selectedExamType ||
          loading
        }
      >
        {loading ? "Searching..." : "Search Question"}
      </button>

      {loading && <p>Loading questions...</p>}

      {images.length > 0 && (
        <div
          style={{
            marginTop: "30px",
          }}
        >
          <h3>Found {images.length} Pages</h3>
          {images.map((img) => (
            <div
              key={img.image_id}
              style={{
                marginBottom: "25px",
              }}
            >
              <img
                src={`${API_BASE}${img.image_url}`}
                alt="Question"
                style={{
                  width: "100%",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}