var pk_button = document.createElement('button');
pk_button.innerHTML=("auto flag switch");
pk_button.style="position: fixed; top: 40px; right: 130px; z-index: 999; background-color:red;";
document.body.appendChild(pk_button);
pk_button.addEventListener('click', set_flag);

function set_flag(){
	chrome.storage.local.get(['auto_flag'], function(result) {
		console.log(result.auto_flag)
		if(result.auto_flag===0 || result.auto_flag===undefined){
			chrome.storage.local.set({auto_flag: 1})
			console.log("auto falg 1 로 바꿈.")
		}
		else if(result.auto_flag===1){
			chrome.storage.local.set({auto_flag: 0})
			console.log("auto flag 0 으로 바꿈.")
		}
	});
}





