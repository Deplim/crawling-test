/* 대상 주소들 크롤링 코드
 * 현제 url 이 https://www.naver.com/ 일 때만 작동하며 이 페이지가 크롤링 기준점이 됩니다.
 * ReadMe 를 꼭 읽어보고 사용하시기 바랍니다.
 * 정의령 (https://github.com/Deplim)
 */ 

//크롤링 정지 & 재시작을 재어하는 버튼 앨리먼트 생성.
var kk_button = document.createElement('button');
kk_button.innerHTML=("stop // go");
kk_button.style="position: fixed; top: 70px; right: 10px; z-index: 999; background-color:orange;";
document.body.appendChild(kk_button);
kk_button.addEventListener('click', go_switch);

//크롤링 대상 플레이스 인덱스와 주소들을 담을 배열과 그 길이.
var target=new Array();
var address_length=0;

//현제 크롤링하는 플레이스 주소 & 대상 주소를 열은 페이지 객체.
var current_target=0;
var current_target_url="";

//크롤링 결과 담길 변수들. 결과는 json 형태의 문자열로 저장하지만, 블로그 리뷰만 배열 형태로 따로 저장한다.
var result="";

console.log("hi");

window.onload=function(){
	chrome.storage.local.get(['go_flag'], function(result) {
		if(result.go_flag===1){
			discriminating()
		}
	});
}

//정지 & 진행 상태 플래그 변환 함수.
function go_switch(){
	chrome.storage.local.get(['go_flag'], function(result) {
		if(result.go_flag===0 || result.go_flag===undefined){
			chrome.storage.local.set({go_flag: 1})
			kk_button.innerHTML=("go flag switch (on)");
			console.log("go flag 1 로 바꿈.")
			set_target_url();
		}
		else if(result.go_flag===1){
			chrome.storage.local.set({go_flag: 0})
			kk_button.innerHTML=("go flag switch (off)");
			console.log("go flag 0 으로 바꿈.")
		}
	});
}

function discriminating(){
	alert("go ?");
    var timerID = setTimeout("set_target_url()", 5000); 
    chrome.storage.local.get(['current_target'], function(result) {
    	chrome.storage.local.set({current_target: result.current_target+1})
    });
}

//크롤링 시작 함수.
function set_target_url(){

	//로컬 웹 스토리지에서 대상 주소들 받아오기.
	chrome.storage.local.get(['target', 'current_target', 'go_flag'], function(result) {

		console.log(result);
        target=result.target        
        //주소 길이 변수에 넣어주기.
        address_length=target.length;
        current_target=result.current_target

        if(current_target==29){
        	alert("완료");
        }


    	var lat=parseFloat(target[current_target][0]);
    	var lng=parseFloat(target[current_target][1]);

    	current_target_url=current_target_url+"https://store.naver.com/accommodations/list?bounds=";
    	current_target_url=current_target_url+(lng-0.002).toFixed(4)+"%3B";
    	current_target_url=current_target_url+(lat-0.002).toFixed(4)+"%3B";
    	current_target_url=current_target_url+(lng+0.002).toFixed(4)+"%3B";
    	current_target_url=current_target_url+(lat+0.002).toFixed(4);
    	current_target_url=current_target_url+"&ip=203.233.111.56&isService=true&query=캠핑장&so=rel.dsc";


    	window.location.href=current_target_url;		
    });
}


