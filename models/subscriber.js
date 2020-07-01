const db = require('./db.js');

class Subscriber {
	constructor(id = null, email = '', validated = '') {
		this.id = id;
		this.email = email;
		this.validated = validated;
	}

	static async add({ email = '', validated = false }) {
		console.log('subscriber add email was supplied', email);
		if (!email) return new Subscriber();
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
			console.log('Error with Subscriber.add():', err);
			return new Subscriber();
		}
	}

	static async validateSusbscriberByEmail(emailAddress = '') {
		if (!emailAddress) return new Subscriber();
		try {
			const {
				id,
				email: subscriberEmail,
				validated,
			} = await db.one(
				`update only subscribers set validated = True where email = $1 returning *`,
				[emailAddress],
			);
			const validSubscriber = new Subscriber(id, subscriberEmail, validated);
			console.log(validSubscriber);
			return validSubscriber;
		} catch (err) {
			console.log(err);
			return new Subscriber();
		}
	}

	static async deleteSusbscriberByEmail(email = '') {
		if (!email) return new Subscriber();
		try {
			return db.one(`delete from subscribers where email = $1 returning true`, [
				email,
			]);
		} catch (err) {
			console.log(err);
			return new Subscriber();
		}
	}

	async getAllValidatedSubscribers() {
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

	async getMostRecentSubscriber() {
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

	async getSubscriberByEmail(emailAddress = '') {
		if (!emailAddress) return new Subscriber();
		try {
			const {
				id,
				email: subscriberEmail,
				validated: subscriberValiation,
			} = await db.one(`select * from subscribers where email = $1`, [
				emailAddress,
			]);
			return new Subscriber(id, subscriberEmail, subscriberValiation);
		} catch (err) {
			console.log(err);
			return new Subscriber();
		}
	}
}

module.exports = Subscriber;
