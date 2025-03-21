import InternCategory from "../../component/Intern/interPortal/InternCategory";
import Internships from "../../component/Intern/interPortal/Internships";
import TopSection from "../../component/Intern/interPortal/TopSection";
import Navbar from "../../component/Navbar";
import {useNavigate} from 'react-router-dom'
const InternshipPortal=()=>{
    const navigate=useNavigate();
    const type="internship"
    return <>
    <div className="grainy-light min-h-screen">
   <Navbar type={type}/>
   <TopSection type="internship"/>
   <InternCategory/>
   <Internships/>
   <div className="flex gap-3 flex-col md:flex-row items-center justify-center">
    <img src="https://d8it4huxumps7.cloudfront.net/uploads/images/676e5f765e786_internship_portal.png?d=1000x600" className="animate-slide-in w-1/2"/>
    <h1 className="text-2xl">
        Explore All types of Internships
        <br></br>
        <button className="p-2 hover:bg-green-600 text-xl rounded-md bg-green-400 text-white" onClick={()=>navigate('/AllInternships')}>Explore Now </button>
    </h1>
   </div>

   <h1 className="w-full items-center flex justify-center text-gray-600 mt-12 mb-3"> Powered by PlacedIn</h1>
    </div>
    </>
}
export default InternshipPortal;