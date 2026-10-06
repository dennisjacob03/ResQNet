require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8','8.8.4.4']);
const mongoose = require('mongoose');
const User = require('../modules/users/userModel');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const users = await User.find(
    { role: { $ne: 'Admin' } },
    'fullName email role'
  ).sort({ role: 1, createdAt: 1 }).lean();

  console.log('\n=== SEEDED USERS (password: Password@123) ===\n');
  let lastRole = '';
  for (const u of users) {
    if (u.role !== lastRole) { console.log('\n[' + u.role + ']'); lastRole = u.role; }
    console.log('  ' + u.fullName.padEnd(25) + ' | ' + u.email);
  }
  console.log('\nTotal:', users.length, 'users\n');
  await mongoose.disconnect();
}).catch(err => { console.error(err); process.exit(1); });
