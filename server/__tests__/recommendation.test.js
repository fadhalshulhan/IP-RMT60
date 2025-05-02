const request = require('supertest');
const { GoogleGenAI } = require('@google/genai');
const app = require('../app');

jest.mock('../middlewares/authMiddleware', () => ({
    authenticate: (req, res, next) => {
        req.user = { userId: 'u1', email: 'a@b.com', name: 'A', picture: 'pic.jpg' };
        next();
    }
}));
jest.mock('@google/genai');

describe('Recommendation Route POST /api/recommendation/care', () => {
    beforeAll(() => process.env.GOOGLE_API_KEY = 'key');
    afterEach(() => jest.clearAllMocks());

    test('400 kalau body kurang lengkap', async () => {
        const res = await request(app).post('/api/recommendation/care').send({ species: 'X' });
        expect(res.status).toBe(400);
    });

    test('200 dan recommendation kalau sukses', async () => {
        GoogleGenAI.mockImplementation(() => ({
            models: { generateContent: () => Promise.resolve({ text: 'OK' }) }
        }));
        const res = await request(app)
            .post('/api/recommendation/care')
            .send({ species: 'X', location: 'Y', light: 'L', temperature: 25 });
        expect(res.status).toBe(200);
        expect(res.body.recommendation).toBe('OK');
    });
});
