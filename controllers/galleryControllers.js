const mysql = require('mysql2/promise');

//@desc Photogallery
//@route GET /gallery
//@access private

const galleryPage = async (req, res) => {
	let conn;
	try {
		const sqlReq = 'SELECT id, file_name, alt_text, privacy FROM galleryphotos WHERE privacy >= ? AND deleted IS NULL';
		const privacy = 2;
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		const [photos] = await conn.execute(sqlReq, [privacy]);
		let galleryData = [];
		for (let i = 0; i < photos.length; i ++){
			let altText = "Galeriipilt";
			if (photos[i].alt_text) {
				altText = photos[i].alt_text;
			}
			galleryData.push({src: photos[i].file_name, alt: altText, id: photos[i].id, privacy: photos[i].privacy});
		}
		res.render('gallery', {galleryData: galleryData, imagehref: process.env.GALLERY_THUMBNAIL_URL});
	}
	catch (err) {
		console.log('Viga: ' + err);
		res.render('gallery', {galleryData: [], imagehref: process.env.GALLERY_THUMBNAIL_URL});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
};

module.exports = {
	galleryPage
}