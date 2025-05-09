const express = require('express');
const { authenticate } = require('../middlewares/authMiddleware');
const AuthController = require('../controllers/authController');
const EmailController = require('../controllers/EmailController');
const router = express.Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/google', AuthController.verifyGoogleToken);
router.get('/session', authenticate, AuthController.verifySession);
router.post("/refresh-token", authenticate, AuthController.refreshToken);

// Google OAuth callback untuk Gmail API
router.get('/gmail', EmailController.getAuthUrl);
router.get('/gmail/callback', EmailController.handleGmailCallback);

module.exports = router;