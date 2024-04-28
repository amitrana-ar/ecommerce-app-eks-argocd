const Sequelize = require('sequelize');

const sequelize = new Sequelize('node-store', 'lahiru', 'Ls@2415698', {
    dialect: 'mysql',
    host: 'localhost'
});

module.exports = sequelize;