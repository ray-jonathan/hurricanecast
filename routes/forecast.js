const express = require('express');
const Router = express.Router;
const forecastRouter = Router();
const { addForecast, sendForecast } = require('../controllers/forecast');

forecastRouter.post('*', addForecast, sendForecast);

module.exports = forecastRouter;
