import React, { useEffect, useState } from "react";
import API from "../../utils/API";
import SmallUnderline from "../../component/SmallUnderline";
import Navbar from "../../component/Navbar";
import ExamCard from "../../component/exams/ExamCard";
import Xskeletonn from "../../component/loading/Xskeleton";
const AllExams = () => {
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: "",
    topic: "",
    price: "",
    startDate: "",
  });
  useEffect(() => {
    const getExams = async () => {
      try {
        const response = await API.get("/exam/get");
        setExams(response.data.exams);
        setLoading(false);
        setFilteredExams(response.data.exams); // Initially show all exams
      } catch (error) {
        console.error("Error fetching exams:", error);
      }
    };
    getExams();
  }, []);
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));

    // Dynamically filter exams based on filters
    const updatedExams = exams.filter((exam) => {
      // Check if category matches or is empty (meaning no filter applied)
      const matchesCategory =
        !filters.category || exam.category === filters.category;

      // Check if topic matches or is empty (meaning no filter applied)
      const matchesTopic =
        !filters.topic || exam.topics.some((topic) => topic === filters.topic);

      // Check if price is less than or equal to the selected value or if no filter applied
      const matchesPrice =
        !filters.price || exam.price <= Number(filters.price);

      // Check if start date matches or is empty (meaning no filter applied)
      const matchesDate =
        !filters.startDate ||
        new Date(exam.startDate).toISOString().slice(0, 10) ===
          filters.startDate;

      return matchesCategory && matchesTopic && matchesPrice && matchesDate;
    });

    setFilteredExams(updatedExams);
  };

  return (
    <div className="grainy-light">
      <Navbar />
      <div className="max-w-7xl mx-auto px-3 lg:px-8 py-10">
        <h1 className="text-center text-primary text-4xl font-bold relative">
          Explore Exams
          <SmallUnderline />
        </h1>

        {/* Filter Section */}
        <div className="mt-8 mb-16 flex flex-wrap justify-center gap-5">
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

        {/* Exam Cards */}
        {filteredExams.length === 0 ? (
          <div className="text-center text-gray-500 text-xl">
            No exams found
          </div>
        ) : (
          <div>
            {loading ? (
              <Xskeletonn />
            ) : (
              <div className="mt-16 grid grid-cols-1 place-items-center sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {filteredExams?.map((exam, index) => (
                  <ExamCard exam={exam} key={exam._id} />
                ))}
              </div>
            )}{" "}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllExams;
