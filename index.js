const express = require('express');
const fs = require('fs').promises;
//moodul URL-i lahtiharutamiseks, et saaks POST osad ka kätte
const bodyparser = require('body-parser');
//moodul andmebaasiga suhtlemiseks, promises osaga async programmeeerimise jaoks
const mysql = require('mysql2/promise');
//moodul .env faili lugemiseks, keskkonnamuutujate parsimiseks
require('dotenv').config();
const dateET = require('./src/dateTimeET');

const textRef = 'public/txt/vanasonad.txt';
const regTextRef = 'public/txt/visits.txt';

//käivitan express.js funktsiooni ja annan nimeks "app"
const app = express();
//määrame veebilehtedele mallide renderdamise mootori
app.set('view engine', 'ejs');
//määran ühe päris kataloogi virtuaalses serveris kättesaadavaks
app.use(express.static('public'));
app.use(bodyparser.urlencoded({extended: false}));

//loon andmebaasiühenduse, connectioni
//const conn = mysql.createConnection({
	//host: 'localhost',
	//user: 'if26',
	//password: 'ifikas26',
	//database: 'if26_johanna'
//});

//marsruudid
app.get('/', (req, res)=>{
	//res.send('Express.js läks käima ja serveerib meile veebi.');
	//const dayNow = dateET.day();
	const dateNow = dateET.fullDate();
	const timeNow = dateET.fullTime();
	res.render('index', {dateNow: dateNow, timeNow: timeNow}); //ei pea lisama .ejs indexile
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


let lastVisitorName = ''; 
let lastVisitDate = '';
let lastVisitTime = '';

app.get('/regvisit', (req, res)=>{
	res.render('regvisit');
});

app.post('/regvisit', async (req, res)=>{
	//console.log(req.body);
	
	try {
		const dateNow = dateET.fullDate();
		const timeNow = dateET.fullTime();
		const inputName = req.body.nameInput ? req.body.nameInput.trim() : '';
		
		const displayName = inputName || 'Keegi';
		const logEntry = displayName + ', ' + dateNow + ', kell ' + timeNow + ';\n';
		
		lastVisitorName = inputName;
		lastVisitDate = dateNow;
        lastVisitTime = timeNow;
		
		//await fs.open(regTextRef, 'a');
		await fs.appendFile(regTextRef, logEntry);
		res.render('regvisit');
	}
	catch (err){
		console.log(err);
		res.render('regvisit');
	}
});

app.get('/viimane', (req, res) => {
	let formattedMessage = '';
	
	if (!lastVisitDate) {
        formattedMessage = 'Külastusi pole veel registreeritud.';
    } else {
		if (lastVisitorName) {
            formattedMessage = 'Viimati registreeriti külastus ' + lastVisitDate + ', kell ' + lastVisitTime + ', ' + lastVisitorName;
        } else {
            formattedMessage = 'Viimati registreeriti külastus ' + lastVisitDate + ', kell ' + lastVisitTime;
        }
    }
	res.render('viimane', { lastVisitMessage: formattedMessage });
});


app.get('/eestifilm', (req, res)=>{
	res.render('eestifilm');
	
});

app.get('/eestifilm/inimesed', async (req, res)=>{
	//console.log('Anmebaasiserver on: ' + process.env.DB_HOST);
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		const sqlReq = 'SELECT * FROM person ORDER by last_name';
		const [sqlRes] = await conn.execute(sqlReq);
		console.log(sqlRes);
		res.render('eestifilminimesed', {personList: sqlRes});
	}
	catch (err){
		console.log('Viga andmebaasist lugemisel: ' + err);
		res.render('eestifilminimesed', {personList: []});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
});

//mul on eestifilminimesed_add, muidu oleks eestifilmiinimesed_add!
app.get('/eestifilm/inimesed_add', (req, res)=>{
	res.render('eestifilminimesed_add', {
		notice: 'Ootan sisestust!',
		firstNameInput: '',
		lastNameInput: '',
		bornInput: '',
		deceasedInput: ''
		});
});

app.post('/eestifilm/inimesed_add', async (req, res)=>{
	console.log(req.body);
	//kontrollime andmete olemasolu
	
	const now = new Date(); // fikseerib praeguse hetke
	const bornDate = new Date(req.body.bornInput); // teeb sisestatud kuupäevast ajaobjekti
	const deceasedDate = new Date(req.body.deceasedInput);
	
	if(!req.body.firstNameInput || !req.body.lastNameInput || isNaN(bornDate.getTime()) || bornDate > now || (req.body.deceasedInput && (isNaN(deceasedDate.getTime()) || deceasedDate < bornDate || deceasedDate > now))){
		console.log('Andmed pole korrektsed');
		return res.render('eestifilminimesed_add', {
			notice: 'Andmed on puudulikud!',
			firstNameInput: req.body.firstNameInput || '',
			lastNameInput: req.body.lastNameInput || '',
			bornInput: req.body.bornInput || '',
			deceasedInput: req.body.deceasedInput || ''
			});
	}
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		let sqlReq = 'INSERT INTO person (first_name, last_name, born, deceased) VALUES (?, ?, ?, ?)';
		let deceasedDate = null;
		if(req.body.deceasedInput !=''){
			deceasedDate = req.body.deceasedInput;
		}
		await conn.execute(sqlReq, [
			req.body.firstNameInput,
			req.body.lastNameInput,
			req.body.bornInput,
			deceasedDate
		]);
		res.render('eestifilminimesed_add', {
			notice: 'Andmed salvestati, ootan uut sisestust!',
			firstNameInput: '',
			lastNameInput: '',
			bornInput: '',
			deceasedInput: ''
			});
	}
	catch (err){
		console.log('Viga andmebaasiga suhtlemisel: ' + err);
		res.render('eestifilminimesed_add', {
			notice: 'Tekkis viga, andmeid ei salvestatud!',
			firstNameInput: req.body.firstNameInput || '',
            lastNameInput: req.body.lastNameInput || '',
            bornInput: req.body.bornInput || '',
            deceasedInput: req.body.deceasedInput || ''
			});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
}); //siin lõppes inimesed_add

app.get('/eestifilm/filmid', async (req, res)=>{
	//console.log('Anmebaasiserver on: ' + process.env.DB_HOST);
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		const sqlReq = 'SELECT * FROM movie ORDER by title';
		const [sqlRes] = await conn.execute(sqlReq);
		console.log(sqlRes);
		res.render('eestifilmid', {movieList: sqlRes});
	}
	catch (err){
		console.log('Viga andmebaasist lugemisel: ' + err);
		res.render('eestifilmid', {movieList: []});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
});

app.get('/eestifilm/filmid_add', (req, res)=>{
	res.render('eestifilmid_add', {
		notice: 'Ootan sisestust!',
		titleInput: '',
		releaseYearInput: '',
		durationMinutesInput: '',
		descriptionInput: ''
		});
});

app.post('/eestifilm/filmid_add', async (req, res)=>{
	console.log(req.body);
	if(!req.body.titleInput || !req.body.durationMinutesInput || req.body.releaseYearInput >= new Date().getFullYear()){
		console.log('Andmed pole korrektsed');
		return res.render('eestifilmid_add', {
			notice: 'Andmed on puudulikud!',
			titleInput: req.body.titleInput || '',
			releaseYearInput: req.body.releaseYearInput || '',
			durationMinutesInput: req.body.durationMinutesInput || '',
			descriptionInput: req.body.descriptionInput || ''
			});
	}
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		let sqlReq = 'INSERT INTO movie (title, release_year, duration_minutes, description) VALUES (?, ?, ?, ?)';
		await conn.execute(sqlReq, [
			req.body.titleInput,
			req.body.releaseYearInput,
			req.body.durationMinutesInput,
			req.body.descriptionInput
		]);
		res.render('eestifilmid_add', {
			notice: 'Andmed salvestati, ootan uut sisestust!',
			titleInput: '',
            releaseYearInput: '',
            durationMinutesInput: '',
            descriptionInput: ''
			});
	}
	catch (err){
		console.log('Viga andmebaasiga suhtlemisel: ' + err);
		res.render('eestifilmid_add', {
			notice: 'Tekkis viga, andmeid ei salvestatud!',
			titleInput: req.body.titleInput || '',
			releaseYearInput: req.body.releaseYearInput || '',
			durationMinutesInput: req.body.durationMinutesInput || '',
			descriptionInput: req.body.descriptionInput || ''
			});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
}); //siin lõppes filmid_add

app.get('/eestifilm/filmiametid', async (req, res)=>{
	//console.log('Anmebaasiserver on: ' + process.env.DB_HOST);
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		const sqlReq = 'SELECT * FROM profession ORDER by title';
		const [sqlRes] = await conn.execute(sqlReq);
		console.log(sqlRes);
		res.render('filmiametid', {professionList: sqlRes});
	}
	catch (err){
		console.log('Viga andmebaasist lugemisel: ' + err);
		res.render('filmiametid', {professionList: []});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
});

app.get('/eestifilm/filmiametid_add', (req, res)=>{
	res.render('filmiametid_add', {notice: 'Ootan sisestust!'});
});

app.post('/eestifilm/filmiametid_add', async (req, res)=>{
	console.log(req.body);
	if(!req.body.titleInput || !req.body.descriptionInput){
		console.log('Andmed pole korrektsed');
		return res.render('filmiametid_add', {notice: 'Andmed on puudulikud!'});
	}
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		let sqlReq = 'INSERT INTO profession (title, description) VALUES (?, ?)';
		await conn.execute(sqlReq, [
			req.body.titleInput,
			req.body.descriptionInput
		]);
		res.render('filmiametid_add', {notice: 'Andmed salvestati, ootan uut sisestust!'});
	}
	catch (err){
		console.log('Viga andmebaasiga suhtlemisel: ' + err);
		res.render('filmiametid_add', {notice: 'Tekkis viga, andmeid ei salvestatud!'});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
});

app.listen(5111);