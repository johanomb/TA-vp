const mysql = require('mysql2/promise');
const validator = require('validator');
const argon = require('argon2');

//@desc page for logging in
//@route GET /signin
//@access public
const signinPage = (req, res) => {
	res.render('signin', {notice: 'Ootan konto andmeid!'});
};

//@desc page for logging in
//@route POST /signin
//@access public
const signinPagePost = async (req, res) => {
	let conn;
	let notice = '';
	//puhastame andmeid ja valideerime (kontrollime kas on olemas, sobivas formaadis, kas sisu on korrektne)
	//escape puhastab kahtlastest märkidest ära
	//trim korjab tühikud ära
	const email = req.body.emailInput.trim();
	
	//kontrollime, kas kõik on olemas
	if(!email || !req.body.passwordInput){
		notice = 'Andmeid on puudu!';
		return res.render('signup', {notice: notice});
	}
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		let sqlReq = 'SELECT id, password FROM users WHERE email = ?';
		const [users] = await conn.execute(sqlReq, [email]);
		if (users.length === 0){
			//privaatsuse pärast see pole kõige parem meetod
			notice = 'Sisestatud kasutajatunnus ja/või parool oli vale!';
			return res.render('signup', {notice: notice});
		}
		//kui on olemas, kas parool klapib
		const match = await argon.verify(users[0].password, req.body.passwordInput);
		if(match){
			//console.log('Oled sisse loginud kasutaja: ' + users[0].id);
			//käivitame sessiooni ja salvestame sessioonimuutuja
			req.session.userId = users[0].id;
			return res.redirect('/home');
		} else {
			notice = 'Sisestatud kasutajatunnus ja/või parool oli vale!';
			return res.render('signup', {notice: notice});
		}
		
	}
	catch (err) {
		console.log('Viga: ' + err);
		res.render('signup', {notice: 'Sisselogimine ei õnnestunud!'});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
};

module.exports = {
	signinPage,
	signinPagePost
}