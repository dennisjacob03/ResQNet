const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Initialize environment variables first
dotenv.config();

const connectDB = require('./config/db');
const authRoutes = require('./modules/auth/authRoutes');
const emailRoutes = require('./modules/email/emailRoutes');
const locationRoutes = require('./modules/locations/locationRoutes');
const shelterApplicationRoutes = require('./modules/shelters/shelterApplicationRoutes');
const userRoutes = require('./modules/users/userRoutes');
const notificationRoutes = require('./modules/notifications/notificationRoutes');
const animalRoutes = require('./modules/animals/animalRoutes');
const { verifyTransporter } = require('./utils/emailService');

const app = express();

// Connect Database & Verify Email Transporter
connectDB();
verifyTransporter();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded profile pictures statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/shelters', shelterApplicationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/animals', animalRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'ResQNet API is running smoothly',
    timestamp: new Date(),
  });
});

// 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Not Found - ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  console.error('Unhandled Error:', err.stack);
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
