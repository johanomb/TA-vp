const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const sharp = require('sharp');

const watermarkFile = "./public/pic/vp_logo_small.png";

//@desc home page for uploading gallery photos
//@route GET /galleryPhotoUpload
//@access private
const galleryPhotoUpload = (req, res) => {
	res.render('galleryPhotoUpload');
};

//@desc home page for uploading gallery photos
//@route POST /galleryPhotoUpload
//@access private
const galleryPhotoUploadPost = async (req, res) => {
	console.log(req.body);
	console.log(req.file);
	let conn;
	try {
		//genereerime oma failinime
		const fileName = 'vp_' + Date.now() + '.jpg';
		
		const originalPath = process.env.GALLERY_ORIGINAL;
		const resizedPath = process.env.GALLERY_NORMAL;
		const thumbnailPath = process.env.GALLERY_THUMBNAIL;
		
		await fs.rename(req.file.path, originalPath + fileName);
		
		//kontrollin, kas vesimärgi fail on olemas
		const watermarkSettings = [{
			input: watermarkFile,
			gravity: "southeast"
		}];
		if (!await fs.access(watermarkFile).then(() => true).catch(() => false)) {
             //console.log("Vesimärgi faili ei leitud!");
             // Tühjendame seaded, et vesimärki ei proovitaks lisada
             watermarkSettings.length = 0; 
        }

		//pildi suuruse muutmine (max 800 X 600)
		/* await sharp(req.file.path, originalPath + fileName).resize(800, 600).jpeg({quality: 90}).toFile('./public/gallery/normal/' + fileName); */
		
		//await sharp(req.file.destination + fileName).resize(800, 600).jpeg({quality: 90}).toFile('./public/gallery/normal/' + fileName);
		let normalImageProcessor = await sharp(originalPath + fileName).resize(800, 600).jpeg({quality: 90});
		//lisan vesimärgi
		//console.log("Lisan vesimärgi" + watermarkSettings.length);    
        if (watermarkSettings.length > 0) {
            normalImageProcessor = await normalImageProcessor.composite(watermarkSettings);
        }
		await normalImageProcessor.toFile(resizedPath + fileName);
				
		//teeme pisipildi (100 X 100)
		await sharp(originalPath + fileName).resize(100, 100).jpeg({quality: 90}).toFile(thumbnailPath + fileName);

		let sqlReq = 'INSERT INTO galleryphotos (file_name, orig_name, alt_text, privacy, user_id) VALUES (?, ?, ?, ?, ?)';
		//const userId = 1; //see on ajutine, kuni päris kasutajakontod teeme
		const userId = req.session.userId;
		
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