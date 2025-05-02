const request = require('supertest');
const { OAuth2Client } = require('google-auth-library');
const app = require('../app');
const { User } = require('../models');

jest.mock('../middlewares/authMiddleware', () => ({
    authenticate: (req, res, next) => {
        req.user = { userId: 'u1', email: 'a@b.com', name: 'A', picture: 'pic.jpg' };
        next();
    }
}));

jest.mock('../models');
jest.mock('google-auth-library', () => ({
    OAuth2Client: jest.fn().mockImplementation(() => ({
        verifyIdToken: jest.fn().mockResolvedValue({
            getPayload: () => ({
                sub: 'id1',
                email: 'a@b.com',
                name: 'A',
                picture: 'pic.jpg'
            })
        })
    }))
}));


describe('Auth Routes', () => {
    beforeAll(() => {
        process.env.JWT_SECRET = 'testsecret';
        process.env.GOOGLE_CLIENT_ID = 'dummy-client-id';
    });

    afterEach(() => jest.clearAllMocks());

    test('POST /api/auth/register → 400 kalau body kurang lengkap', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: 'a@b.com' });
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/diperlukan/);
    });

    test('POST /api/auth/register → 201 dan token user baru', async () => {
        User.findOne.mockResolvedValue(null);
        User.create.mockResolvedValue({
            userId: 'uuid-1', email: 'a@b.com', name: 'A',
            toJSON() { return this; }
        });
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: 'a@b.com', password: 'pass', name: 'A' });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('token');
        expect(res.body.user).toMatchObject({ userId: 'uuid-1', email: 'a@b.com', name: 'A' });
    });

    test('POST /api/auth/login → 401 kalau email/password salah', async () => {
        User.findOne.mockResolvedValue(null);
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'x@x.com', password: 'p' });
        expect(res.status).toBe(401);
    });

    test('POST /api/auth/login → 200 kalau sukses', async () => {
        const fakeUser = {
            userId: 'u1',
            email: 'a@b.com',
            name: 'A',
            picture: 'pic.jpg',
            password: 'hashed',
            comparePassword: jest.fn().mockResolvedValue(true),
        };
        User.findOne.mockResolvedValue(fakeUser);

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'a@b.com', password: 'pass' });
        expect(res.status).toBe(200);
        expect(res.body.user).toMatchObject({ userId: 'u1', email: 'a@b.com', name: 'A', picture: 'pic.jpg' });
    });

    test('POST /api/auth/google → 400 kalau googleToken kosong', async () => {
        const res = await request(app)
            .post('/api/auth/google')
            .send({});
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/required/);
    });

    test('POST /api/auth/google → 200 kalau token valid', async () => {
        User.findOne.mockResolvedValue(null);
        const ticket = {
            getPayload: () => ({ sub: 'id1', email: 'a@b.com', name: 'A', picture: 'pic.jpg' })
        };
        OAuth2Client.mockImplementation(() => ({
            verifyIdToken: () => Promise.resolve(ticket)
        }));
        User.findOrCreate.mockResolvedValue([
            { userId: 'id1', email: 'a@b.com', name: 'A', picture: 'pic.jpg' }, true
        ]);
        const res = await request(app)
            .post('/api/auth/google')
            .send({ googleToken: 'gtoken' });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
    });
});
