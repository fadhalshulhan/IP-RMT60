const request = require('supertest');
const app = require('../app');

jest.mock('../middlewares/authMiddleware', () => ({
    authenticate: (req, res, next) => {
        req.user = { userId: 'u1', email: 'a@b.com', name: 'A', picture: 'pic.jpg' };
        next();
    }
}));

describe('Global Error Handler (app.js)', () => {
    test('GET /trigger-error → 500 internal server error', async () => {
        const res = await request(app).get('/trigger-error');
        expect(res.status).toBe(500);
        expect(res.body.pesan).toBe('Kesalahan server internal');
    });

    test('GET /trigger-custom-error → status 418 dan custom message', async () => {
        const res = await request(app).get('/trigger-custom-error');
        expect(res.status).toBe(418);
        expect(res.body.pesan).toBe('Custom error');
    });

    test('GET /api/test/session → mock session', async () => {
        const res = await request(app).get('/api/test/session');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ token: 'mocktoken', user: { id: 1 } });
    });
});
