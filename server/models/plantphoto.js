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
    },
    photoUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        isUrl: true,
        len: [10, 500],
      },
    },
    uploadedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    sequelize,
    modelName: 'PlantPhoto',
    tableName: 'PlantPhotos',
    timestamps: true,
  });
  return PlantPhoto;
};