const mysql = require('mysql2/promise');
exports.isLogin = async function(req, res, next){
	//kui on sessioon olemas
	if(req.session != null){
		if(req.session.userId){
			console.log('Sisseloginud kasutaja :' + req.session.userId);
			let conn;
            try {
                conn = await mysql.createConnection({
                    host: process.env.DB_HOST,
                    user: process.env.DB_USER,
                    password: process.env.DB_PASS,
                    database: process.env.DB_NAME
                });

                const sqlReq = 'SELECT firstname FROM users WHERE id = ?';
                const [users] = await conn.execute(sqlReq, [req.session.userId]);

                res.locals.firstname = users.length > 0 ? users[0].firstname : '';

                next();

            } catch(err) {
                console.log('Viga: ' + err);
                next(err);
            } finally {
                if(conn){
                    await conn.end();
                }
            }
		} else {
			console.log('Pole sisseloginud, pole sessiooni muutujat!');
			return res.redirect('/signin');
		}
	} else {
		console.log('Sessiooni pole!');
		return res.redirect('/signin');
	}
}