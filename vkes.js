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

function vkesUpdateNarrow(){
	//console.log("update narrow");
	if(cur.module=="profile" || cur.module=="group" || cur.module=="public" || cur.module=="event"){
		var nc=ge("narrow_column");
		if(!nc)
			return;
		nc.style.marginTop="";
		nc.style.bottom="";
		if(hasClass(nc, "fixed"))
			removeClass(nc, "fixed");
		if(vkesWideExpanded!=nc.offsetHeight<-nc.getBoundingClientRect().top){
			vkesWideExpanded=!vkesWideExpanded;
			if(vkesWideExpanded){
				addClass(ge("wide_column"), "wide_expanded");
			}else{
				removeClass(ge("wide_column"), "wide_expanded");
			}
			vkesResizeZhukovLayout();
		}
	}
}

var vkesWideExpanded=false;

if(vkesIsSettingEnabled("profiles_as_old")){
	/*window.updateNarrow=function(){
		
	};*/
	console.log(updateNarrow);
}

//window.addEventListener('load', function() {
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
//}, false);

function vkesOnAlDone(){
	console.log("al done, module="+cur.module);
	var wideModules=["apps", "app", "video", "ads"];
	if((!cur.module && (location.pathname.length<5 || location.pathname.substr(0, 5)!="/dev/")) || (cur.module && wideModules.indexOf(cur.module)==-1)){
		ge("page_body").style.width="627px";
		ge("page_layout").style.width="790px";
		if(cur.module=="profile" || cur.module=="public" || cur.module=="groups"){
			vkesApplyProfileChanges();
		}
		if(cur.module=="feed"){
			vkesApplyFeedChanges();
		}
		if(cur.module=="im"){
			vkesApplyMessagesChanges();
		}
		vkesResizeZhukovLayout();
	}else if(cur.module!="app"){
		if(parseInt(ge("page_layout").style.width)<960)
			ge("page_body").style.width="795px";
		ge("page_layout").style.width="960px";
	}
	var transformTabsModules=["settings", "groups_edit", "fave", "profileEdit", "wall"];
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

	/*window.__leftMenu.handleScroll=function(){};
	removeClass(ge("side_bar"), "sticky_top");
	var defaultStyles = {
      position: 'relative',
      marginTop: null,
      marginLeft: null,
      top: null,
      bottom: null
    };
    setStyle(ge('side_bar_inner'), defaultStyles);*/

    /*window.onBodyScroll=function(){
    	console.log("here");
    	updSideTopLink();
    };*/
    //console.log(getEventListeners(window));
    window.__leftMenu.handleScroll=function(){};
	removeClass(ge("side_bar"), "sticky_top");
	window.addEventListener("scroll", vkesUpdateNarrow);

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

	var observer=new MutationObserver(function(ev){
		//console.log(ev);
		for(var i=0;i<ev.length;i++){
			var m=ev[i];
			if(m.type=="childList"){
				for(var j=0;j<m.addedNodes.length;j++){
					var node=m.addedNodes[j];
					//console.log(node);
					if(node instanceof HTMLElement){
						var posts=node.querySelectorAll(".post") || node.parentNode.querySelectorAll(".post");
						if(posts && posts.length){
							//console.log("added node ", posts);
							vkesTransformPosts(posts);
						}
					}
				}
			}
		}
	});
	observer.observe(document.body, {childList: true, subtree: true});

	var posts=document.body.querySelectorAll(".post");
	if(posts && posts.length){
		vkesTransformPosts(posts);
	}
}

function vkesTransformPosts(posts){
	for(var i=0;i<posts.length;i++){
		var post=posts[i];
		if(post.hasAttribute("data-vkes-transformed"))
			continue;
		if(post.hasAttribute("data-ad")){
			console.log("Removing ad post");
			post.parentNode.removeChild(post);
			continue;
		}
		console.log("Transforming post", post);
		post.setAttribute("data-vkes-transformed", "");
		var likeBtn=post.querySelector(".post_content .like_wrap .like_btns > .like");
		var repostBtn=post.querySelector(".post_content .like_wrap .like_btns > .share");
		var commentBtn=post.querySelector(".post_content .like_wrap .like_btns > .comment");

		var postID=post.getAttribute("data-post-id");
		var likeCont=post.querySelector(".post_content .like_wrap .like_cont");
		if(!likeCont){
			likeCont=document.createElement("div");
			likeCont.className="like_cont";
			post.querySelector(".post_content").appendChild(likeCont);
		}

		if(likeBtn){
			var likeLabel=likeBtn.querySelector(".like_button_label");
			likeLabel.innerHTML=likeBtn.getAttribute("title");
			likeBtn.insertBefore(likeLabel, likeBtn.querySelector(".like_button_icon"));
			addClass(likeBtn, "_vkes_post_like");
			likeCont.appendChild(likeBtn);
			addClass(repostBtn, "_vkes_post_repost");
			likeCont.appendChild(repostBtn);
			post.querySelector(".post_content .like_wrap .like_btns").style.display="none"; // don't remove because something might still update that button
		}
		var postInfo=document.createElement("div");
		postInfo.className="_vkes_post_info";
		var postDate=post.querySelector(".post_header > .post_header_info .post_date");
		postDate.style.display="inline";
		postInfo.appendChild(postDate);

		var postViews=post.querySelector(".post_content .like_wrap .like_views");
		if(postViews){
			postViews.style.display="inline";
			postInfo.appendChild(vkesMakeSeparator());
			postInfo.appendChild(postViews);
		}
		if(commentBtn && commentBtn.getAttribute("data-count")==0 && ge("reply_box_wrap"+postID)){
			postInfo.appendChild(vkesMakeSeparator());
			var commentLink=commentBtn;
			// window.cur.lang['wall_N_replies']
			commentLink.innerHTML="Комментировать";
			//commentLink.onclick=commentBtn.click;
			postInfo.appendChild(commentLink);
		}
		likeCont.appendChild(postInfo);

		var author=post.querySelector(".post_header_info > .post_author");
		var contentWrap=post.querySelector(".post_info");
		if(!contentWrap)
			contentWrap=post.querySelector(".post_content").children[0];
		contentWrap.insertBefore(author, contentWrap.children[0]);
	}
}

function vkesMakeSeparator(){
	var sep=document.createElement("span");
	sep.innerHTML="&nbsp;|&nbsp;"
	return sep;
}

function vkesReInjectCSS(){
	window.postMessage({type: "reinject_css"}, "*");
}

function vkesResizeZhukovLayout(){
	console.log("resize layout");
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
	var mwrap=ge("side_bar_inner").children[0].children[0];
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

	// .top_notify_tt
}

function vkesTransformRMenuIntoTabs(){
	var vtabs=ge('narrow_column').querySelector(".ui_rmenu");
	var wcol=ge("wide_column");
	wcol.insertBefore(vtabs, wcol.children[0]);
	ge("narrow_column").style.display="none";
	addClass(wcol, "wide_completely_expanded");
	addClass(vtabs, "rmenu_transformed_into_tabs");
}

function vkesApplyMessagesChanges(){

	var topTabs=document.createElement("ul");
	topTabs.className="ui_tabs";
	topTabs.style.height="21px";
	topTabs.style.backgroundColor="#FFF";
	var chatListTab=document.createElement("li");
	chatListTab.className="ui_tab";
	chatListTab.innerHTML="Диалоги";
	topTabs.appendChild(chatListTab);
	var chatViewTab=document.createElement("li");
	chatViewTab.className="ui_tab";
	chatViewTab.innerHTML="Просмотр диалогов";
	topTabs.appendChild(chatViewTab);

	var topTabsActionsList=document.createElement("span");
	topTabsActionsList.className="fl_r";
	topTabsActionsList.innerHTML='<a href="javascript:void(0);" id="vkes_im_unread">Непрочитанные</a> | <a href="javascript:void(0);" id="vkes_im_fave">Важные</a>';
	topTabs.appendChild(topTabsActionsList);

	var topTabsActionsChat=document.createElement("span");
	topTabsActionsChat.className="fl_r";
	topTabsActionsChat.innerHTML='<a href="javascript:void(0);" id="vkes_im_actions">Действия</a>';
	//topTabs.appendChild(topTabsActionsChat);

	var cont=document.querySelector(".ui_rmenu");
	cont.insertBefore(topTabs, cont.children[0]);
	var lastPeerTab, lastListTab;

	//return;

	if(document.querySelectorAll("._im_ui_peers_list>a").length==0)
		hide(chatViewTab);

	chatListTab.onclick=function(){
		ge("ui_rmenu_all").click();
	};
	chatViewTab.onclick=function(){
		(lastPeerTab ? lastPeerTab : document.querySelectorAll("._im_ui_peers_list>a")[0]).click();
	};

	ge("vkes_im_fave").onclick=function(){
		ge("ui_rmenu_fav").click();
	};
	ge("vkes_im_unread").onclick=function(){
		var showUnread=!hasClass("ui_rmenu_unread", "ui_rmenu_item_sel");
		(showUnread ? ge("ui_rmenu_unread") : ge("ui_rmenu_all")).click();
		ge("vkes_im_unread").innerHTML=showUnread ? "Все сообщения" : "Непрочитанные";
	};


	var impage=document.querySelector(".im-page");
	var imwrap=impage.parentNode;
	//imwrap.appendChild(impage);
	var peer=cur.peer;
	delete cur.peer;
	var prevChatMembers;
	var prevMenu;
	var peerTabs=document.querySelector("._im_ui_peers_list");
	var didUpdateInputForm=false;
	var observer=new MutationObserver(function(ev){
								console.log(ev);
								for(var i=0;i<ev.length;i++){
									var m=ev[i];
									if(m.type=="attributes" && m.attributeName=="class"){
										var topbar=document.querySelector(".im-page--header-chat");
										if(m.target.className.split(" ").indexOf("im-page--mess-actions_visible")!=-1){
											console.log("entered sel mode");
											show(topbar);
											hide(peerTabs);
										}else{
											console.log("exited sel mode");
											hide(topbar);
											show(peerTabs);
										}
									}
								}
							});
	var rightAva;
	var updatePeer=function(val, force=false){
			if(peer!=val || force){
				observer.disconnect();
				if(prevChatMembers){
					prevChatMembers.parentNode.removeChild(prevChatMembers);
					prevChatMembers=null;
				}
				if(prevMenu){
					prevMenu.parentNode.removeChild(prevMenu);
					prevMenu=null;
				}
				if(val==0){
					addClass(chatListTab, "ui_tab_sel");
					removeClass(chatViewTab, "ui_tab_sel");
					if(document.querySelectorAll("._im_ui_peers_list>a").length==0)
						hide(chatViewTab);
					show(topTabsActionsList);
					hide(topTabsActionsChat);
					var classes=imwrap.className.split(" ");
					var newClasses=[];
					for(var i=0;i<classes.length;i++){
						if(classes[i].length<6 || classes[i].substr(0, 6)!="__vkes")
							newClasses.push(classes[i]);
					}
					newClasses.push("__vkes_tab_chat_list");
					imwrap.className=newClasses.join(" ");
				}else{
					lastPeerTab=ge("ui_rmenu_peer_"+val);
					removeClass(chatListTab, "ui_tab_sel");
					addClass(chatViewTab, "ui_tab_sel");
					show(chatViewTab);
					show(topTabsActionsChat);
					hide(topTabsActionsList);
					var classes=imwrap.className.split(" ");
					var newClasses=[];
					for(var i=0;i<classes.length;i++){
						if(classes[i].length<6 || classes[i].substr(0, 6)!="__vkes")
							newClasses.push(classes[i]);
					}
					newClasses.push("__vkes_tab_chat_view");
					
					if(val>0 && val<2000000000)
						newClasses.push("__vkes_private_chat");
					else if(val>2000000000)
						newClasses.push("__vkes_multi_chat");
					else if(val<0 && val>-2000000000)
						newClasses.push("__vkes_community_chat");
					else if(val<-2000000000)
						newClasses.push("__vkes_email_chat");

					imwrap.className=newClasses.join(" ");

					
					var interval;
					interval=setInterval(function(){
						var menu=document.querySelector(".im-page--header-more>div");
						if(menu && (val<2000000000 || document.querySelector(".im-page--members"))){
							var cmenu=menu.cloneNode(true);
							topTabs.appendChild(cmenu);
							cmenu.onclick=function(ev){
								//console.log(ev.srcElement.className);
								var el=document.querySelector(".im-page--header-more ."+ev.srcElement.className.split(" ").join("."));
								//console.log(el);
								if(el)
									el.click();
							};
							var btn=cmenu.querySelector(".ui_actions_menu_icons");
							var replacement=document.createElement("a");
							replacement.className="fl_r";
							replacement.onclick=function(ev){
								uiActionsMenu.keyToggle(this, ev);
							};
							replacement.innerHTML=btn.getAttribute("aria-label");
							btn.parentNode.replaceChild(replacement, btn);
							prevMenu=cmenu;

							observer.observe(document.querySelector(".im-page--mess-actions"), {attributes: true});

							clearInterval(interval);

						}else{
							return;
						}
						if(val>2000000000){
							/*var members=document.querySelector(".im-page--members");
							var emoji=document.querySelector("._im_rcemoji");
							var memlink=document.createElement("a");
							memlink.innerHTML=members.innerHTML;
							memlink.className="__vkes_chat_members_link";
							memlink.onclick=function(ev){
								// I hate JS already
								members.click();
							};
							prevChatMembers=memlink;
							vkesInsertAfter(emoji.parentNode, memlink, emoji);*/
							var memlink=document.querySelector(".im-page--members");
						}
						if(!didUpdateInputForm){
							didUpdateInputForm=true;
							//var chatHeader=document.querySelector(".im-page--chat-header");
							var txtarea=document.querySelector(".im-chat-input--textarea");
							//txtarea.insertBefore(chatHeader, txtarea.firstChild);
							var inputForm=document.querySelector(".im-chat-input");
							var inputFormPanel=document.createElement("div");
							inputFormPanel.className="__vkes_chat_input_panel";
							txtarea.appendChild(inputFormPanel);
							var leftAva=document.createElement("img");
							leftAva.src=document.querySelector(".top_profile_img").src;
							leftAva.className="__vkes_chat_panel_ava __vkes_chat_left_ava";
							rightAva=document.createElement("div");
							rightAva.className="__vkes_chat_panel_ava __vkes_chat_right_ava";
							txtarea.appendChild(leftAva);
							txtarea.appendChild(rightAva);
							var attachBtn=document.querySelector(".im-chat-input--selector");
							inputFormPanel.appendChild(attachBtn);
							document.querySelector(".ms_item_more").innerHTML="Прикрепить";
						}
						rightAva.innerHTML=document.querySelector(".im-page--aside-photo").innerHTML;
					}, 100);
				}
			}
			peer=val;
			//console.log("new peer "+peer);
			return true;
		};
	Object.defineProperty(cur, "peer", {
		get: function(){
			return peer;
		},
		set: updatePeer, enumerable: true, configurable: true
	});
	updatePeer(peer, true);
}