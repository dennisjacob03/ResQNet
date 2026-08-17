const mongoose = require('mongoose');
const dns = require('dns');

// Force Node.js to use Google DNS (8.8.8.8) for SRV record resolution.
// The default ISP/system DNS may block SRV queries which are required by
// the mongodb+srv:// protocol used by MongoDB Atlas.
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/resqnet'
    );
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
