import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import ContentCreator from "./pages/ContentCreator";
import CourseDetail from "./pages/CourseDetail";
import Hompage from "./pages/Home/Hompage";
import Register from "./pages/Register";
import Login from "./pages/Login";
import FinalExam from "./pages/FinalExam";
import ExamInfoPage from "./component/ExamInfoPage";
import CourseIntro from "./pages/CourseIntro";
import TeacherPanel from "./pages/TeacherPanel";
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
function App() {
  return (
    <>
      <BrowserRouter>
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
          <Route path="/create" element={<ContentCreator />} />
          <Route path="/" element={<Hompage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/email-sent" element={<EmailSentPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/auth/reset-password/:token"
            element={<ResetPassword />}
          />

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

          <Route path="/teacher-panel" element={<TeacherPanel />} />

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
          </Route>

          {/* Exam Routes */}
          <Route path="/allExams" element={<AllExams />} />
          <Route path="/" element={<UserLayout />}>
            <Route
              path="exam/:userId/:ExamId"
              element={
                <ProtectedRoutes>
                  <GiveExam />
                </ProtectedRoutes>
              }
            />
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
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
