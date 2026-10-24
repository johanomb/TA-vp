const mysql = require('mysql2/promise');
const fs = require('fs').promises;

//@desc home page for viewing publicly saved images
//@route GET /fotogalerii
//@access public
const fotogalerii = async (req, res) => {
	let conn;
	try {
		conn = await mysql.createConnection({
				host: process.env.DB_HOST,
				user: process.env.DB_USER,
				password: process.env.DB_PASS,
				database: process.env.DB_NAME
		});
		let sqlReq = 'SELECT file_name, alt_text FROM galleryphotos WHERE privacy IN (2, 3) AND deleted IS NULL ORDER BY id DESC';
		const [rows] = await conn.execute(sqlReq);
		res.render('fotogalerii', {photos: rows});
		
	}
	catch (err) {
		console.log('Viga: ' + err);
		res.render('fotogalerii');
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
};

module.exports = {
	fotogalerii
}