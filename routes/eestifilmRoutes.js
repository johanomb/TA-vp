const express = require('express');
const router = express.Router();

//kontrollerid
const{
	eestifilm, 
	inimesed,
	inimesedAdd,
	inimesedAddpost,
	filmid,
	filmidAdd,
	filmidAddpost,
	filmiametid,
	filmiametidAdd,
	filmiametidAddpost,
	inimesedfilmis,
	inimesedfilmisAdd,
	inimesedfilmisAddpost} = require('../controllers/eestifilmControllers');

router.route('/').get(eestifilm);

router.route('/inimesed').get(inimesed);

router.route('/inimesed_add').get(inimesedAdd);

router.route('/inimesed_add').post(inimesedAddpost);

router.route('/filmid').get(filmid);

router.route('/filmid_add').get(filmidAdd);

router.route('/filmid_add').post(filmidAddpost);

router.route('/filmiametid').get(filmiametid);

router.route('/filmiametid_add').get(filmiametidAdd);

router.route('/filmiametid_add').post(filmiametidAddpost);

router.route('/inimesedfilmis').get(inimesedfilmis);

router.route('/inimesedfilmis').get(inimesedfilmisAdd);

router.route('/inimesedfilmis').post(inimesedfilmisAddpost);

module.exports = router;