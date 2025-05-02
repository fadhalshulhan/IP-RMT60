const request = require('supertest');
const axios = require('axios');
const app = require('../app');

jest.mock('../middlewares/authMiddleware', () => ({
    authenticate: (req, res, next) => {
        req.user = { userId: 'u1', email: 'a@b.com', name: 'A', picture: 'pic.jpg' };
        next();
    }
}));
jest.mock('axios');

describe('Weather Route GET /api/weather', () => {
    test('400 kalau lat/lon tidak dikirim', async () => {
        const res = await request(app).get('/api/weather');
        expect(res.status).toBe(400);
    });

    test('200 kalau sukses', async () => {
        axios.get.mockResolvedValue({
            data: {
                main: { temp: 30, humidity: 50 },
                weather: [{ description: 'cerah', main: 'Clear' }],
                clouds: { all: 1 },
                name: 'TKP'
            }
        });
        const res = await request(app).get('/api/weather?lat=1&lon=1');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('temperature', 30);
    });
});
