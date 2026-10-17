const dateET = require('../src/dateTimeET');
const regTextRef = 'public/txt/visits.txt';
const fs = require('fs').promises;
//@desc home page for registering visits
//@route GET /regvisit
//@access public

//app.get('/regvisit', (req, res)=>{
const regvisit = (req, res) => {
	res.render('regvisit');
};

let lastVisitorName = ''; 
let lastVisitDate = '';
let lastVisitTime = '';
//@desc home page for adding a visitor name
//@route GET /regvisit
//@access public
//app.post('/regvisit', async (req, res)=>{
const regvisitpost = async (req, res) => {
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
};

//@desc home page for viewing last visitor name
//@route GET /viimane
//@access public
//app.get('/regvisit/viimane', (req, res) => {
const viimane = (req, res) => {
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
};

module.exports = {
	regvisit,
	regvisitpost,
	viimane
}