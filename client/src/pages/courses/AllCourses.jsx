import React, { useEffect, useState } from "react";
import API from "../../utils/API";
import CourseCard from "../../component/CourseCard";
import SmallUnderline from "../../component/SmallUnderline";
import Navbar from "../../component/Navbar";
import Xskeletonn from "../../component/loading/Xskeleton";
import cannot from "../../assets/cannot.jpeg";
import { useLocation } from "react-router-dom";
const ITEMS_PER_PAGE = 10;
const AllCourses = () => {
  const location = useLocation();
  useEffect(() => {
    if (location.state !== null) {
      setFilters((prev) => ({
        ...prev,
        ["category"]: location.state.category,
      }));
    }
  }, []);
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [filters, setFilters] = useState({
    category: "",
    priceRange: [0, 1000],
    rating: 0,
    status: "",
    paid: "",
  });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const getCourses = async () => {
      try {
        const { data } = await API.get("/create/courses/all");

        setCourses(data.courses);
        console.log( "Data of courses",data.courses);
        setFilteredCourses(data.courses);
        setLoading(false); // Initialize filtered courses
      } catch (error) {
        console.log(error);
      }
    };
    getCourses();
  }, []);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Filter courses when filters change
  useEffect(() => {
    let filtered = courses;

    // Filter by category
    if (filters?.category) {
      filtered = filtered.filter(
        (course) => course.courseCategory === filters.category
      );
    }

    // Filter by price range
    // filtered = filtered.filter(
    //   (course) =>
    //     course.price >= filters.priceRange[0] &&
    //     course.price <= filters.priceRange[1]
    // );

    // Filter by rating
    if (filters.rating > 0) {
      filtered = filtered.filter((course) => {
        const avgRating =
          course.rating.reduce((sum, r) => sum + r.rating, 0) /
            course.rating.length || 0;
        return avgRating >= filters.rating;
      });
    }

    // Filter by status
    if (filters?.status) {
      filtered = filtered.filter((course) => course.status === filters.status);
    }

    // Filter by paid/free
    if (filters.paid !== "") {
      filtered = filtered.filter(
        (course) => course.price > 0 && filters.paid === "true"
      );
    }

    setFilteredCourses(filtered);
  }, [filters, courses]);

  const [currentPage, setCurrentPage] = useState(1);

  // Calculate total pages
  const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE);

  // Get courses for the current page
  const paginatedCourses = filteredCourses.slice(
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
          Explore Courses
          <SmallUnderline />
        </h1>

        {/* Filter Section */}
        <div className="my-6 flex flex-wrap gap-4 justify-center">
          <select
            className="border px-3 py-2 rounded"
            value={filters?.category || ""}
            onChange={(e) => handleFilterChange("category", e.target.value)}
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
            className="border px-3 py-2 rounded"
            value={filters.paid}
            onChange={(e) => handleFilterChange("paid", e.target.value)}
          >
            <option value="">All</option>
            <option value="true">Paid</option>
            <option value="false">Free</option>
          </select>
        </div>

        {/* Course Cards */}
        {filteredCourses?.length === 0 && !loading ? (
          <div className="mt-16 flex flex-col items-center">
            <img
              src={cannot}
              alt="No results"
              className="mix-blend-darken w-72 h-72 mb-6"
            />
            <h2 className="text-2xl font-semibold text-gray-700">
              No Course found
            </h2>
            <p className="mt-2 text-gray-500 text-center">
              Explore other Courses.
            </p>
          </div>
        ) : (
          <div>
            {loading ? (
              <Xskeletonn />
            ) : (
              <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 items-stretch">
                {paginatedCourses.map((course, index) => (
                  <CourseCard course={course} key={index} />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            <div className="flex justify-center mt-8">
              <button
                className="px-4 py-2 mx-1 border rounded disabled:cursor-not-allowed disabled:opacity-60"
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
                className="px-4 py-2 mx-1 border rounded disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllCourses;
