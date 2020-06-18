// AWS SES SDK Setup
const aws = require('aws-sdk');
aws.config.loadFromPath('../config.json');
const ses = new aws.SES();

async function sendEmail({
	subject = 'HurricaneCast Update',
	body_text = '',
	recipients = [],
}) {
	try {
		const SENDER = process.env.SENDER;
		const REPLY_TO = process.env.REPLY_TO;
		const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
		const charset = 'UTF-8';

		const emailResults = await Promise.allSettled(
			recipients.map((recipient) => {
				var params = {
					Source: SENDER,
					ReplyToAddresses: [REPLY_TO],
					Destination: {
						ToAddresses: recipient,
					},
					Message: {
						Subject: {
							Data: subject,
							Charset: charset,
						},
						Body: {
							Text: {
								Data: body_text,
								Charset: charset,
							},
						},
					},
				};

				ses.sendEmail(params, function (err, data) {
					if (err) {
						console.log(err.message);
						Promise.reject();
					} else {
						console.log('Email sent! Message ID: ', data.MessageId);
						Promise.resolve();
					}
				});
			}),
		);

		emailResults.forEach((promise, i) => {
			if (promise !== 'rejected') return;
			ses.sendEmail({
				Source: SENDER,
				ReplyToAddresses: [REPLY_TO],
				Destination: {
					ToAddresses: [REPLY_TO, ADMIN_EMAIL],
				},
				Message: {
					Subject: {
						Data: 'EMAIL SERVICE FAILURE',
						Charset: charset,
					},
					Body: {
						Text: {
							Data: `There was an error sending a forecase to the following email address: ${recipients[i]}. \nPlease reach out to the subscriber or manually remove them from the list to prevent further emails indicating errors.`,
							Charset: charset,
						},
					},
				},
				function(err, data) {
					if (err) {
						console.log(err.message);
					} else {
						console.log('Email sent! Message ID: ', data.MessageId);
					}
				},
			});
			return;
		});

		return { wasSuccessful: true };
	} catch (err) {
		console.log(err);
		return { wasSuccessful: false };
	}
}

module.exports = sendEmail;
