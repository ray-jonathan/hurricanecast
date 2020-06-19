const db = require('./db.js');

class Subscriber {
	constructor(id = null, email = '', validated = '') {
		this.id = id;
		this.email = email;
		this.validated = validated;
	}

	static async add({ email = '', validated = false }) {
		try {
			const {
				id,
				email: subscriberEmail,
				validated: subscriberValiation,
			} = await db.one(
				`insert into subscribers
        (email, validated)
    values
        ($1, $2) returning *`,
				[email, validated],
			);
			return new Subscriber(id, subscriberEmail, subscriberValiation);
		} catch (err) {
			console.log(err);
			return new Subscriber();
		}
	}

	static async validateSusbscriberByEmail(email = '') {
		try {
			const {
				id,
				email: subscriberEmail,
				validated,
			} = await db.one(
				`update only subscribers set where email = $1 returning *`,
				[email],
			);
			return new Subscriber(id, subscriberEmail, validated);
		} catch (err) {
			console.log(err);
			return new Subscriber();
		}
	}

	static async deleteSusbscriberByEmail(email = '') {
		try {
			return db.one(`delete from subscribers where email = $1 returning true`, [
				email,
			]);
		} catch (err) {
			console.log(err);
			return new Subscriber();
		}
	}

	static async getAllValidatedSubscribers() {
		try {
			const subscriberArray = await db.any(
				`select * from subscribers where validated = true`,
			);
			return subscriberArray.map(
				({ id, email, validated }) => new Subscriber(id, email, validated),
			);
		} catch (err) {
			console.log(err);
			return [new Subscriber()];
		}
	}

	static async deleteAllUnvalidatedSubscribers() {
		try {
			return db.none(`delete from subscribers where validated = false`);
		} catch (err) {
			console.log(err);
			return undefined;
		}
	}

	static async getMostRecentSubscriber() {
		try {
			const {
				id,
				email: subscriberEmail,
				validated: subscriberValiation,
			} = await db.one(
				`select * from subscribers order by id desc limit 1 where validated = false`,
			);
			return new Subscriber(id, subscriberEmail, subscriberValiation);
		} catch (err) {
			console.log(err);
			return new Subscriber();
		}
	}
}

module.exports = Subscriber;
