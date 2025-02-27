import { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import CourseDetail from "./pages/CourseDetail";
import Hompage from "./pages/Home/Hompage";
import Register from "./pages/Register";
import Login from "./pages/Login";
import FinalExam from "./pages/FinalExam";
import ExamInfoPage from "./component/ExamInfoPage";
import CourseIntro from "./pages/CourseIntro";
import EmailSentPage from "./pages/auth/email-sent/page";
import Profile from "./pages/user/Profile";
import UserLayout from "./component/Layout/UserLayout";
import Setting from "./pages/user/Setting";
import MyCourses from "./pages/user/MyCourses";
import AllCourses from "./pages/courses/AllCourses";
import ScrollToTop from "./component/ScrollToTop";
import ForgotPassword from "./pages/auth/forgot-password/page";
import ResetPassword from "./pages/auth/reset-password/page";
import GiveExam from "./pages/exam/GiveExam";
import ProtectedRoutes from "./component/routes/ProtectedRoutes";
import AllExams from "./pages/exam/AllExams";
import ExamInstructionPage from "./pages/exam/ExamInstructionPage";
import ExamIntro from "./pages/exam/ExamIntro";
import SearchResult from "./pages/searching/SearchResult";
import UserExams from "./pages/exam/UserExams";
import { useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import CoinModel from "./component/CoinModel";
import UserProgress from "./pages/progress/UserProgress";
import Transactions from "./pages/user/Transactions";
import "react-quill/dist/quill.snow.css";
import ExamResult from "./pages/exam/ExamResult";
import Interest from "./pages/user/Interest";
import GlobalRestrictions from "./component/Restrictions/GlobalRestrictions";
import Host from "./pages/user/Host";
import InternshipPortal from "./pages/internship/InternshipPortal";
import InternshipDetail from "./component/Intern/InternshipDetail/InternshipDetail";
import JobPortal from "./pages/job/JobPortal";
import JobDetail from "./component/job/JobDetail/JobDetail";
import AllInternship from "./pages/internship/AllInternship";
import AllJob from "./pages/job/AllJob";
import SearchInternship from "./pages/searching/SearchInternship";
import JobSearch from "./pages/searching/JobSearch";
import Notification from "./pages/notification/Notification";
import ChatPage from "./pages/message/ChatPage";
function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
function App() {
  const location = useLocation();

  return (
    <>
      <GlobalRestrictions />
      <ScrollToTop />
      <Routes>
        <Route
          path="/courseDetail/:id"
          element={
            <ProtectedRoutes>
              <CourseDetail />
            </ProtectedRoutes>
          }
        />
        <Route path="/" element={<Hompage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/email-sent" element={<EmailSentPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/reset-password/:token" element={<ResetPassword />} />
        <Route path="/resultExam" element={<ExamResult />} />
        <Route path="/internship-portal" element={<InternshipPortal/>}/>
        <Route path="/internshipDetail" element={<InternshipDetail/>}/>
        <Route path="/jobDetail" element={<JobDetail/>}/>
        <Route path="/job-portal" element={<JobPortal/>}/>
        <Route path="/AllInternships" element={<AllInternship/>}/>
        <Route path="/AllJobs" element={<AllJob/>}/>
        <Route path="/notifications" element={<Notification/>}/>
        <Route path="/chat" element={<ChatPage/>}/>
        <Route
          path="/finalExam/:userId/:courseId"
          element={
            <ProtectedRoutes>
              <FinalExam />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/finalExam-Instruction/:userId/:courseId"
          element={
            <ProtectedRoutes>
              <ExamInfoPage />
            </ProtectedRoutes>
          }
        />
        <Route path="/intro/course/:id" element={<CourseIntro />} />
        <Route path="/courses" element={<AllCourses />} />

        {/* User Profile Routes */}
        <Route path="/user" element={<UserLayout />}>
          <Route
            path="profile"
            element={
              <ProtectedRoutes>
                <Profile />
              </ProtectedRoutes>
            }
          />
          <Route
            path="settings"
            element={
              <ProtectedRoutes>
                <Setting />
              </ProtectedRoutes>
            }
          />

          <Route
            path="transactions"
            element={
              <ProtectedRoutes>
                <Transactions />
              </ProtectedRoutes>
            }
          />
          <Route
            path="enrolled/courses"
            element={
              <ProtectedRoutes>
                <MyCourses />
              </ProtectedRoutes>
            }
          />
          <Route
            path="my/exams"
            element={
              <ProtectedRoutes>
                <UserExams />
              </ProtectedRoutes>
            }
          />
          <Route
            path="progress"
            element={
              <ProtectedRoutes>
                <UserProgress />
              </ProtectedRoutes>
            }
          />
          <Route
          path="host"
          element={
            <ProtectedRoutes>
              <Host/>
            </ProtectedRoutes>
          }
          />
        </Route>

        {/* Exam Routes */}
        <Route path="/allExams" element={<AllExams />} />
        <Route
          path="/exam/:userId/:ExamId"
          element={
            <ProtectedRoutes>
              <GiveExam />
            </ProtectedRoutes>
          }
        />
        <Route path="/" element={<UserLayout />}>
          <Route
            path="examInstruction/:userId/:ExamId"
            element={
              <ProtectedRoutes>
                <ExamInstructionPage />
              </ProtectedRoutes>
            }
          />
        </Route>
        <Route path="/intro/exam/:id" element={<ExamIntro />} />
        <Route path="/search/:query" element={<SearchResult />} />
        <Route path="/search/internship/:query" element={<SearchInternship />} />
        <Route path="/search/job/:query" element={<JobSearch />} />
        <Route path="/add-interest" element={<Interest />} />
      </Routes>
    </>
  );
}

export default AppWrapper;
