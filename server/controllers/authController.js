const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { User } = require('../models');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class AuthController {
    static async verifyGoogleToken(req, res, next) {
        const { googleToken } = req.body;

        if (!googleToken) {
            return res.status(400).json({ message: 'Google token is required' });
        }

        try {
            console.log('Google token received:', googleToken);

            const ticket = await client.verifyIdToken({
                idToken: googleToken,
                audience: process.env.GOOGLE_CLIENT_ID,
            });

            const payload = ticket.getPayload();
            const userData = {
                userId: payload['sub'],
                email: payload.email,
                name: payload.name,
                picture: payload.picture,
            };

            const [user, created] = await User.findOrCreate({
                where: { userId: userData.userId },
                defaults: userData,
            });

            if (!created) {
                await user.update(userData);
            }

            const jwtToken = jwt.sign(userData, process.env.JWT_SECRET, {
                expiresIn: '1h',
            });

            // Log userData for debugging
            console.log('userData before response:', userData);
            const responseData = { token: jwtToken, user: userData };
            console.log('Response object:', responseData);
            res.status(200).json(responseData);
        } catch (error) {
            console.error('Error verifying Google token:', error);
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Google token has expired' });
            }
            next(error);
        }
    }

    static async verifySession(req, res, next) {
        try {
            const token = req.headers.authorization?.split(' ')[1] || null;
            if (!token || !req.user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            res.status(200).json({
                token,
                user: req.user,
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = AuthController;