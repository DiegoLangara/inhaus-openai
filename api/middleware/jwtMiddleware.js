const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Load environment variables from .env
dotenv.config();

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const secretKey = process.env.JWT_SECRET;

    if (!secretKey) {
        console.error('JWT_SECRET is not set in the .env file');
        return res.status(500).json({ success: false, message: 'Server error: Missing secret key' });
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        req.user = decoded; // Attach user info to the request object
        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        console.error('JWT verification error:', err.message);
        return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
    }
};

module.exports = verifyJWT;
