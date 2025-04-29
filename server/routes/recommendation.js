const express = require('express');
const authenticate = require('../middlewares/auth');
const { getCareRecommendation } = require('../controllers/recommendationController');
const router = express.Router();

router.post('/care', authenticate, getCareRecommendation);

module.exports = router;