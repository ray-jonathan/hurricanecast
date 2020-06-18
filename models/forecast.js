const db = require('./db.js');

class Forecast {
	constructor(id, subject, body, timestamp) {
		this.id = id;
		this.subject = subject;
		this.body = body;
		this.timestamp = timestamp;
	}

	static async add({ subject = '', body = '', timestamp = Date.now() }) {
		try {
			const {
				id,
				subject: forecastSubject,
				body: forecastBody,
				timestamp: forecastTimestamp,
			} = await db.one(
				`insert into forecasts
        (subject, body, timestamp)
    values
        ($1, $2, $3) returning *`,
				[subject, body, timestamp],
			);
			return new Forecast(id, forecastSubject, forecastBody, forecastTimestamp);
		} catch (err) {
			console.log(err);
			return new Forecast();
		}
	}

	static async getForecastById(id) {
		try {
			const {
				id: forecastId,
				subject,
				body,
				timestamp,
			} = await db.one(`select * from forecasts where id=$1`, [id]);
			return new Forecast(forecastId, subject, body, timestamp);
		} catch (err) {
			console.log(err);
			return new Forecast();
		}
	}

	static async getMostRecentForecast() {
		try {
			const { id, subject, body, timestamp } = await db.one(
				`select * from forecasts order by timestamp desc limit 1`,
			);
			return new Forecast(id, subject, body, timestamp);
		} catch (err) {
			console.log(err);
			return new Forecast();
		}
	}

	static async getAllForecasts() {
		try {
			const forecastArray = await db.any(
				`select * from forecasts order by timestamp`,
			);
			return forecastArray.map(
				({ id, subject, body, timestamp }) =>
					new Forecast(id, subject, body, timestamp),
			);
		} catch (err) {
			console.log(err);
			return [new Forecast()];
		}
	}

	static async deleteForecastById(id) {
		try {
			return db.none(`delete from forecasts where id=$1`, [id]);
		} catch (err) {
			console.log(err);
			return undefined;
		}
	}
}

module.exports = Forecast;
