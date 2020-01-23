var st_button = document.createElement('button');
st_button.innerHTML=("go go go");
st_button.style="position: fixed; top: 40px; right: 10px; z-index: 999; background-color:lightblue;";
document.body.appendChild(st_button);
st_button.addEventListener('click', naver_place_crawling2);

var temp_link_window;

function naver_place_crawling2(link){
	console.log("hello eui !")
	var temp=document.getElementsByClassName("thumb_area fr");
	temp_link=temp[0].href;
	temp_link_window=window.open(temp_link, "myWin")
	var timerID = setTimeout("myAlert(3)", 3000); 
}
function myAlert(time) { 
	console.log(temp_link_window.document.getElementsByClassName("name")[0].innerHTML)
	temp_link_window.close()
}
