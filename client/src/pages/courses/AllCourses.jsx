import React, { useEffect, useState } from "react";
import API from "../../utils/API";
import CourseCard from "../../component/CourseCard";
import SmallUnderline from "../../component/SmallUnderline";
import Navbar from "../../component/Navbar";

const AllCourses = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [filters, setFilters] = useState({
    category: "",
    priceRange: [0, 1000],
    rating: 0,
    status: "",
    paid: "",
  });

  useEffect(() => {
    const getCourses = async () => {
      try {
        const { data } = await API.get("/create/getCourses");
        setCourses(data.courses);
        setFilteredCourses(data.courses); // Initialize filtered courses
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
    if (filters.category) {
      filtered = filtered.filter(
        (course) => course.courseCategory === filters.category
      );
    }

    // Filter by price range
    filtered = filtered.filter(
      (course) =>
        course.price >= filters.priceRange[0] &&
        course.price <= filters.priceRange[1]
    );

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
    if (filters.status) {
      filtered = filtered.filter((course) => course.status === filters.status);
    }

    // Filter by paid/free
    if (filters.paid !== "") {
      filtered = filtered.filter(
        (course) => course.paid === (filters.paid === "true")
      );
    }

    setFilteredCourses(filtered);
  }, [filters, courses]);

  return (
    <div className="grainy-light">
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
            value={filters.category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Technology">Technology</option>
            <option value="Business">Business</option>
            <option value="Art">Art</option>
            {/* Add more categories as needed */}
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
        {filteredCourses?.length === 0 ? (
          <p className="text-center text-gray-500">No courses found.</p>
        ) : (
          <div className="mt-16 grid grid-cols-1 place-items-center sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredCourses?.map((course, index) => (
              <CourseCard course={course} key={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllCourses;
