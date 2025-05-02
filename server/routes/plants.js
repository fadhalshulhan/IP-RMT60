const express = require('express');
const PlantController = require('../controllers/plantController');
const { authenticate } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/', authenticate, PlantController.createPlant);
router.get('/', authenticate, PlantController.getPlants);
router.put('/:id', authenticate, PlantController.updatePlant);
router.delete('/:id', authenticate, PlantController.deletePlant);
router.delete('/photo/:photoId', authenticate, PlantController.deletePlantPhoto);
router.post('/:plantId/photo', authenticate, PlantController.addPlantPhoto);

module.exports = router;