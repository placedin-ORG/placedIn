const express = require("express");
const puppeteer = require("puppeteer");



const certificate = async(req, res) => {
    try{
        const { name, course } = req.body;
        console.log("in")
        const html = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; }
              .certificate-container { border: 10px solid #ccc; padding: 50px; }
              .website-name { font-size: 24px; font-weight: bold; margin-bottom: 20px; }
              .certificate-title { font-size: 30px; font-weight: bold; margin-bottom: 30px; }
              .recipient-name { font-size: 28px; font-weight: bold; margin: 20px 0; }
              .signature { margin-top: 50px; font-size: 18px; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="certificate-container">
              <div class="website-name">Your Website Name</div>
              <div class="certificate-title">Course Completion Certificate for ${course}</div>
              <div>This certifies that</div>
              <div class="recipient-name">${name}</div>
              <div>has successfully completed the course.</div>
              <div class="signature">[Signature]</div>
            </div>
          </body>
        </html>
      `;
    
      
        console.log("Generated HTML:", html); // Debugging HTML
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
    
        await page.setContent(html);
        const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
    
        // Save PDF for debugging
        const fs = require("fs");
        fs.writeFileSync("debug.pdf", pdfBuffer);
    
        await browser.close();
    
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="certificate.pdf"`);
        res.send(pdfBuffer);
    }catch(err){
        console.log("error")
        console.log(err.message);
    }
}

module.exports={
    certificate
}