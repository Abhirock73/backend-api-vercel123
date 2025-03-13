const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Vendor = require('../models/vendor');

// Authentication middleware: Checks if user is authenticated
const user = async (req, res, next) => {
    try {
        // Extract the token from headers
        const token = req.header('x-auth-token');

        // If no token is provided, return 401 (Unauthorized)
        if (!token) {
            return res.status(401).json({ msg: "No token provided" });
        }

        // Verify the JWT using token and secret key
        const verified = jwt.verify(token, "passwordKey"); // Use environment variable

        if (!verified) {
            return res.status(401).json({ msg: "Token verification failed" });
        }

        // Find the user or vendor in the database using the ID from the token payload
        const user = await User.findById(verified.id) || await Vendor.findById(verified.id);

        if (!user) {
            return res.status(401).json({ msg: "User or vendor not found" });
        }

        // Attach authenticated user (User/Vendor) to the request object
        req.user = user;
        req.token = token;

        // Proceed to next middleware
        next();

    } catch (error) {
        return res.status(500).json({ error: error.message }); // Fix 'e.message' issue
    }
};

// Vendor authentication middleware: Ensures only vendors can access
const vendorAuth = (req, res, next) => {
    try {
        // Check if user is a vendor
        if (!req.user || req.user.role !== "vendor") { // Fix possible null issue
            return res.status(403).json({ msg: "Access denied, only vendors are allowed" });
        }

        // If user is a vendor, proceed
        next();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { user, vendorAuth };
