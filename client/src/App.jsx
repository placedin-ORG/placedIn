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
function App() {
  return (
    <>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/courseDetail/:id" element={<CourseDetail />} />
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

          <Route path="/finalExam/:userId/:courseId" element={<FinalExam />} />
          <Route
            path="/finalExam-Instruction/:userId/:courseId"
            element={<ExamInfoPage />}
          />
          <Route path="/intro/course/:id" element={<CourseIntro />} />
          <Route path="/courses" element={<AllCourses />} />

          <Route path="/teacher-panel" element={<TeacherPanel />} />
          <Route path="/user" element={<UserLayout />}>
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Setting />} />
            <Route path="enrolled/courses" element={<MyCourses />} />
          </Route>
          <Route path="/exam" element={<GiveExam/>}/>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
