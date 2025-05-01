const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const PlantController = require('../controllers/plantController');
const { authenticate } = require('../middlewares/authMiddleware');
const { Plant, PlantPhoto, User } = require('../models');
const cloudinary = require('../config/cloudinary');
const { sendReminderEmail } = require('../config/sendEmail');
const { GoogleGenAI } = require('@google/genai');

jest.mock('../config/cloudinary');
jest.mock('../config/sendEmail');
jest.mock('@google/genai');
jest.mock('../models');
jest.mock('jsonwebtoken');

const app = express();
app.use(express.json());

const router = express.Router();
router.post('/', authenticate, PlantController.createPlant);
router.get('/', authenticate, PlantController.getPlants);
router.put('/:id', authenticate, PlantController.updatePlant);
router.delete('/:id', authenticate, PlantController.deletePlant);
router.delete('/photo/:photoId', authenticate, PlantController.deletePlantPhoto);
router.post('/:plantId/photo', authenticate, PlantController.addPlantPhoto);

app.use('/api/plants', router);

describe('Plant Routes', () => {
    let mockUser;
    let mockToken;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();

        mockUser = {
            userId: 1,
            email: 'test@example.com',
            name: 'Test User',
            picture: 'test.jpg',
        };

        mockToken = 'mocktoken';
        jwt.verify.mockReturnValue({ userId: mockUser.userId });
        User.findByPk.mockResolvedValue(mockUser);
    });

    describe('POST /api/plants', () => {
        it('should create a new plant successfully', async () => {
            const plantData = {
                name: 'Rose',
                species: 'Rosa',
                location: 'Indoor',
                light: 'Bright indirect',
                temperature: 25,
                photo: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
            };

            const mockPlant = {
                id: 1,
                ...plantData,
                userId: mockUser.userId,
                careRecommendation: 'Water every 3-4 days...',
            };

            const mockPhotoResult = {
                secure_url: 'https://cloudinary.com/photo.jpg',
            };

            GoogleGenAI.prototype.models = {
                generateContent: jest.fn().mockResolvedValue({
                    candidates: [{ content: { text: 'Water every 3-4 days...' } }],
                }),
            };

            Plant.create.mockResolvedValue(mockPlant);
            cloudinary.uploader.upload.mockResolvedValue(mockPhotoResult);
            PlantPhoto.create.mockResolvedValue({});
            sendReminderEmail.mockResolvedValue();

            const response = await request(app)
                .post('/api/plants')
                .set('Authorization', `Bearer ${mockToken}`)
                .send(plantData);

            expect(response.status).toBe(201);
            expect(response.body).toMatchObject({
                id: mockPlant.id,
                name: mockPlant.name,
                species: mockPlant.species,
                location: mockPlant.location,
                light: mockPlant.light,
                temperature: mockPlant.temperature,
                userId: mockPlant.userId,
                careRecommendation: mockPlant.careRecommendation,
            });
            expect(Plant.create).toHaveBeenCalledWith({
                userId: mockUser.userId,
                name: plantData.name,
                species: plantData.species,
                location: plantData.location,
                light: plantData.light,
                temperature: plantData.temperature,
                careRecommendation: 'Water every 3-4 days...',
            });
            expect(cloudinary.uploader.upload).toHaveBeenCalled();
            expect(sendReminderEmail).toHaveBeenCalledWith(
                mockUser.email,
                plantData.name,
                'Water every 3-4 days...'
            );
        });

        it('should return 400 if required fields are missing', async () => {
            const response = await request(app)
                .post('/api/plants')
                .set('Authorization', `Bearer ${mockToken}`)
                .send({ name: 'Rose' });

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: 'All fields are required' });
        });

        it('should handle GoogleGenAI error', async () => {
            const plantData = {
                name: 'Rose',
                species: 'Rosa',
                location: 'Indoor',
                light: 'Bright indirect',
                temperature: 25,
            };

            GoogleGenAI.prototype.models = {
                generateContent: jest.fn().mockResolvedValue({
                    candidates: [{}], // Respon tidak valid
                }),
            };

            const response = await request(app)
                .post('/api/plants')
                .set('Authorization', `Bearer ${mockToken}`)
                .send(plantData);

            expect(response.status).toBe(502);
            expect(response.body).toEqual({
                pesan: 'Kesalahan saat menghasilkan rekomendasi dari layanan AI',
            });
        });
    });

    describe('GET /api/plants', () => {
        it('should return all plants for the user', async () => {
            const mockPlants = [
                {
                    id: 1,
                    name: 'Rose',
                    species: 'Rosa',
                    PlantPhotos: [],
                },
            ];

            Plant.findAll.mockResolvedValue(mockPlants);

            const response = await request(app)
                .get('/api/plants')
                .set('Authorization', `Bearer ${mockToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockPlants);
            expect(Plant.findAll).toHaveBeenCalledWith({
                where: { userId: mockUser.userId },
                include: [{ model: PlantPhoto, as: 'PlantPhotos' }],
            });
        });
    });

    describe('PUT /api/plants/:id', () => {
        it('should update a plant successfully', async () => {
            const plantData = {
                name: 'Updated Rose',
                species: 'Rosa',
                location: 'Outdoor',
                light: 'Direct sunlight',
                temperature: 30,
            };

            const mockPlant = {
                id: 1,
                userId: mockUser.userId,
                ...plantData,
                update: jest.fn().mockResolvedValue(),
            };

            const mockUpdatedPlant = {
                id: 1,
                ...plantData,
                PlantPhotos: [],
            };

            Plant.findOne.mockResolvedValueOnce(mockPlant).mockResolvedValueOnce(mockUpdatedPlant);

            const response = await request(app)
                .put('/api/plants/1')
                .set('Authorization', `Bearer ${mockToken}`)
                .send(plantData);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockUpdatedPlant);
            expect(mockPlant.update).toHaveBeenCalledWith(plantData);
        });

        it('should return 404 if plant not found', async () => {
            Plant.findOne.mockResolvedValue(null);

            const response = await request(app)
                .put('/api/plants/1')
                .set('Authorization', `Bearer ${mockToken}`)
                .send({ name: 'Updated Rose' });

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Plant not found' });
        });
    });

    describe('DELETE /api/plants/:id', () => {
        it('should delete a plant successfully', async () => {
            const mockPlant = {
                id: 1,
                userId: mockUser.userId,
                destroy: jest.fn().mockResolvedValue(),
            };

            Plant.findOne.mockResolvedValue(mockPlant);
            PlantPhoto.destroy.mockResolvedValue();

            const response = await request(app)
                .delete('/api/plants/1')
                .set('Authorization', `Bearer ${mockToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'Plant deleted' });
            expect(PlantPhoto.destroy).toHaveBeenCalledWith({ where: { plantId: '1' } });
            expect(mockPlant.destroy).toHaveBeenCalled();
        });

        it('should return 404 if plant not found', async () => {
            Plant.findOne.mockResolvedValue(null);

            const response = await request(app)
                .delete('/api/plants/1')
                .set('Authorization', `Bearer ${mockToken}`);

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Plant not found' });
        });
    });

    describe('DELETE /api/plants/photo/:photoId', () => {
        it('should delete a plant photo successfully', async () => {
            const mockPhoto = {
                id: 1,
                plantId: 1,
                photoUrl: 'https://res.cloudinary.com/test/image/upload/plant_photos/photo.jpg',
            };

            const mockPlant = {
                id: 1,
                userId: mockUser.userId,
            };

            const mockUpdatedPlant = {
                id: 1,
                PlantPhotos: [],
            };

            PlantPhoto.findOne.mockResolvedValue(mockPhoto);
            Plant.findOne.mockResolvedValueOnce(mockPlant).mockResolvedValueOnce(mockUpdatedPlant);
            cloudinary.uploader.destroy.mockResolvedValue({});
            PlantPhoto.destroy.mockResolvedValue();

            const response = await request(app)
                .delete('/api/plants/photo/1')
                .set('Authorization', `Bearer ${mockToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockUpdatedPlant);
            expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('plant_photos/photo');
        });

        it('should return 404 if photo not found', async () => {
            PlantPhoto.findOne.mockResolvedValue(null);

            const response = await request(app)
                .delete('/api/plants/photo/1')
                .set('Authorization', `Bearer ${mockToken}`);

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Photo not found' });
        });

        it('should return 400 if photo URL is missing', async () => {
            const mockPhoto = {
                id: 1,
                plantId: 1,
                photoUrl: undefined,
            };

            const mockPlant = {
                id: 1,
                userId: mockUser.userId,
            };

            PlantPhoto.findOne.mockResolvedValue(mockPhoto);
            Plant.findOne.mockResolvedValue(mockPlant);

            const response = await request(app)
                .delete('/api/plants/photo/1')
                .set('Authorization', `Bearer ${mockToken}`);

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ pesan: 'Photo URL is missing' });
        });
    });

    describe('POST /api/plants/:plantId/photo', () => {
        it('should add a plant photo successfully', async () => {
            const photoData = {
                photoUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
                uploadedAt: '2023-10-01T12:00:00Z',
            };

            const mockPlant = {
                id: 1,
                userId: mockUser.userId,
            };

            const mockPhotoResult = {
                secure_url: 'https://cloudinary.com/photo.jpg',
            };

            const mockUpdatedPlant = {
                id: 1,
                PlantPhotos: [{ photoUrl: mockPhotoResult.secure_url }],
            };

            Plant.findOne.mockResolvedValueOnce(mockPlant).mockResolvedValueOnce(mockUpdatedPlant);
            cloudinary.uploader.upload.mockResolvedValue(mockPhotoResult);
            PlantPhoto.create.mockResolvedValue({});

            const response = await request(app)
                .post('/api/plants/1/photo')
                .set('Authorization', `Bearer ${mockToken}`)
                .send(photoData);

            expect(response.status).toBe(201);
            expect(response.body).toEqual(mockUpdatedPlant);
            expect(cloudinary.uploader.upload).toHaveBeenCalled();
            expect(PlantPhoto.create).toHaveBeenCalledWith({
                plantId: 1,
                photoUrl: mockPhotoResult.secure_url,
                uploadedAt: expect.any(Date),
            });
        });

        it('should return 400 if required fields are missing', async () => {
            const mockPlant = {
                id: 1,
                userId: mockUser.userId,
            };

            Plant.findOne.mockResolvedValue(mockPlant);

            const response = await request(app)
                .post('/api/plants/1/photo')
                .set('Authorization', `Bearer ${mockToken}`)
                .send({});

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: 'Photo URL and uploadedAt are required' });
        });

        it('should return 404 if plant not found', async () => {
            Plant.findOne.mockResolvedValue(null);

            const response = await request(app)
                .post('/api/plants/1/photo')
                .set('Authorization', `Bearer ${mockToken}`)
                .send({ photoUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==', uploadedAt: '2023-10-01T12:00:00Z' });

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Plant not found or unauthorized' });
        });
    });
});