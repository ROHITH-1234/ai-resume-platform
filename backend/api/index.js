// Vercel Serverless Function entrypoint to run the Express API
const serverless = require('serverless-http');
require('dotenv').config();

const connectDB = require('../src/config/database');
const app = require('../src/app');

// Ensure a single DB connection across invocations
let isReady = false;

module.exports = async (req, res) => {
  try {
    if (!isReady) {
      await connectDB();
      isReady = true;
    }
    const handler = serverless(app);
    return handler(req, res);
  } catch (err) {
    console.error('Serverless handler error:', err);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Internal Server Error', details: err.message }));
  }
};
