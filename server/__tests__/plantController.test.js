// __tests__/plantController.test.js
const PlantController = require('../controllers/plantController');
const { Plant, PlantPhoto } = require('../models');
const cloudinary = require('../config/cloudinary');
const { sendReminderEmail } = require('../config/sendEmail');

jest.mock('../models');
jest.mock('../config/cloudinary');
jest.mock('../config/sendEmail');
jest.mock('@google/genai');

describe('PlantController', () => {
    let req, res, next, genMock;

    beforeEach(() => {
        req = { body: {}, params: {}, user: { userId: 'u1', email: 'u@mail' } };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
        genMock = { models: { generateContent: jest.fn() } };
        require('@google/genai').GoogleGenAI.mockImplementation(() => genMock);
    });

    describe('createPlant', () => {
        it('400 jika field kurang lengkap', async () => {
            await PlantController.createPlant(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('502 jika AI gagal isi content', async () => {
            req.body = { name: 'n', species: 's', location: 'l', light: 'L', temperature: 25 };
            genMock.models.generateContent.mockResolvedValue({ candidates: [{}] });
            await PlantController.createPlant(req, res, next);
            expect(res.status).toHaveBeenCalledWith(502);
            expect(res.json).toHaveBeenCalledWith({ pesan: 'Kesalahan saat menghasilkan rekomendasi dari layanan AI' });
        });

        it('201 happy-path tanpa photo', async () => {
            req.body = { name: 'n', species: 's', location: 'l', light: 'L', temperature: 25 };
            genMock.models.generateContent.mockResolvedValue({ candidates: [{ content: { text: 'OK' } }] });
            Plant.create.mockResolvedValue({ toJSON: () => ({ id: 1, name: 'n' }) });
            await PlantController.createPlant(req, res, next);
            expect(sendReminderEmail).toHaveBeenCalledWith('u@mail', 'n', 'OK');
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ id: 1, name: 'n' });
        });

        it('201 happy-path with photo', async () => {
            req.body = { name: 'b', species: 's', location: 'x', light: 'Y', temperature: 30, photo: 'data' };
            genMock.models.generateContent.mockResolvedValue({ candidates: [{ content: { text: 'OK2' } }] });
            Plant.create.mockResolvedValue({ id: 2, toJSON: () => ({ id: 2, name: 'b' }) });
            cloudinary.uploader.upload.mockResolvedValue({ secure_url: 'https://pic' });
            await PlantController.createPlant(req, res, next);
            expect(cloudinary.uploader.upload).toHaveBeenCalledWith('data', { folder: 'plant_photos' });
            expect(PlantPhoto.create).toHaveBeenCalledWith({
                plantId: 2,
                photoUrl: 'https://pic',
                uploadedAt: expect.any(Date)
            });
            expect(res.status).toHaveBeenCalledWith(201);
        });
    });

    describe('getPlants', () => {
        it('200 dengan list kosong', async () => {
            Plant.findAll.mockResolvedValue([]);
            await PlantController.getPlants(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith([]);
        });
    });

    describe('updatePlant', () => {
        it('404 jika plant tidak ditemukan', async () => {
            req.params = { id: 'x' };
            Plant.findOne.mockResolvedValue(null);
            await PlantController.updatePlant(req, res, next);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Plant not found' });
        });

        it('200 update tanpa photo', async () => {
            req.params = { id: 'p1' };
            req.body = { name: 'n2', species: 's2', location: 'l2', light: 'Li', temperature: 22 };
            const plantInst = { update: jest.fn(), id: 'p1' };
            Plant.findOne.mockResolvedValueOnce(plantInst);
            Plant.findOne.mockResolvedValueOnce({ toJSON: () => ({ id: 'p1', PlantPhotos: [] }) });
            await PlantController.updatePlant(req, res, next);
            expect(plantInst.update).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ id: 'p1', PlantPhotos: [] });
        });
    });

    describe('deletePlant', () => {
        it('404 jika tidak ada', async () => {
            req.params = { id: 'p2' };
            Plant.findOne.mockResolvedValue(null);
            await PlantController.deletePlant(req, res, next);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Plant not found' });
        });
        it('200 jika sukses', async () => {
            req.params = { id: 'p2' };
            const plantInst = { destroy: jest.fn() };
            Plant.findOne.mockResolvedValue(plantInst);
            await PlantController.deletePlant(req, res, next);
            expect(PlantPhoto.destroy).toHaveBeenCalledWith({ where: { plantId: 'p2' } });
            expect(plantInst.destroy).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Plant deleted' });
        });
    });

    describe('deletePlantPhoto', () => {
        it('404 jika photo tidak ada', async () => {
            req.params = { photoId: 'z' };
            PlantPhoto.findOne.mockResolvedValue(null);
            await PlantController.deletePlantPhoto(req, res, next);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Photo not found' });
        });

        it('403 jika user bukan owner', async () => {
            const photo = { plantId: 'p', photoUrl: 'https://x.jpg' };
            PlantPhoto.findOne.mockResolvedValue(photo);
            Plant.findOne.mockResolvedValue(null);
            await PlantController.deletePlantPhoto(req, res, next);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
        });

        it('400 jika photoUrl hilang', async () => {
            const photo = { plantId: 'p', photoUrl: null };
            PlantPhoto.findOne.mockResolvedValue(photo);
            Plant.findOne.mockResolvedValue({ id: 'p', userId: 'u1' });
            await PlantController.deletePlantPhoto(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ pesan: 'Photo URL is missing' });
        });

        it('200 happy path', async () => {
            const photo = { id: 'ph1', plantId: 'p', photoUrl: 'https://res.cloudinary.com/folder/photo.jpg' };
            PlantPhoto.findOne.mockResolvedValue(photo);
            Plant.findOne.mockResolvedValue({ id: 'p', userId: 'u1' });
            Plant.findOne.mockResolvedValueOnce({ id: 'p', userId: 'u1' });
            Plant.findOne.mockResolvedValueOnce({ toJSON: () => ({ PlantPhotos: [] }) });
            cloudinary.uploader.destroy.mockResolvedValue({});
            await PlantController.deletePlantPhoto(req, res, next);
            expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('plant_photos/photo');
            expect(PlantPhoto.destroy).toHaveBeenCalledWith({ where: { id: 'ph1' } });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ PlantPhotos: [] });
        });
    });

    describe('addPlantPhoto', () => {
        beforeEach(() => {
            req.params = { plantId: 'p' };
            req.body = { photoUrl: 'https://x', uploadedAt: '2023-01-01' };
        });

        it('404 jika plant tidak ada', async () => {
            Plant.findOne.mockResolvedValue(null);
            await PlantController.addPlantPhoto(req, res, next);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Plant not found or unauthorized' });
        });

        it('400 jika input kurang lengkap', async () => {
            Plant.findOne.mockResolvedValue({ id: 'p', userId: 'u1' });
            req.body = {};
            await PlantController.addPlantPhoto(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Photo URL and uploadedAt are required' });
        });

        it('400 jika tanggal invalid', async () => {
            Plant.findOne.mockResolvedValue({ id: 'p', userId: 'u1' });
            req.body.uploadedAt = 'bad-date';
            await PlantController.addPlantPhoto(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Invalid uploadedAt format. Please provide a valid ISO date.' });
        });

        it('400 jika url tidak https', async () => {
            Plant.findOne.mockResolvedValue({ id: 'p', userId: 'u1' });
            req.body.uploadedAt = '2023-01-01';
            req.body.photoUrl = 'http://x';
            await PlantController.addPlantPhoto(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Invalid photo URL. Please provide a valid URL starting with https://.' });
        });

        it('201 happy path', async () => {
            Plant.findOne.mockResolvedValue({ id: 'p', userId: 'u1' });
            PlantPhoto.create.mockResolvedValue({});
            Plant.findOne.mockResolvedValueOnce({ id: 'p', userId: 'u1' });
            Plant.findOne.mockResolvedValueOnce({ toJSON: () => ({ PlantPhotos: ['pic'] }) });
            await PlantController.addPlantPhoto(req, res, next);
            expect(PlantPhoto.create).toHaveBeenCalledWith({
                plantId: 'p',
                photoUrl: 'https://x',
                uploadedAt: new Date('2023-01-01')
            });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ PlantPhotos: ['pic'] });
        });
    });
});
