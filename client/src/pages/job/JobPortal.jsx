import Navbar from "../../component/Navbar";
import TopSection from "../../component/Intern/interPortal/TopSection";
import InternCategory from "../../component/Intern/interPortal/InternCategory";
import Jobs from "../../component/job/jobPortal/Jobs";

const JobPortal=()=>{
    return <>
         <div className="grainy-light min-h-screen">
   <Navbar/>
   <TopSection type="job"/>
   <InternCategory />
   <Jobs/>
   </div>
    </>
}
export default JobPortal;