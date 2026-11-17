const express = require('express');
const checkLogin = require('../src/checkLogin');

const router = express.Router();
router.use(checkLogin.isLogin);

const {
	personalGalleryPage
	} = require('../controllers/personalGalleryControllers');

router.route('/').get(personalGalleryPage);

module.exports = router;