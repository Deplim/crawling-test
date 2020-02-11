/* 대상 주소들 크롤링 코드
 * 현제 url 이 https://www.naver.com/ 일 때만 작동하며 이 페이지가 크롤링 기준점이 됩니다.
 * ReadMe 를 꼭 읽어보고 사용하시기 바랍니다.
 * 정의령 (https://github.com/Deplim)
 */ 

//크롤링을 시작하는 버튼 앨리먼트 생성.
var st_button = document.createElement('button');
st_button.innerHTML=("naver crawling");
st_button.style="position: fixed; top: 40px; right: 10px; z-index: 999; background-color:lightblue;";
document.body.appendChild(st_button);
st_button.addEventListener('click', naver_place_crawling);

//크롤링 정지 & 재시작을 재어하는 버튼 앨리먼트 생성.
var kk_button = document.createElement('button');
kk_button.innerHTML=("stop // go");
kk_button.style="position: fixed; top: 70px; right: 10px; z-index: 999; background-color:orange;";
document.body.appendChild(kk_button);
kk_button.addEventListener('click', go_switch);

//정지 & 진행 상태 플래그 & 페이지 열림 확인 플래그 & 자동 무한 반복 플래그.
var go_flag=1;
var ready_flag=1;

//db 에 있는 플레이스 캠핑장 
var current_camp=new Array();

//크롤링 결과 담길 변수들.
var result_ar=new Array();

var current_page=1;

var temp_link_window;

//자동 새로고침 방지.
window.addEventListener('beforeunload', function (e) {
	console.log("새로고침 시도\n\n\n");
    return false;
});

//정지 & 진행 상태 플래그 변환 함수.
function go_switch(){
	if(go_flag==0){
		go_flag=1
		crawling_repeat();
	}
	else if(go_flag==1){
		go_flag=0
	}
	return 0;
}

//크롤링 시작 함수.
function naver_place_crawling(){

	//로컬 웹 스토리지에서 대상 주소들 받아오기.
	chrome.storage.local.get(['address'], function(result) {
        current_camp=result.address

        //첫번째 주소 받아서와 윈도우 열기.
    	temp_link="https://store.naver.com/accommodations/list?ip=203.233.111.56&isService=true&page="+current_page+"&query=%EC%BA%A0%ED%95%91%EC%9E%A5&so=rel.dsc"
    	console.log("link: ", temp_link)
		temp_link_window=window.open(temp_link)	

		//윈도우가 열리는 것을 2.5 초 기다린 후 crawling_repeat 함수 시작.
		var timerID = setTimeout("crawling_repeat()", 2500); 
    });
}

//크롤링 반복 함수.
function crawling_repeat() { 

	//하나의 주소에 대하여 크롤링하고 재귀함수 형태로 받은 주소 갯수만큼 크롤링 반복. 

	//대상 주소를 열은 위도우의 readyState 를 얻어올 수 있는지 확인.
	ready_flag=0
	if(temp_link_window.document.readyState){
		ready_flag=1
	}
	

	//document 로드가 끝났는지 확인하는 속성인 readyState를 제대로 얻어왔고 상태가 complete 이라면 대상 페이지의 크롤링 시작.
	if(temp_link_window.document.readyState=="complete" && ready_flag===1){
		
		//크롤링 하는 도중 오류가 생기면 예외처리.
		try{

			// 현제 열린 페이지 주소 콘솔출력.
		    console.log("current address : ", temp_link_window.location.href);

		    // 대상 주소와 연 페이지의 주소가 같지 않다면 예외처리. 현제 한번 크롤링을 할때 5% 정도씩의 페이지에서 이 오류가 나옴.
		    if(temp_link_window.location.href!=="https://store.naver.com/accommodations/list?ip=203.233.111.56&isService=true&page="+current_page+"&query=%EC%BA%A0%ED%95%91%EC%9E%A5&so=rel.dsc"){
		    	throw new Error("윈도우 오픈 관련 오류로 인해 중복 추출됨")
		    }

		    list_place_col1=temp_link_window.document.getElementsByClassName("list_place_col1")[0].children;
    		for(j=0; j<list_place_col1.length; j++){
    			current_camp_href=list_place_col1[j].querySelector("a").href;
    			console.log(current_camp_href);
    			if(current_camp.includes(current_camp_href)){
    				console.log(current_camp.indexOf(current_camp_href));
    			}
    			else{
    				result_ar.push(current_camp_href);
    				console.log(current_camp_href);
    			}
    		}
	    
		}

		//크롤링 도중 오류가 생긴 경우 결과 반영이 되지 않는다.
		catch(e){
			console.log(e)
			try{
				//대상 페이지가 없어진 경우 isDelete 가 1이게 한 결과를 따로 추가한다.
				if(temp_link_window.document.title.includes("페이지를 찾을 수 없습니다.")){
					console.log("요청 페이지 없음.")				
				}
			}
			//아예 페이지가 제대로 열리지 않은 경우 위의 if 문에서 title 을 찾지 못해 오류가 나므로, 예외처리하고 크롤링 지속.
			catch(e){
				console.log(e)
			}
		}


		// 현제 크롤링한 페이지가 받은 주소들의 마지막이면 결과 저장.
		if(current_page==379){
			return 0;
		}

		//현제 크롤링한 페이지 닫기.
		temp_link_window.close()

	    //다음 주소로 넘어간다.
		current_page=current_page+1;

		//이전 페이지에서 콘솔 출력한 내용들과 구분되도록 쓴것.
		console.log("\n\n\nopen link.")

		//대상 추소 콘솔 출력
		temp_link="https://store.naver.com/accommodations/list?ip=203.233.111.56&isService=true&page="+current_page+"&query=%EC%BA%A0%ED%95%91%EC%9E%A5&so=rel.dsc"

		//대상 주소 윈도우 열기
		temp_link_window=window.open(temp_link)

		// go_flag 가 1이면 실행을 지속하는 것이므로 윈도우 열리는 것을 2.5초 기다리고 크롤링 반복 함수 실행.
		if(go_flag==1){
			var timerID = setTimeout("crawling_repeat()", 2500); 
		}
	}

	//2.5 초를 기다렸으나 document 의 로드가 제대로 되지 않은 것우.
	else{
		console.log("\n\n\nLink is not open yet")

		// 결과를 제대로 크롤링하지 못했으므로 다음 주소로 넘어가지 않고 같은 주소로 반복.
		console.log("link: ", target[current_target][1])

		// 아예 document.readyState 를 가져오지 못한 경우.
		if(ready_flag===0){

			//페이지를 닫고 다시 열어본다.
			temp_link_window.close()
			console.log("Failed to open link and try again.")
			temp_link_window=window.open(target[current_target][1])
		}

		// document 는 얻어올 수 있지만 아직 로드가 완료되지 않은 경우.
		if(go_flag==1){

			//페이지를 그대로 둔채 한번 더 기다려준다.
			var timerID = setTimeout("crawling_repeat()", 2500); 
		}
	}
}

