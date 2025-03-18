

const axios = require('axios');
const pdfParse = require('pdf-parse');
const docxParser = require('docx-parser');
const { htmlToText } = require('html-to-text');
const cheerio = require('cheerio');
const path = require('path');

/**
 * Processes internship applications by filtering resumes based on keywords
 */
const internship = async (req, res) => {
  try {
    const { keywords, applications } = req.body;
    const results = [];
    
    // Input validation
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return res.status(400).json({ status: false, message: 'Keywords are required' });
    }
    
    if (!applications || !Array.isArray(applications) || applications.length === 0) {
      return res.status(400).json({ status: false, message: 'No applications to filter' });
    }

    // Log processing start
    console.log(`Processing ${applications.length} applications for keywords: ${keywords.join(', ')}`);

    // Normalize keywords for better matching (create regex patterns with word boundaries)
    const keywordPatterns = keywords.map(keyword => 
      new RegExp(`\\b${keyword.trim().toLowerCase()}\\b`, 'i')
    );
    
    // Process all applications
    for (const application of applications) {
      try {
        if (!application.resume) {
          console.log(`Skipping application with no resume: ${application.student?._id || 'unknown'}`);
          continue;
        }
        
        // Extract resume URL
        const resumeUrl = application.resume;
        console.log(`Processing resume: ${resumeUrl}`);
        
        // Get resume text using our local parser
        const resumeText = await extractTextFromResume(resumeUrl);
        
        if (!resumeText) {
          console.log(`Could not extract text from resume for student: ${application.student?._id || 'unknown'}`);
          continue;
        }
        
        // Convert to lowercase for case-insensitive matching
        const normalizedText = resumeText.toLowerCase();
        
        // Check if any of the keywords match in the resume text
        const matchedKeywords = [];
        
        for (const pattern of keywordPatterns) {
          if (pattern.test(normalizedText)) {
            // Extract the actual matched keyword
            const keyword = pattern.source.replace(/\\b/g, '').replace(/\\/g, '');
            matchedKeywords.push(keyword);
          }
        }
        
        if (matchedKeywords.length > 0) {
          // Add to results with matched keywords
          results.push({
            ...application,
            matchedKeywords
          });
          console.log(`Match found for student ${application.student?._id || 'unknown'}: ${matchedKeywords.join(', ')}`);
        }
      } catch (error) {
        console.error(`Error processing application for student ${application.student?._id || 'unknown'}:`, error.message);
        // Continue processing other applications despite this error
      }
    }
    
    return res.json({ 
      status: true, 
      results,
      message: results.length > 0 ? `Found ${results.length} matching applications` : 'No matching applications found',
      keywordsUsed: keywords
    });
    
  } catch (err) {
    console.error('ATS filtering error:', err);
    return res.status(500).json({ 
      status: false, 
      message: err.message || 'Error processing resumes' 
    });
  }
};

/**
 * Extracts text content from resume files of various formats
 * @param {string} fileUrl - URL to the resume file
 * @returns {Promise<string>} Extracted text from the resume
 */
async function extractTextFromResume(fileUrl) {
  try {
    // Download the file
    const response = await axios.get(fileUrl, {
      responseType: 'arraybuffer',
      timeout: 10000 // 10-second timeout
    });
    
    const fileBuffer = Buffer.from(response.data);
    const fileExtension = path.extname(fileUrl).toLowerCase();
    
    // Extract text based on file type
    let extractedText = '';
    
    switch (fileExtension) {
      case '.pdf':
        // Parse PDF
        try {
          const pdfData = await pdfParse(fileBuffer);
          extractedText = pdfData.text;
        } catch (pdfError) {
          console.error('PDF parsing error:', pdfError.message);
        }
        break;
        
      case '.docx':
        // Parse DOCX
        try {
          extractedText = await new Promise((resolve, reject) => {
            docxParser.parseDocx(fileBuffer, (data) => {
              resolve(data);
            });
          });
        } catch (docxError) {
          console.error('DOCX parsing error:', docxError.message);
        }
        break;
        
      case '.doc':
        // Legacy DOC files are harder to parse - use metadata as fallback
        extractedText = `Could not parse legacy DOC file ${path.basename(fileUrl)}`;
        break;
        
      case '.txt':
        // Plain text
        extractedText = fileBuffer.toString('utf8');
        break;
        
      case '.html':
      case '.htm':
        // HTML files
        const htmlContent = fileBuffer.toString('utf8');
        const $ = cheerio.load(htmlContent);
        
        // Remove script and style elements
        $('script, style').remove();
        
        // Get text
        extractedText = htmlToText($.html(), {
          wordwrap: false,
          ignoreHref: true,
          ignoreImage: true
        });
        break;
        
      default:
        // Unsupported format
        console.log(`Unsupported file format: ${fileExtension}`);
        extractedText = `Unsupported file format: ${fileExtension}`;
    }
    
    // If parsing fails, use filename as fallback
    if (!extractedText || extractedText.trim().length === 0) {
      extractedText = path.basename(fileUrl).replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    }
    
    return extractedText;
    
  } catch (error) {
    console.error(`Error downloading or processing file ${fileUrl}:`, error.message);
    return '';
  }
}



const job=async(req,res)=>{
    try{

    }catch(err){
        console.log(err.message);
    }
}
module.exports={internship,job}