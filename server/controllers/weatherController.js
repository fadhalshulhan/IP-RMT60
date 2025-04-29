const axios = require('axios');

const getWeather = async (req, res) => {
    const { city } = req.query;
    try {
        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.OPENWEATHERMAP_API_KEY}&units=metric`
        );
        const weather = {
            temperature: response.data.main.temp,
            humidity: response.data.main.humidity,
            description: response.data.weather[0].description,
        };
        res.status(200).json(weather);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getWeather };