const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const plantRoutes = require('./routes/plants');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/plants', plantRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;