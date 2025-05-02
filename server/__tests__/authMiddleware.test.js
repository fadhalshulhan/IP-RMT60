// __tests__/authMiddleware.test.js
process.env.JWT_SECRET = 'testsecret';

const jwt = require('jsonwebtoken');
const { authenticate } = require('../middlewares/authMiddleware');
const { User } = require('../models');

jest.mock('../models');

describe('authenticate', () => {
    let req, res, next;

    beforeEach(() => {
        req = { headers: {} };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
    });

    it('401 if missing header', async () => {
        await authenticate(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid authorization header' });
    });

    it('401 if no token after Bearer', async () => {
        req.headers.authorization = 'Bearer ';
        await authenticate(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'No token provided' });
    });

    it('500 if no JWT_SECRET', async () => {
        delete process.env.JWT_SECRET;
        req.headers.authorization = 'Bearer tok';
        await authenticate(req, res, next);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Server configuration error: JWT_SECRET not defined' });
        process.env.JWT_SECRET = 'testsecret';
    });

    it('401 if jwt.verify throws JsonWebTokenError', async () => {
        req.headers.authorization = 'Bearer badtoken';
        jwt.verify = jest.fn(() => { const e = new Error(); e.name = 'JsonWebTokenError'; throw e; });
        await authenticate(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Malformed token' });
    });

    it('401 if jwt.verify throws TokenExpiredError', async () => {
        req.headers.authorization = 'Bearer badtoken';
        jwt.verify = jest.fn(() => { const e = new Error(); e.name = 'TokenExpiredError'; throw e; });
        await authenticate(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Token has expired' });
    });

    it('401 if user not found', async () => {
        req.headers.authorization = 'Bearer ok';
        jwt.verify = jest.fn(() => ({ userId: 'u1' }));
        User.findByPk.mockResolvedValue(null);
        await authenticate(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('calls next() if everything valid', async () => {
        req.headers.authorization = 'Bearer ok';
        jwt.verify = jest.fn(() => ({ userId: 'u1' }));
        User.findByPk.mockResolvedValue({ userId: 'u1', email: 'e', name: 'n', picture: 'p' });
        await authenticate(req, res, next);
        expect(req.user).toEqual({ userId: 'u1', email: 'e', name: 'n', picture: 'p' });
        expect(next).toHaveBeenCalled();
    });
});
