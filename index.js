require('dotenv').config();
const PORT = process.env.PORT;
const DB_HOST = process.env.DB_HOST;
const express = require('express');
const app = express();
const es6Renderer = require('express-es6-template-engine');
const helmet = require('helmet');
const cors = require('cors');
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

//Logging
app.use((req, res, next) => {
	console.log(req.path, req.method, '\n');
	next();
});

// View Engine Setup
app.engine('html', es6Renderer);
app.set('views', 'views');
app.set('view engine', 'html');

// Routers
const subscriberRouter = require('./routes/subscriber');
const forecastRouter = require('./routes/forecast');

// Routes
app.use('/subscribe', subscriberRouter);
app.use('/send-forecast', forecastRouter);

// Testing for AWS SNS
app.post('/notification', (req, res) => {
	console.log('\nNew SNS:');
	console.log(req.body);
	res.sendStatus(200);
});

app.get('/', (req, res) =>
	res.render('index.html', {
		partials: {
			header: './partial-header',
			footer: './partial-footer',
		},
	}),
);

// Failsafe
app.all('*', (req, res) => {
	res.render('404');
});

app.listen(PORT, () => {
	console.log(`listening to ${DB_HOST}:${PORT}`);
});
