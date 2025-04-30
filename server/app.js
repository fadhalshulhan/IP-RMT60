const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const plantRoutes = require('./routes/plants');
const recommendationRoutes = require('./routes/recommendation');
const weatherRoutes = require('./routes/weather');

const { sendReminderEmail } = require('./config/sendEmail');

const main = async () => {
    try {
        await sendReminderEmail(
            "heydhal.com@gmail.com", // Ganti dengan email tujuan yang valid
            "Monstera",
            "menyiram"
        );
    } catch (error) {
        console.error("Failed to send email:", error);
    }
};

main();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/plants', plantRoutes);
app.use('/api/recommendation', recommendationRoutes);
app.use('/api/weather', weatherRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;