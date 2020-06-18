const DB_HOST = process.env.DB_HOST;
const DB_NAME = process.env.DB_NAME;
const pgp = require('pg-promise')();

const options = {
	host: DB_HOST,
	database: DB_NAME,
};

const db = pgp(options);
module.exports = db;
