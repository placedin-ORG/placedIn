import React, { useEffect, useState } from "react";
import SmallUnderline from "../../component/SmallUnderline";
import { useSelector } from "react-redux";
import API from "../../utils/API";
import ExamCard from "../../component/exams/ExamCard";
import { useSearchParams } from "react-router-dom";

const UserExams = () => {
  const { user } = useSelector((state) => state.user);
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchparams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    category: "",
    topic: "",
    price: "",
    startDate: "",
  });
  const examType = searchparams.get("examType");

  useEffect(() => {
    if (!examType) {
      setSearchParams({ examType: "upcoming" });
    }
  });

  // Fetch exams based on examType
  useEffect(() => {
    const getExams = async () => {
      setLoading(true);
      try {
        const endpoint =
          examType === "upcoming"
            ? "/exam/upcoming-exams"
            : "/exam/completed-exams";
        const { data } = await API.get(endpoint);
        setExams(data.exams);
        setFilteredExams(data.exams);
      } catch (error) {
        console.error("Error fetching exams:", error);
      } finally {
        setLoading(false);
      }
    };
    getExams();
  }, [examType]); // Re-fetch when examType changes

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));

    const updatedExams = exams.filter((exam) => {
      const matchesCategory =
        !filters.category || exam.category === filters.category;
      const matchesTopic =
        !filters.topic || exam.topics.some((topic) => topic === filters.topic);
      const matchesPrice =
        !filters.price || exam.price <= Number(filters.price);
      const matchesDate =
        !filters.startDate ||
        new Date(exam.startDate).toISOString().slice(0, 10) ===
          filters.startDate;

      return matchesCategory && matchesTopic && matchesPrice && matchesDate;
    });

    setFilteredExams(updatedExams);
  };

  return (
    <div className="grainy-light min-h-screen">
      <div className="max-w-7xl mx-auto px-3 md:px-8 py-10">
        <h1 className="text-center text-primary text-4xl font-bold relative">
          Exams Data
          <SmallUnderline />
        </h1>

        <div className="flex flex-col items-center justify-between mt-16 gap-10">
          {/* Tabs Section */}
          <div className="flex justify-start space-x-4">
            <button
              className={`px-4 py-2 border-b-2 ${
                examType === "upcoming"
                  ? "border-orange-500 font-bold"
                  : "border-gray-300"
              }`}
              onClick={() => setSearchParams({ examType: "upcoming" })}
            >
              Upcoming Exams
            </button>
            <button
              className={`px-4 py-2 border-b-2 ${
                examType === "completed"
                  ? "border-orange-500 font-bold"
                  : "border-gray-300"
              }`}
              onClick={() => setSearchParams({ examType: "completed" })}
            >
              Completed Exams
            </button>
          </div>

          {/* Filter Section */}
          <div className="flex flex-wrap justify-center gap-5">
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="border p-2 rounded-md"
            >
              <option value="">All Categories</option>
              <option value="software">Software</option>
              <option value="science">Science</option>
            </select>

            <select
              name="topic"
              value={filters.topic}
              onChange={handleFilterChange}
              className="border p-2 rounded-md"
            >
              <option value="">All Topics</option>
              {Array.from(new Set(exams.flatMap((exam) => exam.topics))).map(
                (topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        {/* Exam Cards */}
        {loading ? (
          <div className="text-center text-xl">Loading...</div>
        ) : filteredExams.length === 0 ? (
          <div className="text-center text-gray-500 text-xl">
            No exams found
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 place-items-center sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredExams.map((exam) => (
              <ExamCard
                isUser
                completed
                exam={examType === "upcoming" ? exam : exam.ExamId}
                key={exam._id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserExams;
