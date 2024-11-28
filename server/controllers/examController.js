const {Exam} = require('../models/ExamModel'); // Assuming Exam model is in the models folder
const {ExamResult} = require('../models/ExamModel');
// Create a new exam
const create = async (req, res) => {
  try {
    const { startDate, duration, acceptedResultDate, price, numberOfStudents, questions,category } = req.body;

    const exam = new Exam({
      startDate,
      duration,
      acceptedResultDate,
      price,
      numberOfStudents,
      questions,
      category
    });

    await exam.save();
    res.status(201).json({ message: 'Exam created successfully', exam });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


const submitExam= async (req, res) => {
    try {
      const { userId, examId, userAnswers } = req.body;
  
      // Validate exam existence
      const exam = await Exam.findById(examId);
      if (!exam) {
        return res.status(404).json({ error: 'Exam not found' });
      }
  
      // Validate answers
      const validatedAnswers = userAnswers.map(({ questionId, answer }) => {
        const question = exam.questions.find(
          (q) => q._id.toString() === questionId
        );
        if (!question) {
          throw new Error(`Invalid question ID: ${questionId}`);
        }
        return { questionId, answer };
      });
  
      // Calculate score (only for objective questions)
      let score = 0;
      validatedAnswers.forEach(({ questionId, answer }) => {
        const question = exam.questions.find(
          (q) => q._id.toString() === questionId
        );
        if (question.type === 'objective') {
          // Assuming `options` contains the correct answer at index 0 for simplicity
          if (question.options[0] === answer) {
            score += 1; // Increment score for correct answer
          }
        }
      });
  
      // Save the submission
      const submission = new ExamResult({
        userId,
        examId,
        userAnswers: validatedAnswers,
        score,
      });
  
      await submission.save();
  
      res.status(201).json({
        message: 'Exam submitted successfully',
        submissionId: submission._id,
        score,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

// Get all exams
const get =  async (req, res) => {
  try {
    const exams = await Exam.find();
    res.status(200).json(exams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
// Get a specific exam by ID
const getSpeceficExam = async(req, res) => {
  try {
    const {ExamId}=req.body
    const exam = await Exam.findById(ExamId);
    if (!exam) return res.status(404).json({ msg: 'Exam not found' });

    res.status(200).json({exam});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Update an exam
const update =  async (req, res) => {
  try {
    const { startDate, duration, acceptedResultDate, price, numberOfStudents, questions } = req.body;

    const exam = await Exam.findByIdAndUpdate(
      req.params.id,
      { startDate, duration, acceptedResultDate, price, numberOfStudents, questions },
      { new: true }
    );

    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    res.status(200).json({ message: 'Exam updated successfully', exam });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Delete an exam
const deleteExam =  async (req, res) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    res.status(200).json({ message: 'Exam deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports={
create,get,update,deleteExam,getSpeceficExam,submitExam
}