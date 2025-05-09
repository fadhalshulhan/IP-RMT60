require('dotenv').config();
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');
const { Token } = require('../models');

// Inisialisasi OAuth2 Client di luar class
const oAuth2Client = new OAuth2Client(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
);

class EmailController {
    // Fungsi untuk memuat token dari database
    static async loadTokens() {
        try {
            const token = await Token.findOne();
            if (!token) return null;
            return {
                refresh_token: token.refreshToken,
                access_token: token.accessToken,
                expiry_date: token.expiryDate ? token.expiryDate.getTime() : null,
            };
        } catch (error) {
            console.error("Error loading tokens from database:", error);
            return null;
        }
    }

    // Fungsi untuk menyimpan token ke database
    static async saveTokens(tokens) {
        try {
            let token = await Token.findOne();
            if (token) {
                // Update token yang ada
                await token.update({
                    refreshToken: tokens.refresh_token || token.refreshToken,
                    accessToken: tokens.access_token || token.accessToken,
                    expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : token.expiryDate,
                });
            } else {
                // Buat token baru
                await Token.create({
                    refreshToken: tokens.refresh_token,
                    accessToken: tokens.access_token,
                    expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
                });
            }
        } catch (error) {
            console.error("Error saving tokens to database:", error);
            throw error;
        }
    }

    // Fungsi untuk mendapatkan OAuth2 client
    static async getOAuth2Client() {
        let tokens = await this.loadTokens();
        if (tokens) {
            oAuth2Client.setCredentials(tokens);
            try {
                await oAuth2Client.getAccessToken();
            } catch (error) {
                if (error.message.includes('invalid_grant')) {
                    console.log('Refresh token invalid, requesting new authorization...');
                    tokens = null; // Token tidak valid, hapus token lama
                }
            }
        }

        if (!tokens) {
            const authUrl = oAuth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: ['https://mail.google.com/'],
                prompt: 'consent',
            });
            console.log('Authorize this app by visiting this url:', authUrl);
            throw new Error('No valid tokens found. Please authorize the app using the URL above.');
        }

        oAuth2Client.on('tokens', async (tokens) => {
            if (tokens.refresh_token) {
                await this.saveTokens({
                    refresh_token: tokens.refresh_token,
                    access_token: tokens.access_token,
                    expiry_date: tokens.expiry_date,
                });
            }
        });

        return oAuth2Client;
    }

    // Fungsi untuk membuat transporter Nodemailer dengan OAuth2
    static async createTransporter() {
        const auth = await this.getOAuth2Client();
        return nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                type: "OAuth2",
                user: process.env.GMAIL_EMAIL_USER,
                clientId: process.env.GMAIL_CLIENT_ID,
                clientSecret: process.env.GMAIL_CLIENT_SECRET,
                accessToken: (await auth.getAccessToken()).token,
            },
            authMethod: "XOAUTH2",
        });
    }

    // Endpoint untuk mendapatkan URL autentikasi
    static async getAuthUrl(req, res, next) {
        try {
            const authUrl = oAuth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: ['https://mail.google.com/'],
                prompt: 'consent',
            });
            res.json({ authUrl });
        } catch (error) {
            console.error("!!! getAuthUrl error:", error.response?.data || error.message);
            next(error);
        }
    }

    // Endpoint untuk menangani callback Gmail OAuth
    static async handleGmailCallback(req, res, next) {
        try {
            const code = req.query.code;
            if (!code) {
                return res.status(400).json({ message: "No authorization code provided." });
            }

            const { tokens } = await oAuth2Client.getToken(code);
            oAuth2Client.setCredentials(tokens);
            await EmailController.saveTokens(tokens); // Panggil secara eksplisit

            res.json({ message: "Authentication successful! Tokens have been saved." });
        } catch (error) {
            console.error("!!! handleGmailCallback error:", error);
            next(error);
        }
    }
    static async sendReminderEmail(to, plantName, recommendation) {
        const transporter = await this.createTransporter();

        const formatRecommendation = (recommendation) => {
            if (!recommendation) {
                return `<p style="color: #333333; line-height: 1.6; font-size: 14px;">Tidak ada panduan perawatan yang tersedia.</p>`;
            }

            const introMatch = recommendation.match(
                /^Tentu, berikut adalah rekomendasi perawatan rinci untuk tanaman Rosa \(Mawar\) Anda di dalam ruangan dengan kondisi cahaya terang tidak langsung dan suhu 25°C:/
            );
            const introTextRaw = introMatch ? introMatch[0] : null;
            const introText = introTextRaw
                ? introTextRaw.replace(
                    "Tentu, berikut adalah ",
                    "Rekomendasi perawatan rinci untuk tanaman Rosa (Mawar) Anda di dalam ruangan dengan kondisi cahaya terang tidak langsung dan suhu 25°C:"
                )
                : `Rekomendasi perawatan rinci untuk tanaman <strong>${plantName}</strong> Anda di dalam ruangan dengan kondisi cahaya terang tidak langsung dan suhu 25°C:`;

            const cleanedRecommendation = introTextRaw
                ? recommendation.replace(introTextRaw, "").trim()
                : recommendation;

            const conclusionMatch = cleanedRecommendation.match(
                /Dengan perawatan yang tepat, tanaman mawar Anda akan tumbuh subur dan menghasilkan bunga yang indah di dalam ruangan\./
            );
            const conclusionText = conclusionMatch ? conclusionMatch[0] : null;

            const finalRecommendation = conclusionText
                ? cleanedRecommendation.replace(conclusionText, "").trim()
                : cleanedRecommendation;

            const sections = finalRecommendation
                .split(/\d+\.\s/)
                .filter((section) => section.trim() !== "");

            if (sections.length >= 3) {
                sections[2] = sections[2] + (sections[3] ? "\n\n" + sections[3] : "");
                sections.splice(3, 1);
            }

            let html = '';
            if (introText) {
                html += `<p style="color: #333333; line-height: 1.6; margin-bottom: 24px; font-size: 14px;">${introText}</p>`;
            }

            sections.forEach((section, index) => {
                const sectionTitle = index === 0
                    ? "Jadwal Penyiraman dan Cara Menjaga Kelembapan Tanah"
                    : index === 1
                        ? "Frekuensi Pemupukan, Jenis Pupuk, dan Unsur Hara"
                        : index === 2
                            ? "Cara Menjaga Kelembapan Udara dan Tips Tambahan"
                            : null;

                if (!sectionTitle) return;

                const cleanSection = section
                    .replace(/\*\*/g, "")
                    .replace(/\*\s/g, "");

                const parts = cleanSection
                    .split(/\n+/)
                    .filter((part) => part.trim() !== "");
                const formattedSubsections = [];
                let currentSubsection = null;

                parts.forEach((part) => {
                    if (part.trim().endsWith(":")) {
                        const heading = part.trim().slice(0, -1);
                        if (
                            heading === sectionTitle ||
                            heading === "Jadwal Penyiraman dan Cara Menjaga Kelembapan Tanah" ||
                            heading === "Frekuensi Pemupukan, Jenis Pupuk, dan Unsur Hara" ||
                            heading === "Cara Menjaga Kelembapan Udara"
                        ) {
                            return;
                        }
                        currentSubsection = { heading, content: [] };
                        formattedSubsections.push(currentSubsection);
                    } else if (currentSubsection) {
                        currentSubsection.content.push(part.trim());
                    }
                });

                html += `
                    <div style="margin-bottom: 24px;">
                        <h4 style="font-size: 16px; font-weight: 600; color: #1B5E20; margin-bottom: 8px; text-transform: uppercase;">${sectionTitle}</h4>
                        ${formattedSubsections.map((subsection) => (
                    subsection.content.length > 0 ? `
                                <div style="margin-left: 16px; margin-bottom: 16px;">
                                    <h5 style="font-size: 14px; font-weight: 600; color: #333333;">${subsection.heading}</h5>
                                    ${subsection.content.length > 1 || subsection.content[0].includes(':')
                            ? `<ul style="list-style-type: disc; margin-left: 24px; color: #333333; line-height: 1.6; margin-top: 4px; font-size: 14px;">
                                            ${subsection.content.map((item) => `<li>${item}</li>`).join('')}
                                        </ul>`
                            : `<p style="color: #333333; line-height: 1.6; margin-top: 4px; font-size: 14px;">${subsection.content[0]}</p>`
                        }
                                </div>
                            ` : ''
                )).join('')}
                    </div>
                `;
            });

            if (conclusionText) {
                html += `
                    <div style="margin-bottom: 24px;">
                        <h4 style="font-size: 16px; font-weight: 600; color: #1B5E20; margin-bottom: 8px; text-transform: uppercase;">Kesimpulan</h4>
                        <p style="color: #333333; line-height: 1.6; font-size: 14px;">${conclusionText}</p>
                    </div>
                `;
            }

            return html;
        };

        const mailOptions = {
            from: process.env.GMAIL_EMAIL_USER,
            to,
            subject: `Pengingat Perawatan Tanaman: ${plantName}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E0E0E0; border-radius: 8px;">
                    <h2 style="color: #1B5E20; text-align: center; font-size: 24px;">PENGINGAT PERAWATAN TANAMAN</h2>
                    <p style="color: #333333; text-align: center; font-size: 16px;">Halo, berikut adalah rekomendasi perawatan untuk tanaman <strong>${plantName}</strong> Anda:</p>
                    ${formatRecommendation(recommendation)}
                    <p style="color: #333333; text-align: center; margin-top: 30px; font-size: 14px;">Terima kasih telah menggunakan Platform Plant Planner 🌱</p>
                </div>
            `,
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log("Email sent successfully");
        } catch (error) {
            console.error("Error sending email:", error);
            throw error;
        }
    }
}

module.exports = EmailController;