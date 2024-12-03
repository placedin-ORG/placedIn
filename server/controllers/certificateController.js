const express = require("express");
const puppeteer = require("puppeteer");

const User = require('../models/userModel')

const certificate = async(req, res) => {
    try{
        const { userId, courseId,name } = req.body;
        const user = await User.findOneAndUpdate(
          {
            _id: userId,
            "ongoingCourses.courseId": courseId,
          },
          {
            $set: { 
              "ongoingCourses.$.finalExam.certificate.downloaded": true,
              "ongoingCourses.$.finalExam.certificate.name": name,
            },
            
          },
          { new: true } // Return the updated document
        );
    }catch(err){
        console.log("error")
        console.log(err.message);
    }
}

module.exports={
    certificate
}