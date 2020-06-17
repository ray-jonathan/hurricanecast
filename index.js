require('dotenv').config();

const PORT = process.env.PORT;
const DB_HOST = process.env.DB_HOST;
const express = require('express');
const app = express();
const es6Renderer = require('express-es6-template-engine');
const helmet = require('helmet');
app.use(helmet());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// View Engine Setup
app.engine('html', es6Renderer);
app.set('views', 'views');
app.set('view engine', 'html');

// AWS SES SDK Setup
const aws = require('aws-sdk');
aws.config.loadFromPath('../config.json');
const ses = new aws.SES();
// // Routers
// const exampleRouter = require('./routes/example');

// // Routes
// app.get('/example', exampleRouter);
// app.post('/example', exampleRouter);
app.get('/', (req, res) =>
	res.render('index.html', {
		partials: {
			header: './partial-header',
			footer: './partial-footer',
		},
	}),
);

app.post('/send-forecast', (req, res) => {
	console.log(req.body);
	try {
		const { subject, body, disclaimer, donations } = req.body;
		const body_text =
			body +
			'\n' +
			(disclaimer === 'on'
				? `DISCLAIMER: \nThe Florida State University required that I not use any FSU equipment to send out these forecasts. To comply, I have purchased my own computer for making and sending these forecasts. I have been touched by the many offers of encouragement and support that I have received. I am deeply indebted to the Secretary and the staff of the Department of Children and Families who value these forecasts for the citizens of Florida. I acknowledge that these forecasts are mine alone, by my own effort and initiative. I only try to provide the best possible forecasts for the community, and the State of Florida and now, surrounding states at no cost to those who receive it.` +
				  '\n'
				: '') +
			(donations === 'on'
				? 'DONATIONS: \nIf you want to help support these efforts, there is information how you can help financially support this effort. I have moved to a new website and blog which may be reached at URL  http://www.hurricanecast.com   In this website you can find the forecast, as well as a blog of expanded interests of mine dealing with weather and climate and hurricanes, and an opportunity for you to comment as well.  There is also an opportunity for you to contribute to defraying the increasing costs of maintaining this service, if and only if you want to.  This must always be a not for profit public service and free as long as I have anything to do with it. But I have had offers of help in the past and it is increasingly difficult for me to underwrite all the cost. You can also just mail a check to 7030 Heritage Ridge Road. Tallahassee, Fl 32312. But I want to stress that there is no requirement at all, it is only to help support this effort. This I do for you as best I can, no strings attached.' +
				  '\n'
				: '') +
			'SUBSCRIPTIONS: \nIf you wish to unsubscribe from these forecasts and all future correspondence, please LORUM IPSUM LORUM IPSUM LORUM IPSUM';

		const SENDER = process.env.SENDER;
		const REPLY_TO = process.env.REPLY_TO;
		const RECIPIENT = process.env.RECIPIENT;
		const charset = 'UTF-8';

		var params = {
			Source: SENDER,
			ReplyToAddresses: [REPLY_TO],
			Destination: {
				ToAddresses: [RECIPIENT],
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
	} catch (err) {
		console.error(err);
	}

	ses.sendEmail(params, function (err, data) {
		if (err) {
			console.log(err.message);
			res.sendStatus(503);
		} else {
			console.log('Email sent! Message ID: ', data.MessageId);
			res.sendStatus(205);
		}
	});
});

// Failsafe
app.all('*', (req, res) => {
	res.render('404');
});

app.listen(PORT, () => {
	console.log(`listening to ${DB_HOST}:${PORT}`);
});
