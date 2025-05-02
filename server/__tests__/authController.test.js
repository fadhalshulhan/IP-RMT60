/**
 * @jest-environment node
 */
jest.mock('google-auth-library', () => ({
    OAuth2Client: jest.fn()
}));
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const AuthController = require('../controllers/authController');
const { User } = require('../models');

describe('AuthController', () => {
    let req, res, next, mockVerify;

    beforeAll(() => {
        process.env.JWT_SECRET = 'testsecret';
        process.env.GOOGLE_CLIENT_ID = 'dummy-client-id';
    });

    beforeEach(() => {
        req = { body: {}, headers: {} };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();

        mockVerify = jest.fn();
        OAuth2Client.mockClear();
        OAuth2Client.mockImplementation(() => ({ verifyIdToken: mockVerify }));
    });

    describe('register', () => {
        it('400 jika body kurang lengkap', async () => {
            req.body = { email: 'a@b.com' };
            await AuthController.register(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Email, password, dan nama diperlukan' });
        });

        it('201 membuat user baru', async () => {
            req.body = { email: 'u@u.com', password: 'pw', name: 'Name' };
            User.findOne = jest.fn().mockResolvedValue(null);
            User.create = jest.fn().mockResolvedValue({ userId: 'u1', email: 'u@u.com', name: 'Name' });

            await AuthController.register(req, res, next);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                token: expect.any(String),
                user: { userId: 'u1', email: 'u@u.com', name: 'Name' }
            }));
        });
    });

    describe('login', () => {
        it('401 jika salah email/password', async () => {
            req.body = { email: 'x', password: 'p' };
            User.findOne = jest.fn().mockResolvedValue(null);

            await AuthController.login(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
        });

        it('200 jika sukses', async () => {
            req.body = { email: 'e', password: 'pw' };
            const user = {
                userId: 'u1',
                email: 'e',
                name: 'N',
                picture: 'pic',
                password: 'h',
                comparePassword: jest.fn().mockResolvedValue(true)
            };
            User.findOne = jest.fn().mockResolvedValue(user);

            await AuthController.login(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                token: expect.any(String),
                user: expect.objectContaining({ userId: 'u1', email: 'e', name: 'N', picture: 'pic' })
            }));
        });
    });

    describe('verifyGoogleToken', () => {
        it('400 jika googleToken kosong', async () => {
            await AuthController.verifyGoogleToken(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Google token is required' });
        });

        it('200 jika token valid', async () => {
            req.body.googleToken = 'tok';
            mockVerify.mockResolvedValue({
                getPayload: () => ({ sub: 'id', email: 'e', name: 'N', picture: 'p' })
            });
            User.findOne = jest.fn().mockResolvedValue(null);
            User.findOrCreate = jest.fn().mockResolvedValue([
                { userId: 'id', email: 'e', name: 'N', picture: 'p' },
                true
            ]);

            await AuthController.verifyGoogleToken(req, res, next);

            expect(OAuth2Client).toHaveBeenCalledWith('dummy-client-id');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                token: expect.any(String),
                user: expect.objectContaining({ userId: 'id', email: 'e' })
            }));
        });

        it('401 jika token expired', async () => {
            req.body.googleToken = 'tok';
            const err = new Error('exp');
            err.name = 'TokenExpiredError';
            mockVerify.mockRejectedValue(err);

            await AuthController.verifyGoogleToken(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'Google token has expired' });
        });
    });

    describe('verifySession', () => {
        it('401 jika unauthorized', async () => {
            req.headers.authorization = '';
            await AuthController.verifySession(req, res, next);
            expect(res.status).toHaveBeenCalledWith(401);
        });

        it('200 jika authorized', async () => {
            req.headers.authorization = 'Bearer tk';
            req.user = { userId: 'u1', email: 'e' };
            await AuthController.verifySession(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ token: 'tk', user: req.user });
        });
    });

    describe('refreshToken', () => {
        it('404 jika user tidak ada', async () => {
            req.user = { userId: 'u1' };
            User.findByPk = jest.fn().mockResolvedValue(null);

            await AuthController.refreshToken(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'User tidak ditemukan' });
        });

        it('200 refresh token', async () => {
            req.user = { userId: 'u1' };
            User.findByPk = jest.fn().mockResolvedValue({
                userId: 'u1', email: 'e', name: 'N', picture: 'p'
            });

            await AuthController.refreshToken(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                token: expect.any(String),
                user: expect.objectContaining({ userId: 'u1' })
            }));
        });
    });
});
