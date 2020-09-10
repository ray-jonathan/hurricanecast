require('dotenv').config();
const Subscriber = require('../models/subscriber');
const sendEmail = require('../models/ses');

(async function () {
	const arr = await Subscriber.getAllUnvalidatedSubscribers();
	const recipients = arr.map(({ email }) => email);
	console.log('Reminding Unvalidated Subscribers:\n', recipients);
	const goodArr = [];
	const badArr = [];
	await Promise.allSettled(
		recipients.map(async (email) => {
			const params = {
				subject: 'Confirm Your Subscription with HurricaneCast',
				body_text: `Thank you for expressing interest in receiving emails from HurricaneCast!
    To ensure we only send forecasts to those wanting them, please click the following link to confirm your subscription: https://email.hurricanecast.com/subscribe/add?email=${encodeURIComponent(
			email,
		)}
      \n
    You can unsubscribe at anytime by visiting https://hurricanecast.com/subscribe to manage your preferences.`,
				recipients: [email],
			};
			const { wasSuccessful = false } = await sendEmail(params);
			if (wasSuccessful) {
				goodArr.push(email);
				Promise.resolve();
				return true;
			} else {
				badArr.push(email);
				Promise.reject();
				return false;
			}
		}),
	);
	console.log('Something went wrong with the following emails:\n', badArr);
	badArr.forEach((badEmail) => {
		fs.appendFile('failed-to-remind-emails.txt', `${badEmail};`, function (
			err,
		) {
			if (err) console.log(`problem storing ${badEmail} to external file!`);
		});
	});
})();
