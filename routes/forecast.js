const express = require('express');
const Router = express.Router;
const forecastRouter = Router();
const { addForecast, sendForecast } = require('../controllers/forecast');

forecastRouter.post(
	'/',
	(req, res, next) => {
		console.log('made it to the forecastRouter');
		next();
	},
	addForecast,
	sendForecast,
);

module.exports = forecastRouter;
