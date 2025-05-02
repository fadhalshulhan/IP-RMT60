const request = require('supertest');
const { GoogleGenAI } = require('@google/genai');
const app = require('../app');

jest.mock('../middlewares/authMiddleware', () => ({
    authenticate: (req, res, next) => { req.user = { userId: 'u1' }; next(); }
}));
jest.mock('@google/genai');

beforeAll(() => process.env.GOOGLE_API_KEY = 'key');

describe('RecommendationControllerGemini', () => {
    test('bad request', async () => {
        const res = await request(app)
            .post('/api/recommendation/care')
            .send({});
        expect(res.status).toBe(400);
    });
    test('ok', async () => {
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
