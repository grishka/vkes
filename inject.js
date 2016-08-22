var s = document.createElement('script');
s.src = chrome.extension.getURL('vkes.js');
s.onload = function() {
    this.parentNode.removeChild(this);
};
(document.head || document.documentElement).appendChild(s);

var request = new XMLHttpRequest();
request.open('GET', chrome.extension.getURL('style.css'), false);
request.send(null);  
if(request.status === 200){  
	processAndInjectCSS(request.responseText);
}else{
	console.log("Error loading CSS!");
}

function isSettingEnabled(name){
	return true;
}

function processAndInjectCSS(css){
	var lines=css.split("\n");
	var linesToUse=[];
	var useCurSection=false;
	for(var i=0;i<lines.length;i++){
		if(lines[i].length>4 && lines[i].substr(0, 3)=="/*S"){
			var sectionName=lines[i].split(" ")[1];
			useCurSection=isSettingEnabled(sectionName);
			continue;
		}
		if(useCurSection){
			linesToUse.push(lines[i]);
		}
	}
	var el=document.createElement("style");
	el.id="__vkes_css";
	el.innerHTML=linesToUse.join("\n");
	(document.head || document.documentElement).appendChild(el);
}

window.addEventListener("message", function(event) {
  // We only accept messages from ourselves
  if (event.source != window)
    return;

  if (event.data.type && (event.data.type == "reinject_css")) {
    var el=document.getElementById("__vkes_css");
	el.parentNode.removeChild(el);
	(document.head || document.documentElement).appendChild(el);
  }
}, false);