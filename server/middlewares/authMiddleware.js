const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authenticate = async (req, res, next) => {
    // Validasi header Authorization
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Invalid authorization header' });
    }

    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    // Validasi JWT_SECRET
    if (!process.env.JWT_SECRET) {
        return res.status(500).json({ message: 'Server configuration error: JWT_SECRET not defined' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = {
            userId: user.userId,
            email: user.email,
            name: user.name,
            picture: user.picture,
        };
        next();
    } catch (error) {
        // console.error('Authentication error for token:', token, 'Error:', error.message);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token has expired' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Malformed token' });
        }
        return res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = { authenticate };