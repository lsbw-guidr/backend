const express = require('express');
const {
	getTripsByUser,
	getById,
	updateTrip,
	deleteTrip,
	createTrip,
	addImage
} = require('../../helpers/tripHelpers');
const { hasCorrectKeys, checkDesignation, typeCoercion } = require('../../middleware');

const router = express.Router();

router.param('tripId', async function(req, res, next, tripId) {
	const trip = await getById(tripId);

	if (trip) {
		req.trip = trip;
		next();
	} else {
		next({ status: 404, message: 'A trip with that ID does not exist' }, res);
	}
});

router.get('/all', async ({ decodedToken: { guide } }, res, next) => {
	try {
		const trips = await getTripsByUser(guide.id);
		// if (trips.length === 0) return res.status(404).json(trips);
		res.status(200).json(trips);
	} catch (err) {
		next({ message: err }, res);
	}
});

router.get('/:tripId', async ({ trip, decodedToken: { guide } }, res, next) => {
	try {
		if (trip.guide_id !== guide.id) {
			return next({ status: 400, message: 'That trip is not connected to the specified guide ID' });
		} else {
			res.status(200).json(trip);
		}
	} catch (err) {
		next({ message: err }, res);
	}
});

router.put('/:tripId', typeCoercion, async ({ trip, body, decodedToken }, res, next) => {
	const { guide } = decodedToken;

	try {
		if (trip.guide_id !== guide.id) {
			next({ status: 400, message: "You must be the trip's guide to make changes" }, res);
		}
		const success = await updateTrip(trip.id, body);
		res.status(200).json(success);
	} catch (err) {
		next({ message: err }, res);
	}
});

router.post('/:tripId/upload', async ({ body, trip }, res, next) => {
	try {
		const id = await addImage({ ...body, trip_id: trip.id });
		res.status(201).json(id);
	} catch (err) {
		next({ message: err }, res);
	}
});

router.post(
	'/create',
	hasCorrectKeys,
	typeCoercion,
	checkDesignation,
	async ({ decodedToken, body }, res, next) => {
		const { guide } = decodedToken;

		try {
			const tripId = await createTrip({ ...body, guide_id: guide.id });
			res.status(201).json(tripId);
		} catch (err) {
			next({ message: err }, res);
		}
	}
);

router.delete('/:id', async ({ params: { id } }, res, next) => {
	try {
		const numberRemoved = await deleteTrip(id);
		if (numberRemoved === 0) {
			next({ status: 400, message: 'A trip with that id does not exist' }, res);
		} else {
			res.status(202).json(numberRemoved);
		}
	} catch (err) {
		next({ message: err }, res);
	}
});

module.exports = router;
