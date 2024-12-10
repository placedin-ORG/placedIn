import React, { useEffect, useState } from "react";
import API from "../../utils/API";
import SmallUnderline from "../../component/SmallUnderline";
import Navbar from "../../component/Navbar";
import ExamCard from "../../component/exams/ExamCard";
import Xskeletonn from "../../component/loading/Xskeleton";
import cannot from "../../assets/cannot.jpeg";
const ITEMS_PER_PAGE = 10;
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
        setFilteredExams(response.data.exams); // Show all exams initially
        setLoading(false);
      } catch (error) {
        console.error("Error fetching exams:", error);
      }
    };
    getExams();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const updatedFilters = { ...filters, [name]: value };
    setFilters(updatedFilters);

    const updatedExams = exams.filter((exam) => {
      const matchesCategory =
        !updatedFilters.category || exam.category === updatedFilters.category;
      const matchesTopic =
        !updatedFilters.topic || exam.topics.includes(updatedFilters.topic);
      const matchesPrice =
        !updatedFilters.price || exam.price <= Number(updatedFilters.price);
      const matchesDate =
        !updatedFilters.startDate ||
        new Date(exam.startDate).toISOString().slice(0, 10) ===
          updatedFilters.startDate;

      return matchesCategory && matchesTopic && matchesPrice && matchesDate;
    });

    setFilteredExams(updatedExams);
  };

  const filteredTopics = filters.category
    ? Array.from(
        new Set(
          exams
            .filter((exam) => exam.category === filters.category)
            .flatMap((exam) => exam.topics)
        )
      )
    : Array.from(new Set(exams.flatMap((exam) => exam.topics)));
    const [currentPage, setCurrentPage] = useState(1);

    // Calculate total pages
    const totalPages = Math.ceil(filteredExams.length / ITEMS_PER_PAGE);
  
    // Get exams for the current page
    const paginatedExams = filteredExams.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  
    const handlePageChange = (newPage) => {
      setCurrentPage(newPage);
    };
    
  return (
    <div className="grainy-light min-h-screen">
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
          <option value="doctorate">Doctorate</option>
          <option value="aiml">AIML</option>
          <option value="mba">MBA</option>
          <option value="software">Software</option>
          <option value="dataScience">Data Science</option>
          <option value="marketing">Marketing</option>
          <option value="management">Management</option>
          <option value="law">Law</option>
        </select>

        <select
          name="topic"
          value={filters.topic}
          onChange={handleFilterChange}
          className="border p-2 rounded-md"
        >
          <option value="">All Topics</option>
          {filteredTopics.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
      </div>

      {/* Exam Cards */}
      {loading ? (
        <Xskeletonn />
      ) : paginatedExams.length === 0 ? (
        <div className="mt-16 flex flex-col items-center">
          <img
            src={cannot}
            alt="No results"
            className="mix-blend-darken w-72 h-72 mb-6"
          />
          <h2 className="text-2xl font-semibold text-gray-700">
            No results found
          </h2>
          <p className="mt-2 text-gray-500 text-center">
            Try refining your category or explore other categories.
          </p>
        </div>
      ) : (
        <div className="mt-16 grid grid-cols-1 place-items-center sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {paginatedExams.map((exam) => (
            <ExamCard exam={exam} key={exam._id} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex justify-center mt-8">
        <button
          className="px-4 py-2 mx-1 border rounded"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, idx) => (
          <button
            key={idx}
            className={`px-4 py-2 mx-1 border rounded ${
              currentPage === idx + 1 ? "bg-primary text-white" : ""
            }`}
            onClick={() => handlePageChange(idx + 1)}
          >
            {idx + 1}
          </button>
        ))}
        <button
          className="px-4 py-2 mx-1 border rounded"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  </div>
  );
};

export default AllExams;
