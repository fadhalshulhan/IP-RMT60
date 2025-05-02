// __tests__/weatherController.test.js
jest.mock('axios');
const axios = require('axios');
const WeatherController = require('../controllers/weatherController');

describe('WeatherController.getWeather', () => {
    let req, res, next;
    beforeEach(() => {
        req = { query: {} };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
    });

    it('400 jika lat/lon kosong', async () => {
        await WeatherController.getWeather(req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('200 sukses', async () => {
        req.query = { lat: 1, lon: 2 };
        axios.get.mockResolvedValue({
            data: {
                main: { temp: 15, humidity: 45 },
                weather: [{ description: 'd', main: 'm' }],
                clouds: { all: 10 },
                name: 'X'
            }
        });
        await WeatherController.getWeather(req, res, next);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            temperature: 15,
            humidity: 45,
            description: 'd',
            main: 'm',
            clouds: { all: 10 },
            location: 'X'
        });
    });

    it('error diteruskan ke next', async () => {
        req.query = { lat: 1, lon: 2 };
        axios.get.mockRejectedValue({ response: { data: { message: 'err' } } });
        await WeatherController.getWeather(req, res, next);
        expect(next).toHaveBeenCalled();
    });
});
