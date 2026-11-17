const express = require('express');
const fs = require('fs').promises;
//moodul URL-i lahtiharutamiseks, et saaks POST osad ka kätte
const bodyparser = require('body-parser');
//moodul andmebaasiga suhtlemiseks, promises osaga async programmeeerimise jaoks
const mysql = require('mysql2/promise');
//moodul .env faili lugemiseks, keskkonnamuutujate parsimiseks
require('dotenv').config();
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

const checkLogin = require('./src/checkLogin');
const dateET = require('./src/dateTimeET');

const textRef = 'public/txt/vanasonad.txt';
const regTextRef = 'public/txt/visits.txt';

//käivitan express.js funktsiooni ja annan nimeks "app"
const app = express();
//võtan kasutusele sessiooni
/* app.use(session({
	secret: process.env.SES_SECRET,
	saveUninitialized: false,
	resave: false
})); */
const sessionStore = new MySQLStore({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME
});
app.use(session({
	secret: process.env.SES_SECRET,
	store: sessionStore,
	saveUninitialized: false,
	resave: false,
	cookie: {
		maxAge: 1000 * 60 * 60 * 1 //sessiooni küpsiste aegumisaeg, tund aega
	}
}));

//määrame veebilehtedele mallide renderdamise mootori
app.set('view engine', 'ejs');
//määran ühe päris kataloogi virtuaalses serveris kättesaadavaks
app.use(express.static('public'));
app.use(bodyparser.urlencoded({extended: true})); //kui vormidest ainult tekst, siis "false"
app.use(express.urlencoded({extended: true }));

//loon andmebaasiühenduse, connectioni
//const conn = mysql.createConnection({
	//host: 'localhost',
	//user: 'if26',
	//password: 'ifikas26',
	//database: 'if26_johanna'
//});

//marsruudid
app.get('/', async (req, res)=>{
	//res.send('Express.js läks käima ja serveerib meile veebi.');
	//const dayNow = dateET.day();
	const dateNow = dateET.fullDate();
	const timeNow = dateET.fullTime();
	let conn;
	try {
		let sqlReq = 'SELECT file_name, alt_text FROM galleryphotos WHERE id = (SELECT MAX(id) FROM galleryphotos WHERE privacy = ? AND deleted IS NULL)';
		const privacy = 3;
		conn = await mysql.createConnection({
				host: process.env.DB_HOST,
				user: process.env.DB_USER,
				password: process.env.DB_PASS,
				database: process.env.DB_NAME
		});
		
		const [rows] = await conn.execute(sqlReq, [privacy]);

		let imgAlt = "Avalik foto";
		let imgFile = 'pic/vp_logo_small.png';

		if (rows.length > 0) {
			if (rows[0].alt_text !== "") {
				imgAlt = rows[0].alt_text;
			}

			imgFile = process.env.GALLERY_NORMAL_URL + rows[0].file_name;
		}
		res.render('index', {dateNow: dateNow, timeNow: timeNow, imgFile: imgFile, imgAlt: imgAlt});
	}
	catch (err) {
		console.log(err);
		res.render('index', {dateNow: dateNow, timeNow: timeNow, imgFile: 'pic/vp_logo_small.png', imgAlt: 'VP logo'});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
});

//sisseloginud kasutajate avaleht
app.get('/home', checkLogin.isLogin, (req, res)=>{
	res.render('home');
});

//väljalogimine
app.get('/logout', (req, res)=>{
	res.redirect('/');
});

app.get('/vanasona', async (req, res)=>{
	try {
		const data = await fs.readFile(textRef, 'utf8');
		let folkWisdom = data.split(';');
		res.render('vanasona', {wisdom: folkWisdom[Math.round(Math.random() * (folkWisdom.length - 1))]});
	}
	catch (err) {
		console.log(err);
		res.render('vanasona', {wisdom: 'Ei leidnud ühtegi vanasõna!'});
	}
});

app.get('/marsruut', (req, res)=>{
	res.render('marsruut');
});

//Külastuse marsruudid
const külastusRouter = require('./routes/külastusRoutes');
app.use('/regvisit', külastusRouter);

//Eesti filmi marsruudid
const eestifilmRouter = require('./routes/eestifilmRoutes');
app.use('/eestifilm', eestifilmRouter);

//Galeriipiltide üleslaadimine
const galleryPhotoUploadRouter = require('./routes/galleryPhotoUploadRoutes')
app.use('/galleryPhotoUpload', galleryPhotoUploadRouter);

const galleryRouter = require('./routes/galleryRoutes')
app.use('/gallery', galleryRouter);

const personalGalleryRouter = require('./routes/personalGalleryRoutes')
app.use('/personalGallery', personalGalleryRouter);

//kasutajakonto loomise marsruut
const signupRouter = require('./routes/signupRoutes')
app.use('/signup', signupRouter);

//sisselogimise marsruut
const signinRouter = require('./routes/signinRoutes')
app.use('/signin', signinRouter);

app.listen(5111);