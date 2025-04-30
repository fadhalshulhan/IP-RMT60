const OpenAI = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const getCareRecommendation = async (req, res) => {
    const { species, location, light, temperature } = req.body;

    try {
        const chatCompletion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "user",
                    content: `Saya memiliki tanaman ${species} di ${location} dengan kondisi cahaya ${light} dan suhu ${temperature}°C. Berikan rekomendasi perawatan.`,
                },
            ],
        });

        const recommendation = chatCompletion.choices[0].message.content;
        res.status(200).json({ recommendation });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getCareRecommendation };
