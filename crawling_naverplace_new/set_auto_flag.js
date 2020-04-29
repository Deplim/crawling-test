/* 크롤링 무한 반복 여부 세팅 코드.
 * 현제 어느 페이지를 보고 있던지 상관없이 작동.
 * ReadMe 를 꼭 읽어보고 사용하시기 바랍니다.
 * 정의령 (https://github.com/Deplim)
 */

var block_string="<h4 id='ext_block_h4'>&nbsp;crawling naverplace detail</h4><hr id='ext_block_hr'><table><tbody id='ext_block_tbody'></tbody></table>"
var ext_block = document.createElement('div');
ext_block.id = "ext_block";
document.body.appendChild(ext_block);
ext_block.innerHTML=block_string

// 크롤링 무한 반복 여부를 세팅하는 버튼 앨리먼트 생성.
var pk_button = document.createElement('button');
chrome.storage.local.get(['auto_flag'], function(result) {
	if(result.auto_flag===0 || result.auto_flag===undefined){
		pk_button.innerHTML=("auto flag switch (off)");
	}
	else if(result.auto_flag===1){
		pk_button.innerHTML=("auto flag switch (on)");
	}
});
pk_button.className="g_button"
pk_button.addEventListener('click', set_flag);

var temp_tr=document.createElement('tr');
document.getElementById("ext_block_tbody").appendChild(temp_tr)
temp_tr.appendChild(pk_button)

// 무한 반복 여부 세팅 함수.
function set_flag(){

	//로컬 웹 스토리지에서 꺼내와 값을 바꿔준 후 다시 저장.
	chrome.storage.local.get(['auto_flag'], function(result) {
		if(result.auto_flag===0 || result.auto_flag===undefined){
			chrome.storage.local.set({auto_flag: 1})
			pk_button.innerHTML=("auto flag switch (on)");
			console.log("auto falg 1 로 바꿈.")
		}
		else if(result.auto_flag===1){
			chrome.storage.local.set({auto_flag: 0})
			pk_button.innerHTML=("auto flag switch (off)");
			console.log("auto flag 0 으로 바꿈.")
		}
	});
}





