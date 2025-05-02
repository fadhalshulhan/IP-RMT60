// __tests__/errorHandler.test.js
const ErrorHandler = require('../middlewares/errorHandler');

describe('ErrorHandler.errorHandler', () => {
    let res, next;

    beforeEach(() => {
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
    });

    function run(err) {
        ErrorHandler.errorHandler(err, null, res, next);
    }

    it('handles SequelizeValidationError', () => {
        const err = {
            name: 'SequelizeValidationError',
            errors: [{ path: 'email', message: 'cannot be null' }]
        };
        run(err);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            pesan: 'Kesalahan validasi',
            errors: { email: 'cannot be null' }
        });
    });

    it('handles SequelizeUniqueConstraintError', () => {
        const err = {
            name: 'SequelizeUniqueConstraintError',
            errors: [{ path: 'name', message: 'must be unique' }]
        };
        run(err);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            pesan: 'Kesalahan validasi',
            errors: { name: 'must be unique' }
        });
    });

    it('handles BadRequest with errors array', () => {
        const err = {
            name: 'BadRequest',
            errors: [{ path: 'x', message: 'bad' }]
        };
        run(err);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            pesan: 'Kesalahan validasi',
            errors: [{ field: 'x', pesan: 'bad' }]
        });
    });

    it('handles BadRequest without errors array', () => {
        const err = { name: 'BadRequest', message: 'oh no' };
        run(err);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ pesan: 'oh no' });
    });

    it('handles Unauthorized/JsonWebTokenError/TokenExpiredError', () => {
        ['Unauthorized', 'JsonWebTokenError', 'TokenExpiredError'].forEach(name => {
            const err = { name, message: 'denied' };
            run(err);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ pesan: 'denied' });
        });
    });

    it('handles Forbidden', () => {
        run({ name: 'Forbidden' });
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ pesan: 'Akses ditolak' });
    });

    it('handles NotFound', () => {
        run({ name: 'NotFound', message: 'not here' });
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ pesan: 'not here' });
    });

    it('handles AxiosError', () => {
        const err = {
            name: 'AxiosError',
            response: { status: 502, data: { message: 'api down' } }
        };
        run(err);
        expect(res.status).toHaveBeenCalledWith(502);
        expect(res.json).toHaveBeenCalledWith({ pesan: 'api down' });
    });

    it('handles GoogleGenAIError', () => {
        run({ name: 'GoogleGenAIError' });
        expect(res.status).toHaveBeenCalledWith(502);
        expect(res.json).toHaveBeenCalledWith({ pesan: 'Kesalahan saat menghasilkan rekomendasi dari layanan AI' });
    });

    it('handles default error', () => {
        run({ name: 'FooError', message: 'uh oh', status: 418 });
        expect(res.status).toHaveBeenCalledWith(418);
        expect(res.json).toHaveBeenCalledWith({ pesan: 'uh oh' });
    });

    it('handles default error without status/message', () => {
        run({});
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ pesan: 'Kesalahan server internal' });
    });
});
