const mysql = require('mysql2/promise');

//@desc Photogallery
//@route GET /personalGallery
//@access private

const personalGalleryPage = async (req, res) => {
	let conn;
	try {
		const userId = req.session.userId;
		const sqlReq = 'SELECT id, file_name, alt_text, privacy FROM galleryphotos WHERE user_id = ? AND deleted IS NULL';

		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		const [photos] = await conn.execute(sqlReq, [userId]);
		let galleryData = [];
		for (let i = 0; i < photos.length; i ++){
			let altText = "Galeriipilt";
			if (photos[i].alt_text) {
				altText = photos[i].alt_text;
			}
			galleryData.push({src: photos[i].file_name, alt: altText, id: photos[i].id, privacy: photos[i].privacy});
		}
		res.render('personalGallery', {galleryData: galleryData, imagehref: process.env.GALLERY_THUMBNAIL_URL});
	}
	catch (err) {
		console.log('Viga: ' + err);
		res.render('personalGallery', {galleryData: [], imagehref: process.env.GALLERY_THUMBNAIL_URL});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
};

module.exports = {
	personalGalleryPage
}