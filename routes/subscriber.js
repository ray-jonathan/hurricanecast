const express = require('express');
const Router = express.Router;
const subscriberRouter = Router();
const {
	addSubscriber,
	validateSubscriber,
	removeSubscriber,
} = require('../controllers/subscriber');

//Logging
subscriberRouter.use((req, res, next) => {
	console.log('subscriberRouter:', req.path, req.method, '\n');
	next();
});
subscriberRouter.post('add', addSubscriber);
subscriberRouter.post('remove', removeSubscriber);
subscriberRouter.get('validate', validateSubscriber);

module.exports = subscriberRouter;
