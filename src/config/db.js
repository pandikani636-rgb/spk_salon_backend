import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    console.log('=> Using existing database connection');
    return;
  }
  
  if (mongoose.connections.length > 0) {
    isConnected = mongoose.connections[0].readyState === 1;
    if (isConnected) {
      console.log('=> Using existing database connection (from mongoose.connections)');
      return;
    }
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = conn.connections[0].readyState === 1;
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    // Don't exit process in serverless, throw error so request fails gracefully
    throw error;
  }
};
