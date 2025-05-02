const request = require('supertest');
const { User } = require('../models');
const app = require('../app');

jest.mock('../middlewares/authMiddleware', () => ({
    authenticate: (req, res, next) => {
        req.user = { userId: 'u1', email: 'a@b.com', name: 'A', picture: 'pic.jpg' };
        next();
    }
}));
jest.mock('../models');

describe('User Profile Routes', () => {
    afterEach(() => jest.clearAllMocks());

    test('GET /api/users/profile → 404 kalau user nggak ada', async () => {
        User.findByPk.mockResolvedValue(null);
        const res = await request(app).get('/api/users/profile');
        expect(res.status).toBe(404);
    });

    test('GET /api/users/profile → 200 kalau ada', async () => {
        User.findByPk.mockResolvedValue({ toJSON() { return { userId: 'u1' }; } });
        const res = await request(app).get('/api/users/profile');
        expect(res.status).toBe(200);
    });

    test('PUT /api/users/profile → 200 update sukses', async () => {
        const u = { userId: 'u1', save: jest.fn(), toJSON() { return this; } };
        User.findByPk.mockResolvedValue(u);
        const res = await request(app)
            .put('/api/users/profile')
            .send({ name: 'B' });
        expect(res.status).toBe(200);
        expect(u.name).toBe('B');
    });

    test('DELETE /api/users/profile → 200 delete sukses', async () => {
        const u = { destroy: jest.fn() };
        User.findByPk.mockResolvedValue(u);
        const res = await request(app).delete('/api/users/profile');
        expect(res.status).toBe(200);
    });
});
