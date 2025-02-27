const axios=require('axios');

const job=async(req,res)=>{
    try{
        const {keywords,applications}=req.body;
        const results = [];
        for (const application of applications) {
          if (!application.resume) continue;
    
          try {
            // Parse the resume using Affinda
            const response = await axios.post(
              'https://api.affinda.com/v2/resumes',
              { url: application.resume },
              {
                headers: {
                  Authorization: `Bearer aff_54605a1b8915e98cb77ae5a2d1f971c9159ab450`, // Replace with your Affinda API key
                },
              }
            );
    
            const parsedData = response.data;
            console.log("parsedDara",parsedData.data.rawText )
            // Check if any of the keywords match in the parsed resume
            const resumeText = parsedData.data.rawText || ''; // Full text of the resume
// console.log(resumeText)
            const containsKeyword = keywords.some((keyword) =>
              resumeText.toLowerCase().includes(keyword.toLowerCase())
            );
    
            if (containsKeyword) {
              results.push(application);
            }
            console.log(results);
            return res.json({status:true,results});
          } catch (error) {
            console.error(`Error parsing resume for student ${application.student._id}:`, error);
          }
        }
    }catch(err){
        console.log(err.message);
    }
}
module.exports={job}