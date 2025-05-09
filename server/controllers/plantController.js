const { GoogleGenAI } = require("@google/genai");
const { Plant, PlantPhoto } = require('../models');
const cloudinary = require("../config/cloudinary");
const EmailController = require("./EmailController");

class PlantController {
    static async createPlant(req, res, next) {
        try {
            const { name, species, location, light, temperature, photo } = req.body;

            if (!name || !species || !location || !light || !temperature) {
                return res.status(400).json({ message: "All fields are required" });
            }

            const genAI = new GoogleGenAI(process.env.GOOGLE_API_KEY);
            const prompt = `Saya memiliki tanaman ${species} di ${location} dengan kondisi cahaya ${light} dan suhu ${temperature}°C. Berikan rekomendasi perawatan yang rinci, termasuk: 
1. Jadwal penyiraman dan cara menjaga kelembapan tanah.
2. Frekuensi pemupukan, jenis pupuk yang disarankan, dan rincian unsur hara yang dibutuhkan (seperti nitrogen, fosfor, kalium, dan unsur mikro).
3. Cara menjaga kelembapan udara.`;

            const response = await genAI.models.generateContent({
                model: "gemini-2.0-flash",
                contents: prompt,
            });

            // === validasi respons AI ===
            const candidate = response?.candidates?.[0];
            const content = candidate?.content;
            let recommendation;
            if (!content) {
                return res.status(502).json({ pesan: 'Kesalahan saat menghasilkan rekomendasi dari layanan AI' });
            }
            if (content.parts?.[0]?.text) {
                recommendation = content.parts[0].text;
            } else if (content.text) {
                recommendation = content.text;
            } else {
                return res.status(502).json({ pesan: 'Kesalahan saat menghasilkan rekomendasi dari layanan AI' });
            }

            // === simpan tanaman ===
            const plant = await Plant.create({
                userId: req.user.userId,
                name, species, location, light, temperature,
                careRecommendation: recommendation,
            });

            // === upload foto (opsional) ===
            if (photo) {
                const result = await cloudinary.uploader.upload(photo, { folder: "plant_photos" });
                await PlantPhoto.create({
                    plantId: plant.id,
                    photoUrl: result.secure_url,
                    uploadedAt: new Date(),
                });
            }

            // === kirim email pengingat ===
            await EmailController.sendReminderEmail(req.user.email, name, recommendation);
            const plantData = plant.toJSON
                ? plant.toJSON()
                : { ...plant };
            return res.status(201).json({
                plant: plantData,
                message: "Plant created and email sent successfully",
            });
        } catch (error) {
            console.error("Error in createPlant:", error);
            next(error);
        }
    }

    static async predictSpecies(req, res, next) {
        try {
            const { name } = req.body;

            if (!name) {
                return res.status(400).json({ message: "Nama tanaman diperlukan" });
            }

            const genAI = new GoogleGenAI(process.env.GOOGLE_API_KEY);
            const prompt = `Berdasarkan nama tanaman "${name}", prediksi spesies tanaman yang paling mungkin. Berikan hanya nama spesies (contoh: Monstera deliciosa) tanpa penjelasan tambahan.`;

            const response = await genAI.models.generateContent({
                model: "gemini-2.0-flash",
                contents: prompt,
            });

            // Validasi respons AI
            const candidate = response?.candidates?.[0];
            const content = candidate?.content;
            let species;
            if (!content) {
                return res.status(502).json({ message: "Kesalahan saat menghasilkan prediksi dari layanan AI" });
            }
            if (content.parts?.[0]?.text) {
                species = content.parts[0].text.trim();
            } else if (content.text) {
                species = content.text.trim();
            } else {
                return res.status(502).json({ message: "Kesalahan saat menghasilkan prediksi dari layanan AI" });
            }

            return res.status(200).json({ species });
        } catch (error) {
            console.error("Error in predictSpecies:", error);
            next(error);
        }
    }

    static async getPlants(req, res, next) {
        try {
            const plants = await Plant.findAll({
                where: { userId: req.user.userId },
                include: [{ model: PlantPhoto, as: "PlantPhotos" }],
                order: [['createdAt', 'DESC']],
            });
            res.status(200).json(plants);
        } catch (error) {
            next(error);
        }
    }

    static async updatePlant(req, res, next) {
        try {
            const { id } = req.params;
            const { name, species, location, light, temperature, photo } = req.body;

            const plant = await Plant.findOne({ where: { id, userId: req.user.userId } });
            if (!plant) return res.status(404).json({ message: "Plant not found" });

            await plant.update({ name, species, location, light, temperature });

            if (photo) {
                const result = await cloudinary.uploader.upload(photo, {
                    folder: "plant_photos",
                });
                await PlantPhoto.create({
                    plantId: plant.id,
                    photoUrl: result.secure_url,
                    uploadedAt: new Date(),
                });
            }

            const updatedPlant = await Plant.findOne({
                where: { id },
                include: [{ model: PlantPhoto, as: "PlantPhotos" }],
            });

            res.status(200).json(updatedPlant);
        } catch (error) {
            next(error);
        }
    }

    static async deletePlant(req, res, next) {
        try {
            const { id } = req.params;
            const plant = await Plant.findOne({ where: { id, userId: req.user.userId } });
            if (!plant) return res.status(404).json({ message: 'Plant not found' });

            await PlantPhoto.destroy({ where: { plantId: id } });
            await plant.destroy();

            res.status(200).json({ message: 'Plant deleted' });
        } catch (error) {
            next(error);
        }
    }

    static async deletePlantPhoto(req, res, next) {
        try {
            const photo = await PlantPhoto.findOne({ where: { id: req.params.photoId } });
            if (!photo) {
                return res.status(404).json({ message: 'Photo not found' });
            }

            const plant = await Plant.findOne({
                where: { id: photo.plantId, userId: req.user.userId }
            });
            if (!plant) {
                return res.status(403).json({ message: 'Unauthorized' });
            }

            if (!photo.photoUrl) {
                return res.status(400).json({ pesan: 'Photo URL is missing' });
            }

            // hitung publicId → 'plant_photos/photo'
            const parts = photo.photoUrl.split('/');
            const fileName = parts[parts.length - 1].split('.')[0];
            const publicId = `plant_photos/${fileName}`;

            await cloudinary.uploader.destroy(publicId);
            await PlantPhoto.destroy({ where: { id: photo.id } });

            // fetch ulang utk response
            const updatedPlant = await Plant.findOne({
                where: { id: plant.id },
                include: [{ model: PlantPhoto, as: 'PlantPhotos' }],
            });

            return res.status(200).json(updatedPlant);
        } catch (err) {
            next(err);
        }
    }

    static async addPlantPhoto(req, res, next) {
        try {
            const { plantId } = req.params;
            const { photoUrl, uploadedAt } = req.body;

            // Validasi plant
            const plant = await Plant.findOne({ where: { id: plantId, userId: req.user.userId } });
            if (!plant) {
                return res.status(404).json({ message: "Plant not found or unauthorized" });
            }

            // Validasi input
            if (!photoUrl || !uploadedAt) {
                return res.status(400).json({ message: "Photo URL and uploadedAt are required" });
            }

            // Validasi uploadedAt
            if (isNaN(new Date(uploadedAt).getTime())) {
                return res.status(400).json({ message: "Invalid uploadedAt format. Please provide a valid ISO date." });
            }

            // (Opsional) Validasi bahwa photoUrl adalah URL
            if (!photoUrl.startsWith("https://")) {
                return res.status(400).json({ message: "Invalid photo URL. Please provide a valid URL starting with https://." });
            }

            // Simpan ke database
            await PlantPhoto.create({
                plantId: plant.id,
                photoUrl, // Langsung simpan URL dari Cloudinary
                uploadedAt: new Date(uploadedAt),
            });

            // Ambil data tanaman yang diperbarui
            const updatedPlant = await Plant.findOne({
                where: { id: plant.id },
                include: [{ model: PlantPhoto, as: "PlantPhotos" }],
            });

            res.status(201).json(updatedPlant);
        } catch (error) {
            console.error("Error in addPlantPhoto:", error);
            next(error);
        }
    }
}

module.exports = PlantController;
