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
function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/courseDetail/:id" element={<CourseDetail />} />
          <Route path="/create" element={<ContentCreator />} />
          <Route path="/" element={<Hompage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/finalExam/:userId/:courseId" element={<FinalExam />} />
          <Route
            path="/finalExam-Instruction/:userId/:courseId"
            element={<ExamInfoPage />}
          />
          <Route path="/intro/course/:id" element={<CourseIntro />} />
          <Route path="/teacher-panel" element={<TeacherPanel/>}/>
    </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
