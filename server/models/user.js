// user.js
'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Plant, {
        foreignKey: 'userId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }

    async comparePassword(password) {
      return await bcrypt.compare(password, this.password);
    }
  }
  User.init(
    {
      userId: {
        type: DataTypes.STRING, // String untuk Google ID dan UUID
        primaryKey: true,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: { msg: 'Email harus memiliki format yang valid' },
          notEmpty: { msg: 'Email tidak boleh kosong' },
          len: {
            args: [5, 255],
            msg: 'Email harus memiliki panjang antara 5 hingga 255 karakter',
          },
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Nama tidak boleh kosong' },
          len: {
            args: [2, 100],
            msg: 'Nama harus memiliki panjang antara 2 hingga 100 karakter',
          },
        },
      },
      picture: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isUrl: { msg: 'Picture harus berupa URL yang valid' },
          len: {
            args: [0, 500],
            msg: 'Picture harus memiliki panjang maksimal 500 karakter',
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true, // Null untuk user Google
        validate: {
          len: {
            args: [8, 100],
            msg: 'Password harus memiliki panjang antara 8 hingga 100 karakter',
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'Users',
      timestamps: true,
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            user.password = await bcrypt.hash(user.password, 10);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed('password') && user.password) {
            user.password = await bcrypt.hash(user.password, 10);
          }
        },
      },
    }
  );
  return User;
};