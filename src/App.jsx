import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import ContentCreator from './pages/ContentCreator'
import CourseDetail from './pages/CourseDetail'
import Hompage from './pages/Hompage'

function App() {
  

  return (
    <>
    <BrowserRouter>
    <Routes>
      <Route path='/detail' element={<CourseDetail/>}/>
      <Route path='/create' element={<ContentCreator/>}/>
      <Route path='/' element={<Hompage/>}/>
    </Routes>
    </BrowserRouter>
  
    </>
  )
}

export default App
