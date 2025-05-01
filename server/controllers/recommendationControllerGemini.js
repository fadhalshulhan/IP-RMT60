const { GoogleGenAI } = require("@google/genai");

class RecommendationController {
    static async getCareRecommendation(req, res, next) {
        const genAI = new GoogleGenAI(process.env.GOOGLE_API_KEY);
        const { species, location, light, temperature } = req.body;

        try {
            if (!species || !location || !light || !temperature) {
                const error = new Error("All fields are required");
                error.status = 400;
                throw error;
            }

            const prompt = `Saya memiliki tanaman ${species} di ${location} dengan kondisi cahaya ${light} dan suhu ${temperature}°C. Berikan rekomendasi perawatan yang rinci, termasuk: 
          1. Jadwal penyiraman dan cara menjaga kelembapan tanah.
          2. Frekuensi pemupukan, jenis pupuk yang disarankan, dan rincian unsur hara yang dibutuhkan (seperti nitrogen, fosfor, kalium, dan unsur mikro).
          3. Cara menjaga kelembapan udara.`;
            console.log("🚀 ~ RecommendationController ~ getCareRecommendation ~ prompt:", prompt)

            const response = await genAI.models.generateContent({
                model: "gemini-2.0-flash",
                contents: prompt,
            });
            const recommendation = response.text;
            console.log("🚀 ~ RecommendationController ~ getCareRecommendation ~ response:", response.text)

            res.status(200).json({ recommendation });
        } catch (error) {
            next(error.status ? error : { status: 500, message: error.message });
        }
    }
}

module.exports = RecommendationController;