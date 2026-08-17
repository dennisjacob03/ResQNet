const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const {
  registerUser,
  loginUser,
  googleAuth,
  getMe,
  sendOtp,
  verifyOtp,
  resetPassword,
  updateProfile,
  changePassword,
} = require('./authController');
const { protect } = require('../../middleware/authMiddleware');

// Multer setup — store profile pics in server/uploads/
const profilePicStorage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `profile-${req.user?._id || Date.now()}${ext}`);
  },
});
const uploadProfilePic = multer({
  storage: profilePicStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  },
});

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);
router.put('/profile', protect, uploadProfilePic.single('profilePic'), updateProfile);
router.post('/change-password', protect, changePassword);

module.exports = router;
