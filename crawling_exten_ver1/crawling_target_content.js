var st_button = document.createElement('button');
st_button.innerHTML=("naver crawling");
st_button.style="position: fixed; top: 40px; right: 10px; z-index: 999; background-color:lightblue;";
document.body.appendChild(st_button);
st_button.addEventListener('click', naver_place_crawling);

var kk_button = document.createElement('button');
kk_button.innerHTML=("stop // go");
kk_button.style="position: fixed; top: 70px; right: 10px; z-index: 999; background-color:orange;";
document.body.appendChild(kk_button);
kk_button.addEventListener('click', go_switch);

var go_flag=1;

var target=new Array();
var address_length=0;

var current_target=0;
var temp_link_window;
var ready_flag=1;

var result="";
var blog_result=new Array();

var auto_flag=0;

chrome.storage.local.get(['auto_flag'], function(result) {
	if(result.auto_flag){
		auto_flag=result.auto_flag;
	}
	if(auto_flag===1){
		naver_place_crawling()
	}
});

function naver_place_crawling(){
	result=result+"{\"campGround\":[";
	chrome.storage.local.get(['address'], function(result) {
        target=result.address
        console.log(target)
        address_length=target.length;
    	temp_link=target[current_target][1];
    	console.log("link: ", temp_link)
		temp_link_window=window.open(temp_link)		
		var timerID = setTimeout("crawling_repeat()", 2500); 
    });
}

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

function crawling_repeat() { 

	ready_flag=0
	if(temp_link_window.document.readyState){
		ready_flag=1
	}
	
	if(temp_link_window.document.readyState=="complete" && ready_flag===1){
		try{
		    console.log("current address : ", temp_link_window.location.href);
		    if(temp_link_window.location.href!==target[current_target][1]){
		    	throw new Error("윈도우 오픈 관련 오류로 인해 중복 추출됨")
		    }

			var blog=null;
			var reviewCount=0;
			var bookReviewCount=0;
			var bookFlag=0;
			var rating=0;
			
			var list_item=temp_link_window.document.getElementsByClassName("list_item")[0].children;
			
			if(temp_link_window.document.getElementsByClassName("info_inner").length!=0){
				var info_inner=temp_link_window.document.getElementsByClassName("info_inner")[0].children;
				for(var i=0; i<info_inner.length; i++){
					if(typeof(info_inner[i].href)!="undefined"){
						if(info_inner[i].href.includes("bookingReview")){
							bookReviewCount=info_inner[i].innerHTML.split(">")[2]
							var book_review = temp_link_window.document.getElementById('tabs').querySelector("a[aria-label='예약자 리뷰']");
							book_review.click()
							temp_rating=temp_link_window.document.getElementsByClassName("score")[0].children[0].innerHTML;
							rating=parseFloat(temp_rating)*2*0.1;
							rating=rating.toFixed(2);
							if((bookReviewCount==null)||(bookReviewCount=="")||(rating==null)||(rating=="")){
								throw new Error("객체에서 값 넘어오지 않음")
							}
						}
						else if(info_inner[i].href.includes("fsasReview")){
							reviewCount=Number(info_inner[i].innerHTML.split(">")[2])

							blog="["
							var blog_review = temp_link_window.document.getElementById('tabs').querySelector("a[aria-label='블로그 리뷰']");
							blog_review.click(temp_link_window.document.getElementsByClassName("list_place_col1")[0])
							if(temp_link_window.document.getElementsByClassName("list_place_col1").length!=0){
								var list_place_col1=temp_link_window.document.getElementsByClassName("list_place_col1")[0].children;
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
									if(i==2){
										break;
									}
								}						
								blog=blog.slice(0, -1);
								blog=blog+"]";
								if((reviewCount==null)||(reviewCount=="")||(blog==null)||(blog=="")){
									throw new Error("객체에서 값 넘어오지 않음")
								}
							}
							else{
								blog=null;
								reviewCount=0;
							}
						}
					}			
				}
			}

			if(list_item[0].href.includes("booking.naver.com")){
				var bookFlag=1;
			}
			else{
				var bookFlag=0;
			}
			blog_result.push(blog)
			console.log(target[current_target][0], "\n", blog, "\n", reviewCount, "\n", bookReviewCount, "\n", bookFlag, "\n", rating, "\n", "isdelete = 0", "\n")
			result=result+"{\"campGroundIdx\":\""+target[current_target][0]+"\","+"\"reviewCount\":\""+reviewCount+"\","+"\"bookReviewCount\":\""+bookReviewCount+"\","+"\"bookFlag\":\""+bookFlag+"\","+"\"rating\":\""+rating+"\","+"\"isDelete\":\"0\"},";
		}
		catch(e){
			console.log(e)
			try{
				if(temp_link_window.document.title.includes("페이지를 찾을 수 없습니다.")){
					console.log("요청 페이지 없음.")
					blog_result.push(blog)
					result=result+"{\"campGroundIdx\":\""+target[current_target][0]+"\","+"\"reviewCount\":\"0\","+"\"bookReviewCount\":\"0\","+"\"bookFlag\":\"0\","+"\"rating\":\"0\","+"\"isDelete\":\"1\"},"
					console.log(target[current_target][0], "\n", blog, "\n", reviewCount, "\n", bookReviewCount, "\n", bookFlag, "\n", rating, "\n", "isdelete = 1", "\n")
				}
			}
			catch(e){
				console.log(e)
			}
		}
		if(current_target%10==0){
			console.log(result)
			console.log(blog_result)
			chrome.storage.local.set({data1: result})
			chrome.storage.local.set({data2: blog_result})
		}
		if(current_target==address_length-1){
			console.log(result)
			console.log(blog_result)
			chrome.storage.local.set({data1: result})
			chrome.storage.local.set({data2: blog_result})
			if(auto_flag===1){
				window.location.href="http://hushit.live/service/camper/api/v1_crawling/get_list_todo_detail_naver_javascrpit.php"
			}
			return 0;
		}

		temp_link_window.close()
		current_target=current_target+1;

		console.log("\n\n\nopen link.")
		console.log("link: ", target[current_target][1])
		temp_link_window=window.open(target[current_target][1])

		if(go_flag==1){
			var timerID = setTimeout("crawling_repeat(1)", 2500); 
		}
	}
	else{
		console.log("\n\n\nLink is not open yet")
		console.log("link: ", target[current_target][1])
		if(ready_flag===0){
			temp_link_window.close()
			console.log("Failed to open link and try again.")
			temp_link_window=window.open(target[current_target][1])
		}

		if(go_flag==1){
			var timerID = setTimeout("crawling_repeat(1)", 2500); 
		}
	}
}

