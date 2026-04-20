const Request = require('../models/Request');

// @desc    Get all requests
// @route   GET /api/request
// @access  Private/Admin
const getRequests = async (req, res) => {
    try {
        const requests = await Request.find().sort({ createdAt: -1 });
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching requests' });
    }
};

// @desc    Create new request
// @route   POST /api/request
// @access  Private
const createRequest = async (req, res) => {
    try {
        const { medicineName, companyName, quantity, requiredDate } = req.body;
        // Use authenticated user's name
        const userName = req.user ? req.user.name : req.body.userName;

        if (!userName || !medicineName || !companyName || !quantity || !requiredDate) {
            return res.status(400).json({ message: 'Please add all required fields' });
        }

        const request = await Request.create({
            userName,
            medicineName,
            companyName,
            quantity,
            requiredDate
        });

        res.status(201).json(request);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Server Error saving request' });
    }
};

// @desc    Update request status
// @route   PUT /api/request/:id
// @access  Private/Admin
const updateRequest = async (req, res) => {
    try {
        const request = await Request.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ message: 'Please provide a status to update' });
        }

        const updatedRequest = await Request.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        res.status(200).json(updatedRequest);
    } catch (error) {
        res.status(500).json({ message: 'Server Error updating request' });
    }
};

// @desc    Delete request
// @route   DELETE /api/request/:id
// @access  Private/Admin
const deleteRequest = async (req, res) => {
    try {
        const request = await Request.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        await request.deleteOne();
        res.status(200).json({ id: req.params.id, message: 'Request deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error deleting request' });
    }
};

// @desc    Get requests by user
// @route   GET /api/request/user/:userName
// @access  Private
const getUserRequests = async (req, res) => {
    try {
        // Case-insensitive regex search for username string
        const requests = await Request.find({ 
            userName: { $regex: new RegExp(`^${req.params.userName}$`, 'i') } 
        }).sort({ createdAt: -1 });
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching user history' });
    }
};

module.exports = {
    getRequests,
    createRequest,
    updateRequest,
    deleteRequest,
    getUserRequests
};
