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

//kui pole nime sisestatud regvisit-is
let lastVisitorName = 'Keegi';

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

app.get('/regvisit', (req, res)=>{
	res.render('regvisit');
});

app.post('/regvisit', async (req, res)=>{
	//console.log(req.body);
	
	try {
		const dateNow = dateET.fullDate();
		const timeNow = dateET.fullTime();
		
		const logEntry = req.body.nameInput + ', ' + dateNow + ', kell ' + timeNow + ';\n';
		
		lastVisitorName = req.body.nameInput;
		
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
	const dateNow = dateET.fullDate();
	const timeNow = dateET.fullTime();
	
	const formattedMessage = 'Viimati registreeriti külastus ' + dateNow + ', kell ' + timeNow + ', ' + lastVisitorName;
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
	res.render('eestifilminimesed_add', {notice: 'Ootan sisestust!'});
});

app.post('/eestifilm/inimesed_add', async (req, res)=>{
	console.log(req.body);
	//kontrollime andmete olemasolu
	if(!req.body.firstNameInput || !req.body.lastNameInput || !req.body.bornInput || req.body.bornInput >= new Date()){
		console.log('Andmed pole korrektsed');
		return res.render('eestifilminimesed_add', {notice: 'Andmed on puudulikud!'});
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
		res.render('eestifilminimesed_add', {notice: 'Andmed salvestati, ootan uut sisestust!'});
	}
	catch (err){
		console.log('Viga andmebaasiga suhtlemisel: ' + err);
		res.render('eestifilminimesed_add', {notice: 'Tekkis viga, andmeid ei salvestatud!'});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
});

app.listen(5111);