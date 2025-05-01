const express = require('express');
const { authenticate } = require('../middlewares/authMiddleware');
const AuthController = require('../controllers/authController');
const router = express.Router();

router.post('/google', AuthController.verifyGoogleToken);
router.get('/verify', authenticate, AuthController.verifySession);

module.exports = router;