/* 대상 주소들 크롤링 코드
 * 현제 url 이 https://www.naver.com/ 일 때만 작동하며 이 페이지가 크롤링 기준점이 됩니다.
 * ReadMe 를 꼭 읽어보고 사용하기 바랍니다.
 * 정의령 (https://github.com/Deplim)
 */ 

//크롤링을 시작하는 버튼 앨리먼트 생성.
var st_button = document.createElement('button');
st_button.innerHTML=("naver crawling");
st_button.className="g_button"
st_button.addEventListener('click', naver_place_crawling);

//크롤링 정지 & 재시작을 재어하는 버튼 앨리먼트 생성.
var kk_button = document.createElement('button');
kk_button.innerHTML=("stop // go");
kk_button.className="g_button"
kk_button.addEventListener('click', go_switch);

var temp_tr=document.createElement('tr');
document.getElementById("ext_block_tbody").appendChild(temp_tr)
temp_tr.appendChild(st_button)

var temp_tr=document.createElement('tr');
document.getElementById("ext_block_tbody").appendChild(temp_tr)
temp_tr.appendChild(kk_button)

//정지 & 진행 상태 플래그 & 페이지 열림 확인 플래그 & 자동 무한 반복 플래그.
var go_flag=1;
var ready_flag=1;
var auto_flag=0;

//크롤링 대상 플레이스 인덱스와 주소들을 담을 배열과 그 길이.
var target=new Array();
var address_length=0;

//현제 크롤링하는 플레이스 주소 & 대상 주소를 열은 페이지 객체.
var current_target=0;
var temp_link;
var temp_link_window;

//크롤링 결과 담길 변수들. 결과는 json 형태의 문자열로 저장하지만, 블로그 리뷰만 배열 형태로 따로 저장한다.
var result=Array();

//자동 새로고침 방지.
window.addEventListener('beforeunload', function (e) {
	console.log("새로고침 시도\n\n\n");
    return false;
});

//로컬 웹 스토리지에 저장된 auto_flag 가져와서 1이라면 자동으로 크롤링 함수 시작.
chrome.storage.local.get(['auto_flag'], function(result) {
	if(result.auto_flag){
		auto_flag=result.auto_flag;
	}
	if(auto_flag===1){
		naver_place_crawling()
	}
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

// "37.9041288" , "127.3746013"
//https://store.naver.com/accommodations/list?bounds=127.36460129999999%37.894128800000004%127.3846013%37.9141288&ip=203.233.111.56&isService=true&query=%EC%BA%A0%ED%95%91%EC%9E%A5&so=rel.dsc
function make_url(lat, lng){
	var lng1=parseFloat(lng)-0.01
	var lng2=parseFloat(lng)+0.01
	var lat1=parseFloat(lat)-0.01
	var lat2=parseFloat(lat)+0.01

	var link="https://store.naver.com/accommodations/list?bounds="+lng1+"%3B"+lat1+"%3B"+lng2+"%3B"+lat2+"&ip=203.233.111.56&isService=true&query=%EC%BA%A0%ED%95%91%EC%9E%A5&so=rel.dsc"
	return link
}

//크롤링 시작 함수.
function naver_place_crawling(){

	//로컬 웹 스토리지에서 대상 주소들 받아오기.
	chrome.storage.local.get(['address'], function(result) {
        target=result.address
        console.log(target)
        console.log("\n\n\n\n\n")
        
        //주소 길이 변수에 넣어주기.
        address_length=target.length;

        //첫번째 주소 받아서와 윈도우 열기.
    	temp_link=make_url(target[current_target][2], target[current_target][3])
    	console.log("title : ", target[current_target][1])
		console.log("link : ")
		console.log(temp_link)
		temp_link_window=window.open(temp_link, "target_window")	

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
		

		/* 크롤링 시작 !
		 * 크로링 도중 도중 오류가 생기면 예외처리.
		 */
		try{

		    // 대상 주소와 연 페이지의 주소가 같지 않다면 예외처리. 현제 한번 크롤링을 할때 5% 정도씩의 페이지에서 이 오류가 나옴.
		    if(temp_link_window.location.href!==temp_link){
		    	console.log("temp_link >>")
		    	console.log(temp_link)
		    	console.log("current location")
		    	console.log(temp_link_window.location.href)
		    	throw new Error("열린 윈도우의 주소와 타깃 주소가 다름")
		    }

		    // 크롤링 대상 요소들을 담을 변수들.


			if(temp_link_window.document.getElementsByClassName("no_data_area").length>0){
				console.log("조건에 맞는 업체 없음 >> ")
				console.log(temp_link_window.document.getElementsByClassName("no_data_area")[0])
			}
			else{
				console.log("조건에 맞는 업체 발견")

				var temp_list=temp_link_window.document.getElementsByClassName("list_place_col1")[0]
				for(var i=0; i<temp_list.children.length; i++){
					var title;
					var linkUrl;
					var temp_result={};

					var temp_camp=temp_list.children[i]				
					
					title=temp_camp.getElementsByClassName("name")[0].getElementsByTagName("span")[0].innerHTML
					linkUrl=temp_camp.getElementsByTagName("a")[0].getAttribute("href")

					temp_result["title"]=title
					temp_result["linkUrl"]=linkUrl

					result.push(temp_result)					
				}
			}
		}
		//크롤링 도중 오류가 생긴 경우 결과 반영이 되지 않는다.
		catch(e){
			console.log(e)
		}



		// 현제 크롤링한 페이지가 받은 주소들의 마지막이면 결과 저장.
		if(current_target==address_length-1){
			console.log("\n***** crawlign finish *****")
			chrome.storage.local.set({data1: result})

			console.log(result)

			//만약 auto_flag 가 1이라면 자동으로 서버 요청 페이지로 이동.
			
			chrome.storage.local.get(['auto_flag'], function(result) {
				if(result.auto_flag){
					auto_flag=result.auto_flag;
				}
				if(auto_flag===1){
					window.removeEventListener('beforeunload', function (e) {
						console.log("새로고침 시도\n\n\n");
   						return false;
					});
					window.location.href="http://hushit.live/service/post_page.html"
				}
			});
			
			return 0;
		}

		// 현제 크롤링한 페이지가 10의 배수이면 크롤링 결과 백업
		if(current_target%10==0){
			console.log("\n***** crawling backup *****")
		}

		//현제 크롤링한 페이지 닫기.
		temp_link_window.close()

	    //다음 주소로 넘어간다.
		current_target=current_target+1;

		//이전 페이지에서 콘솔 출력한 내용들과 구분되도록 쓴것.
		console.log("\n\n\n\n\n-----------------------------------\nopen link.")

		//대상 주소 윈도우 열기
		temp_link=make_url(target[current_target][2], target[current_target][3])
		console.log("title : ", target[current_target][1])
		console.log("link : ")
		console.log(temp_link)
		temp_link_window=window.open(temp_link, "target_window")

		// go_flag 가 1이면 실행을 지속하는 것이므로 윈도우 열리는 것을 2.5초 기다리고 크롤링 반복 함수 실행.
		if(go_flag==1){
			var timerID = setTimeout("crawling_repeat()", 2500); 
		}
	}

	//2.5 초를 기다렸으나 document 의 로드가 제대로 되지 않은 것우.
	else{
		console.log("***** Link is not open yet *****")

		// 결과를 제대로 크롤링하지 못했으므로 다음 주소로 넘어가지 않고 같은 주소로 반복.


		// 아예 document.readyState 를 가져오지 못한 경우.
		if(ready_flag===0){

			//페이지를 닫고 다시 열어본다.
			temp_link_window.close()
			console.log("***** Failed to get readyState and try again. *****")
			temp_link_window=window.open(temp_link, "target_window")
		}

		// document 는 얻어올 수 있지만 아직 로드가 완료되지 않은 경우.
		if(go_flag==1){

			//페이지를 그대로 둔채 한번 더 기다려준다.
			var timerID = setTimeout("crawling_repeat()", 2500); 
		}
	}
}






