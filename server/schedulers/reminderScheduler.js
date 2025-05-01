const cron = require('node-cron');
const { Plant } = require('../models');
const { sendReminderEmail } = require('../config/sendEmail');

const scheduleReminders = () => {
    cron.schedule('0 8 * * *', async () => {
        try {
            const plants = await Plant.findAll();
            for (const plant of plants) {
                await sendReminderEmail(plant.user.email, plant.name, 'menyiram');
            }
            console.log('Pengingat email berhasil dikirim');
        } catch (error) {
            console.error('Gagal mengirim pengingat:', error);
        }
    });
};

module.exports = { scheduleReminders };