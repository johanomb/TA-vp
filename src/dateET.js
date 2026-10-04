//function dateFormattedET(){
exports.dateFormattedET = function(mode = 0){
	let timeNow = new Date();
	const monthNamesET = ['jaanuar', 'veebruar', 'märts', 'aprill', 'mai', 'juuni', 'juuli', 'august', 'september', 'oktoober', 'november', 'detsember'];
	const folkMonthNamesET = ['näärikuu', 'küünlakuu', 'paastukuu', 'jürikuu', 'lehekuu', 'jaanikuu', 'heinakuu', 'lõikuskuu', 'mihklikuu', 'viinakuu', 'talvekuu', 'jõulukuu'];
	let monthIndex = timeNow.getMonth();
	let monthName = (mode === 1) ? folkMonthNamesET[monthIndex] : monthNamesET[monthIndex];
	
	let weekDay = new Date().getDay();
	const weekdayNamesET = ['pühapäev', 'esmaspäev', 'teisipäev', 'kolmapäev', 'neljapäev', 'reede', 'laupäev'];
	return weekdayNamesET[timeNow.getDay()] + ', ' + timeNow.getDate() + '. ' + monthName + ' ' + timeNow.getFullYear();
}
