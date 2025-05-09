require('dotenv').config();
const nodemailer = require('nodemailer');

// Konfigurasi Nodemailer dengan autentikasi berbasis user dan pass
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_EMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

const sendReminderEmail = async (to, plantName, recommendation) => {
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
            sections.splice(3, 1); // Remove the Tips Tambahan section
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
};

module.exports = { sendReminderEmail };