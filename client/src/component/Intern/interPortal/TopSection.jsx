const TopSection=({type})=>{
    return <>
   <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-gradient-to-r ">
      {/* Left Section */}
      <div className="pl-0 md:pl-10 flex flex-col items-start text-center md:text-left md:w-1/2 space-y-4">
        <h1 className="text-3xl md:text-5xl font-bold animate-fade-in">Unlock <span className='text-green-400'>{type==="job"?"Ambition":"Opportunity"}</span></h1>
        <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
          {
            type==="job"?"Apply to a plethora of hiring opportunities & work with your dream companies!":"  Explore opportunities from across the globe to grow, showcase skills, gain CV points & get hired by your dream company."
          }
        
        </p>
      </div>

      {/* Right Section */}
      <div className="flex items-center justify-center  mt-8 md:mt-0 md:w-1/2 animate-slide-in px-0 md:px-32">
      {
        type==="job"?<img src="https://d8it4huxumps7.cloudfront.net/uploads/images/676e54be91c74_job_portal.png?d=1000x600"/> : <img src="https://d8it4huxumps7.cloudfront.net/uploads/images/676e5f765e786_internship_portal.png?d=1000x600"/>
      }
   
         
      </div>
    </div>
    </>
}
export default TopSection;