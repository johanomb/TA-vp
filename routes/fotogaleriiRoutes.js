const express = require('express');
const router = express.Router();

const{
	fotogalerii} = require('../controllers/fotogaleriiControllers');
	
router.route('/').get(fotogalerii);
	
module.exports = router;