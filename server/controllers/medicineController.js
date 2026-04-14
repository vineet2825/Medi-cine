const Medicine = require('../models/Medicine');

// @desc    Get all medicines
// @route   GET /api/medicine
// @access  Public
const getMedicines = async (req, res) => {
    try {
        const medicines = await Medicine.find().sort({ name: 1 });
        res.status(200).json(medicines);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching medicines' });
    }
};

// @desc    Add new medicine
// @route   POST /api/medicine
// @access  Public
const addMedicine = async (req, res) => {
    try {
        const { name, company, inStock } = req.body;
        if (!name || !company) {
            return res.status(400).json({ message: 'Tablet name and company are required' });
        }

        const medicine = await Medicine.create({
            name,
            company,
            inStock: inStock !== undefined ? inStock : true
        });

        res.status(201).json(medicine);
    } catch (error) {
        console.error('Add Medicine Error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: `Medicine "${req.body.name}" already exists in the catalog.` });
        }
        res.status(500).json({ message: 'Failed to save medicine to database' });
    }
};

// @desc    Update medicine stock status
// @route   PUT /api/medicine/:id
// @access  Public
const updateMedicine = async (req, res) => {
    try {
        const medicine = await Medicine.findById(req.params.id);
        if (!medicine) return res.status(404).json({ message: 'Medicine not found' });

        medicine.inStock = !medicine.inStock;
        const updatedMedicine = await medicine.save();
        res.status(200).json(updatedMedicine);
    } catch (error) {
        res.status(500).json({ message: 'Server Error updating stock' });
    }
};

// @desc    Delete medicine
// @route   DELETE /api/medicine/:id
// @access  Public
const deleteMedicine = async (req, res) => {
    try {
        const medicine = await Medicine.findById(req.params.id);
        if (!medicine) return res.status(404).json({ message: 'Medicine not found' });

        await medicine.deleteOne();
        res.status(200).json({ id: req.params.id, message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error deleting medicine' });
    }
};

module.exports = { getMedicines, addMedicine, updateMedicine, deleteMedicine };
