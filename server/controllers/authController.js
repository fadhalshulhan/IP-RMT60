const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const verifyGoogleToken = async (req, res) => {
    const { googleToken } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: googleToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const user = {
            email: payload.email,
            name: payload.name,
        };

        if (!user) {
            throw { name: "Unauthorized", message: "Invalid email/password" }
        }
        const jwtToken = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token: jwtToken, user });
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = { verifyGoogleToken };