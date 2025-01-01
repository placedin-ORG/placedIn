import {useNavigate} from 'react-router-dom';
const Unlock=()=>{
  const navigate=useNavigate();

    return <>
 <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-gradient-to-r ">
      {/* Left Section */}
      <div className="flex flex-col items-start text-center md:text-left md:w-1/2 space-y-4">
        <h1 className="text-3xl md:text-5xl font-bold animate-fade-in">Boost Your <span className='text-green-400'>Knowledge</span> And<span className='text-green-400'> Experience</span> </h1>
        <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
          Explore opportunities from across the globe to grow, showcase skills, gain CV points & get hired by your dream company.
        </p>
      </div>

      {/* Right Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-0 gap-y-3  mt-8 md:mt-0 md:w-1/2 animate-slide-in px-0 md:px-32">
      
          <div
            
            className="flex flex-col items-center bg-[#9BE6C1] shadow-lg rounded-lg p-4 hover:shadow-2xl transform hover:scale-105 transition-all duration-300 w-48 h-48"
            onClick={()=>navigate("/internship-portal")}
          >
            <h2>
                Internships
            </h2>
            <div className="text-center text-blue-600 font-semibold mb-4">
                Practical <br /> Experience
            </div>
            <img
              src="https://d8it4huxumps7.cloudfront.net/uploads/images/66a33ab0b2ae3_internship.png?d=222x166"
              alt="Practical Experience"
              className="w-full h-auto rounded-lg"
            />
          </div>
       

          <div
            
            className="flex flex-col items-center bg-[#FFDD80] shadow-lg rounded-lg p-4 hover:shadow-2xl transform hover:scale-105 transition-all duration-300 w-48 h-48"
          > <h2>Courses</h2>
            <div className="text-center text-blue-600 font-semibold mb-4">
               
              Gain <br /> Certificates 
            </div>
            <img
              src="https://d8it4huxumps7.cloudfront.net/uploads/images/6567142bc098d_frame_1000013233.png?d=410x390"
              alt="Practical Experience"
              className=" md:w-full h-auto rounded-lg"
            />
          </div>
          <div
            
            className="flex flex-col items-center bg-[#F8BD8F] shadow-lg rounded-lg p-4 hover:shadow-2xl transform hover:scale-105 transition-all duration-300 w-48 h-48"
          > <h2>Exams</h2>
            <div className="text-center text-blue-600 font-semibold mb-4">
               
              Gain <br /> Practical <br /> Experience
            </div>
            <img
              src="https://d8it4huxumps7.cloudfront.net/uploads/images/66a33e8b45898_mentorship.png?d=296x188"
              alt="Practical Experience"
              className="w-[80%] md:w-full h-auto rounded-lg"
            />
          </div>
          <div
           
            className="flex flex-col items-center bg-[#9BC9FF] shadow-lg rounded-lg p-4 hover:shadow-2xl transform hover:scale-105 transition-all duration-300 w-48 h-48"
          >
            <h2>Jobs</h2>
            <div className="text-center text-blue-600 font-semibold mb-4">
              Explore <br /> Diverse <br /> careerrs
            </div>
            <img
              src="https://d8it4huxumps7.cloudfront.net/uploads/images/66a33a774fef4_jobs.png?d=222x166"
              alt="Practical Experience"
              className="w-[80%] md:w-full h-auto rounded-lg"
            />
          </div>
      </div>
    </div>
    </>
}

export default Unlock;