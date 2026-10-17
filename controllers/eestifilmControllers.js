const mysql = require('mysql2/promise');

//@desc home page for Estonian Film section
//@route GET /eestifilm
//@access public

// defineerib ühe funktsiooni ehk konstandi
//app.get('/eestifilm', (req, res)=>{
const eestifilm = (req, res) => {
	res.render('eestifilm');
};

//@desc home page for list of people involved in Estonian Film industry
//@route GET /eestifilm/inimesed
//@access public
//app.get('/eestifilm/inimesed', async (req, res)=>{
const inimesed = async (req, res) => {
	//console.log('Andmebaasiserver on: ' + process.env.DB_HOST);
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
};

//@desc home page for adding people involved in Estonian Film industry
//@route GET /eestifilm/inimesed_add
//@access public
//app.get('/eestifilm/inimesed_add', (req, res)=>{
const inimesedAdd = (req, res) => {
	res.render('eestifilminimesed_add', {notice: 'Ootan sisestust!', firstNameInput: '', lastNameInput: '', bornInput: '', deceasedInput: ''});
};

//@desc home page for adding people involved in Estonian Film industry
//@route POST /eestifilm/inimesed_add
//@access public
//app.post('/eestifilm/inimesed_add', async (req, res)=>{
const inimesedAddpost = async (req, res) => {
	console.log(req.body);
	//kontrollime andmete olemasolu
	
	const now = new Date(); // fikseerib praeguse hetke
	const bornDate = new Date(req.body.bornInput); // teeb sisestatud kuupäevast ajaobjekti
	const deceasedDate = new Date(req.body.deceasedInput);
	
	if(!req.body.firstNameInput || !req.body.lastNameInput || isNaN(bornDate.getTime()) || bornDate > now || (req.body.deceasedInput && (isNaN(deceasedDate.getTime()) || deceasedDate < bornDate || deceasedDate > now))){
		console.log('Andmed pole korrektsed');
		return res.render('eestifilminimesed_add', {notice: 'Andmed on puudulikud!', firstNameInput: req.body.firstNameInput || '', lastNameInput: req.body.lastNameInput || '', bornInput: req.body.bornInput || '', deceasedInput: req.body.deceasedInput || ''});
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
		res.render('eestifilminimesed_add', {notice: 'Andmed salvestati, ootan uut sisestust!', firstNameInput: '', lastNameInput: '', bornInput: '', deceasedInput: ''});
	}
	catch (err){
		console.log('Viga andmebaasiga suhtlemisel: ' + err);
		res.render('eestifilminimesed_add', {notice: 'Tekkis viga, andmeid ei salvestatud!', firstNameInput: req.body.firstNameInput || '', lastNameInput: req.body.lastNameInput || '', bornInput: req.body.bornInput || '', deceasedInput: req.body.deceasedInput || ''});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
};

//@desc home page for list of Estonian Films section
//@route POST /eestifilm/filmid
//@access public
//app.get('/eestifilm/filmid', async (req, res)=>{
const filmid = async (req, res) => {
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
};

//@desc home page for adding Estonian Films
//@route POST /eestifilm/filmid_add
//@access public
//app.get('/eestifilm/filmid_add', (req, res)=>{
const filmidAdd = (req, res) => {
	res.render('eestifilmid_add', {notice: 'Ootan sisestust!', titleInput: '', releaseYearInput: '', durationMinutesInput: '', descriptionInput: ''});
};

//@desc home page for adding Estonian Films
//@route POST /eestifilm/filmid_add
//@access public
//app.post('/eestifilm/filmid_add', async (req, res)=>{
const filmidAddpost = async (req, res) => {
	console.log(req.body);
	if(!req.body.titleInput || !req.body.durationMinutesInput || req.body.releaseYearInput >= new Date().getFullYear()){
		console.log('Andmed pole korrektsed');
		return res.render('eestifilmid_add', {notice: 'Andmed on puudulikud!', titleInput: req.body.titleInput || '', releaseYearInput: req.body.releaseYearInput || '', durationMinutesInput: req.body.durationMinutesInput || '', descriptionInput: req.body.descriptionInput || ''});
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
		res.render('eestifilmid_add', {notice: 'Andmed salvestati, ootan uut sisestust!', titleInput: '', releaseYearInput: '', durationMinutesInput: '', descriptionInput: ''});
	}
	catch (err){
		console.log('Viga andmebaasiga suhtlemisel: ' + err);
		res.render('eestifilmid_add', {notice: 'Tekkis viga, andmeid ei salvestatud!', titleInput: req.body.titleInput || '', releaseYearInput: req.body.releaseYearInput || '', durationMinutesInput: req.body.durationMinutesInput || '', descriptionInput: req.body.descriptionInput || ''});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
};

//@desc home page for list of film industries
//@route POST /eestifilm/filmiametid
//@access public
//app.get('/eestifilm/filmiametid', async (req, res)=>{
const filmiametid = async (req, res) => {
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
};

//@desc home page for adding film industries
//@route POST /eestifilm/filmiametid_add
//@access public
//app.get('/eestifilm/filmiametid_add', (req, res)=>{
const filmiametidAdd = (req, res) => {
	res.render('filmiametid_add', {notice: 'Ootan sisestust!'});
};

//@desc home page for adding film industries
//@route POST /eestifilm/filmiametid_add
//@access public
//app.post('/eestifilm/filmiametid_add', async (req, res)=>{
const filmiametidAddpost = async (req, res) => {
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
};

//@desc home page for list of Estonian movies and people
//@route GET /eestifilm/eestiinimesedfilmis
//@access public
const inimesedfilmis = async (req, res) => {
	//console.log('Anmebaasiserver on: ' + process.env.DB_HOST);
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		//võibolla alumise selecti asemel panna: SELECT first_name, last_name from person, veel SELECT title from movie, SELECT title from profession.
		const [person] = await conn.execute('SELECT * FROM person');
		const [movie] = await conn.execute('SELECT * FROM movie');
		const [profession] = await conn.execute('SELECT * FROM profession');
		
		const sqlReq = 'SELECT person_in_movie.*, person.first_name, person.last_name, movie.title AS movie_title, profession.title AS profession_title FROM person_in_movie JOIN person ON person.id = person_in_movie.person_id JOIN movie ON movie.id = person_in_movie.movie_id JOIN profession ON profession.id = person_in_movie.profession_id ORDER BY person_in_movie.id';
		const [seosed] = await conn.execute(sqlReq);
		console.log(seosed);
		let notice = 'Ootan sisestust!';

		if (req.query.notice === 'salvestatud') {
			notice = 'Andmed salvestati, ootan uut sisestust!';
		} else if (req.query.notice === 'olemas') {
			notice = 'Selline seos on juba olemas!';
		} else if (req.query.notice === 'viga') {
			notice = 'Andmeid ei salvestatud, tekkis viga!';
		}

		res.render('eestiinimesedfilmis', {
			person: person,
			movie: movie,
			profession: profession,
			seosed: seosed,
			notice: notice
		});
	}
	catch (err){
		console.log('Viga andmebaasist lugemisel: ' + err);
		res.render('Andmebaasi lugemisel tekkis viga.');
		//res.render('eestiinimesedfilmis', {person_in_movieList: [], person: [], movie: [], profession: []});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
};

//@desc home page for adding people in movies
//@route GET /eestifilm/inimesedfilmis
//@access public
const inimesedfilmisAdd = (req, res) => {
	res.render('eestinimesedfilmis', {notice: 'Ootan sisestust!', person: [], movie: [], profession: [], seosed: []});
}

//@desc home page for adding people in movies
//@route POST /eestifilm/inimesedfilmis
//@access public
const inimesedfilmisAddpost = async (req, res) => {
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		const {person_id, movie_id, profession_id} = req.body;
		let {character_name} = req.body;
		const [amet] = await conn.execute('SELECT title FROM profession WHERE id = ?', [profession_id]);
		//kontroll, kas tegu on näitlejaga või mitte
		
		if (amet[0].title === 'Näitleja') {
			if (!character_name){
				character_name = null;
			}
		} else if (!character_name || !character_name.trim()){
			character_name = null;
		}
		
		const[olemas] = await conn.execute('SELECT * FROM person_in_movie WHERE person_id = ? AND movie_id = ? AND profession_id = ? AND character_name <=> ?', [person_id, movie_id, profession_id, character_name]);
		if (olemas.length === 0) {
			await conn.execute('INSERT INTO person_in_movie (person_id, movie_id, profession_id, character_name) VALUES (?, ?, ?, ?)', [person_id, movie_id, profession_id, character_name]);
			res.redirect('/eestifilm/inimesedfilmis?notice=salvestatud');
		} else {
			res.redirect('/eestifilm/inimesedfilmis?notice=olemas');
		}
	
	} 
	
	catch (err){
		console.log('Viga seose lisamisel: ' + err);
		res.redirect('/eestifilm/inimesedfilmis?notice=viga');
	} 
	finally {
		if(conn){
			await conn.end();
		}
	}
}

module.exports = {
	eestifilm,
	inimesed,
	inimesedAdd,
	inimesedAddpost,
	filmid,
	filmidAdd,
	filmidAddpost,
	filmiametid,
	filmiametidAdd,
	filmiametidAddpost,
	inimesedfilmis,
	inimesedfilmisAdd,
	inimesedfilmisAddpost
}