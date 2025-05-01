const axios = require('axios');

class WeatherController {
    static async getWeather(req, res, next) {
        const { lat, lon } = req.query;
        try {
            if (!lat || !lon) {
                const error = new Error("Latitude and longitude are required");
                error.status = 400;
                throw error;
            }

            const response = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHERMAP_API_KEY}&units=metric&lang=id`
            );
            const weather = {
                temperature: response.data.main.temp, // 29.87°C
                humidity: response.data.main.humidity, // 64%
                description: response.data.weather[0].description, // "overcast clouds"
                main: response.data.weather[0].main, // "Clouds"
                clouds: {
                    all: response.data.clouds.all // 96
                },
                location: response.data.name // e.g "Serpong"
            };
            res.status(200).json(weather);
        } catch (error) {
            console.log('Error in WeatherController.getWeather:', error);
            const message = error.response?.data?.message || error.message || 'tidak ada data';
            next(new Error(message));
        }
    }
}

module.exports = WeatherController;