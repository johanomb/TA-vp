const express = require('express');
const router = express.Router();

const{
	regvisit,
	regvisitpost,
	viimane} = require('../controllers/külastusControllers');
	
router.route('/').get(regvisit);

router.route('/').post(regvisitpost);

router.route('/viimane').get(viimane);
	
module.exports = router;