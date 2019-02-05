const express = require('express');
const {
	getTripsByUser,
	getTripByIds,
	getById,
	updateTrip,
	deleteTrip,
	createTrip
} = require('../../helpers/tripHelpers');
const { getUserById } = require('../../helpers/guideHelpers');
const { hasCorrectKeys, checkDesignation } = require('../../middleware');

const router = express.Router();
let error = { status: 400, message: 'something went wrong' };

router.get('/:guideId/all', async (req, res, next) => {
	const { guideId } = req.params;
	try {
		const trips = await getTripsByUser(guideId);
		if (trips.length === 0) {
			error.status = 404;
			error.message = 'there are no trips for this guide id';
			next(error, res);
		} else {
			res.status(200).json(trips);
		}
	} catch (err) {
		next({ message: err }, res);
	}
});

router.get('/:guideId/:tripId', async (req, res, next) => {
	const { tripId, guideId } = req.params;
	try {
		const trip = await getTripByIds(tripId, guideId);
		if (!trip) {
			error.message = 'a user with that id does not exist';
			next(error, req, res);
		} else {
			res.status(200).json(trip);
		}
	} catch (err) {
		next({ message: err }, res);
	}
});

router.put('/:guideId/:tripId', async (req, res, next) => {
	const { tripId, guideId } = req.params;
	const updates = req.body;
	try {
		const user = await getUserById(guideId);
		const trip = await getById(tripId);
		const connection = await getTripByIds(tripId, guideId);

		if (!user) next({ ...error, message: 'A user with that iD does not exist' }, res);
		if (!trip) next({ ...error, message: 'A trip with that ID does not exist' }, res);
		if (!connection) {
			(error.status = 400), (error.message = "You must be the trip's guide to make changes");
			next(error, res);
		}
		const success = await updateTrip(tripId, updates);
		res.status(203).json(success);
	} catch (err) {
		next({ message: err }, res);
	}
});

router.post('/:guideId/create', hasCorrectKeys, checkDesignation, async (req, res, next) => {
	const { guideId } = req.params;
	const tripInfo = req.body;
	try {
		const guide = await getUserById(guideId);
		if (!guide) next({ ...error, message: 'A user with that ID does not exist' }, res);
		const tripId = await createTrip({ ...tripInfo, guide_id: guide.id });
		// const newTrip = await getTripByIds(tripId[0], guideId);
		res.status(201).json(tripId);
	} catch (err) {
		next({ message: err }, res);
	}
});

router.delete('/:tripId', async (req, res, next) => {
	const { tripId } = req.params;
	try {
		const numberRemoved = await deleteTrip(tripId);
		if (numberRemoved === 0) {
			error.message = 'A trip with that id does not exist';
			next(error, res);
			// res.status(400).json({ error: 'A trip with that ID does not exist' });
		} else {
			res.status(202).json(numberRemoved);
		}
	} catch (err) {
		next({ message: err }, res);
	}
});

module.exports = router;
