const express = require('express');
const { updateUser, getUserById } = require('../../helpers/guideHelpers');

const router = express.Router();

router.get('/:guideId', async (req, res) => {
	const { guideId } = req.params;
	try {
		const guide = await getUserById(guideId);
		return guide
			? res.status(200).json(guide)
			: res.status(404).json({ error: 'That user does not exist' });
	} catch (err) {
		res.status(500).json(err);
	}
});

router.put('/update/:guideId', async (req, res) => {
	const { guideId } = req.params;
	const info = req.body;
	try {
		const numUpdated = await updateUser(guideId, info);
		if (numUpdated === 0) {
			res.status(400).json({ error: 'A user with that ID does not exist' });
		} else {
			res.status(200).json(numUpdated);
		}
	} catch (err) {
		// postgres errorhandler
		if (err['code'] === '42703') {
			res.status(400).json({ error: 'Unrecognized key in update object' });
		} else {
			res.status(500).json(err);
		}
	}
});

module.exports = router;
