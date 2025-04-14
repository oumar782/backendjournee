const { Sequelize } = require('sequelize');

// Utilise directement la DATABASE_URL (c’est ce que Neon te donne)
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // important pour les connexions cloud (Neon)
    }
  },
  logging: false // désactive les logs SQL si t’en veux pas
});

module.exports = sequelize;
