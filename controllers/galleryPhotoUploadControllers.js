const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const sharp = require('sharp');

//@desc home page for uploading gallery photos
//@route GET /galleryPhotoUpload
//@access public
const galleryPhotoUpload = (req, res) => {
	res.render('galleryPhotoUpload');
};

//@desc home page for uploading gallery photos
//@route POST /galleryPhotoUpload
//@access public
const galleryPhotoUploadPost = async (req, res) => {
	console.log(req.body);
	console.log(req.file);
	let conn;
	try {
		//genereerime oma failinime
		const fileName = 'vp_' + Date.now() + '.jpg';
		const originalPath = process.env.UPLOAD_ORIGINAL_PATH;
		const resizedPath = process.env.UPLOAD_RESIZED_PATH;
		const thumbnailPath = process.env.UPLOAD_THUMBNAIL_PATH;

		await fs.rename(req.file.path, originalPath + fileName)
		//pildi suuruse muutmine (max 800 laius X 600)
		await sharp(originalPath + fileName).resize(800, 600).jpeg({quality: 90}).toFile(resizedPath + fileName);

		//teeme pisipildi (100 X 100)
		await sharp(originalPath + fileName).resize(100, 100).jpeg({quality: 90}).toFile(thumbnailPath + fileName);

		let sqlReq = 'INSERT INTO galleryphotos (file_name, orig_name, alt_text, privacy, user_id) VALUES (?, ?, ?, ?, ?)';
		const userId = 1; //see on ajutine, kuni päris kasutajakontod teeme
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		const [result] = await conn.execute(sqlReq, [fileName, req.file.originalname, req.body.altInput, req.body.privacyInput, userId]);
		console.log('Salvestati kirje id: ' + result.insertId); //teinekord kasulik teada result.insertId
		
		/* Uusima kindla privaatsusega pildi päring
		SELECT filename, alttext FROM tabelinimi WHERE id=SELECT MAX(id) FROM tabelinimi WHERE privacy=? AND deleted IS NULL */
		/* if req.body.privacyInput = 3 {
			let sqlReq = 'SELECT filename, alttext FROM galleryphotos WHERE id=SELECT MAX(id) FROM galleryphotos WHERE privacy=? AND deleted IS NULL';
		} */
		
		res.render('galleryPhotoUpload');
	}
	catch (err) {
		console.log('Viga: ' + err);
		res.render('galleryPhotoUpload');
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
};


module.exports = {
	galleryPhotoUpload,
	galleryPhotoUploadPost
}