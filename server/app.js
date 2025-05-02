const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const plantRoutes = require('./routes/plants');
const recommendationRoutes = require('./routes/recommendation');
const weatherRoutes = require('./routes/weather');
const ErrorHandler = require('./middlewares/errorHandler');
const userRoutes = require("./routes/users");

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
    console.log({ env: process.env.NODE_ENV });
}

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/plants', plantRoutes);
app.use('/api/recommendation', recommendationRoutes);
app.use('/api/weather', weatherRoutes);
app.use("/api/users", userRoutes);

// Test-only routes harus di-register SEBELUM ErrorHandler
if (process.env.NODE_ENV === 'test') {
    app.get('/trigger-error', (req, res, next) => next(new Error()));
    app.get('/trigger-custom-error', (req, res, next) => {
        const err = new Error('Custom error');
        err.status = 418;
        next(err);
    });
    app.get('/api/test/session', (req, res) => {
        res.status(200).json({ token: 'mocktoken', user: { id: 1 } });
    });
}

app.use(ErrorHandler.errorHandler);

module.exports = app;