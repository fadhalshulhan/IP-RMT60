const PlantController = require('../controllers/plantController');
const { Plant } = require('../models');

describe('PlantController.getPlants', () => {
    let req, res, next;

    beforeEach(() => {
        req = { user: { userId: 'u1' } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
    });

    test('200 dengan list kosong', async () => {
        // stub findAll() → []
        Plant.findAll = jest.fn().mockResolvedValue([]);
        await PlantController.getPlants(req, res, next);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([]);
    });

    test('200 dengan beberapa plant', async () => {
        const fakePlants = [
            { id: 1, name: 'A', PlantPhotos: [] },
            { id: 2, name: 'B', PlantPhotos: [{ id: 10, photoUrl: 'u' }] }
        ];
        Plant.findAll = jest.fn().mockResolvedValue(fakePlants);
        await PlantController.getPlants(req, res, next);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(fakePlants);
    });
});
