const express = require('express');
const Router = express.Router;
const subscriberRouter = Router();
const {
	addSubscriber,
	validateSubscriber,
	removeSubscriber,
} = require('../controllers/subscriber');

subscriberRouter.post('add', addSubscriber);
subscriberRouter.post('remove', removeSubscriber);
subscriberRouter.get('validate', validateSubscriber);

module.exports = subscriberRouter;
