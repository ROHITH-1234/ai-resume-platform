const mongoose = require('mongoose');

let isConnecting = false;

const connectDB = async () => {
  try {
    // 1 = connected, 2 = connecting
    if (mongoose.connection.readyState === 1) {
      return;
    }
    if (isConnecting) {
      return;
    }
    isConnecting = true;
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    isConnecting = false;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    isConnecting = false;
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // In serverless environments we shouldn't exit the process; rethrow instead
    if (process.env.VERCEL) throw error;
    process.exit(1);
  }
};

module.exports = connectDB;
