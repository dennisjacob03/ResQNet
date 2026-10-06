const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const {
  createRescueRequest,
  getUserRescueRequests,
  getAllRescueRequestsForAdmin,
  getRescueRequestById,
  getRescueTeamBroadcasts,
  acceptRescueRequest,
  declineRescueRequest,
  updateRescueStage,
  getNearbySheltersForIntake,
  routeToShelter,
  confirmShelterAdmission,
  getShelterIncomingIntakes,
  getAllRescueTeamsAndSheltersMap,
} = require("./rescueRequestController");
const {
  protect,
  authorizeRoles,
  requireCompleteProfile,
} = require("../../middleware/authMiddleware");

const rescueUploadDir = path.join(__dirname, "../../uploads");
fs.mkdirSync(rescueUploadDir, { recursive: true });
const rescueUpload = multer({
  storage: multer.diskStorage({
    destination: rescueUploadDir,
    filename: (_req, file, cb) => {
      const extension = path.extname(file.originalname).toLowerCase();
      cb(
        null,
        `rescue-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`,
      );
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    cb(null, file.mimetype.startsWith("image/"));
  },
});

// Public User Rescue Request Routes
router.post(
  "/",
  protect,
  requireCompleteProfile,
  rescueUpload.single("image"),
  createRescueRequest,
);
router.get("/my-requests", protect, getUserRescueRequests);
router.get(
  "/admin/all",
  protect,
  authorizeRoles("Admin"),
  getAllRescueRequestsForAdmin,
);
router.get("/map-data", getAllRescueTeamsAndSheltersMap);

// Rescue Team Operational Routes
router.get(
  "/broadcasts",
  protect,
  authorizeRoles("Rescue Team", "Admin"),
  getRescueTeamBroadcasts,
);
router.post(
  "/:id/accept",
  protect,
  authorizeRoles("Rescue Team", "Admin"),
  acceptRescueRequest,
);
router.post(
  "/:id/decline",
  protect,
  authorizeRoles("Rescue Team", "Admin"),
  declineRescueRequest,
);
router.put(
  "/:id/stage",
  protect,
  authorizeRoles("Rescue Team", "Admin"),
  updateRescueStage,
);
router.get(
  "/:id/nearby-shelters",
  protect,
  authorizeRoles("Rescue Team", "Admin"),
  getNearbySheltersForIntake,
);
router.post(
  "/:id/route-shelter",
  protect,
  authorizeRoles("Rescue Team", "Admin"),
  routeToShelter,
);

// Shelter Intake Confirmation & Tracking Routes
router.get(
  "/shelter-incoming",
  protect,
  authorizeRoles("Shelter", "Admin"),
  getShelterIncomingIntakes,
);
router.post(
  "/:id/confirm-admission",
  protect,
  authorizeRoles("Shelter", "Admin"),
  confirmShelterAdmission,
);

// Single Request Detailed View
router.get("/:id", protect, getRescueRequestById);

module.exports = router;
