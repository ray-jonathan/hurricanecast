const db = require('./db.js');

class Subscriber {
	constructor(id = null, email = '', validated = false) {
		this.id = id;
		this.email = email;
		this.validated = validated;
	}

	static async add({ email = '', validated = false }) {
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
			return validSubscriber;
		} catch (err) {
			console.log('Error with Subscriber.validateSusbscriberByEmail():', err);
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
			console.log('Error with Subscriber.deleteSusbscriberByEmail():', err);
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
			console.log('Error with Subscriber.getAllValidatedSubscribers():', err);
			return [new Subscriber()];
		}
	}

	static async getAllUnvalidatedSubscribers() {
		try {
			const subscriberArray = await db.any(
				`select * from subscribers where validated = false`,
			);
			return subscriberArray.map(
				({ id, email, validated }) => new Subscriber(id, email, validated),
			);
		} catch (err) {
			console.log('Error with Subscriber.getAllUnvalidatedSubscribers():', err);
			return [new Subscriber()];
		}
	}

	static async deleteAllUnvalidatedSubscribers() {
		try {
			return db.none(`delete from subscribers where validated = false`);
		} catch (err) {
			console.log(
				'Error with Subscriber.deleteAllUnvalidatedSubscribers():',
				err,
			);
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
				`select * from subscribers where validated = false order by id desc limit 1;`,
			);
			return new Subscriber(id, subscriberEmail, subscriberValiation);
		} catch (err) {
			console.log('Error with Subscriber.getMostRecentSubscriber():', err);
			return new Subscriber();
		}
	}

	static async getSubscriberByEmail(emailAddress = '') {
		if (!emailAddress) return new Subscriber();
		try {
			const {
				id,
				email,
				validated,
			} = await db.one(`select * from subscribers where email = $1`, [
				emailAddress,
			]);
			return new Subscriber(id, email, validated);
		} catch (err) {
			return new Subscriber();
		}
	}
}

module.exports = Subscriber;
