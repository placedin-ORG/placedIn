const {Exam} = require('../models/ExamModel'); // Assuming Exam model is in the models folder

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
// router.get('/:id', async (req, res) => {
//   try {
//     const exam = await Exam.findById(req.params.id);
//     if (!exam) return res.status(404).json({ message: 'Exam not found' });

//     res.status(200).json(exam);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

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
create,get,update,deleteExam
}