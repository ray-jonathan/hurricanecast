const Subscriber = require('../models/subscriber');
const escapeHtml = require('escape-html');
const sendEmail = require('../models/ses');

async function addSubscriber(req, res) {
	try {
		const { email } = req.body;
		const existingSubscriber = await Subscriber.getSubscriberByEmail(
			decodeURIComponent(email),
		);
		console.log(existingSubscriber);
		if (!existingSubscriber.email) {
			const newSubscriber = await Subscriber.add({
				email: decodeURIComponent(escapeHtml(email)),
			});
			if (!!newSubscriber.id) {
				const params = {
					subject: 'Confirm Your Subscription with HurricaneCast',
					body_text: `Thank you for expressing interest in receiving emails from HurricaneCast!
		To ensure we only send forecasts to those wanting them, please click the following link to confirm your subscription:
		https://email.hurricanecast.com/subscribe/add?email=${encodeURIComponent(
			newSubscriber.email,
		)}
					\n
		You can unsubscribe at anytime by visiting https://hurricanecast.com/subscribe to manage your preferences.`,
					recipients: [newSubscriber.email],
				};
				const { wasSuccessful = false } = await sendEmail(params);
			}
			// res.redirect('https://hurricanecast.com/');
		}
		res.sendStatus(205);
	} catch (err) {
		console.log(err);
		res.sendStatus(203);
	}
}

async function validateSubscriber(req, res) {
	const { email = '' } = req.query;
	const theSubscriber = await Subscriber.getSubscriberByEmail(
		decodeURIComponent(email),
	);
	if (!!theSubscriber.id) {
		await Subscriber.validateSusbscriberByEmail(theSubscriber.email);
	} else {
		const { email: culpritEmail } = await Subscriber.getMostRecentSubscriber();
		console.log(
			'Unable to validate subscriber. The most likely culprit is ' +
				culpritEmail,
		);
	}
	res.redirect('https://hurricanecast.com');
}

async function removeSubscriber(req, res) {
	try {
		const { email } = req.query;
		const theSubscriber = await Subscriber.getSubscriberByEmail(
			decodeURIComponent(email),
		);
		if (!!theSubscriber.id) {
			const {
				bool: didRemoveSubscriber,
			} = await Subscriber.deleteSusbscriberByEmail(theSubscriber.email);
			console.log(
				`${decodeURIComponent(email)} ${
					didRemoveSubscriber ? 'was' : 'was not'
				} removed from the distribution list.`,
			);
		}
	} catch (err) {
		console.log(err, 'The offending email was:', req.body.email);
	}
	res.redirect('https://hurricanecast.com');
}

async function requestRemoveSubscriber(req, res) {
	try {
		const { email } = req.body;
		const params = {
			subject: 'Confirm Your Unsubscription with HurricaneCast',
			body_text: `You are receiving this email because a request was submitted to have this email removed from the distribution list.
To complete this process. please follow this link:
https://email.hurricanecast.com/subscribe/remove?email=${encodeURIComponent(
				email,
			)}
      \n
If you received this email and you do not want to be removed from the distribution, you may safely ignore this email.`,
			recipients: [email],
		};
		const { wasSuccessful = false } = await sendEmail(params);
	} catch (err) {
		console.log(err, 'The offending email was:', req.body.email);
	}
	// res.redirect('https://hurricanecast.com');
	res.sendStatus(205);
}

module.exports = {
	addSubscriber,
	validateSubscriber,
	removeSubscriber,
	requestRemoveSubscriber,
};
