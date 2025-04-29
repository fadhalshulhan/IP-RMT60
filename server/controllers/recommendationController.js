const axios = require('axios');

const getCareRecommendation = async (req, res) => {
    const { species, location, light, temperature } = req.body;
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'user',
                        content: `Saya memiliki tanaman ${species} di ${location} dengan kondisi cahaya ${light} dan suhu ${temperature}°C. Berikan rekomendasi perawatan.`,
                    },
                ],
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        const recommendation = response.data.choices[0].message.content;
        res.status(200).json({ recommendation });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getCareRecommendation };