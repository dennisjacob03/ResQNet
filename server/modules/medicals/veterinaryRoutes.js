const express = require('express');
const router = express.Router();
const {
  submitVetStaffApplication,
  getMyVetStaffApplication,
  getShelterVetApplications,
  scheduleVetInterview,
  submitVetInterviewReport,
  getMyVetAssignment,
  getShelterVetStaff,
  toggleMedicineStockPermission,
  getAssignedShelterAnimals,
  createClinicalRecord,
  getClinicalRecords,
  createVaccinationRecord,
  getVaccinationRecords,
  sendShelterAnimalReminder,
  getMedicineStock,
  addMedicineStock,
  updateMedicineStock,
  deleteMedicineStock,
} = require('./veterinaryController');
const { protect, authorizeRoles, requireCompleteProfile } = require('../../middleware/authMiddleware');

// Public User Application routes
router.post('/apply', protect, requireCompleteProfile, submitVetStaffApplication);
router.get('/my-application', protect, getMyVetStaffApplication);

// Shelter Management routes for interviewing & assigning staff
router.get('/shelter-applications', protect, getShelterVetApplications);
router.put('/applications/:id/interview', protect, scheduleVetInterview);
router.post('/applications/:id/interview-report', protect, submitVetInterviewReport);
router.get('/shelter-staff', protect, getShelterVetStaff);
router.put('/shelter-staff/:id/medicine-permission', protect, toggleMedicineStockPermission);

// Veterinary Staff Clinical Operations routes
router.get('/my-assignment', protect, getMyVetAssignment);
router.get('/animals', protect, getAssignedShelterAnimals);
router.post('/records', protect, createClinicalRecord);
router.get('/records', protect, getClinicalRecords);
router.post('/vaccinations', protect, createVaccinationRecord);
router.get('/vaccinations', protect, getVaccinationRecords);
router.post('/reminders/send', protect, sendShelterAnimalReminder);

// Vet Staff: Medicine Stock Management routes
router.get('/medicine-stock', protect, getMedicineStock);
router.post('/medicine-stock', protect, addMedicineStock);
router.put('/medicine-stock/:id', protect, updateMedicineStock);
router.delete('/medicine-stock/:id', protect, deleteMedicineStock);

module.exports = router;
