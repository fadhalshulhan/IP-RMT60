const { User } = require("../models");
const bcrypt = require("bcryptjs");

class UserController {
    static async getProfile(req, res, next) {
        try {
            const user = await User.findByPk(req.user.userId);
            if (!user) {
                return res.status(404).json({ message: "User tidak ditemukan" });
            }
            res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    }

    static async updateProfile(req, res, next) {
        const { name, email, picture, password } = req.body;

        try {
            const user = await User.findByPk(req.user.userId);
            if (!user) {
                return res.status(404).json({ message: "User tidak ditemukan" });
            }

            // Update data user
            user.name = name || user.name;
            user.email = email || user.email;
            user.picture = picture || user.picture;

            if (password) {
                console.log("Password sebelum update:", password);
                user.password = password;
            }

            await user.save();
            console.log("User setelah save:", user.toJSON());
            res.status(200).json(user);
        } catch (error) {
            console.error("Error saat update profil:", error);
            next(error);
        }
    }

    static async deleteProfile(req, res, next) {
        try {
            const user = await User.findByPk(req.user.userId);
            if (!user) {
                return res.status(404).json({ message: "User tidak ditemukan" });
            }

            await user.destroy();
            res.status(200).json({ message: "Akun berhasil dihapus" });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = UserController;