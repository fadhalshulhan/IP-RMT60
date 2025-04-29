const express = require('express');
const authenticate = require('../middlewares/auth');
const { getWeather } = require('../controllers/weatherController');
const router = express.Router();

router.get('/', authenticate, getWeather);

module.exports = router;