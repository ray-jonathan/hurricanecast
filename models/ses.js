// AWS SES SDK Setup
const aws = require('aws-sdk');
aws.config.loadFromPath('../config.json');
const ses = new aws.SES();
var RateLimiter = require('limiter').RateLimiter;
var limiter = new RateLimiter(12, 'second');
const fs = require('fs');

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
			recipients.map((email) => {
				var params = {
					Source: SENDER,
					ReplyToAddresses: [REPLY_TO],
					Destination: {
						ToAddresses: [email],
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
							// Html: {
							// 	Data: body_text,
							// 	Charset: charset,
							// },
						},
					},
				};
				limiter.removeTokens(1, function (rateLimitError, remainingRequests) {
					var prom;
					if (!!rateLimitError)
						console.log('Error with Rate Limiter,\n', rateLimitError);
					ses.sendEmail(params, function (err, data) {
						if (err) {
							console.log(err.message, email);
							fs.appendFile('rate-limited-emails.txt', `${email};`, function (
								err,
							) {
								if (err)
									console.log(`problem storing ${email} to external file!`);
								console.log('CHECK rate-limited-emails.txt FOR UNSENT EMAILS!');
							});
							Promise.reject();
						} else {
							// console.log('Email sent! Message ID: ', data.MessageId);
							Promise.resolve();
						}
					});
					return;
				});
			}),
		);

		// Emails About Errors
		emailResults.forEach((promise, i) => {
			if (promise !== 'rejected') return;
			// Throttle requests
			limiter.removeTokens(1, function (err, remainingRequests) {
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
								Data: `There was an error sending a forecase to the following email address: ${recipients[i].email}. \nPlease reach out to the subscriber or manually remove them from the list to prevent further emails indicating errors.`,
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
		});

		return { wasSuccessful: true };
	} catch (err) {
		console.log(err);
		return { wasSuccessful: false };
	}
}

module.exports = sendEmail;
