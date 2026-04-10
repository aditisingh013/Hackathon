const mongoose = require('mongoose');

/**
 * Robust MongoDB Connection
 * Automatically falls back to local instance if Atlas throws a whitelist rejection error.
 */
const connectDB = async () => {
  const atlasUri = process.env.MONGODB_URI;
  const localUri = 'mongodb://127.0.0.1:27017/burnout_db';

  try {
    console.log(`⏳ Attempting to connect to MongoDB...`);
    const conn = await mongoose.connect(atlasUri, {
      serverSelectionTimeoutMS: 5000, 
    });
    console.log(`✅ MongoDB connected successfully to remote cluster: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Primary MongoDB connection failed: ${error.message}`);
    console.log(`⏳ Falling back to Local MongoDB at ${localUri}...`);
    
    try {
       const localConn = await mongoose.connect(localUri, {
         serverSelectionTimeoutMS: 5000, 
       });
       console.log(`✅ MongoDB connected successfully to LOCAL fallback: ${localConn.connection.host}`);
    } catch (localErr) {
       console.error(`❌ Local MongoDB also failed: ${localErr.message}`);
       console.log(`⚠️  CRITICAL: Server is running without database. API requests will fail.`);
    }
  }
};

module.exports = connectDB;
