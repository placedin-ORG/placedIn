const Job = require("../models/jobs"); // Adjust path to your job model
const Internship = require("../models/internship"); // Adjust path to internship model


exports.getCompanyStats = async (req, res) => {
  try {
    const companyId = req.user._id;

    // 1. Get total jobs and internships
    const totalJobsPromise = Job.countDocuments({ teacherId: companyId });
    const totalInternshipsPromise = Internship.countDocuments({
      teacherId: companyId,
    });

    // 2. Get total job applicants by summing the 'studentApplied' field
    const totalJobApplicantsPromise = Job.aggregate([
      { $match: { teacherId: companyId } },
      { $group: { _id: null, total: { $sum: "$studentApplied" } } },
    ]);

    // 3. Get total internship applicants
    const totalInternshipApplicantsPromise = Internship.aggregate([
      { $match: { teacherId: companyId } },
      { $group: { _id: null, total: { $sum: "$studentApplied" } } },
    ]);

    // Run all queries in parallel
    const [
      totalJobs,
      totalInternships,
      jobApplicantsResult,
      internshipApplicantsResult,
    ] = await Promise.all([
      totalJobsPromise,
      totalInternshipsPromise,
      totalJobApplicantsPromise,
      totalInternshipApplicantsPromise,
    ]);

    // Extract sum from aggregate results, defaulting to 0
    const totalJobApplicants = jobApplicantsResult[0]?.total || 0;
    const totalInternshipApplicants =
      internshipApplicantsResult[0]?.total || 0;

    res.status(200).json({
      success: true,
      data: {
        totalJobs,
        totalInternships,
        totalJobApplicants,
        totalInternshipApplicants,
      },
    });
  } catch (error) {
    console.error("Error fetching company stats:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getCompanyCharts = async (req, res) => {
  try {
    const companyId = req.user._id;

    // --- FIX 1: Get server's IANA timezone (e.g., "Asia/Kolkata") ---
    const serverTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // --- FIX 2: Use a reliable, hardcoded array for month names ---
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const today = new Date();
    const sixMonthsAgo = new Date();
    // Go back 6 months and set to the 1st day of that month
    sixMonthsAgo.setMonth(today.getMonth() - 6);
    sixMonthsAgo.setDate(1);

    // --- 1. Generate Labels (Reliably) ---
    const monthLabels = [];
    const tempDate = new Date(sixMonthsAgo);

    for (let i = 0; i <= 6; i++) {
      // Use the hardcoded array
      const monthName = monthNames[tempDate.getMonth()];
      monthLabels.push(monthName);
      // Move to the next month
      tempDate.setMonth(tempDate.getMonth() + 1);
    }
    // Result will be a reliable 7-month array, e.g.:
    // ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"]

    // --- 2. Get data (Applying Timezone) ---
    const jobsDataPromise = Job.aggregate([
      {
        $match: {
          teacherId: companyId,
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            // Apply the server's timezone to the aggregation
            year: { $year: { date: "$createdAt", timezone: serverTimezone } },
            month: { $month: { date: "$createdAt", timezone: serverTimezone } },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const internshipsDataPromise = Internship.aggregate([
      {
        $match: {
          teacherId: companyId,
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            // Apply the server's timezone to the aggregation
            year: { $year: { date: "$createdAt", timezone: serverTimezone } },
            month: { $month: { date: "$createdAt", timezone: serverTimezone } },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const [jobStats, internshipStats] = await Promise.all([
      jobsDataPromise,
      internshipsDataPromise,
    ]);

    // --- 3. Format data (Reliably) ---
    const formatChartData = (stats) => {
      // Create an empty array of 0s, e.g., [0, 0, 0, 0, 0, 0, 0]
      const data = new Array(monthLabels.length).fill(0);
      
      stats.forEach((stat) => {
        // Get month name from our array (stat._id.month is 1-based, array is 0-based)
        const monthName = monthNames[stat._id.month - 1];
        // Find the index of that month in our labels
        const index = monthLabels.indexOf(monthName);
        
        if (index !== -1) {
          // If found, insert the count at the correct spot
          data[index] = stat.count;
        }
      });
      return data;
    };

    console.log("Job Stats:", jobStats);
    console.log("Internship Stats:", internshipStats);

    const jobDataPoints = formatChartData(jobStats);
    const internshipDataPoints = formatChartData(internshipStats);

    res.status(200).json({
      success: true,
      data: {
        labels: monthLabels,
        datasets: [
          {
            label: "Jobs Posted",
            data: jobDataPoints,
            borderColor: "rgb(255, 99, 132)", // Red
            backgroundColor: "rgba(255, 99, 132, 0.5)",
          },
          {
            label: "Internships Posted",
            data: internshipDataPoints,
            borderColor: "rgb(54, 162, 235)", // Blue
            backgroundColor: "rgba(54, 162, 235, 0.5)",
          },
        ],
      },
    });
  } catch (error) {
    console.error("Error fetching company charts:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};