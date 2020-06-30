const express = require('express');
const Router = express.Router;
const subscriberRouter = Router();
const {
	addSubscriber,
	validateSubscriber,
	removeSubscriber,
} = require('../controllers/subscriber');

//Logging
subscriberRouter.post('*', (req, res, next) => {
	console.log('made it to the subscriberRouter');
	next();
});

subscriberRouter.post('/add', addSubscriber);
subscriberRouter.post('/remove', removeSubscriber);
subscriberRouter.get('/validate', validateSubscriber);

module.exports = subscriberRouter;
