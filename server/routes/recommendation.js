const express = require('express');
const { authenticate } = require('../middlewares/authMiddleware');
const RecommendationController = require('../controllers/recommendationControllerGemini');
const router = express.Router();

router.post('/care', authenticate, RecommendationController.getCareRecommendation);

module.exports = router;