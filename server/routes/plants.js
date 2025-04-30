const express = require('express');
const authenticate = require('../middlewares/auth');
const { createPlant, getPlants, updatePlant, deletePlant, uploadPlantPhoto } = require('../controllers/plantController');
const router = express.Router();

router.post('/', authenticate, createPlant);
router.get('/', authenticate, getPlants);
router.put('/:id', authenticate, updatePlant);
router.delete('/:id', authenticate, deletePlant);
router.post('/:id/photo', authenticate, uploadPlantPhoto);

module.exports = router;