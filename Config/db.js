// Config/db.js
const { Sequelize } = require('sequelize');
const sql = postgres(process.env.DATABASE_URL,  { ssl: 'verify-full' });

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  }
);


module.exports = sequelize;
