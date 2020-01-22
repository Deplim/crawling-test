var tt_button = document.createElement('button');
tt_button.innerHTML=("get address");
tt_button.style="position: fixed; top: 40px; right: 130px; z-index: 999; background-color:yellow;";
document.body.appendChild(tt_button);
tt_button.addEventListener('click', get_address);

var ss_button = document.createElement('button');
ss_button.innerHTML=("db update");
ss_button.style="position: fixed; top: 70px; right: 130px; z-index: 999; background-color:lightgreen;";
document.body.appendChild(ss_button);
ss_button.addEventListener('click', jsonSend);

var target=new Array()

var result="";
var blog_result=new Array();

function get_address(){
	var data_str=document.getElementsByTagName("pre")[0].textContent.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
	var data_splited=data_str.split(',')
	var target_idx;
	var target_url
	for (var i in data_splited){
		if(data_splited[i].includes("campGroundIdx")){
			temp=data_splited[i].split('\"')
			temp_idx=temp.indexOf("campGroundIdx")
			target_idx=temp[temp_idx+2]
		}
		else if(data_splited[i].includes("linkUrl")){
			temp=data_splited[i].split('\"')
			target_url=temp[3]
			console.log(target_url)
			target.push([target_idx, target_url])
		}
	}
	chrome.storage.local.set({address: target})
}

function jsonSend() {
	chrome.storage.local.get(['data1'], function(res) {
		result=res.data1;
		result=result.slice(0, -1);
		result=result+"]}";
		chrome.storage.local.get(['data2'], function(res) {
			blog_result=res.data2;
			console.log(result);
			console.log(blog_result)
			$.ajax({
				method : "POST",
				url : "http://hushit.live/service/camper/api/v1_crawling/set_naver_detail_javascript.php",
				//url : "http://localhost:8080/nmt/NMTTestServlet",
				data : {"data":result, "data2" : blog_result}, //json을 보내는 방법
				success : function(data) { //서블렛을 통한 결과 값을 받을 수 있습니다.
				    console.log("data: "+data);
				},
				error : function(e) {
					console.log(e);
					alert('실패했습니다.');
				}
			});			
    	});
    });
}





