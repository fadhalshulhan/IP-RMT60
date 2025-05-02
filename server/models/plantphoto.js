'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PlantPhoto extends Model {
    static associate(models) {
      PlantPhoto.belongsTo(models.Plant, {
        foreignKey: 'plantId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }
  PlantPhoto.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    plantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Plants',
        key: 'id',
      },
      validate: {
        notNull: {
          msg: 'Plant ID harus diisi.'
        },
        isInt: {
          msg: 'Plant ID harus berupa angka.'
        }
      },
    },
    photoUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'URL foto harus diisi.'
        },
        notEmpty: {
          msg: 'URL foto tidak boleh kosong.'
        },
        isUrl: {
          msg: 'URL foto harus berupa URL yang valid.'
        },
        len: {
          args: [10, 500],
          msg: 'URL foto harus memiliki panjang antara 10 hingga 500 karakter.'
        }
      },
    },
    uploadedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      validate: {
        notNull: {
          msg: 'Tanggal upload harus diisi.'
        },
        isDate: {
          msg: 'Tanggal upload harus berupa tanggal yang valid.'
        }
      },
    },
  }, {
    sequelize,
    modelName: 'PlantPhoto',
    tableName: 'PlantPhotos',
    timestamps: true,
  });
  return PlantPhoto;
};