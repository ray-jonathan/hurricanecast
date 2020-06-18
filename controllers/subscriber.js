const Subscriber = require('../models/subscriber');
const escapeHtml = require('escape-html');
const sendEmail = require('../models/ses');

async function addSubscriber(req, res) {
	try {
		const { email } = req.body;
		const newSubscriber = await Subscriber.add({ email: escapeHtml(email) });
		if (!newSubscriber.id) res.sendStatus(503);
		const params = {
			subject: 'Confirm Your Subscription with HurricaneCast',
			body_text: `Thank you for expressing interest in receiving emails from HurricaneCast!
      To ensure we only send forecasts to those wanting them, please click the following link to confirm your subscription:
      http://email.hurricanehunt.com/subscribe/validate?email=${encodeURI(
				newSubscriber.email,
			)}
      \n
      You can unsubscribe at anytime by visiting http://email.hurricanehunt.com/subscribe to manage your preferences.`,
			recipients: [newSubscriber.email],
		};
		const { wasSuccessful = false } = await sendEmail(params);
	} catch (err) {
		console.log(err);
		res.sendStatus(503);
	}
}

async function validateSubscriber(req, res) {
	const { email = '' } = req.query;
	if (!email) {
		let { email: culpritEmail } = await Subscriber.getMostRecentSubscriber();
		console.log(
			'Unable to validate subscriber. The most likely culprit is ' +
				culpritEmail,
		);
	}
	const validSubscriber = await Subscriber.validateSusbscriberByEmail(
		decodeURI(email),
	);
	if (!validSubscriber.id) res.sendStatus(503);

	res.redirect('https://hurricanehunt.com');
}

async function removeSubscriber(req, res) {}

module.exports = {
	addSubscriber,
	validateSubscriber,
	removeSubscriber,
};
