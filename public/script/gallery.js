window.onload = function(){
	let allThumbs = document.querySelector("#gallery").querySelectorAll(".thumbs");
	for(let i = 0; i < allThumbs.length; i ++){
		allThumbs[i].addEventListener("click", openModal);
	}
	document.querySelector("#modalClose").addEventListener("click", closeModal);
	document.querySelector("#modalImage").addEventListener("click", closeModal);
}

function openModal(e){
	document.querySelector("#modalImage").src = "/gallery/normal/" + e.target.dataset.file_name;
	document.querySelector("#modalCaption").innerHTML = e.target.alt;
	let privacy = e.target.dataset.privacy;
	if (privacy == 1) {
		document.querySelector("#modalPrivacy").innerHTML = "Privaatsus: Privaatne";
	} else if (privacy == 2){
		document.querySelector("#modalPrivacy").innerHTML = "Privaatsus: Sisseloginud kasutajatele";
	} else if (privacy == 3){
		document.querySelector("#modalPrivacy").innerHTML = "Privaatsus: Avalik";
	}
	document.querySelector("#modal").showModal();
}

function closeModal(){
	document.querySelector("#modal").close();
	document.querySelector("#modalImage").src = "../pic/empty.png";
	document.querySelector("#modalCaption").innerHTML = "galeriipilt";
	document.querySelector("#modalPrivacy").innerHTML = "";
}