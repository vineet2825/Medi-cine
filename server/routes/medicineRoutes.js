const express = require('express');
const router = express.Router();
const {
    getMedicines,
    addMedicine,
    updateMedicine,
    deleteMedicine
} = require('../controllers/medicineController');

const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(getMedicines)
    .post(protect, admin, addMedicine);

router.route('/:id')
    .put(protect, admin, updateMedicine)
    .delete(protect, admin, deleteMedicine);

module.exports = router;
