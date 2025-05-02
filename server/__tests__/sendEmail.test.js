jest.mock('nodemailer');
const nodemailer = require('nodemailer');
const { sendReminderEmail, formatRecommendation } = require('../config/sendEmail');

describe('sendReminderEmail', () => {
    beforeAll(() => {
        process.env.GMAIL_EMAIL_USER = 'u@example.com';
        process.env.GOOGLE_CLIENT_ID = 'cid';
        process.env.GOOGLE_CLIENT_SECRET = 'cs';
        process.env.GMAIL_REFRESH_TOKEN = 'rt';
    });

    beforeEach(() => {
        const sendMail = jest.fn().mockResolvedValue({});
        nodemailer.createTransport.mockReturnValue({ sendMail });
    });

    it('sends email successfully', async () => {
        const transporter = nodemailer.createTransport();
        const sendMail = transporter.sendMail;
        await sendReminderEmail('to@mail', 'Rose', 'rec');

        expect(nodemailer.createTransport).toHaveBeenCalledWith(
            expect.objectContaining({ auth: expect.objectContaining({ user: 'u@example.com' }) })
        );
        expect(sendMail).toHaveBeenCalledWith(
            expect.objectContaining({
                from: 'u@example.com',
                to: 'to@mail',
                subject: expect.stringContaining('Rose'),
                html: expect.any(String)
            })
        );
    });

    it('throws on invalid_grant', async () => {
        const transporter = nodemailer.createTransport();
        transporter.sendMail.mockRejectedValueOnce(new Error('invalid_grant'));
        await expect(sendReminderEmail('to', 'R', 'x'))
            .rejects.toThrow(/Refresh Token invalid/);
    });

    it('rethrows other errors', async () => {
        const transporter = nodemailer.createTransport();
        transporter.sendMail.mockRejectedValueOnce(new Error('oops'));
        await expect(sendReminderEmail('t', 'P', 'r'))
            .rejects.toThrow('oops');
    });
});

describe('formatRecommendation', () => {
    it('no recommendation placeholder', () => {
        const html = formatRecommendation('');
        expect(html).toContain('Tidak ada panduan perawatan yang tersedia');
    });

    it('splits sections and conclusion', () => {
        const rec = `Tentu, berikut adalah rekomendasi perawatan rinci untuk tanaman Rosa (Mawar)…
1. Bagian A
2. Bagian B
3. Bagian C
Dengan perawatan yang tepat, tanaman mawar Anda akan tumbuh subur dan menghasilkan bunga yang indah di dalam ruangan.`;
        const html = formatRecommendation(rec);
        expect(html).toContain('Jadwal Penyiraman dan Cara Menjaga Kelembapan Tanah');
        expect(html).toContain('Kesimpulan');
    });
});
