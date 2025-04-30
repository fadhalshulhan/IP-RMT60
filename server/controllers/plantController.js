const { Plant } = require('../models');
const { sendReminderEmail } = require('../config/sendEmail');
const cloudinary = require('../config/cloudinary');

const createPlant = async (req, res) => {
    const { name, species, location, light, temperature } = req.body;
    try {
        const plant = await Plant.create({
            userId: req.user.id,
            name,
            species,
            location,
            light,
            temperature,
        });
        await sendReminderEmail(req.user.email, name, 'menyiram');
        res.status(201).json(plant);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPlants = async (req, res) => {
    try {
        const plants = await Plant.findAll({ where: { userId: req.user.id } });
        res.status(200).json(plants);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updatePlant = async (req, res) => {
    const { id } = req.params;
    const { name, species, location, light, temperature } = req.body;
    try {
        const plant = await Plant.findOne({ where: { id, userId: req.user.id } });
        if (!plant) return res.status(404).json({ message: 'Plant not found' });
        await plant.update({ name, species, location, light, temperature });
        res.status(200).json(plant);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deletePlant = async (req, res) => {
    const { id } = req.params;
    try {
        const plant = await Plant.findOne({ where: { id, userId: req.user.id } });
        if (!plant) return res.status(404).json({ message: 'Plant not found' });
        await plant.destroy();
        res.status(200).json({ message: 'Plant deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const uploadPlantPhoto = async (req, res) => {
    const { id } = req.params;
    const { photo } = req.body;
    try {
        const plant = await Plant.findOne({ where: { id, userId: req.user.id } });
        if (!plant) return res.status(404).json({ message: 'Plant not found' });

        const result = await cloudinary.uploader.upload(photo, {
            folder: 'plant_photos',
        });
        await plant.update({ photoUrl: result.secure_url });
        res.status(200).json({ photoUrl: result.secure_url });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


module.exports = { createPlant, getPlants, updatePlant, deletePlant, uploadPlantPhoto };