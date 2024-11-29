import {useState,useEffect} from 'react';
import {useParams} from 'react-router-dom';
import axios from 'axios';
import CourseCard from "../../component/CourseCard";
import SmallUnderline from "../../component/SmallUnderline";
import Navbar from '../../component/Navbar';
import Footer from '../../component/Layout/Footer';
import noresult from "../../assets/noresult3.jpg"
const SearchResult=()=>{
const {query}=useParams();
 const [courses,setCourses]=useState(null);
useEffect(()=>{
    const call=async()=>{
      const data=await axios.post('http://localhost:5000/api/v1/search/getSearch',{
        query
      })
      if(data.data.status){
        setCourses(data.data.courses);
      }
      
    }
    call()
},[])
return (
    <>
   <Navbar />
      <div className="resultPage min-h-screen">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
          {/* Page Heading */}
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900">
              Search Results for: <span className="text-blue-600">{query}</span>
            </h1>
            <SmallUnderline />
            <p className="mt-4 text-lg text-gray-600">
              Explore the courses that match your query. Learn something new today!
            </p>
          </div>

          {/* Results Section */}
          {courses?.length === 0 ? (
            // Empty State
            <div className="mt-16 flex flex-col items-center">
              <img
                src={noresult}
                alt="No results"
                className="w-72 h-72 mb-6"
              />
              <h2 className="text-2xl font-semibold text-gray-700">
                No results found for "{query}"
              </h2>
              <p className="mt-2 text-gray-500 text-center">
                Try refining your search or explore other categories.
              </p>
            </div>
          ) : (
            // Results Grid
            <div className="mt-16 grid grid-cols-1 place-items-center sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {courses?.map((course, index) => (
                <CourseCard key={index} course={course} />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
)
}

export default SearchResult;