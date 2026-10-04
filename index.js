const express = require('express');
const fs = require('fs').promises;
//moodul URL-i lahtiharutamiseks, et saaks POST osad ka kätte
const bodyparser = require('body-parser');
const dateET = require('./src/dateTimeET');

const textRef = 'public/txt/vanasonad.txt';
const regTextRef = 'public/txt/visits.txt';

//kui pole nime sisestatud
let lastVisitorName = 'Keegi';

//käivitan express.js funktsiooni ja annan nimeks "app"
const app = express();
//määrame veebilehtedele mallide renderdamise mootori
app.set('view engine', 'ejs');
//määran ühe päris kataloogi virtuaalses serveris kättesaadavaks
app.use(express.static('public'));
app.use(bodyparser.urlencoded({extended: false}));

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

app.listen(5111);