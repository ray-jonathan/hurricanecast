const express = require('express');
const Router = express.Router;
const subscriberRouter = Router();
const {
	addSubscriber,
	validateSubscriber,
	removeSubscriber,
	requestRemoveSubscriber,
} = require('../controllers/subscriber');

subscriberRouter.post('/request-add', addSubscriber);
subscriberRouter.get('/add', validateSubscriber);
subscriberRouter.post('/request-remove', requestRemoveSubscriber);
subscriberRouter.get('/remove', removeSubscriber);

module.exports = subscriberRouter;
