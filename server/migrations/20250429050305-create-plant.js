'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Plants', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        allowNull: false,
        type: Sequelize.STRING,
        references: {
          model: 'Users',
          key: 'userId',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING,
        validate: {
          len: [2, 100],
        },
      },
      species: {
        allowNull: false,
        type: Sequelize.STRING,
        validate: {
          len: [2, 100],
        },
      },
      location: {
        allowNull: false,
        type: Sequelize.STRING,
        validate: {
          len: [2, 100],
        },
      },
      light: {
        allowNull: false,
        type: Sequelize.STRING,
        validate: {
          len: [2, 50],
        },
      },
      temperature: {
        allowNull: false,
        type: Sequelize.FLOAT,
        validate: {
          min: -10,
          max: 50,
        },
      },
      careRecommendation: {
        allowNull: true,
        type: Sequelize.TEXT,
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

    await queryInterface.addConstraint('Plants', {
      fields: ['name'],
      type: 'check',
      where: {
        name: {
          [Sequelize.Op.and]: [
            Sequelize.where(Sequelize.fn('LENGTH', Sequelize.col('name')), {
              [Sequelize.Op.gte]: 2,
            }),
            Sequelize.where(Sequelize.fn('LENGTH', Sequelize.col('name')), {
              [Sequelize.Op.lte]: 100,
            }),
          ],
        },
      },
    });

    await queryInterface.addConstraint('Plants', {
      fields: ['species'],
      type: 'check',
      where: {
        species: {
          [Sequelize.Op.and]: [
            Sequelize.where(Sequelize.fn('LENGTH', Sequelize.col('species')), {
              [Sequelize.Op.gte]: 2,
            }),
            Sequelize.where(Sequelize.fn('LENGTH', Sequelize.col('species')), {
              [Sequelize.Op.lte]: 100,
            }),
          ],
        },
      },
    });

    await queryInterface.addConstraint('Plants', {
      fields: ['location'],
      type: 'check',
      where: {
        location: {
          [Sequelize.Op.and]: [
            Sequelize.where(Sequelize.fn('LENGTH', Sequelize.col('location')), {
              [Sequelize.Op.gte]: 2,
            }),
            Sequelize.where(Sequelize.fn('LENGTH', Sequelize.col('location')), {
              [Sequelize.Op.lte]: 100,
            }),
          ],
        },
      },
    });

    await queryInterface.addConstraint('Plants', {
      fields: ['light'],
      type: 'check',
      where: {
        light: {
          [Sequelize.Op.and]: [
            Sequelize.where(Sequelize.fn('LENGTH', Sequelize.col('light')), {
              [Sequelize.Op.gte]: 2,
            }),
            Sequelize.where(Sequelize.fn('LENGTH', Sequelize.col('light')), {
              [Sequelize.Op.lte]: 50,
            }),
          ],
        },
      },
    });

    await queryInterface.addConstraint('Plants', {
      fields: ['temperature'],
      type: 'check',
      where: {
        temperature: {
          [Sequelize.Op.between]: [-10, 50],
        },
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Plants');
  },
};