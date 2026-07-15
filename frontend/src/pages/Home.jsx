
import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "/api";

export default function QuestionSearch() {
  const [universities, setUniversities] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [years, setYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [examTypes, setExamTypes] = useState([]);

  const [selectedUniversity, setSelectedUniversity] =
    useState("");

  const [selectedSubject, setSelectedSubject] =
    useState("");

  const [selectedCourse, setSelectedCourse] =
    useState("");

  const [selectedYear, setSelectedYear] =
    useState("");

  const [selectedSemester, setSelectedSemester] =
    useState("");

  const [selectedExamType, setSelectedExamType] =
    useState("");

  const [images, setImages] = useState([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/fetch/universities`
      );

      setUniversities(res.data);
    } catch (err) {
      console.error(err);
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

    try {
      const res = await axios.get(
        `${API_BASE}/fetch/subjects/${encodeURIComponent(
          value
        )}`
      );

      setSubjects(res.data);
    } catch (err) {
      console.error(err);
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

    try {
      const res = await axios.get(
        `${API_BASE}/fetch/courses/${encodeURIComponent(
          selectedUniversity
        )}/${encodeURIComponent(value)}`
      );

      setCourses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCourseChange = async (value) => {
    setSelectedCourse(value);

    setSelectedYear("");
    setSelectedSemester("");
    setSelectedExamType("");

    setYears([]);
    setSemesters([]);
    setExamTypes([]);
    setImages([]);
    try{
      const res = await axios.get(
        `${API_BASE}/fetch/years/${encodeURIComponent(
          selectedUniversity
        )}/${encodeURIComponent(
          selectedSubject
        )}/${encodeURIComponent(value)}`
      );
      setYears(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleYearChange = async (value) => {
    setSelectedYear(value);

    setSelectedSemester("");
    setSelectedExamType("");

    setSemesters([]);
    setExamTypes([]);
    setImages([]);

    try {
      const res = await axios.get(
        `${API_BASE}/fetch/semesters/${encodeURIComponent(
          selectedUniversity
        )}/${encodeURIComponent(
          selectedSubject
        )}/${encodeURIComponent(selectedCourse
        )}/${value}`
      );

      setSemesters(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSemesterChange = async (value) => {
    setSelectedSemester(value);

    setSelectedExamType("");
    setExamTypes([]);
    setImages([]);

    try {
      const res = await axios.get(
        `${API_BASE}/fetch/exam_types/${encodeURIComponent(
          selectedUniversity
        )}/${encodeURIComponent(
          selectedSubject
        )}/${encodeURIComponent(
          selectedCourse
        )}/${encodeURIComponent(
          selectedYear
        )}/${encodeURIComponent(
          value
        )}`
      );

      setExamTypes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${API_BASE}/fetch/question`,
        {
          params: {
            university: selectedUniversity,
            subject: selectedSubject,
            course: selectedCourse,
            year: selectedYear,
            semester: selectedSemester,
            exam_type: selectedExamType,
          },
        }
      );

      setImages(res.data.images);
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
        onChange={(e) =>
          handleUniversityChange(e.target.value)
        }
      >
        <option value="">
          Select University
        </option>

        {universities.map((uni) => (
          <option
            key={uni}
            value={uni}
          >
            {uni}
          </option>
        ))}
      </select>

      <br />
      <br />

      <select
        value={selectedSubject}
        onChange={(e) =>
          handleSubjectChange(e.target.value)
        }
      >
        <option value="">
          Select Subject
        </option>

        {subjects.map((sub) => (
          <option
            key={sub}
            value={sub}
          >
            {sub}
          </option>
        ))}
      </select>
      <br />
      <br />
      <select
        value={selectedCourse}
        onChange={(e) =>
          handleCourseChange(e.target.value)
        }
      >
        <option value="">
          Select Course
        </option>

        {courses.map((course) => (
          <option
            key={course}
            value={course}
          >
            {course}
          </option>
        ))}
      </select>

      <br />
      <br />

      <select
        value={selectedYear}
        onChange={(e) =>
          handleYearChange(e.target.value)
        }
      >
        <option value="">
          Select Year
        </option>

        {years.map((year) => (
          <option
            key={year}
            value={year}
          >
            {year}
          </option>
        ))}
      </select>

      <br />
      <br />

      <select
        value={selectedSemester}
        onChange={(e) =>
          handleSemesterChange(e.target.value)
        }
      >
        <option value="">
          Select Semester
        </option>

        {semesters.map((semester) => (
          <option
            key={semester}
            value={semester}
          >
            {semester}
          </option>
        ))}
      </select>

      <br />
      <br />

      <select
        value={selectedExamType}
        onChange={(e) =>
          setSelectedExamType(
            e.target.value
          )
        }
      >
        <option value="">
          Select Exam Type
        </option>

        {examTypes.map((exam) => (
          <option
            key={exam}
            value={exam}
          >
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
          !selectedYear ||
          !selectedSemester ||
          !selectedExamType
        }
      >
        Search Question
      </button>

      {loading && (
        <p>Loading questions...</p>
      )}

      {images.length > 0 && (
        <div
          style={{
            marginTop: "30px",
          }}
        >
          <h3>
            Found {images.length} Pages
          </h3>

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
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}