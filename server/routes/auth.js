const express = require('express');
const { verifyGoogleToken } = require('../controllers/authController');
const router = express.Router();

router.post('/google', verifyGoogleToken);

module.exports = router;