const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { User } = require('../models');
const { v4: uuidv4 } = require('uuid');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class AuthController {
    static async register(req, res, next) {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ message: 'Email, password, dan nama diperlukan' });
        }

        try {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ message: 'Email sudah terdaftar' });
            }

            const userData = {
                userId: uuidv4(),
                email,
                name,
                password,
            };

            const user = await User.create(userData);

            const jwtToken = jwt.sign(
                { userId: user.userId, email: user.email, name: user.name },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.status(201).json({
                token: jwtToken,
                user: { userId: user.userId, email: user.email, name: user.name },
            });
        } catch (error) {
            console.error('Error registering user:', error);
            next(error);
        }
    }

    static async login(req, res, next) {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email dan password diperlukan' });
        }

        try {
            const user = await User.findOne({ where: { email } });
            if (!user || !user.password) {
                console.log("User tidak ditemukan atau tidak memiliki password:", email);
                return res.status(401).json({ message: 'Email atau password salah' });
            }

            const isMatch = await user.comparePassword(password);
            console.log("Hasil comparePassword:", isMatch, "Email:", email);
            if (!isMatch) {
                return res.status(401).json({ message: 'Email atau password salah' });
            }

            const jwtToken = jwt.sign(
                { userId: user.userId, email: user.email, name: user.name },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.status(200).json({
                token: jwtToken,
                user: { userId: user.userId, email: user.email, name: user.name, picture: user.picture },
            });
        } catch (error) {
            console.error('Error logging in:', error);
            next(error);
        }
    }

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
                userId: payload.sub,
                email: payload.email,
                name: payload.name,
                picture: payload.picture,
            };

            const existingUser = await User.findOne({ where: { email: userData.email } });
            if (existingUser && existingUser.userId !== userData.userId) {
                return res.status(400).json({ message: 'Email sudah terdaftar dengan akun lain' });
            }

            const [user, created] = await User.findOrCreate({
                where: { userId: userData.userId },
                defaults: userData,
            });

            if (!created) {
                await user.update(userData);
            }

            const jwtToken = jwt.sign(
                { userId: user.userId, email: user.email, name: user.name, picture: user.picture },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.status(200).json({
                token: jwtToken,
                user: { userId: user.userId, email: user.email, name: user.name, picture: user.picture },
            });
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

    // Tambahkan endpoint untuk refresh token
    static async refreshToken(req, res, next) {
        try {
            const user = await User.findByPk(req.user.userId);
            if (!user) {
                return res.status(404).json({ message: "User tidak ditemukan" });
            }

            const jwtToken = jwt.sign(
                { userId: user.userId, email: user.email, name: user.name, picture: user.picture },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.status(200).json({
                token: jwtToken,
                user: { userId: user.userId, email: user.email, name: user.name, picture: user.picture },
            });
        } catch (error) {
            console.error('Error refreshing token:', error);
            next(error);
        }
    }




}

module.exports = AuthController;