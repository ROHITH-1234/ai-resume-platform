const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs').promises;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class ResumeParserService {
  async extractText(filePath, fileType) {
    try {
      if (fileType === 'pdf') {
        const dataBuffer = await fs.readFile(filePath);
        const pdfData = await pdfParse(dataBuffer);
        return pdfData.text;
      } else if (fileType === 'doc' || fileType === 'docx') {
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value;
      } else {
        throw new Error('Unsupported file type');
      }
    } catch (error) {
      console.error('Text extraction error:', error);
      throw error;
    }
  }

  async parseWithGemini(extractedText) {
    try {
      // Use gemini-2.5-flash - latest stable model
      const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });

      const prompt = `
You are an AI resume parser. Extract the following information from this resume text and return ONLY a valid JSON object (no markdown, no extra text):

{
  "name": "Full name",
  "email": "Email address",
  "phone": "Phone number",
  "address": "Full address or location",
  "summary": "Professional summary or objective",
  "education": [
    {
      "degree": "Degree name",
      "institution": "University/College name",
      "fieldOfStudy": "Major/Field",
      "graduationYear": 2023,
      "gpa": 3.8
    }
  ],
  "experience": [
    {
      "company": "Company name",
      "position": "Job title",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM or Present",
      "current": false,
      "description": "Job responsibilities and achievements"
    }
  ],
  "skills": {
    "technical": ["List of technical skills like programming languages, tools, frameworks"],
    "soft": ["List of soft skills like communication, leadership, teamwork"]
  },
  "certifications": [
    {
      "name": "Certification name",
      "issuer": "Issuing organization",
      "dateIssued": "YYYY-MM",
      "credentialId": "ID if available"
    }
  ],
  "languages": ["English", "Spanish"],
  "projects": [
    {
      "name": "Project name",
      "description": "Brief description",
      "technologies": ["Tech stack used"],
      "url": "Project URL if available"
    }
  ]
}

Resume Text:
${extractedText}

Return ONLY the JSON object, nothing else.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean and parse JSON
      let jsonText = text.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }
      
      const parsedData = JSON.parse(jsonText);
      return parsedData;
    } catch (error) {
      console.error('Gemini parsing error:', error);
      throw error;
    }
  }

  async generateSuggestions(parsedData, extractedText) {
    try {
      const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });

      const prompt = `
Analyze this resume and provide improvement suggestions. Return ONLY a valid JSON object:

{
  "missingKeywords": ["List of industry-relevant keywords that are missing"],
  "formattingIssues": ["List of formatting problems"],
  "contentImprovements": ["List of content improvement suggestions"],
  "skillGaps": ["List of in-demand skills the candidate should consider learning"]
}

Resume Data:
${JSON.stringify(parsedData, null, 2)}

Return ONLY the JSON object.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      let jsonText = text.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }
      
      const suggestions = JSON.parse(jsonText);
      return suggestions;
    } catch (error) {
      console.error('Suggestions generation error:', error);
      return {
        missingKeywords: [],
        formattingIssues: [],
        contentImprovements: [],
        skillGaps: []
      };
    }
  }

  async parseResume(filePath, fileType) {
    const extractedText = await this.extractText(filePath, fileType);
    const parsedData = await this.parseWithGemini(extractedText);
    const aiSuggestions = await this.generateSuggestions(parsedData, extractedText);

    return {
      extractedText,
      parsedData,
      aiSuggestions
    };
  }
}

module.exports = new ResumeParserService();
