var tt_button = document.createElement('button');
tt_button.innerHTML=("get address");
tt_button.style="position: fixed; top: 40px; right: 130px; z-index: 999; background-color:yellow;";
document.body.appendChild(tt_button);
tt_button.addEventListener('click', get_address);

var target=new Array()

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





