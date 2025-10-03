const express = require('express');
const {
  createReport,
  getReports,
  getReport,
  updateReportStatus,
  exportReports
} = require('../controllers/reportController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.post('/', authorize('lecturer'), createReport);
router.get('/', getReports);
router.get('/export', exportReports);
router.get('/:id', getReport);
router.patch('/:id/status', authorize('principal_lecturer', 'program_leader'), updateReportStatus);

module.exports = router;