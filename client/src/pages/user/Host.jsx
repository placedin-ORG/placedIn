import { useEffect,useState } from 'react';
import {MdWork,MdOutlineQuiz,MdLibraryAdd} from 'react-icons/md';

const Host=()=>{
    const handleRedirect = () => {
        window.location.href = import.meta.env.VITE_APP_BASE_URL; // Replace with your desired URL
      };
      const [visible,setVisible]=useState(false);
      useEffect(()=>{
        setVisible(true);
      },[])
   return  <>
   <div className="w-full h-screen">
      <h1 className="w-full text-xl md:text-2xl pt-4 flex items-center justify-center">
        Start your Own :
      </h1>
      <div className="mt-6 p-6 w-full flex flex-col items-center justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-center w-[90%]">
          <div className="p-4 border-2 rounded-lg border-green-200 animate-float transform transition-transform duration-300 hover:scale-110 hover:rotate-2 hover:shadow-xl">
            <MdWork size={54} className="text-green-400" />
            <p className="mt-2 text-center text-sm md:text-base">
              Internship Program
            </p>
          </div>
          <div className="p-4 border-2 rounded-lg border-green-200 animate-float transform transition-transform duration-300 hover:scale-110 hover:rotate-2 hover:shadow-xl">
            <MdOutlineQuiz size={54} className="text-green-400" />
            <p className="mt-2 text-center text-sm md:text-base">
               Exams
            </p>
          </div>
          <div className="p-4 border-2 rounded-lg border-green-200 animate-float transform transition-transform duration-300 hover:scale-110 hover:rotate-2 hover:shadow-xl">
            <MdLibraryAdd size={54} className="text-green-400" />
            <p className="mt-2 text-center text-sm md:text-base">
               Course
            </p>
          </div>
        </div>
        <div className='mt-10'>
            {
                visible &&  <button className='p-3 hover:bg-green-700 hover:shadow-xl text-xl rounded-md  bg-green-500 text-violet-50' onClick={()=>handleRedirect()}>Start Now</button>
            }
         
        </div>
      </div>
    </div>
    
    </>
}

export default Host;