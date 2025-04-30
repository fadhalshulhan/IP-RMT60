const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../models');
const jwt = require('jsonwebtoken');

let server;

beforeAll(async () => {
    await sequelize.sync({ force: true });
    server = app.listen(0); // Gunakan port dinamis untuk pengujian
});

afterAll(async () => {
    await sequelize.close();
    server.close(); // Tutup server setelah semua tes selesai
});

describe('Plant API', () => {
    let token;

    beforeEach(() => {
        token = jwt.sign({ id: 1, email: 'test@example.com' }, process.env.JWT_SECRET);
    });

    it('should create a new plant', async () => {
        const res = await request(app)
            .post('/api/plants')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Monstera',
                species: 'Monstera Deliciosa',
                location: 'Jakarta',
                light: 'Medium',
                temperature: 30,
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('name', 'Monstera');
    });

    it('should get all plants', async () => {
        await request(app)
            .post('/api/plants')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Monstera',
                species: 'Monstera Deliciosa',
                location: 'Jakarta',
                light: 'Medium',
                temperature: 30,
            });

        const res = await request(app)
            .get('/api/plants')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveLength(1);
    });
});