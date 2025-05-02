'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PlantPhotos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      plantId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Plants',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      photoUrl: {
        allowNull: false,
        type: Sequelize.STRING,
        validate: {
          len: [10, 500],
        },
      },
      uploadedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addConstraint('PlantPhotos', {
      fields: ['photoUrl'],
      type: 'check',
      where: {
        photoUrl: {
          [Sequelize.Op.and]: [
            Sequelize.where(Sequelize.fn('LENGTH', Sequelize.col('photoUrl')), {
              [Sequelize.Op.gte]: 10,
            }),
            Sequelize.where(Sequelize.fn('LENGTH', Sequelize.col('photoUrl')), {
              [Sequelize.Op.lte]: 500,
            }),
          ],
        },
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('PlantPhotos');
  },
};