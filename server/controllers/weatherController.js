const axios = require('axios');

class WeatherController {
    static async getWeather(req, res, next) {
        try {
            const { lat, lon } = req.query;
            if (!lat || !lon) {
                return res.status(400).json({ message: "Latitude and longitude are required" });
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