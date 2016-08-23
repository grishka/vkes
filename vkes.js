var stManagerWasDone=[];
var vkesOrigStManagerDone=stManager.done;
stManager.done=function(s){
	if(stManagerWasDone.indexOf(s)!=-1)
		return;
	console.log("stManager.done("+s+")");

	if(s.substr(-4)==".css"){
		vkesReInjectCSS();
	}
	
	vkesOrigStManagerDone.apply(this, arguments);
}

function vkesIsSettingEnabled(name){
	return true;
}

var vkesWideExpanded=false;

if(vkesIsSettingEnabled("profiles_as_old")){
	updateNarrow=function(){
		var nc=ge("narrow_column");
		if(!nc)
			return;
		nc.style.marginTop="";
		nc.style.bottom="";
		if(hasClass(nc, "fixed"))
			removeClass(nc, "fixed");
		if(vkesWideExpanded!=nc.offsetHeight<-nc.getBoundingClientRect().top && (cur.module=="profile" || cur.module=="group" || cur.module=="public" || cur.module=="event")){
			vkesWideExpanded=!vkesWideExpanded;
			if(vkesWideExpanded){
				addClass(ge("wide_column"), "wide_expanded");
			}else{
				removeClass(ge("wide_column"), "wide_expanded");
			}
			vkesResizeZhukovLayout();
		}
	};
}

window.addEventListener('load', function() {
	vkesOnPageLoaded();
	setTimeout(function(){
		vkesOnAlDone();
	}, 50);
	var origFrameover=ajax._receive;
	ajax._receive=function(){
		var res=origFrameover.apply(this, arguments);
		vkesOnAlDone();
		return res;
	};
}, false);

function vkesOnAlDone(){
	console.log("al done, module="+cur.module);
	var wideModules=["apps", "app", "video", "im", "ads"];
	if(!cur.module || wideModules.indexOf(cur.module)==-1){
		ge("page_body").style.width="627px";
		ge("page_layout").style.width="790px";
			if(cur.module=="profile" || cur.module=="public" || cur.module=="groups"){
			vkesApplyProfileChanges();
		}
			if(cur.module=="feed"){
			vkesApplyFeedChanges();
		}
			vkesResizeZhukovLayout();
	}else if(cur.module!="app"){
		if(parseInt(ge("page_layout").style.width)<960)
			ge("page_body").style.width="795px";
		ge("page_layout").style.width="960px";
	}
	var transformTabsModules=["settings", "groups_edit", "fave", "profileEdit"];
	if(transformTabsModules.indexOf(cur.module)!=-1 || location.pathname=="/settings" || location.pathname=="/edit")
		vkesTransformRMenuIntoTabs();
	var sidebarModules=["friends", "audio", "groups_list"];
	if(sidebarModules.indexOf(cur.module)!=-1){
		addClass(ge("narrow_column").parentNode, "right_sidebar");
	}
}

function vkesOnPageLoaded(){
	if(vkesIsSettingEnabled("reorder_left_menu"))
		vkesApplyLeftMenuOrder();

	updateLeftMenu=function(){};
	var defaultStyles = {
      position: 'relative',
      marginTop: null,
      marginLeft: null,
      top: null,
      bottom: null
    };
    setStyle(ge('side_bar_inner'), defaultStyles);

	/*var xitem=document.createElement("a");
	xitem.className="ui_actions_menu_item";
	xitem.href="/lol";
	xitem.innerHTML="Настройки VKES";
	var menu=document.querySelector(".ui_actions_menu");
	menu.insertBefore(xitem, menu.querySelector(".ui_actions_menu_item"));*/

	if(cur.module && cur.module=="audio"){
		var e = geByClass1("_audio_rows_header", document.body);
        setStyle(e, "width", getSize(geByClass1("_audio_rows", document.body))[0] - 1);
        //this.getLayer().sb.widthUpdated()
	}
	/*var origGetSize=getSize;
	getSize=function(elem, withBounds, notBounding){
		console.log(elem.id);
		return origGetSize(elem, withBounds, notBounding);
	};*/
}

function vkesReInjectCSS(){
	window.postMessage({type: "reinject_css"}, "*");
}

function vkesResizeZhukovLayout(){
	var postThumbs=document.querySelectorAll(".page_post_sized_thumbs");
	if(postThumbs && postThumbs.length>0){
		for(var i=0;i<postThumbs.length;i++){
			//console.log(postThumbs[i]);
			if(postThumbs[i].parentNode.offsetWidth==0)
				continue;
			//console.log(postThumbs[i].parentNode.offsetWidth+" -> "+postThumbs[i].offsetWidth);
			var factor=postThumbs[i].parentNode.offsetWidth/postThumbs[i].offsetWidth;
			//console.log("f="+factor);
			for(var j=0;j<postThumbs[i].children.length;j++){
				var c=postThumbs[i].children[j];
				if(factor<1){
					var w, h;
					if(!c.hasAttribute("data-orig-size")){
						c.setAttribute("data-orig-size", c.offsetWidth+","+c.offsetHeight);
						w=c.offsetWidth;
						h=c.offsetHeight;
					}else{
						var sz=c.getAttribute("data-orig-size").split(",");
						w=parseInt(sz[0]);
						h=parseInt(sz[1]);
					}
					c.style.width=Math.round(w*factor)+"px";
					c.style.height=Math.round(h*factor)+"px";
				}else{
					if(c.hasAttribute("data-orig-size")){
						var sz=c.getAttribute("data-orig-size").split(",");
						c.style.width=sz[0]+"px";
						c.style.height=sz[1]+"px";
					}
				}
			}
			postThumbs[i].style.height="auto";
			if(factor<1){
				postThumbs[i].style.paddingRight=(postThumbs[i].offsetWidth-postThumbs[i].parentNode.offsetWidth)+"px";
				console.log((postThumbs[i].offsetWidth-postThumbs[i].parentNode.offsetWidth)+"px");	
			}else{
				postThumbs[i].style.paddingRight="0";
			}
		}
	}
}

function vkesToggleWallTab(){
	var wtabs=ge("wall_tabs");
	var tabs=wtabs.querySelectorAll(".ui_tab");
	(hasClass(tabs[0], "ui_tab_sel") ? tabs[1] : tabs[0]).click();
	var tabTitle=(hasClass(tabs[0], "ui_tab_sel") ? tabs[1].innerHTML : tabs[0].innerHTML).trim();
	tabTitle=tabTitle.substr(0, 1).toLowerCase()+tabTitle.substr(1);
	ge("wall_tab_value").innerHTML=tabTitle;
}

function vkesApplyProfileChanges(){
	var wall=ge("profile_wall") || ge("public_wall") || ge("group_wall");
	var postBox=wall.previousElementSibling;
	wall.insertBefore(postBox, wall.children[1]);
	var wallHeader='<a class="header_right_link fl_r" onclick="return nav.go(this, event, {noback: false})" href="/wall'+cur.oid+'?search=1">поиск</a>';
	wallHeader+='<a class="module_header" onclick="return nav.go(this, event, {noback: false})" href="/wall'+cur.oid+'"><h3 class="header_top clear_fix"><span class="header_label fl_l">Микроблог</span></h3></a>';
	var wtabs=ge("wall_tabs");
	hide(wtabs);
	var tabs=wtabs.querySelectorAll(".ui_tab");
	console.log(tabs);
	if(tabs.length>=2){
		var tabTitle=(hasClass(tabs[0], "ui_tab_sel") ? tabs[1].innerHTML : tabs[0].innerHTML).trim();
		tabTitle=tabTitle.substr(0, 1).toLowerCase()+tabTitle.substr(1);
		wallHeader+='<div class="module_subheader"><a href="javascript:void(0)" onclick="vkesToggleWallTab()">Показать <span id="wall_tab_value">'+tabTitle+'</span></a>';
		//wallHeader+='| <a href="javascript:void(0)" onclick="alert(\'При выполнении команды произошла ошибка:\\nDurov is undefined\')">Вернуть стену</a>';
		wallHeader+="</div>";
	}
	wall.insertAdjacentHTML("afterbegin", wallHeader);
	var wrap;
	if(wrap=document.querySelector(".wide_column_right")){
		addClass(wrap, "pad_wide_column_right");
	}else if(wrap=document.querySelector(".wide_column_left")){
		addClass(wrap, "pad_wide_column_left");
	}
}

function vkesApplyFeedChanges(){
	var vtabs=ge("feed_rmenu");
	var feedEl=ge("main_feed");
	feedEl.parentNode.insertBefore(vtabs, feedEl.parentNode.children[0]);
	ge("narrow_column").style.display="none";
	addClass(ge("wide_column"), "wide_completely_expanded");
	var addlist=ge("feed_add_list_icon");
	var filter=document.querySelector(".feed_filter_icon");
	if(filter){
		vtabs.insertBefore(addlist, vtabs.children[0]);
		vtabs.insertBefore(filter, vtabs.children[1]);
	}
}

function vkesInsertAfter(parent, node, after){
	if(after.nextSibling){
		parent.insertBefore(node, after.nextSibling);
	}else{
		parent.appendChild(node);
	}
}

function vkesApplyLeftMenuOrder(){
	// profile friends photo video audio messages groups news feedback fave settings | apps docs ads | userapps
	var mwrap=ge("side_bar_inner").children[0];
	var profile=ge("l_pr");
	var news=ge("l_nwsf");
	var messages=ge("l_msg");
	var friends=ge("l_fr");
	var groups=ge("l_gr");
	var photos=ge("l_ph");
	var audio=ge("l_aud");
	var video=ge("l_vid");
	var apps=ge("l_ap");
	var fave=ge("l_fav");
	var docs=ge("l_doc");
	var ads=ge("l_ads");
	var appman=ge("l_apm");

	var settings=news.cloneNode(true);
	settings.id="l_sett";
	settings.querySelector(".left_label").innerHTML="Настройки";
	settings.children[0].href="/settings";

	var feedback=news.cloneNode(true);
	feedback.id="l_ntf";
	feedback.querySelector(".left_label").innerHTML="Ответы";
	feedback.children[0].href="/feed?section=notifications";

	vkesInsertAfter(mwrap, settings, profile);
	vkesInsertAfter(mwrap, fave, profile);
	vkesInsertAfter(mwrap, feedback, profile);
	vkesInsertAfter(mwrap, news, profile);
	vkesInsertAfter(mwrap, groups, profile);
	vkesInsertAfter(mwrap, messages, profile);
	vkesInsertAfter(mwrap, audio, profile);
	vkesInsertAfter(mwrap, video, profile);
	vkesInsertAfter(mwrap, photos, profile);
	vkesInsertAfter(mwrap, friends, profile);
	var sep1=mwrap.querySelector(".l_main");
	if(appman)
		vkesInsertAfter(mwrap, appman, sep1);
	vkesInsertAfter(mwrap, apps, sep1);
	if(ads)
		vkesInsertAfter(mwrap, ads, docs ? docs : apps);
}

function vkesTransformRMenuIntoTabs(){
	var vtabs=ge('narrow_column').querySelector(".ui_rmenu");
	var wcol=ge("wide_column");
	wcol.insertBefore(vtabs, wcol.children[0]);
	ge("narrow_column").style.display="none";
	addClass(wcol, "wide_completely_expanded");
	addClass(vtabs, "rmenu_transformed_into_tabs");
}