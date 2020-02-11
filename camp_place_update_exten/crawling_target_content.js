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
var auto_flag=0;

//크롤링 대상 플레이스 인덱스와 주소들을 담을 배열과 그 길이.
var target=new Array();
var address_length=0;

//현제 크롤링하는 플레이스 주소 & 대상 주소를 열은 페이지 객체.
var current_target=0;
var temp_link_window;

//크롤링 결과 담길 변수들. 결과는 json 형태의 문자열로 저장하지만, 블로그 리뷰만 배열 형태로 따로 저장한다.
var result="";
var blog_result=new Array();

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

//크롤링 시작 함수.
function naver_place_crawling(){

	//result 형식은 json. 처음부분에 필요한 문자열로 초기화.
	result=result+"{\"campGround\":[";

	//로컬 웹 스토리지에서 대상 주소들 받아오기.
	chrome.storage.local.get(['address'], function(result) {
        target=result.address
        console.log(target)
        
        //주소 길이 변수에 넣어주기.
        address_length=target.length;

        //첫번째 주소 받아서와 윈도우 열기.
    	temp_link=target[current_target][1];
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
		    if(temp_link_window.location.href!==target[current_target][1]){
		    	throw new Error("윈도우 오픈 관련 오류로 인해 중복 추출됨")
		    }

		    // 크롤링 대상 요소들을 담을 변수들.
			var blog=null;
			var reviewCount=0;
			var bookReviewCount=0;
			var bookFlag=0;
			var rating=0;
			
			/*
			 *아래의 코드들은 크롤링 대상 페이지가 네이버 플레이스라는 가정하에 작성.
			 */
			
			//장소 이름 아래에 예약자 리뷰, 블로그 리뷰의 갯수가 적혀있는 있는 링크들의 리스트가 존재하는지 확인한다.
			if(temp_link_window.document.getElementsByClassName("info_inner").length!=0){

				//리스트의 앨리먼트를 얻어온다.
				var info_inner=temp_link_window.document.getElementsByClassName("info_inner")[0].children;
				
				for(var i=0; i<info_inner.length; i++){

					//연결 주소가 비어있지 않은 앨리먼드들에 대하여 
					if(typeof(info_inner[i].href)!="undefined"){

						//네이버예약 예약자 갯수 앨리먼트를 찾으면
						if(info_inner[i].href.includes("bookingReview")){

							// 예약자 리뷰 갯수를 얻어온다.
							bookReviewCount=info_inner[i].innerHTML.split(">")[2]

							// 예약자 리뷰 영역을 열도록 링크를 클릭.
							var book_review = temp_link_window.document.getElementById('tabs').querySelector("a[aria-label='예약자 리뷰']");
							book_review.click()

							// 예약자 리뷰 별점을 얻어온다.
							temp_rating=temp_link_window.document.getElementsByClassName("score")[0].children[0].innerHTML;
							rating=parseFloat(temp_rating)*2*0.1;
							rating=rating.toFixed(2);

							// 값을 얻어오지 못한 경우 예외처리.
							if((bookReviewCount==null)||(bookReviewCount=="")||(rating==null)||(rating=="")){
								throw new Error("객체에서 값 넘어오지 않음")
							}
						}

						// 블로그 예약자 갯수 앨리먼트를 찾으면
						else if(info_inner[i].href.includes("fsasReview")){

							//블로그 예약 갯수를 얻어온다.
							reviewCount=Number(info_inner[i].innerHTML.split(">")[2])

							//블로그 크롤링 결과 담을 문자열 초기화.
							blog="["

							// 블로그 리뷰 영역을 열도록 링크를 클릭.
							var blog_review = temp_link_window.document.getElementById('tabs').querySelector("a[aria-label='블로그 리뷰']");
							blog_review.click(temp_link_window.document.getElementsByClassName("list_place_col1")[0])

							// 블로그 리뷰 영역에 제대로 내용이 있는지 확인.
							if(temp_link_window.document.getElementsByClassName("list_place_col1").length!=0){

								//블로그 리뷰 영역 첫번째 페이지의 리뷰 갯수 얻어오기.
								var list_place_col1=temp_link_window.document.getElementsByClassName("list_place_col1")[0].children;

								//블로그 리뷰 크롤링.
								for(var i=0; i<list_place_col1.length; i++){
									blog=blog+"{\"title\":\""+list_place_col1[i].getElementsByClassName("name")[0].innerHTML+"\""
									blog=blog+",\"content\":\""+list_place_col1[i].getElementsByClassName("txt ellp2")[0].innerHTML+"\""
									blog=blog+",\"author\":\""+list_place_col1[i].getElementsByClassName("info name")[0].children[0].innerHTML+"\""
									blog=blog+",\"linkUrl\":\""+list_place_col1[i].getElementsByClassName("name")[0].href+"\""
									if(list_place_col1[i].getElementsByClassName("thumb").length!=0){	
										temp_imageUrl=list_place_col1[i].getElementsByClassName("thumb")[0].children[0].src;												
										temp_imageUrl=temp_imageUrl.slice(0, temp_imageUrl.lastIndexOf("%"));
										blog=blog+",\"imageUrl\":\""+temp_imageUrl+"\"";
									}
									else{
										blog=blog+",\"imageUrl\":\"null\"";
									}
									blog=blog+",\"registDate\":\""+list_place_col1[i].getElementsByClassName("info time")[0].innerHTML+"\"},"
									
									//블로그 크롤링은 3개까지만.
									if(i==2){
										break;
									}
								}						
								blog=blog.slice(0, -1);
								blog=blog+"]";

								//값을 얻어오지 못한 경우 예외처리.
								if((reviewCount==null)||(reviewCount=="")||(blog==null)||(blog=="")){
									throw new Error("객체에서 값 넘어오지 않음")
								}
							}

							//블로그 리뷰 영역에 내용이 없는 경우.
							else{

								//blog 크롤링 결과 null 처리.
								blog=null;

								//실제 블로그 리뷰가 없음에도 페이지에서 블로그 리뷰 갯수가 있다고 표시된 경우이므로 리뷰 갯수 0 처리.
								reviewCount=0;
							}
						}
					}			
				}
			}

			//장소 이름 아래에 예약, 길찾기, 거리뷰, 공유 등의 링크들이 있는 리스트의 앨리먼트를 얻어온다. 
			var list_item=temp_link_window.document.getElementsByClassName("list_item")[0].children;

			//리스트의 첫번째 앨리먼트에 예약 유무에 따라 북 플래그 결정.
			if(list_item[0].href.includes("booking.naver.com")){
				var bookFlag=1;
			}
			else{
				var bookFlag=0;
			}

			//현제 페이지의 크롤링 결과 콘솔화면에 출력.
			console.log(target[current_target][0], "\n", blog, "\n", reviewCount, "\n", bookReviewCount, "\n", bookFlag, "\n", rating, "\n", "isdelete = 0", "\n")

			//블로그 크롤링 결과 배열에 입력.
			blog_result.push(blog)

			//크롤링 결과 문자열에 추가.
			result=result+"{\"campGroundIdx\":\""+target[current_target][0]+"\","+"\"reviewCount\":\""+reviewCount+"\","+"\"bookReviewCount\":\""+bookReviewCount+"\","+"\"bookFlag\":\""+bookFlag+"\","+"\"rating\":\""+rating+"\","+"\"isDelete\":\"0\"},";
		}

		//크롤링 도중 오류가 생긴 경우 결과 반영이 되지 않는다.
		catch(e){
			console.log(e)
			try{
				//대상 페이지가 없어진 경우 isDelete 가 1이게 한 결과를 따로 추가한다.
				if(temp_link_window.document.title.includes("페이지를 찾을 수 없습니다.")){
					console.log("요청 페이지 없음.")
					blog_result.push(blog)
					result=result+"{\"campGroundIdx\":\""+target[current_target][0]+"\","+"\"reviewCount\":\"0\","+"\"bookReviewCount\":\"0\","+"\"bookFlag\":\"0\","+"\"rating\":\"0\","+"\"isDelete\":\"1\"},"
					console.log(target[current_target][0], "\n", blog, "\n", reviewCount, "\n", bookReviewCount, "\n", bookFlag, "\n", rating, "\n", "isdelete = 1", "\n")
				}
			}
			//아예 페이지가 제대로 열리지 않은 경우 위의 if 문에서 title 을 찾지 못해 오류가 나므로, 예외처리하고 크롤링 지속.
			catch(e){
				console.log(e)
			}
		}

		// 현제 크롤링한 페이지가 10의 배수이면 크롤링 결과 백업
		if(current_target%10==0){
			console.log(result)
			console.log(blog_result)
			chrome.storage.local.set({data1: result})
			chrome.storage.local.set({data2: blog_result})
		}

		// 현제 크롤링한 페이지가 받은 주소들의 마지막이면 결과 저장.
		if(current_target==address_length-1){
			console.log(result)
			console.log(blog_result)
			chrome.storage.local.set({data1: result})
			chrome.storage.local.set({data2: blog_result})

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

		//현제 크롤링한 페이지 닫기.
		temp_link_window.close()

	    //다음 주소로 넘어간다.
		current_target=current_target+1;

		//이전 페이지에서 콘솔 출력한 내용들과 구분되도록 쓴것.
		console.log("\n\n\nopen link.")

		//대상 추소 콘솔 출력
		console.log("link: ", target[current_target][1])

		//대상 주소 윈도우 열기
		temp_link_window=window.open(target[current_target][1])

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

