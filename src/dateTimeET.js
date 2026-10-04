//function dateFormattedET(){
const dateFormattedET = function(mode = 0){ //või ka export.dateFormattedET
	let timeNow = new Date();
	const monthNamesET = ['jaanuar', 'veebruar', 'märts', 'aprill', 'mai', 'juuni', 'juuli', 'august', 'september', 'oktoober', 'november', 'detsember'];
	
	const folkMonthNamesET = ['näärikuu', 'küünlakuu', 'paastukuu', 'jürikuu', 'lehekuu', 'jaanikuu', 'heinakuu', 'lõikuskuu', 'mihklikuu', 'viinakuu', 'talvekuu', 'jõulukuu'];
	let monthIndex = timeNow.getMonth();
	let monthName = (mode === 1) ? folkMonthNamesET[monthIndex] : monthNamesET[monthIndex]; //kolm võrdusmärki on equal value and equal type!
	
	let weekDay = new Date().getDay();
	const weekdayNamesET = ['pühapäev', 'esmaspäev', 'teisipäev', 'kolmapäev', 'neljapäev', 'reede', 'laupäev'];
	let dayName = weekdayNamesET[timeNow.getDay()];
	
	return dayName + ', ' + timeNow.getDate() + '. ' + monthName + ' ' + timeNow.getFullYear();
}

const timeFormattedET = function(){
	let timeNow = new Date();
	let hourNow = timeNow.getHours();
	let minuteNow = timeNow.getMinutes();
	let secondNow = timeNow.getSeconds();
	if (hourNow < 10){
		hourNow = '0' + hourNow;
	}
	if (minuteNow < 10){
		minuteNow = '0' + minuteNow;
	}
	if (secondNow < 10){
		secondNow = '0' + secondNow;
	}
	let timeFormatted = hourNow + ':' + minuteNow + ':' + secondNow;
	return timeFormatted;
}

//ekspordin kõik vajaliku
module.exports = {fullDate: dateFormattedET, fullTime: timeFormattedET}