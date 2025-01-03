import React, { useState } from 'react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import API from '../../utils/API';
import toast from 'react-hot-toast';
import {useNavigate} from 'react-router-dom'
const ApplyInternship = ({ setModel, internshipId, teacherId, studentId }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [location, setLocation] = useState('');
  const [gender, setGender] = useState('');
  const [resume, setResume] = useState(null);
const navigate=useNavigate();
  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResume(file);
    }
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
try{
    const formData = new FormData();
    formData.append('studentId', studentId);
    formData.append('internshipId', internshipId);
    formData.append('phoneNumber', phoneNumber);
    formData.append('location', location);
    formData.append('gender', gender);
    formData.append('resume', resume);
    // Send the form data to the backend API
  const response= await API.post('/internship/apply', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Ensure the correct header is set
        },
      })
      if(response.data.message==="Application submitted successfully!"){
        toast.success("Application Submitted");
        setModel(false);
        navigate("/internship-portal")
      }else{
        toast.error("Error submitting application");
      }
    }catch(error) {
        toast.error('Error submitting application');
      };
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 md:p-8 w-[90%] max-w-md relative shadow-lg">
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            onClick={() => setModel(false)}
            aria-label="Close Modal"
          >
            ✖
          </button>

          <h2 className="text-xl font-semibold mb-4">Apply for Internship</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="phoneNumber" className="block text-gray-700 mb-2">
                Phone Number
              </label>
              <PhoneInput
                international
                defaultCountry="US"
                value={phoneNumber}
                onChange={setPhoneNumber}
                className="w-full border border-gray-300 rounded-md p-2"
                id="phoneNumber"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="location" className="block text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder="Enter your location"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="gender" className="block text-gray-700 mb-2">
                Gender
              </label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2"
                required
              >
                <option value="">Select your gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="resume" className="block text-gray-700 mb-2">
                Resume (PDF/Word)
              </label>
              <input
                type="file"
                id="resume"
                accept=".pdf, .doc, .docx"
                onChange={handleResumeChange}
                className="w-full border border-gray-300 rounded-md p-2"
                required
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-500 text-white py-2 px-4 rounded-md"
              >
                Apply
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ApplyInternship;
