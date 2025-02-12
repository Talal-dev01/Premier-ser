const mongoose = require("mongoose");

const config = async () => {
  try {
    console.log('Starting MongoDB connection...');
    
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is missing');
    }

    const connection = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 seconds
    });

    if (connection.connection.readyState === 1) {
      console.log('✅ MongoDB Connected Successfully');
      return true;
    } else {
      throw new Error('MongoDB connection failed');
    }

  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    return false;
  }
};

module.exports = config;