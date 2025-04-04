import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AiOutlineHeart, AiFillHeart, AiOutlineShareAlt } from "react-icons/ai";
import { toast } from "react-toastify";
import parse from "html-react-parser";

import Navbar from "../../Navbar";
import ApplyInternship from "../../model/ApplyInternship";
import ErrorBoundary from "../../error/ErrorBoundary";
import LoadingSpinner from "../../loading/LoadingSpinner";
import API from "../../../utils/API";
import { formatDate } from "../../../utils/Helper";

const InternshipDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.user.user);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [internshipData, setInternshipData] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  // Get internship ID and enrolled status from URL params or state
  const { internshipId, enrolled: initialEnrolled } = location.state || {};
  const {id}=useParams();

  const urlInternshipId = id
  const currentInternshipId = internshipId || urlInternshipId;
  console.log(urlInternshipId) 
  console.log(currentInternshipId)
  // Use the passed enrolled status or default to false
  const [enrolled, setEnrolled] = useState(initialEnrolled || false);

  useEffect(() => {
    const fetchInternshipDetails = async () => {
      try {
        setIsLoading(true);
        
        if (!currentInternshipId) {
          throw new Error("No internship ID provided");
        }
        
        // Fetch internship details
        const response = await API.get(`/internship/${currentInternshipId}`);
        setInternshipData(response.data);
        
        // If user is logged in, check if they've wishlisted
        if (user) {
          // Only check wishlist status since enrolled status is passed from parent
          const wishlistStatus = await API.get(`/wishlist/wishlist-status/${currentInternshipId}/${user._id}`);
          setIsWishlisted(wishlistStatus.data.isWishlisted);
          
          // Record view
          await API.post("/internship/increaseView", {
            studentId: user._id,
            internshipId: currentInternshipId
          });
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching internship details:", err);
        setError(err.message || "Failed to load internship details");
        setIsLoading(false);
      }
    };
    
    fetchInternshipDetails();
  }, [currentInternshipId, user, initialEnrolled]);

  // Rest of the component remains unchanged
  const handleApply = () => {
    if (!user) {
      toast.info("Please login to apply for this internship");
      navigate("/login", { state: { returnUrl: location.pathname + location.search } });
      return;
    }
    
    if (internshipData.OtherSite) {
      window.open(internshipData.OtherSite, '_blank');
    } else {
      setIsModalOpen(true);
    }
  };
  
  const toggleWishlist = async () => {
    if (!user) {
      toast.info("Please login to add to wishlist");
      navigate("/login", { state: { returnUrl: location.pathname + location.search } });
      return;
    }
    
    try {
      const action = isWishlisted ? "remove" : "add";
      await API.post(`/wishlist/${action}`, {
        studentId: user._id,
        internshipId: currentInternshipId
      });
      
      setIsWishlisted(!isWishlisted);
      toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
    } catch (err) {
      toast.error("Failed to update wishlist");
    }
  };
  
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: internshipData?.title,
          text: `Check out this internship: ${internshipData?.title}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      }
    } catch (err) {
      toast.error("Failed to share");
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex justify-center items-center">
          <LoadingSpinner />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex justify-center items-center flex-col p-4">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
          <button 
            onClick={() => navigate(-1)} 
            className="mt-4 bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
          >
            Go Back
          </button>
        </div>
      </>
    );
  }

  if (!internshipData) {
    return null;
  }

  const isExpired = new Date(internshipData.closingTime) < new Date();
  const isFull = internshipData.studentApplied >= internshipData.maximumApplicant;

  return (
    <ErrorBoundary fallback={<div>Something went wrong. Please try again later.</div>}>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 flex flex-col md:flex-row gap-8">
          {/* Left Side - Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src={internshipData.thumbnail || "/default-internship-image.jpg"}
                alt={internshipData.title}
                className="w-full h-64 object-cover"
                onError={(e) => { e.target.src = "/default-internship-image.jpg" }}
              />
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h1 className="text-2xl font-bold text-gray-800">{internshipData.title}</h1>
                  <div className="flex gap-2">
                    <button 
                      onClick={toggleWishlist}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      {isWishlisted ? 
                        <AiFillHeart size={24} className="text-red-500" /> : 
                        <AiOutlineHeart size={24} className="text-gray-500" />
                      }
                    </button>
                    <button 
                      onClick={handleShare}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      aria-label="Share internship"
                    >
                      <AiOutlineShareAlt size={24} className="text-gray-500" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center mb-6">
                  <img
                    src={internshipData.companyLogo || "/default-company-logo.png"}
                    alt={internshipData.companyName}
                    className="w-12 h-12 object-cover rounded-full border border-gray-200"
                    onError={(e) => { e.target.src = "/default-company-logo.png" }}
                  />
                  <div className="ml-3">
                    <h2 className="font-semibold text-gray-800">{internshipData.companyName}</h2>
                    <p className="text-sm text-gray-500">
                      {internshipData.location || "Remote"}
                    </p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2 text-gray-800">Description</h2>
                  <div className="prose max-w-none text-gray-700">
                    {parse(internshipData.description || "")}
                  </div>
                </div>
                
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2 text-gray-800">Eligibility Criteria</h2>
                  <div className="prose max-w-none text-gray-700">
                    {parse(internshipData.whoEligible || "")}
                  </div>
                </div>
                
                {internshipData.perks && (
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-2 text-gray-800">Perks</h2>
                    <div className="prose max-w-none text-gray-700">
                      {parse(internshipData.perks || "")}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Right Side - Application Panel */}
          <div className="w-full md:w-80">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Internship Details</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{internshipData.duration || "Not specified"}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Stipend:</span>
                    <span className="font-medium">{internshipData.stipend || "Not specified"}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Start Date:</span>
                    <span className="font-medium">
                      {internshipData.startDate ? formatDate(internshipData.startDate) : "Flexible"}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Apply by:</span>
                    <span className={`font-medium ${isExpired ? "text-red-500" : ""}`}>
                      {formatDate(internshipData.closingTime)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Applications:</span>
                    <span className="font-medium">
                      {internshipData.studentApplied} / {internshipData.maximumApplicant}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Views:</span>
                    <span className="font-medium">{internshipData.view}</span>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                {enrolled ? (
                  <div className="bg-green-50 border border-green-200 rounded-md p-3 text-center">
                    <p className="text-green-700 font-medium">You have already applied for this internship</p>
                  </div>
                ) : isExpired ? (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3 text-center">
                    <p className="text-red-700 font-medium">This internship is no longer accepting applications</p>
                  </div>
                ) : isFull ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-center">
                    <p className="text-yellow-700 font-medium">Maximum applications reached</p>
                  </div>
                ) : (
                  <button
                    onClick={handleApply}
                    className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition-colors font-medium shadow-sm flex items-center justify-center gap-2"
                  >
                    {user ? "Apply Now" : "Login to Apply"}
                  </button>
                )}
                
                {!user && (
                  <p className="text-sm text-gray-500 text-center mt-3">
                    Don't have an account?{" "}
                    <a href="/register" className="text-green-600 hover:underline">
                      Sign up
                    </a>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {isModalOpen && (
        <ApplyInternship
          internshipId={currentInternshipId}
          studentId={user?._id}
          teacherId={internshipData.teacherId}
          setModel={setIsModalOpen}
          onSuccess={() => {
            setEnrolled(true);
            setIsModalOpen(false);
          }}
        />
      )}
    </ErrorBoundary>
  );
};

export default InternshipDetail;