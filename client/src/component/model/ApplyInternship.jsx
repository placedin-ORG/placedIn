import React, { useState } from 'react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import API from '../../utils/API';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { isValidPhoneNumber } from 'libphonenumber-js';

const ApplyInternship = ({ setModel, internshipId, teacherId, studentId }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [location, setLocation] = useState('');
  const [gender, setGender] = useState('');
  const [resume, setResume] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          resume: 'File size must be less than 5MB'
        }));
        return;
      }
      
      // Validate file type
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          resume: 'Only PDF and Word documents are allowed'
        }));
        return;
      }
      
      setResume(file);
      setErrors(prev => ({ ...prev, resume: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate phone number
    if (!phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!isValidPhoneNumber(phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }
    
    // Validate location
    if (!location.trim()) {
      newErrors.location = 'Location is required';
    } else if (location.trim().length < 3) {
      newErrors.location = 'Location must be at least 3 characters';
    }
    
    // Validate gender
    if (!gender) {
      newErrors.gender = 'Please select your gender';
    }
    
    // Validate resume
    if (!resume) {
      newErrors.resume = 'Resume is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please correct the errors in the form');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('studentId', studentId);
      formData.append('internshipId', internshipId);
      formData.append('phoneNumber', phoneNumber);
      formData.append('location', location);
      formData.append('gender', gender);
      formData.append('resume', resume);
      
      const response = await API.post('/internship/apply', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 second timeout
      });
      
      if (response.data.message === "Application submitted successfully!") {
        toast.success("Application submitted successfully!");
        setModel(false);
        navigate("/internship-portal");
      } else {
        toast.error(response.data.message || "Error submitting application");
      }
    } catch (error) {
      console.error('Application submission error:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Error submitting application. Please try again.';
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Show confirmation if form has been partially filled
    if (phoneNumber || location || gender || resume) {
      if (window.confirm('Are you sure you want to cancel? Your changes will be lost.')) {
        setModel(false);
      }
    } else {
      setModel(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-labelledby="apply-internship-title"
      aria-modal="true"
    >
      <div 
        className="bg-white rounded-xl p-6 md:p-8 w-[90%] max-w-md relative shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          onClick={handleCancel}
          aria-label="Close Modal"
          disabled={isSubmitting}
        >
          <span aria-hidden="true">✖</span>
        </button>

        <h2 id="apply-internship-title" className="text-xl font-semibold mb-4">Apply for Internship</h2>
        
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label htmlFor="phoneNumber" className="block text-gray-700 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <PhoneInput
              international
              defaultCountry="US"
              value={phoneNumber}
              onChange={(value) => {
                setPhoneNumber(value);
                if (errors.phoneNumber) {
                  setErrors(prev => ({ ...prev, phoneNumber: null }));
                }
              }}
              className={`w-full border rounded-md p-2 ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'}`}
              id="phoneNumber"
              required
              aria-invalid={errors.phoneNumber ? "true" : "false"}
              aria-describedby={errors.phoneNumber ? "phoneNumber-error" : undefined}
              disabled={isSubmitting}
            />
            {errors.phoneNumber && (
              <p id="phoneNumber-error" className="text-red-500 text-sm mt-1">
                {errors.phoneNumber}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="location" className="block text-gray-700 mb-2">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                if (errors.location) {
                  setErrors(prev => ({ ...prev, location: null }));
                }
              }}
              className={`w-full border rounded-md p-2 ${errors.location ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter your location"
              required
              aria-invalid={errors.location ? "true" : "false"}
              aria-describedby={errors.location ? "location-error" : undefined}
              disabled={isSubmitting}
            />
            {errors.location && (
              <p id="location-error" className="text-red-500 text-sm mt-1">
                {errors.location}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="gender" className="block text-gray-700 mb-2">
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => {
                setGender(e.target.value);
                if (errors.gender) {
                  setErrors(prev => ({ ...prev, gender: null }));
                }
              }}
              className={`w-full border rounded-md p-2 ${errors.gender ? 'border-red-500' : 'border-gray-300'}`}
              required
              aria-invalid={errors.gender ? "true" : "false"}
              aria-describedby={errors.gender ? "gender-error" : undefined}
              disabled={isSubmitting}
            >
              <option value="">Select your gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
            {errors.gender && (
              <p id="gender-error" className="text-red-500 text-sm mt-1">
                {errors.gender}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="resume" className="block text-gray-700 mb-2">
              Resume (PDF/Word) <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              id="resume"
              accept=".pdf,.doc,.docx"
              onChange={handleResumeChange}
              className={`w-full border rounded-md p-2 ${errors.resume ? 'border-red-500' : 'border-gray-300'}`}
              required
              aria-invalid={errors.resume ? "true" : "false"}
              aria-describedby={errors.resume ? "resume-error" : undefined}
              disabled={isSubmitting}
            />
            {resume && (
              <p className="text-green-600 text-sm mt-1">
                Selected file: {resume.name}
              </p>
            )}
            {errors.resume && (
              <p id="resume-error" className="text-red-500 text-sm mt-1">
                {errors.resume}
              </p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              Max file size: 5MB. Accepted formats: PDF, DOC, DOCX
            </p>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              className="border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Submit Application'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyInternship;