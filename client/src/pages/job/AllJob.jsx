import React, { useEffect, useState } from "react";
import API from "../../utils/API";

import SmallUnderline from "../../component/SmallUnderline";
import Navbar from "../../component/Navbar";
import Xskeletonn from "../../component/loading/Xskeleton";
import cannot from "../../assets/cannot.jpeg";
import { useLocation } from "react-router-dom";
const ITEMS_PER_PAGE = 10;
import toast from 'react-hot-toast'
import {useSelector} from "react-redux";
import JobCard from "../../component/Job/JobPortal/JobCard";

const AllJob=()=>{
    const user=useSelector((state)=>state.user.user);
    const location = useLocation();
  useEffect(() => {
    if (location.state !== null) {
      setFilters((prev) => ({
        ...prev,
        ["category"]: location.state.category,
      }));
    }
  }, []);
  const [jobs, setJobs] = useState([]); 
  const [studentData,setStudentData]=useState(null);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [filters, setFilters] = useState({
    category: "",
  });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const getJobs = async () => {
      try {
        const response= await API.post("/job/get",{
            user
        });
           
        if(response.status){
            if(user){
                setJobs(response.data.data);
                setStudentData(response.data.studentJob);
                console.log(response.data.data)
            }else{
                setJobs(response.data.data);
            }
            
          
          }else{
            toast.error(response.data.message)
          }
        setFilteredJobs(response.data.data);
        setLoading(false); // Initialize filtered job
      } catch (error) {
        console.log(error);
      }
    };
    getJobs();
  }, []);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Filter Jobs when filters change
  useEffect(() => {
    let filtered = jobs;
   console.log(jobs)
    // Filter by category
    console.log(filters.category)
    if (filters?.category) {
      filtered = filtered.filter(
        (job) => {job.category.includes(filters.category); console.log(job.category)}
      );
    }

    setFilteredJobs(filtered);
  }, [filters, jobs]);

  const [currentPage, setCurrentPage] = useState(1);

  // Calculate total pages
  const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE);

  // Get job for the current page
  const paginatedJobs= filteredJobs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };
  const type="job"
 return    <>
  <div className="grainy-light min-h-screen">
      <Navbar type={type}/>

      <div className="max-w-7xl mx-auto px-3 lg:px-8 py-10">
        <h1 className="text-center text-primary text-4xl font-bold relative">
          Explore Jobs
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

         
        </div>

        {/* Job Cards */}
        {filteredJobs?.length === 0 ? (
          <div className="mt-16 flex flex-col items-center">
            <img
              src={cannot}
              alt="No results"
              className="mix-blend-darken w-72 h-72 mb-6"
            />
            <h2 className="text-2xl font-semibold text-gray-700">
              No Jobs found
            </h2>
            <p className="mt-2 text-gray-500 text-center">
              Explore other Jobs.
            </p>
          </div>
        ) : (
          <div>
            {loading ? (
              <Xskeletonn />
            ) : (
              <div className="mt-16 grid grid-cols-1 place-items-center sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {paginatedJobs.map((job, index) => (
                  <JobCard job={job} studentData={studentData}/>
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
    </>
}
export default AllJob;