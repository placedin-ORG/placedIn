import InternCategory from "../../component/Intern/interPortal/InternCategory";
import Internships from "../../component/Intern/interPortal/Internships";
import TopSection from "../../component/Intern/interPortal/TopSection";
import Navbar from "../../component/Navbar";

const InternshipPortal=()=>{
    return <>
    <div className="grainy-light min-h-screen">
   <Navbar/>
   <TopSection type="internship"/>
   <InternCategory/>
   <Internships/>
    </div>
    </>
}
export default InternshipPortal;