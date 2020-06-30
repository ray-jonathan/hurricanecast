const Subscriber = require('../models/subscriber');
const escapeHtml = require('escape-html');
const sendEmail = require('../models/ses');

async function addSubscriber(req, res) {
	try {
		const { email } = req.body;
		const newSubscriber = await Subscriber.add({
			email: decodeURIComponent(escapeHtml(email)),
		});
		// if (!newSubscriber.id) res.sendStatus(503);
		const params = {
			subject: 'Confirm Your Subscription with HurricaneCast',
			body_text: `Thank you for expressing interest in receiving emails from HurricaneCast!
To ensure we only send forecasts to those wanting them, please click the following link to confirm your subscription:
https://email.hurricanecast.com/subscribe/validate?email=${encodeURIComponent(
				newSubscriber.email,
			)}
      \n
You can unsubscribe at anytime by visiting https://hurricanecast.com/subscribe to manage your preferences.`,
			recipients: [newSubscriber.email],
		};
		const { wasSuccessful = false } = await sendEmail(params);
		if (wasSuccessful) res.sendStatus(201);
		else res.sendStatus(403);
	} catch (err) {
		console.log(err);
		res.sendStatus(403);
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
		decodeURIComponent(email),
	);
	if (!validSubscriber.id) res.sendStatus(503);
	else res.redirect('https://hurricanecast.com');
}

async function removeSubscriber(req, res) {
	try {
		const { email } = req.body;
		const whateverComesBackFromDBNone = await Subscriber.deleteSusbscriberByEmail(
			decodeURIComponent(email),
		);
		res.sendStatus(204);
	} catch (err) {
		console.log(err, 'The offending email was:', req.body.email);
		res.sendStatus(403);
	}
}

module.exports = {
	addSubscriber,
	validateSubscriber,
	removeSubscriber,
};
