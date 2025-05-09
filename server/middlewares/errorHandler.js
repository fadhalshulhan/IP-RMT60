const ErrorHandler = class {
    static errorHandler(err, req, res, next) {
        // console.error('🚀 ~ ErrorHandler ~ err:', err);

        // Menangani jenis error tertentu
        switch (err.name) {
            // Error validasi dan pelanggaran constraint unik Sequelize
            case 'SequelizeValidationError':
            case 'SequelizeUniqueConstraintError':
                const validationErrors = {};
                err.errors.forEach((error) => {
                    validationErrors[error.path] = error.message;
                });
                return res.status(400).json({
                    pesan: 'Kesalahan validasi',
                    errors: validationErrors
                });

            // Error BadRequest kustom
            case 'BadRequest':
                if (err.errors) {
                    return res.status(400).json({
                        pesan: 'Kesalahan validasi',
                        errors: err.errors.map((error) => ({
                            field: error.path,
                            pesan: error.message
                        }))
                    });
                }
                return res.status(400).json({ pesan: err.message });

            // Error Unauthorized (misalnya, token Google tidak valid, masalah JWT)
            case 'Unauthorized':
            case 'JsonWebTokenError':
            case 'TokenExpiredError':
                return res.status(401).json({ pesan: err.message || 'Tidak diizinkan' });

            // Error Forbidden (misalnya, pengguna mengakses sumber daya yang tidak diizinkan)
            case 'Forbidden':
                return res.status(403).json({ pesan: 'Akses ditolak' });

            // Error NotFound (misalnya, tanaman atau foto tidak ditemukan)
            case 'NotFound':
                return res.status(404).json({ pesan: err.message || 'Sumber daya tidak ditemukan' });

            // Menangani error axios dari API eksternal (misalnya, OpenWeatherMap)
            case 'AxiosError':
                return res.status(err.response?.status || 502).json({
                    pesan: err.response?.data?.message || 'Kesalahan API eksternal'
                });

            // Menangani error spesifik Google GenAI
            case 'GoogleGenAIError':
                return res.status(502).json({
                    pesan: 'Kesalahan saat menghasilkan rekomendasi dari layanan AI'
                });

            // Tangani ServerError dari @google/genai
            case 'ServerError':
                // jika service unavailable
                if (err.error?.code === 503) {
                    return res.status(503).json({
                        pesan: 'Maaf, layanan AI sedang ada gangguan, silakan coba lagi yaa!.'
                    });
                }
                // fallback untuk error GenAI lain
                return res.status(502).json({
                    pesan: 'Kesalahan saat menghasilkan rekomendasi dari layanan AI'
                });

            // Kasus default untuk error yang tidak ditangani
            default:
                return res.status(err.status || 500).json({
                    pesan: err.message || 'Kesalahan server internal'
                });
        }
    }
}

module.exports = ErrorHandler;