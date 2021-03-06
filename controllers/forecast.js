const Forecast = require('../models/forecast');
const Subscriber = require('../models/subscriber');
const sendEmail = require('../models/ses');

async function addForecast(req, res, next) {
	const {
		subject = '',
		special = '',
		forecast = '',
		discussion = '',
		disclaimer = 'on',
		donations = 'on',
	} = req.body;
	const body_text = `${special.length > 1 ? special + '\n' : ''}${
		forecast.length > 1 ? '\nFORECAST:\n' + forecast : ''
	} 
		
${discussion.length > 1 ? '\nDISCUSSION:\n' + discussion : ''}

${
	disclaimer === 'on'
		? `DISCLAIMER: 
The Florida State University required that I not use any FSU equipment to send out these forecasts. To comply, I have purchased my own computer for making and sending these forecasts. I have been touched by the many offers of encouragement and support that I have received. I am deeply indebted to the Secretary and the staff of the Department of Children and Families who value these forecasts for the citizens of Florida. I acknowledge that these forecasts are mine alone, by my own effort and initiative. I only try to provide the best possible forecasts for the community, and the State of Florida and now, surrounding states at no cost to those who receive it.
`
		: ''
}
${
	donations === 'on'
		? `DONATIONS: 
If you want to help support these efforts, there is information how you can help financially support this effort. I have moved to a new website and blog which may be reached at URL  https://www.hurricanecast.com   In this website you can find the forecast, as well as a blog of expanded interests of mine dealing with weather and climate and hurricanes, and an opportunity for you to comment as well.  There is also an opportunity for you to contribute to defraying the increasing costs of maintaining this service, if and only if you want to.  This must always be a not for profit public service and free as long as I have anything to do with it. But I have had offers of help in the past and it is increasingly difficult for me to underwrite all the cost. You can also just mail a check to 7030 Heritage Ridge Road, Tallahassee, FL 32312. But I want to stress that there is no requirement at all, it is only to help support this effort. This I do for you as best I can, no strings attached.
`
		: ''
}
SUBSCRIPTIONS: 
If you wish to subscribe or unsubscribe from these forecasts and all future correspondence, please visit https://hurricanecast.com/subscribe and supply your email address to the corresponding form.
`;
	const addedForecast = await Forecast.add({ subject, body: body_text });
	if (!addedForecast.id) {
		console.log(
			'Failed to add forecast to table.',
			'controllers/addForecast Failure',
		);
		res
			.status(403)
			.send('Failed to send forecast. Please contact your IT Admin.');
		return;
	}
	res.addedForecast = addedForecast;
	next();
}

async function sendForecast(req, res) {
	if (!res.addedForecast.id) {
		console.log(
			'Failed to add forecast to table.',
			'controllers/sendForecast Failure',
		);
		res
			.status(403)
			.send('Failed to send forecast. Please contact your IT Admin.');
		return;
	} else {
		try {
			const recipientsObjects = await Subscriber.getAllValidatedSubscribers();
			console.log(recipientsObjects);
			const recipients = recipientsObjects.map(({ email }) => email);
			const { subject, body } = res.addedForecast;
			const { wasSuccessful } = await sendEmail({
				subject,
				body_text: body,
				recipients,
			});
			if (wasSuccessful)
				await sendEmail({
					subject: `Status of Forecast: ${subject}`,
					body_text: `Successfully sent ${recipients.length} emails to subscriber list.`,
					recipients: [`${process.env.REPLY_TO}`],
				});
			else
				await sendEmail({
					subject: `Error with Forecast: ${subject}`,
					body_text: `Error sending forecast. Tried to send to ${recipients.length} emails on subscriber list.`,
					recipients: [`${process.env.ADMIN_EMAIL}`],
				});
			res.redirect('https://hurricanecast.com');
		} catch (err) {
			console.log('Error with SendForecast\n', err);
			res.sendStatus(503);
		}
	}
}

module.exports = {
	addForecast,
	sendForecast,
};
