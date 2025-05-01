const app = require('../app');

const PORT = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 3000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
