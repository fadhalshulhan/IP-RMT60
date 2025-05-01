const express = require('express');
const { authenticate } = require('../middlewares/authMiddleware');
const WeatherController = require('../controllers/weatherController');
const router = express.Router();

router.get('/', authenticate, WeatherController.getWeather);

module.exports = router;