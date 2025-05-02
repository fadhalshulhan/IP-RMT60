// __tests__/userController.test.js
jest.mock('../models');
const { User } = require('../models');
const UserController = require('../controllers/userController');

describe('UserController', () => {
    let req, res, next;
    beforeEach(() => {
        req = { user: { userId: 'u1' }, body: {} };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
    });

    it('404 getProfile jika tidak ada', async () => {
        User.findByPk.mockResolvedValue(null);
        await UserController.getProfile(req, res, next);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('200 getProfile berhasil', async () => {
        const u = { userId: 'u1', toJSON: () => ({ userId: 'u1' }) };
        User.findByPk.mockResolvedValue(u);
        await UserController.getProfile(req, res, next);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(u);
    });

    it('404 updateProfile jika tidak ada', async () => {
        User.findByPk.mockResolvedValue(null);
        await UserController.updateProfile(req, res, next);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('200 updateProfile sukses', async () => {
        const u = { userId: 'u1', save: jest.fn(), toJSON: () => ({ userId: 'u1' }) };
        User.findByPk.mockResolvedValue(u);
        req.body = { name: 'New', email: 'e', picture: 'p', password: 'pw' };
        await UserController.updateProfile(req, res, next);
        expect(u.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('404 deleteProfile jika tidak ada', async () => {
        User.findByPk.mockResolvedValue(null);
        await UserController.deleteProfile(req, res, next);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('200 deleteProfile sukses', async () => {
        const u = { destroy: jest.fn() };
        User.findByPk.mockResolvedValue(u);
        await UserController.deleteProfile(req, res, next);
        expect(u.destroy).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
    });
});
