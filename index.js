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

// Failsafe
app.all('*', (req, res) => {
	res.render('404');
});

app.listen(PORT, () => {
	console.log(`listening to ${DB_HOST}:${PORT}`);
});
