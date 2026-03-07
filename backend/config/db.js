const mongoose = require('mongoose');

const connectDB = async () => {
  const maxRetries = 3;
  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI);
      
      console.log(`MongoDB connected: ${conn.connection.host}`);
      
      // Connection event listeners
      mongoose.connection.on('connected', () => {
        console.log('Mongoose connected to MongoDB');
      });
      
      mongoose.connection.on('error', (err) => {
        console.error(`Mongoose connection error: ${err}`);
      });
      
      mongoose.connection.on('disconnected', () => {
        console.log('Mongoose disconnected from MongoDB');
      });
      
      return conn;
    } catch (error) {
      retryCount++;
      const waitTime = Math.pow(2, retryCount) * 1000; // Exponential backoff: 2s, 4s, 8s
      
      console.error(`MongoDB connection attempt ${retryCount} failed: ${error.message}`);
      
      if (retryCount < maxRetries) {
        console.log(`Retrying in ${waitTime / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        console.error('Max retries reached. Could not connect to MongoDB.');
        process.exit(1);
      }
    }
  }
};

module.exports = connectDB;
