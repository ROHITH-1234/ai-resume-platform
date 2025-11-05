const { GoogleGenerativeAI } = require('@google/generative-ai');
const MockInterview = require('../models/MockInterview.model');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class MockInterviewService {
  // Fallback questions if AI fails
  getFallbackQuestions(domain, difficulty, count = 5) {
    const questionBank = {
      technical: {
        easy: [
          "What is the difference between var, let, and const in JavaScript?",
          "Explain the concept of object-oriented programming.",
          "What is the difference between == and === in JavaScript?",
          "What are the main features of HTML5?",
          "Explain what CSS specificity is and how it works."
        ],
        medium: [
          "Explain the difference between synchronous and asynchronous programming.",
          "What are closures in JavaScript and provide an example?",
          "Describe the differences between REST and GraphQL APIs.",
          "What is the Virtual DOM and how does React use it?",
          "Explain the concept of database normalization."
        ],
        hard: [
          "Design a scalable system for handling millions of concurrent users.",
          "Explain how you would implement a distributed caching system.",
          "Describe strategies for optimizing database query performance at scale.",
          "How would you design a real-time collaborative editing system?",
          "Explain the CAP theorem and its implications for distributed systems."
        ]
      },
      behavioral: {
        easy: [
          "Tell me about yourself and your background.",
          "Why are you interested in this position?",
          "What are your greatest strengths?",
          "How do you handle working under pressure?",
          "Describe your ideal work environment."
        ],
        medium: [
          "Tell me about a time when you had to work with a difficult team member.",
          "Describe a situation where you had to meet a tight deadline.",
          "Give an example of a time you showed leadership skills.",
          "Tell me about a time when you failed and what you learned from it.",
          "Describe how you prioritize tasks when you have multiple deadlines."
        ],
        hard: [
          "Describe a time when you had to make a difficult decision with incomplete information.",
          "Tell me about a situation where you had to influence others without authority.",
          "Give an example of when you had to handle a major project setback.",
          "Describe a time when you had to advocate for an unpopular decision.",
          "Tell me about your most challenging professional experience and how you overcame it."
        ]
      },
      situational: {
        easy: [
          "What would you do if you disagreed with your manager's decision?",
          "How would you handle receiving negative feedback?",
          "What would you do if you missed an important deadline?",
          "How would you approach learning a new technology quickly?",
          "What would you do if you found a bug in production?"
        ],
        medium: [
          "How would you handle a situation where stakeholders have conflicting requirements?",
          "What would you do if you discovered a security vulnerability in your code?",
          "How would you approach a project with unclear requirements?",
          "What would you do if a team member wasn't pulling their weight?",
          "How would you handle a situation where you're asked to compromise quality for speed?"
        ],
        hard: [
          "How would you handle a critical system failure during peak business hours?",
          "What would you do if you discovered your team's technical approach was fundamentally flawed?",
          "How would you manage conflicting priorities from multiple senior stakeholders?",
          "What would you do if asked to implement something you believe is unethical?",
          "How would you handle a situation where a major client threatens to leave due to technical issues?"
        ]
      }
    };

    const domainQuestions = questionBank[domain] || questionBank.technical;
    const difficultyQuestions = domainQuestions[difficulty] || domainQuestions.medium;
    
    return difficultyQuestions.slice(0, count);
  }

  // Generate interview questions based on domain
  async generateQuestions(domain, difficulty = 'medium', count = 5) {
    try {
      // Check if Gemini API key is available
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key') {
        console.warn('⚠️  Gemini API key not configured, using fallback questions');
        return this.getFallbackQuestions(domain, difficulty, count);
      }

      const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });

      const prompt = `
Generate ${count} interview questions for a ${difficulty} level ${domain} position.
Return ONLY a valid JSON array of questions (no markdown, no extra text):

[
  "Question 1 text",
  "Question 2 text",
  "Question 3 text"
]

Make questions realistic and relevant to ${domain}. Difficulty: ${difficulty}.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().trim();
      
      if (text.startsWith('```json')) {
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }
      
      const questions = JSON.parse(text);
      return questions;
    } catch (error) {
      console.error('⚠️  Error generating questions with Gemini AI:', error.message);
      console.log('📝 Using fallback questions instead');
      return this.getFallbackQuestions(domain, difficulty, count);
    }
  }

  // Fallback evaluation if AI fails
  getFallbackEvaluation(answer) {
    const answerLength = answer.trim().split(/\s+/).length;
    
    // Basic scoring based on answer length and structure
    const hasStructure = answer.includes('.') || answer.includes(',');
    const isDetailed = answerLength > 30;
    const isComprehensive = answerLength > 60;
    
    let accuracy = 60;
    let clarity = 65;
    let confidence = 60;
    
    if (isDetailed) accuracy += 10;
    if (isComprehensive) accuracy += 10;
    if (hasStructure) clarity += 15;
    if (answerLength > 20) confidence += 10;
    if (answerLength > 50) confidence += 10;
    
    // Cap at 85 for fallback (to indicate it's not perfect AI analysis)
    accuracy = Math.min(85, accuracy);
    clarity = Math.min(85, clarity);
    confidence = Math.min(85, confidence);
    
    return {
      accuracy,
      clarity,
      confidence,
      feedback: `Your answer demonstrates ${isComprehensive ? 'comprehensive' : 'good'} understanding. ${
        hasStructure ? 'The structure is clear.' : 'Consider organizing your thoughts more clearly.'
      } ${isDetailed ? 'Good level of detail provided.' : 'Try to elaborate more on key points.'}`,
      suggestions: [
        'Provide specific examples to support your points',
        'Structure your answer with clear beginning, middle, and end',
        'Use technical terminology appropriately when relevant'
      ]
    };
  }

  // Evaluate answer using AI
  async evaluateAnswer(question, answer, domain) {
    try {
      // Check if Gemini API key is available
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key') {
        console.warn('⚠️  Gemini API key not configured, using fallback evaluation');
        return this.getFallbackEvaluation(answer);
      }

      const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });

      const prompt = `
You are an expert interviewer for ${domain} positions. Evaluate this candidate's answer.

Question: ${question}
Answer: ${answer}

Provide evaluation as ONLY a valid JSON object (no markdown):

{
  "accuracy": 85,
  "clarity": 90,
  "confidence": 75,
  "feedback": "Brief feedback on the answer",
  "suggestions": ["Suggestion 1", "Suggestion 2"]
}

- accuracy: 0-100 (how correct/relevant is the answer)
- clarity: 0-100 (how clear and well-structured)
- confidence: 0-100 (assess confidence level from the answer)
- feedback: concise feedback paragraph
- suggestions: 2-3 improvement tips

Return ONLY the JSON object.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().trim();
      
      if (text.startsWith('```json')) {
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }
      
      const evaluation = JSON.parse(text);
      return evaluation;
    } catch (error) {
      console.error('⚠️  Error evaluating answer with Gemini AI:', error.message);
      console.log('📝 Using fallback evaluation instead');
      return this.getFallbackEvaluation(answer);
    }
  }

  // Generate overall feedback
  async generateOverallFeedback(questions) {
    try {
      const totalAccuracy = questions.reduce((sum, q) => sum + (q.aiEvaluation?.accuracy || 0), 0) / questions.length;
      const totalClarity = questions.reduce((sum, q) => sum + (q.aiEvaluation?.clarity || 0), 0) / questions.length;
      const totalConfidence = questions.reduce((sum, q) => sum + (q.aiEvaluation?.confidence || 0), 0) / questions.length;

      // Check if Gemini API key is available
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key') {
        console.warn('⚠️  Gemini API key not configured, using fallback feedback');
        return this.getFallbackOverallFeedback(totalAccuracy, totalClarity, totalConfidence);
      }

      const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });

      const prompt = `
Analyze this mock interview performance and provide feedback.

Questions & Evaluations:
${JSON.stringify(questions.map(q => ({
  question: q.question,
  evaluation: q.aiEvaluation
})), null, 2)}

Average Scores:
- Accuracy: ${totalAccuracy.toFixed(1)}
- Clarity: ${totalClarity.toFixed(1)}
- Confidence: ${totalConfidence.toFixed(1)}

Return ONLY a valid JSON object:

{
  "strengths": ["Strength 1", "Strength 2"],
  "weaknesses": ["Weakness 1", "Weakness 2"],
  "improvementTips": ["Tip 1", "Tip 2", "Tip 3"]
}

Return ONLY the JSON object.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().trim();
      
      if (text.startsWith('```json')) {
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }
      
      const feedback = JSON.parse(text);
      return feedback;
    } catch (error) {
      console.error('⚠️  Error generating overall feedback with Gemini AI:', error.message);
      console.log('📝 Using fallback feedback instead');
      
      const totalAccuracy = questions.reduce((sum, q) => sum + (q.aiEvaluation?.accuracy || 0), 0) / questions.length;
      const totalClarity = questions.reduce((sum, q) => sum + (q.aiEvaluation?.clarity || 0), 0) / questions.length;
      const totalConfidence = questions.reduce((sum, q) => sum + (q.aiEvaluation?.confidence || 0), 0) / questions.length;
      
      return this.getFallbackOverallFeedback(totalAccuracy, totalClarity, totalConfidence);
    }
  }

  getFallbackOverallFeedback(accuracy, clarity, confidence) {
    const strengths = [];
    const weaknesses = [];
    const improvementTips = [];

    // Analyze strengths
    if (accuracy >= 75) strengths.push('Demonstrates solid technical knowledge');
    if (clarity >= 75) strengths.push('Communicates ideas clearly and effectively');
    if (confidence >= 75) strengths.push('Shows confidence in responses');
    if (strengths.length === 0) strengths.push('Completed the interview and provided answers');

    // Analyze weaknesses
    if (accuracy < 70) weaknesses.push('Technical accuracy could be improved');
    if (clarity < 70) weaknesses.push('Answers could be more structured and clear');
    if (confidence < 70) weaknesses.push('Could demonstrate more confidence in responses');
    if (weaknesses.length === 0) weaknesses.push('Continue practicing to maintain skills');

    // General improvement tips
    improvementTips.push('Practice explaining concepts with specific examples');
    improvementTips.push('Structure answers using frameworks like STAR method');
    improvementTips.push('Research common interview questions for your domain');

    return { strengths, weaknesses, improvementTips };
  }

  // Start a new mock interview
  async startInterview(candidateId, domain, difficulty = 'medium') {
    const questions = await this.generateQuestions(domain, difficulty, 5);
    
    const mockInterview = await MockInterview.create({
      candidateId,
      domain,
      difficulty,
      questions: questions.map(q => ({ question: q })),
      status: 'in-progress'
    });

    return mockInterview;
  }

  // Submit answer for a question
  async submitAnswer(interviewId, questionIndex, answer) {
    const interview = await MockInterview.findById(interviewId);
    if (!interview) throw new Error('Interview not found');

    const question = interview.questions[questionIndex];
    if (!question) throw new Error('Question not found');

    const evaluation = await this.evaluateAnswer(question.question, answer, interview.domain);
    
    interview.questions[questionIndex].answer = answer;
    interview.questions[questionIndex].aiEvaluation = evaluation;
    interview.questions[questionIndex].answeredAt = new Date();
    
    await interview.save();
    
    return evaluation;
  }

  // Complete interview
  async completeInterview(interviewId) {
    const interview = await MockInterview.findById(interviewId);
    if (!interview) throw new Error('Interview not found');

    const answeredQuestions = interview.questions.filter(q => q.answer);
    
    if (answeredQuestions.length === 0) {
      throw new Error('No questions answered');
    }

    // Calculate overall score
    const scores = answeredQuestions.map(q => {
      const acc = q.aiEvaluation?.accuracy || 0;
      const cla = q.aiEvaluation?.clarity || 0;
      const con = q.aiEvaluation?.confidence || 0;
      return (acc + cla + con) / 3;
    });
    
    const overallScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    // Generate feedback
    const feedback = await this.generateOverallFeedback(answeredQuestions);

    interview.overallScore = Math.round(overallScore);
    interview.strengths = feedback.strengths;
    interview.weaknesses = feedback.weaknesses;
    interview.improvementTips = feedback.improvementTips;
    interview.status = 'completed';
    interview.completedAt = new Date();
    interview.duration = Math.round((Date.now() - interview.createdAt) / 60000); // minutes

    await interview.save();

    return interview;
  }
}

module.exports = new MockInterviewService();
