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
app.use(express.urlencoded({extended: true }));

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

//filmide osasse peab lisama uue lehe mis võimaldab seoseid teha. loeb inimesed, filmid, ametid ja võimaldab ka uue seose sinna tabelisse kirjutada. peab ka lisama kontrolli enne salvestamist, et kas täpselt sama seos on juba olemas.
//isikuid jms peab saama valida rippmenüüst, select oma seoste .ejs failis. ja seoste põhjal tuleks neid ka eraldi lehel näidata.


//Külastuse marsruudid
const külastusRouter = require('./routes/külastusRoutes');
app.use('/regvisit', külastusRouter);

//Eesti filmi marsruudid
const eestifilmRouter = require('./routes/eestifilmRoutes');
app.use('/eestifilm', eestifilmRouter);

app.listen(5111);