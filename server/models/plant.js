'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Plant extends Model {
    static associate(models) {
      Plant.belongsTo(models.User, {
        foreignKey: 'userId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
      Plant.hasMany(models.PlantPhoto, {
        foreignKey: 'plantId',
        as: 'PlantPhotos',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }
  Plant.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'userId',
      },
      validate: {
        notNull: {
          msg: 'User ID harus diisi.'
        },
        notEmpty: {
          msg: 'User ID tidak boleh kosong.'
        },
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Nama tanaman harus diisi.'
        },
        notEmpty: {
          msg: 'Nama tanaman tidak boleh kosong.'
        },
        len: {
          args: [2, 100],
          msg: 'Nama tanaman harus memiliki panjang antara 2 hingga 100 karakter.'
        },
      },
    },
    species: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Spesies tanaman harus diisi.'
        },
        notEmpty: {
          msg: 'Spesies tanaman tidak boleh kosong.'
        },
        len: {
          args: [2, 100],
          msg: 'Spesies tanaman harus memiliki panjang antara 2 hingga 100 karakter.'
        },
      },
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Lokasi tanaman harus diisi.'
        },
        notEmpty: {
          msg: 'Lokasi tanaman tidak boleh kosong.'
        },
        len: {
          args: [2, 100],
          msg: 'Lokasi tanaman harus memiliki panjang antara 2 hingga 100 karakter.'
        },
      },
    },
    light: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Kondisi cahaya harus diisi.'
        },
        notEmpty: {
          msg: 'Kondisi cahaya tidak boleh kosong.'
        },
        len: {
          args: [2, 50],
          msg: 'Kondisi cahaya harus memiliki panjang antara 2 hingga 50 karakter.'
        },
      },
    },
    temperature: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Suhu harus diisi.'
        },
        isFloat: {
          msg: 'Suhu harus berupa angka desimal.'
        },
        min: {
          args: -10,
          msg: 'Suhu minimal adalah -10°C.'
        },
        max: {
          args: 50,
          msg: 'Suhu maksimal adalah 50°C.'
        },
      },
    },
    careRecommendation: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Plant',
    tableName: 'Plants',
    timestamps: true,
  });
  return Plant;
};