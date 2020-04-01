$.Mobile = {
	localeMsg : null,
	colorSet : null,
	params : null,
	startIdx : 0,
	slipRange : 10,
	attachRange : 10,
	thumbWidth : 160,
	objSlipItem: null,
	objAttachItem : null,
	contextMenu : null,
	currentKey : null,
	m_Viewer : null,
	m_ViewerItem : null,
	is_Maximized : false,
	IS_FOLD : true,
	isSlipLoading : false,
	isAttachLoading : false,
	init : function(params) {


		//Set Mobile default enviroments.
		$.Mobile.params = params;
		$.Mobile.is_Maximized = params.MAXIMIZED === "T" ? true : false;
		$.Mobile.IS_FOLD = params.FOLD === "T" ? true : false;

		//Set globalization.
		$.Mobile.localeMsg = $.Common.Localize($.Lang, "data-i18n", params.LANG,"Mobile");
		//Set UI set
		$.Mobile.setUIColor();

		//Start finger slide
		$('nav').slideAndSwipe();

		$.Mobile.Init_Navi();

		$.Mobile.Set_ButtonEffect();

		$("#show-slip").click();


	},
	Init_Navi : function() {

		// $("#navi-close").on("click",function(){
		// 	  $('.ssm-toggle-nav').trigger("click");
		// });
		$("#nav-user-info").html($.Mobile.params.USER_NM + "(" +$.Mobile.params.USER_ID+")");
		$("#nav-part-info").html($.Mobile.params.PART_NM);

		if($.Mobile.params.MULTI_KEY && $.Common.isBlank($.Mobile.currentKey)) {
			$(".navi-menu").hide();
		}
		else {
			$(".navi-menu").show();
		}




	//	$.Mobile.getAttachList($.Mobile, $.Mobile.params, $.Mobile.attachRange);


	},

	addScrollEvent : function(element, callback) {

		var scrollTimeout = null;

		//Add scroll event for attach
		element.unbind('scroll').bind('scroll',function(e) {

			var area = $(this);
			clearTimeout(scrollTimeout);
			scrollTimeout = setTimeout(function(){

				if(area.scrollTop() + area.innerHeight() >= (area[0].scrollHeight - 5)) {

					callback();
				}

				clearTimeout(scrollTimeout);
			}, 100);

		});

	},
	//Load thumb images
	getSlipList : function(parent, params)
	{
		var objListParams = {
			KEY : params.KEY,
			KEY_TYPE : params.KEY_TYPE,
			USER_ID : params.USER_ID,
			CORP_NO : params.CORP_NO,
			LANG : params.LANG
		};

		var deferred = $.Deferred();

		$.when($.Common.RunCommand(g_ActorCommand, "GET_SLIP_LIST", objListParams)).then(function(res) {


			deferred.resolve(true);

		},function(reason){
			deferred.reject(reason);
		});
		return deferred.promise();
	},
	// getAttachList : function(parent, params, loadCnt, isMultiKey)
	// {
	//
	// 	var start = $(".attach_item").size() == 0 ? 0 : $(".attach_item").size() + 1;
	// 	var per = loadCnt;
	//
	// 	// if(params.MULTI_KEY) {
	// 	// 	start = null;
	// 	// 	per = null;
	// 	// 	$("#area_attach").unbind('scroll');
	// 	// }
	//
	// 	var objListParams = {
	// 		KEY : params.KEY,
	// 		KEY_TYPE : params.KEY_TYPE,
	// 		USER_ID : params.USER_ID,
	// 		CORP_NO : params.CORP_NO,
	// 		LANG : params.LANG,
	// 		// START_IDX : start,
	// 		// PER : per
	// 	};
	//
	// 	$.when($.Common.RunCommand(g_ActorCommand, "GET_ATTACH_LIST", objListParams)).done(function(res) {
	//
	// 		var resCnt = Object.keys(res) == null ? 0 : Object.keys(res).length;
	// 		if(res == null || resCnt <= 0) {
	// 			$('.progress_attach_scroll').hide();
	// 			return;
	// 		}
	//
	// 		if(parent.objAttachItem == null) {
	// 			parent.objAttachItem = res;
	// 		}
	// 		else {
	//
	// 			Object.keys(res).forEach(function(dataKey) {
	// 				parent.objAttachItem[dataKey] = res[dataKey];
	// 			});
	// 		}
	//
	// 		parent.addAttachItem(res, $("#area_attach"), $.Mobile.currentKey);
	//
	// 		if(resCnt !== $.Mobile.attachRange) {
	// 			$("#area_attach").unbind('scroll');
	// 		}
	//
	// 		if(isMultiKey) {
	// 			$.Mobile.change_GroupKey($.Mobile.currentKey);
	// 		}
	//
	// 	}).fail(function(res){
	// 		alert("Failed to load attach.");
	//
	// 	}).always(function(){
	//
	// 		$.Common.HideProgress("#attach_progress");
	// 		$('.progress_attach_scroll').hide();
	// 	});
	// },

	Open_Viewer : function(slipIrn, index) {

		$(".pswp__bg").css("background","#DFE1E5");
		$(".pswp__top-bar").css("background","#"+$.Mobile.colorSet.TOP_NAVIGATION);
		    var swipe_Options = {
		    		index :index,
		    		bgOpacity : 1,
		    		tapToToggleControls:false,
		    		showInfoEl:true,
					loop:false,
					shareEl:false,
					arrowEl:false,
		    	//	getDoubleTapZoom:true,
		    		isClickableElement: function(el) {
		    		    return el.tagName === 'SELECT';
		    		},
	    		    getThumbBoundsFn: function(index) {

	    		    //	var nSlipIdx = $.Actor.m_GalleryItem[index].SlipIdx;//.map(function(e) { return e.SlipIdx; }).indexOf(index);

	    		    	// find thumbnail element
		    		    var thumbnail = $("#slip_masonry").find("[idx="+slipIrn+"]")[0];

		    		    // get window scroll Y
		    		    var pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
		    		    // optionally get horizontal scroll

		    		    // get position of element relative to viewport
		    		    var rect = thumbnail.getBoundingClientRect();

		    		    // w = width
		    		    return {x:rect.left, y:rect.top + pageYScroll + 40, w:rect.width};

		    		},
		    		history:false
		    };

			this.m_Viewer 					= new PhotoSwipe($('.pswp')[0], PhotoSwipeUI_Default, $.Mobile.m_ViewerItem , swipe_Options);


			this.m_Viewer.listen('afterChange', function() {

				$("[id=loadingBookmark]").show();
				var curIdx = $.Mobile.m_Viewer.getCurrentIndex();
				var curItem = $.Mobile.objSlipItem[Object.keys($.Mobile.objSlipItem)[curIdx]];
				var elCur = $($.Mobile.m_Viewer.container).find("[idx="+curItem.SLIP_IRN+"]")[0];

				if(elCur == null) {
					$.Mobile.displayThumb($.Mobile);
					// sets a flag that slides should be updated
					$.Mobile.m_Viewer.invalidateCurrItems();
					// updates the content of slides
					$.Mobile.m_Viewer.updateSize(true);
				}

				if(!$(elCur).find("img").length) {

					$(elCur).find("canvas").hide();

					var imgUrl = curItem.ORIGINAL_URL;

					var elImg = $("<img/>", {
						load : function(){
							var canvas = $(elCur).find("canvas")[0];
							$(canvas).attr({
								"width": $(elCur).find(".original").width(),
								"height": $(elCur).find(".original").height(),
							});

						//	$.Mobile.m_ViewerItem[curIdx].w = this.naturalWidth;
						//	$.Mobile.m_ViewerItem[curIdx].h = this.naturalHeight;

							$("[id=loadingBookmark]").hide();
							$(elCur).find("canvas").show();
							$.Bookmark.Draw_BookmarkItem($(canvas)[0], curItem.BOOKMARKS, curItem.SLIP_ROTATE);
						},
						src : imgUrl
					});
					elImg.addClass("original");
					elImg.appendTo($(elCur).find(".contents"));
				}
				else {
					$("[id=loadingBookmark]").hide();
				}

				// var url = $(elImg).attr('src');
				// if($.Common.isBlank(url)) {
				// 	return;
				// // }
				// var img = new Image();
				// img.src = elImg;
				// img.onload = function() {
				// 	$(elCur).find("img").attr("src", $(this).attr('src'));
				//
				//
				//
				// };
				// img.src = elImg;


			});

		this.m_Viewer.init();
	},
	change_GroupKey : function(option) {

		var key = option.value;
		
		if($.Common.isBlank(key)) key = null;//$.Mobile.params.KEY;
		
		$.Mobile.currentKey = key;
		
		if($($("#slip_masonry")).is(":visible") && !$.Mobile.isSlipLoading) {
			$("#slip_masonry").empty();
			$.Mobile.displayThumb($.Mobile);
		}
		if($($("#area_attach")).is(":visible") && !$.Mobile.isAttachLoading) {
			$("#area_attach").empty();
			$.Mobile.addAttachItem($.Mobile.objAttachItem, $("#area_attach"), $.Mobile.currentKey);
		}

		$.Mobile.Init_Navi();
	},

	Set_ButtonEffect : function() {

		$("#show-slip").ripple({
					maxDiameter: "200%"
		});
		$("#show-attach").ripple({
					maxDiameter: "200%"
		});
		$("#btn-menu").ripple({
					maxDiameter: "200%"
		});
		// $("#navi-close").ripple({
		// 			maxDiameter: "200%",
		// });

		// $("#navi-open-comment").ripple({
		// 			maxDiameter: "200%",
		// });

		// $("#navi-open-history").ripple({
		// 			maxDiameter: "200%",
		// });
		

		
	},
	Close_frame : function()
		{
			$('.area-layout').fadeOut(333, function(){
				$(this).remove();
			});
		},

	Close_Navi : function() {
		$(".ssm-overlay").hide();
		$("nav").css('transform', 'translate(-280px,0)');
		$("nav").removeClass("ssm-nav-visible");
		
	},
	Open_Comment : function() {

			$.Mobile.Close_Navi();
			var el_layout = $(document.createElement('div'));
			el_layout.addClass("area-layout");
			el_layout.on("click",function() {
				$.Mobile.Close_frame();
			});
			el_layout.appendTo("body");

			$(".area-frame").remove();
			var el_areaFrame = $(document.createElement('div'));
			el_areaFrame.addClass("area-frame");
			el_areaFrame.appendTo(el_layout);

			var el_close = $(document.createElement('div'));
			el_close.append($(document.createElement('img')).attr("src",g_RootURL+"/image/common/x.png"));
			el_close.addClass("close-frame");
			el_close.on("click", function(){
				$.Mobile.Close_frame();
			});
			el_close.appendTo(el_areaFrame);

			var el_areaLoading = $(document.createElement('div'));
			el_areaLoading.attr("id","progress-mobile-comment");
			el_areaLoading.appendTo(el_areaFrame);
			
			$.Common.ShowProgress("#progress-mobile-comment","Waiting..","000000","0.7");

			var el_containerFrame = $(document.createElement('div'));
			el_containerFrame.addClass("container-frame");
			el_containerFrame.appendTo(el_areaFrame);

			var el_frame = $(document.createElement('iframe'));
			el_frame.addClass("frame-main");
			el_frame.appendTo(el_containerFrame);

			var url = new StringBuffer();
			url.append(g_RootURL + "/slip_comment.jsp?");
			url.append("KEY="+$.Mobile.params.KEY);
			url.append("&LANG="+$.Mobile.params.LANG);
			url.append("&USER_ID="+$.Mobile.params.USER_ID);
			url.append("&CORP_NO="+$.Mobile.params.CORP_NO);
		
			el_frame.attr("src",url.toString());


			el_frame.load(function(){
				$.Common.HideProgress("#progress-mobile-comment");
			});
	},
	Open_History : function() {

			$.Mobile.Close_Navi();
			var el_layout = $(document.createElement('div'));
			el_layout.addClass("area-layout");
			el_layout.on("click",function() {
				$.Mobile.Close_frame();
			});
			el_layout.appendTo("body");

			$(".area-frame").remove();
			var el_areaFrame = $(document.createElement('div'));
			el_areaFrame.addClass("area-frame");
			el_areaFrame.appendTo(el_layout);

			var el_close = $(document.createElement('div'));
			el_close.append($(document.createElement('img')).attr("src",g_RootURL+"/image/common/x.png"));
			el_close.addClass("close-frame");
			el_close.on("click", function(){
				$.Mobile.Close_frame();
			});
			el_close.appendTo(el_areaFrame);

			var el_areaLoading = $(document.createElement('div'));
			el_areaLoading.attr("id","progress-mobile-history");
			el_areaLoading.appendTo(el_areaFrame);
			
			$.Common.ShowProgress("#progress-mobile-history","Waiting..","000000","0.7");

			var el_containerFrame = $(document.createElement('div'));
			el_containerFrame.addClass("container-frame");
			el_containerFrame.appendTo(el_areaFrame);

			var el_frame = $(document.createElement('iframe'));
			el_frame.addClass("frame-main");
			el_frame.appendTo(el_containerFrame);

			var url = new StringBuffer();
			url.append(g_RootURL + "/slip_history.jsp?");
			url.append("KEY="+$.Mobile.params.KEY);
			url.append("&LANG="+$.Mobile.params.LANG);
			url.append("&USER_ID="+$.Mobile.params.USER_ID);
			url.append("&CORP_NO="+$.Mobile.params.CORP_NO);
		
			el_frame.attr("src",url.toString());


			el_frame.load(function(){
				$.Common.HideProgress("#progress-mobile-history");
			});
	},
	setUIColor : function()
	{
		var colorSet =  $.extend($.Color.Mobile.Viewer, $.Color.Common);
		if(colorSet != null)
		{
			
			$(".top-navi").css("background","#"+colorSet.TOP_NAVIGATION);
			$(".top-navi").css("color","#"+colorSet.TOP_NAVIGATION_FONT);
			$(".area-title").css("border","1px solid #" + colorSet.KEY_BORDER);
			$(".key-title").css("background","#"+colorSet.KEY_TITLE_BG);
			$(".key-title").css("color","#"+colorSet.KEY_TITLE_FONT);
			$(".key-content > span").css("color","#"+colorSet.KEY_CONTENT_FONT);
			$(".navi-wrapper").css("border-top","10px solid #"+colorSet.TOP_NAVIGATION);
			$(".navi-bar").css("background-color","#"+colorSet.TOP_NAVIGATION);
			$.Mobile.colorSet = colorSet;
			
		}
	},
	Draw_SlipList : function(params) {

		//Get Mobile menu list
		$.Mobile.contextMenu = $.Menu.Mobile.Common;

		$('#slip_masonry').masonry({
			// options
			itemSelector: '#slip_item',
			columnWidth: $.Mobile.thumbWidth,
			horizontalOrder: true,
			isFitWidth: true,
			gutter: 30
		});

		var objListParams = {
			KEY : params.KEY,
			KEY_TYPE : params.KEY_TYPE,
			USER_ID : params.USER_ID,
			CORP_NO : params.CORP_NO,
			LANG : params.LANG
		};

		$.when($.Common.RunCommand(g_ActorCommand, "GET_SLIP_LIST", objListParams)).then(function(res){

			var resCnt = Object.keys(res) == null ? 0 : Object.keys(res).length;
			if(res == null || resCnt <= 0) {
				$.Common.HideProgress("#slip_progress");
				return;
			}

			$.Mobile.objSlipItem = res;

			$.Mobile.slipTotalCnt = resCnt;
			$.Mobile.m_ViewerItem = new Array($.Mobile.slipTotalCnt);

			for(var i = 0; i < $.Mobile.m_ViewerItem.length; i++)
			{
				$.Mobile.m_ViewerItem[i] = {};
			}


			$.Mobile.displayThumb($.Mobile);


			//$.Mobile.addSlipItem(res);

			// if($.Mobile.params.MULTI_KEY) {
			// 	$.Actor.change_GroupKey($.Actor.currentKey);
			// }
			// else {
			// 	$.Actor.displayThumb($.Actor);
			// }


		}, function (reason) {
			$.Common.simpleToast("Failed to load thumbs.");
			$.Common.HideProgress("#slip_progress");
		});
	},
	addContextMenu : function(parent, elTarget, menuGroup, objData, viewMode, option) {
		//Set click event
		var fnClick = function(e) {

		}
		//Add icon
		var iconURL = g_RootURL+"image/common/option";

		var elBtn = $(document.createElement('div'));
		elBtn.unbind().bind("click",fnClick);
		elBtn.appendTo(elTarget);

		var elImg = $(document.createElement('img')).attr("src",iconURL + ".png");
		elImg.unbind('mouseenter mouseleave').hover(function(){
			$(this).css("opacity","0.7");
		},function(){
			$(this).css("opacity","1");
		});

		elImg.appendTo(elBtn);

		var arObjMenu = $.Common.sortContextMenuItem(parent.localeMsg, menuGroup, viewMode, $.Mobile.currentKey);
		$.ContextMenu.getMenu(parent, elTarget, elBtn, arObjMenu, objData, option);
	},

	displayThumb : function(parent) {

		var arThumbInfo = Object.keys(parent.objSlipItem);

		var arItems = {};
		if(!$.Common.isBlank(parent.currentKey) && parent.currentKey.indexOf(",") === -1 && parent.params.MULTI_KEY) {
			for(var i = 0; i < arThumbInfo.length; i++) {

				var item = parent.objSlipItem[arThumbInfo[i]];
				if(item.JDOC_NO !== parent.currentKey) {
					continue;
				}
				else {
					arItems[item.SLIP_IRN] = item;
				}
			}

			arThumbInfo = Object.keys(arItems);
		}
		else {
			arItems = parent.objSlipItem;
		}

		//	var visibleCnt = $(".slip_item").size();
		//	var start = parseInt(visibleCnt / elDest.slipRange) * 10 + elDest.slipRange;


		var targetItem = [];
		for(var i = 0; i < arThumbInfo.length; i++) {

			var item = arItems[arThumbInfo[i]];

			var elItem = $("#slip_masonry").find("[idx=" + item.SLIP_IRN + "]")
			if (elItem.length) {
				continue;
			}
			else {
				if(targetItem.length < parent.slipRange) {
					if("1" === item.SDOCNO_INDEX) {
						targetItem.push(item);
					}
					else {
						if(parent.IS_FOLD) {
							continue;
						}
						else {
							targetItem.push(item);
						}
					}
				}
				else {
					break;
				}

			}
		}

		if(targetItem == null || targetItem.length <= 0) {

			$.Common.HideProgress("#slip_progress");
			$('.progress_slip_scroll').hide();
			return;
		}
		else {
			$.Mobile.addSlipItem(targetItem);
		}

		if($.Mobile.slipRange > targetItem.length) {
			$("#area_slip").unbind('scroll');
		}
		else {
			$.Mobile.addScrollEvent($(".slip_wrapper"), function(){
				if(!$.Mobile.isSlipLoading) {

					//	var start = $(".slip_item").size() === 0 ? 0 : $(".slip_item").size() + 1;

					$(".slip_wrapper").find('.progress_slip_scroll').show();
					//$.Actor.getSlipList($.Actor.params,   $.Actor.slipRange);
					$.Mobile.displayThumb($.Mobile);
				}
			});
		}
	},

	addSlipItem : function(item)
	{
		$.Mobile.isSlipLoading = true;
		var arElThumb = [];

		var arThumbInfo = Object.keys($.Mobile.objSlipItem);


		$.each(item, function(i){

			var elThumb = $.Mobile.getThumbElement(this, $.Mobile, arThumbInfo.indexOf(this.SLIP_IRN));

			if(elThumb != null)
			{
				var elDestination = $("#slip_masonry").find("[group="+this.SDOC_NO+"]:last");

				if(elDestination.length) {
					elDestination.after(elThumb);
				}
				else {
					elThumb.appendTo($('#slip_masonry'));
				}

				$('#slip_masonry').masonry('appended', elThumb);
				elThumb.css("opacity","0");
				$.Mobile.setThumbMouseEvent(elThumb.find(".area_thumb"));

				arElThumb.push(elThumb);

				$.Mobile.Set_ImageOriginal(this);

			}
		});

		$('#slip_masonry').imagesLoaded(function(){

			$.Mobile.isSlipLoading = false;

			setTimeout(function(){

				if($.Mobile.is_Maximized) {
					$('#slip_masonry').masonry({
						columnWidth: $(".area_slip").width() - 40
					});
					$(".slip_item").css("width", "100%");
				}
				else {
					$('#slip_masonry').masonry({
						columnWidth:  $.Mobile.thumbWidth
					});
					$(".slip_item").css("width",  $.Mobile.thumbWidth);
				}

				$('#slip_masonry').masonry('reloadItems');
				$('#slip_masonry').masonry('layout');



			}, 100);

			$.Common.HideProgress("#slip_progress");


			//Add thumb options
			$.each(arElThumb, function(){

				$(this).css("opacity","1");
				$(this).find('.area_effect').ripple({
					maxDiameter: "200%"
				});

				var idx = $(this).attr("idx");

				var elTitleArea = $(this).find(".area_title_btn");

				//Draw fold icon
				$.Mobile.addFoldIcon($.Mobile, elTitleArea, idx);

				if("1" !== $.Mobile.objSlipItem[idx].SDOCNO_INDEX)
				{
					//$.Actor.fold($.Actor, idx);
					var sdocNo = $.Mobile.objSlipItem[idx].SDOC_NO;

					var first = null;

					$.each($.Mobile.objSlipItem, function(){
						if(this.SDOC_NO === sdocNo) {
							first = this;
							return false;
						}
					});

					if(first.IS_FOLD) {
						$(this).hide();
					}
					else {
						$(this).show();
					}
				}
				else {
					$(this).show();
				}

				//Draw option icon
				$.Mobile.addContextMenu($.Mobile, elTitleArea, $.Mobile.contextMenu["Thumb"], $.Mobile.objSlipItem[idx], $.Mobile.params.VIEW_MODE);


				var curObj 			= $.Mobile.objSlipItem[idx];

				var bookmarkItem = curObj["BOOKMARKS"];
				//
				// $.each(bookmarkItem, function(){

				var bookmark = $(document.createElement('canvas'))[0];
				$(bookmark).attr({
					"width": $(this).find(".area_thumb").width(),
					"height": $(this).find(".area_thumb").height(),
					"class":"bookmark"
				});

				$(bookmark).insertAfter($(this).find(".link"));

				$.Bookmark.Draw_BookmarkItem(bookmark, bookmarkItem, curObj["SLIP_ROTATE"]);

			});

			$('.progress_slip_scroll').hide();


		});
	},
	Set_ImageOriginal : function(objItem) {

		// var sbThumbURL = new StringBuffer();
		// sbThumbURL.append(g_RootURL);
		// sbThumbURL.append("DownloadImage.do?");
		// sbThumbURL.append("ImgType=thumb");
		// sbThumbURL.append("&DocIRN="+objItem.DOC_IRN);
		// sbThumbURL.append("&Idx="+objItem.DOC_NO);
		// sbThumbURL.append("&degree="+objItem.SLIP_ROTATE);
		// sbThumbURL.append("&UserID="+$.Mobile.params.USER_ID);
		// sbThumbURL.append("&CorpNo="+$.Mobile.params.CORP_NO);
		// sbThumbURL.append('?'+Math.random());

		var sbImageURL = new StringBuffer();
		sbImageURL.append(g_RootURL);
		sbImageURL.append("DownloadImage.do?");
		sbImageURL.append("&DocIRN="+objItem.DOC_IRN);
		sbImageURL.append("&Idx="+objItem.DOC_NO);
		sbImageURL.append("&degree="+objItem.SLIP_ROTATE);
		sbImageURL.append("&UserID="+$.Mobile.params.USER_ID);
		sbImageURL.append("&CorpNo="+$.Mobile.params.CORP_NO);
		sbImageURL.append('?'+Math.random());


		var elTitleArea = $(document.createElement('div'));
		elTitleArea.addClass("original-view-caption");

		var elTitle = $(document.createElement('span'));
		elTitle.addClass("caption-title");
		elTitle.html(objItem.SDOC_NAME);
		elTitle.appendTo(elTitleArea);

		var elNewLine = $(document.createElement('br'));
		elNewLine.appendTo(elTitleArea);

		var elSlipType = $(document.createElement('span'));
		elSlipType.addClass("caption-slip-type");
		elSlipType.html(objItem.SDOC_KINDNM);
		elSlipType.appendTo(elTitleArea);

		var imageIdx = 0;
		for(var i = 0; i < $.Mobile.m_ViewerItem.length; i++) {

			if($.Mobile.m_ViewerItem[i].html == null) {
				imageIdx = i;
				break;
			}
		}

		var elOriginal = $(document.createElement('div'));
		elOriginal.attr("idx",objItem.SLIP_IRN);
		elOriginal.addClass("original-wrapper");

		var elContents = $(document.createElement('div'));
		elContents.addClass("contents");
		elContents.appendTo(elOriginal);

		var elProgressBookmark = $(document.createElement('div'));
		elProgressBookmark.attr("id","loadingBookmark");
		elProgressBookmark.addClass("loadingBookmark");
		elProgressBookmark.appendTo(elOriginal);

		var bookmark = $(document.createElement('canvas'))[0];
		//$(bookmark).attr("id","bookmark_"+objItem.SLIP_IRN);
		$(bookmark).addClass("bookmark");

		$(bookmark).appendTo(elContents);
		// $.Bookmark.Draw_BookmarkItem(bookmark, objItem.BOOKMARKS, objItem.SLIP_ROTATE);

		var helper = $(document.createElement('span'));
		helper.addClass("helper");
		helper.appendTo(elContents);

	// 	var elImage = $(document.createElement('img'));
	// //	elImage.attr("src",sbImageURL.toString());
	// 	elImage.addClass("original");
	// 	elImage.attr("id","original");
	// 	elImage.appendTo(elContents);
		objItem.ORIGINAL_URL = sbImageURL.toString();



		// $(elImage).load(function(){
		//
		// 	//var canvas = $($.Mobile.m_Viewer.container).find("canvas");
		// 	var canvas = $($.Mobile.m_Viewer.container).find("[idx="+objItem.SLIP_IRN+"]")[0];
		// 	$(canvas).attr({
		// 		"width" : $(".original").width(),
		// 		"height": $(".original").height(),
		// 		//	"class" : "bookmark"
		// 	});
		//
		// 	$.Bookmark.Draw_BookmarkItem($(canvas)[0], objItem.BOOKMARKS, objItem.SLIP_ROTATE);
		//
		//
		// });



	/*	$(elImage).load(function(){
			var bookmark = $(".original-wrapper").find("bookmark [slip_irn="+objItem.SLIP_IRN+"]")[0];
			$(bookmark).attr({
				"width" : this.naturalWidth,
				"height": this.naturalHeight,
			//	"class" : "bookmark"
			});
			*/
		//
		// 	$.Bookmark.Draw_BookmarkItem(bookmark, objItem.BOOKMARKS, objItem.SLIP_ROTATE);
		//
	//	});

		// elOriginal.append(bookmark);
	//	elOriginal.append("<img class='original' src="+sbImageURL.toString()+"/>");





		$.Mobile.m_ViewerItem[imageIdx] = {
			// src: sbImageURL.toString(),
			// msrc:sbThumbURL.toString(),
			html: $(document.createElement('div')).append(elOriginal).html(),
			//w:0,
			//h:0,
			title:elTitleArea.prop("outerHTML"),
			//  SlipIdx:nRealIdx
		};


						
	},

	Set_ImageDimension : function(index, callback)
		{
			var html = $.Mobile.m_ViewerItem[index].html;

			var url = $(html).find("img").attr('src');
			if($.Common.isBlank(url)) {
				return;
			}
			var img = new Image();
			img.src = url;

			$(img).load(function() {
				//$.Mobile.m_ViewerItem[index].w = img.naturalWidth;
				//$.Mobile.m_ViewerItem[index].h = img.naturalHeight;

				// var bookmark = $(html).find("#bookmark")[0];
				// $(bookmark).attr({
				// 	"width": 500,
				// 	"height": 500,
				// });
				// var ctx = bookmark.getContext("2d");
				// ctx.fillStyle = "#FF0000";
				// ctx.fillRect(0, 0, 150, 75);
				// sets a flag that slides should be updated
			//	$.Mobile.m_Viewer.invalidateCurrItems();
				// updates the content of slides
			//	$.Mobile.m_Viewer.updateSize(true);
				callback();
				//$(this) = null;
			});
		

		},

	getThumbElement : function(objData, callerObjData, thumbIdx)
		{
			//Draw thumb outline
			var idx 		= objData.SLIP_IRN;
			var group 	= objData.SDOC_NO;
			
			var elThumb = $(document.createElement('div'));
			elThumb.addClass("slip_item");
			elThumb.attr("idx", idx);
			elThumb.attr("group", group);
			elThumb.css({
				"width" : callerObjData.thumbWidth
			});
			elThumb.attr("id","slip_item");
			elThumb.attr("command","VIEW_ORIGINAL_SLIP");
			if("1" == objData.SDOC_ONE)
			{
				elThumb.addClass("oneSlip");
			}
	
			//Draw thumb Title area
			var elThumbTitleArea = $(document.createElement('div'));
			elThumbTitleArea.addClass("area_title");
			// elThumbTitleArea.css("background-color","rgb("+objData.KIND_COLOR+")");
			elThumbTitleArea.appendTo(elThumb);
			
			//Draw checkbox area
			var elTitleCheckbox = $(document.createElement('div'));
			elTitleCheckbox.addClass("area_cb");
			elTitleCheckbox.appendTo(elThumbTitleArea);
			
			//Draw checkbox
			var elCheckbox =  $(document.createElement('label'));
			elCheckbox.addClass("cb_container");
			elCheckbox.addClass("slip_check");
			elCheckbox.append($(document.createElement('input')).attr({"id":"chk","type":"checkbox"}));
			elCheckbox.append($(document.createElement('span')).addClass("checkbox"));
			elCheckbox.appendTo(elTitleCheckbox);

			var elTypeColor = $(document.createElement('div'));
			elTypeColor.attr("id","type_color");
			elTypeColor.css("background-color","rgb("+objData.KIND_COLOR+")");
			elTypeColor.appendTo(elThumbTitleArea);
			//Draw thumb title
			var elThumbTitle = $(document.createElement('div'));
			elThumbTitle.addClass("thumb_title");
			elThumbTitle.append($(document.createElement('span')).html(objData.SDOC_KINDNM));
			elThumbTitle.appendTo(elThumbTitleArea);
		
			if("1" === objData.SDOCNO_INDEX)
			{
				var elThumbBtnArea = $(document.createElement('div'));
				elThumbBtnArea.addClass("area_title_btn");
				elThumbBtnArea.attr("type","SLIP");
				elThumbBtnArea.appendTo(elThumbTitleArea);
				objData.IS_FOLD = callerObjData.IS_FOLD;

				// elThumb.attr("first","1");
				// elThumb.attr("fold","1");
			}
			// else
			// {
			// 	elThumb.css("display","none");
			// }
			
			
			
			//Draw image area
			var elThumbImgArea = $(document.createElement('div'));
			elThumbImgArea.css("position","relative");
			elThumbImgArea.attr("class","area_thumb");
			elThumbImgArea.appendTo(elThumb);
			
			//Add link
			var vElImageHref = $(document.createElement('a'));
			vElImageHref.addClass("link");
			vElImageHref.appendTo(elThumbImgArea);
			
			//Add image
			var sbImgURL = new StringBuffer();
			sbImgURL.append(g_RootURL);
			sbImgURL.append("DownloadImage.do?");
			sbImgURL.append("ImgType=thumb");
			sbImgURL.append("&DocIRN="+objData.DOC_IRN);
			sbImgURL.append("&Idx="+objData.DOC_NO);
			sbImgURL.append("&degree="+objData.SLIP_ROTATE);
			sbImgURL.append("&UserID="+callerObjData.params.USER_ID);
			sbImgURL.append("&CorpNo="+callerObjData.params.CORP_NO);
			sbImgURL.append('?'+Math.random());
		
			var vElImage = $(document.createElement('img'));
			vElImage.attr("src",sbImgURL);
			vElImage.attr("class","thumb_img");
			$(vElImageHref).append(vElImage);
			
			
			var sbSlipInfo = new StringBuffer();
			sbSlipInfo.append("<span class='slip-title'>" + objData.SDOC_NAME + "</span>");
			sbSlipInfo.append("<br/><span class='slip-reg-user'>"+objData.REG_USERNM + "</span>");
			
			//Draw thumb Info area
			var elThumbInfoArea = $(document.createElement('div'));
			elThumbInfoArea.addClass("area_info");
			
			elThumbInfoArea.html(sbSlipInfo.toString());
			elThumbInfoArea.appendTo(elThumbImgArea);
			
			//Draw thumb effect area
			var elThumbEffectArea = $(document.createElement('div'));
			elThumbEffectArea.addClass("area_effect");
			elThumbEffectArea.appendTo(elThumbImgArea);
			elThumbEffectArea.unbind("click").bind("click", function(){

				$.Mobile.Open_Viewer(objData.SLIP_IRN, thumbIdx);
			});
			//Add image
			
			return elThumb;
		},
		addFoldIcon : function(itemList, elTarget, idx) {
			
			if(elTarget.closest("#slip_item").attr("first") != "1") return;
			
			var objData = $.Common.getObjByValue(itemList,"SLIP_IRN",idx)[0];
			if(/*"1" == objData.SDOCNO_INDEX &&*/ parseInt(objData.SDOCNO_CNT) > 1)
			{
				var elBtn = $(document.createElement('div'));
				elBtn.attr("id","btn_fold");
				elBtn.unbind().bind("click", function(){ $.Mobile.fold(itemList, "btn_fold", idx) });
				elBtn.appendTo(elTarget);
				
				var iconURL = g_RootURL+"image/common/fold.png";
				
//				if("0" == elTarget.closest("#slip_item").attr("fold")) {
//					 iconURL = g_RootURL+"image/common/fold.png";
//				}
				
				var elImg = $(document.createElement('img')).attr("src",iconURL);
				elImg.unbind('mouseenter mouseleave').hover(function(){
					$(this).css("opacity","0.7");
				},function(){
					$(this).css("opacity","1");
				});
				
				elImg.appendTo(elBtn);
			}
		},
//		drawThumbOptionBtn: function(elThumb, objData, attrVal, imgURL, clickEvent) {
//			//Draw fold/unfold button
//			var elBtn = $(document.createElement('div'));
//				elBtn.attr(attrVal);
//				elBtn.unbind().bind("click",clickEvent);
//				elBtn.appendTo(elThumb);
//				
//				var elImg = $(document.createElement('img')).attr("src",imgURL + ".png");
//				elImg.unbind('mouseenter mouseleave').hover(function(){
//					$(this).css("opacity","0.7");
//				},function(){
//					$(this).css("opacity","1");
//				});
//				
//				elImg.appendTo(elBtn);
//			
//		},

		addFoldIcon : function(target, elTarget, idx) {

			var objData = target.objSlipItem[idx];
			if("1" !== objData.SDOCNO_INDEX) return;
			//if(elTarget.closest("#slip_item").attr("first") != "1") return;

			if(/*"1" == objData.SDOCNO_INDEX &&*/ parseInt(objData.SDOCNO_CNT) > 1)
			{
				var elBtn = $(document.createElement('div'));
				elBtn.attr("id","btn_fold");
				elBtn.unbind().bind("click", function(){ $.Mobile.fold(target, idx) });
				elBtn.appendTo(elTarget);

				var iconURL = null;
				if(objData.IS_FOLD) {
					iconURL = g_RootURL+"image/common/fold.png";
				}
				else {
					iconURL = g_RootURL+"image/common/unfold.png";
				}
	//				if("0" == elTarget.closest("#slip_item").attr("fold")) {
	//					 iconURL = g_RootURL+"image/common/fold.png";
	//				}

				var elImg = $(document.createElement('img')).attr("src",iconURL);
				elImg.unbind('mouseenter mouseleave').hover(function(){
					$(this).css("opacity","0.7");
				},function(){
					$(this).css("opacity","1");
				});

				elImg.appendTo(elBtn);
			}
		},
		fold : function(target, id){

			var curItem = target.objSlipItem[id];

			if(curItem.IS_FOLD) {
				$.Common.ShowProgress("#slip_progress","Waiting..","000000","0.7");
				$.Mobile.displayFoldThumb(target, id, curItem.SDOC_NO);
			}
			else {
				$.Mobile.hideFoldThumb(target, id, curItem.SDOC_NO);
			}

			curItem.IS_FOLD = !curItem.IS_FOLD;

		},
		displayFoldThumb : function(parent, id, groupNo) {

			var arThumbInfo = Object.keys(parent.objSlipItem);

			var itemIdx = $("#slip_masonry").find("[idx=" + id + "]").index();

			$('[id=slip_item]:gt(' + (itemIdx - 1) + ')').hide();
			//$("#slip_masonry").masonry('remove',);//.hide();

			var visibleItems = $("[id=slip_item]:visible");
			//
			// var cntToDisplay = target.slipRange - (visibleItems.length % target.slipRange);

			// var limit = 0;
			var parentFold = true;
			var targetThumbs = [];

			for(var i = 0; i < arThumbInfo.length; i++) {
				var res = null;
				var item = parent.objSlipItem[arThumbInfo[i]];

				if(arThumbInfo.indexOf(item.SLIP_IRN) < arThumbInfo.indexOf(id)) {
					continue;
				}
				else {
					if(item.SDOC_NO === groupNo) {
						res = item;
					}
					else {
						if(item.SDOCNO_INDEX === "1") {
							parentFold = item.IS_FOLD;
							res = item;
						}
						else {
							if(parentFold) {
								continue;
							}
							else {
								res = item;
							}
						}
					}
				}

				/*if(++limit > cntToDisplay) {
					break;
				}*/
				// else
				{
					if(res !== null) {
						targetThumbs.push(res);
					}
				}
			}

			var filteredTargetThumbs = [];
			$.each(targetThumbs,function () {
				var elItem = $("#slip_masonry").find("[idx=" + this.SLIP_IRN + "]")
				if (elItem.length) {
					elItem.show();
				} else {
					if(this.SDOC_NO === groupNo) {
						filteredTargetThumbs.push(this);
					}
				}
			});


			$('#slip_masonry').masonry('layout');
			// $("#area_slip").getNiceScroll().resize();

			if(filteredTargetThumbs.length > 0) {
				$.Mobile.addSlipItem(filteredTargetThumbs);
			}
			else {
				$.Common.HideProgress("#slip_progress");
			}

			$("#slip_masonry").find("[idx="+id+"]").find("#btn_fold").find("img").attr("src", g_RootURL+"image/common/unfold.png");

		},
		hideFoldThumb : function(parent, id, groupNo)
		{
			var arThumbInfo = Object.keys(parent.objSlipItem);

			var itemIdx = $("#slip_masonry").find("[idx=" + id + "]").index();
			$('[id=slip_item]:gt(' + (itemIdx) + ')').hide();
			//$('#slip_masonry').masonry('layout');

			/*$("#slip_masonry").find("[idx="+id+"]").show();*/
			$("#slip_masonry").find("[idx="+id+"]").find("#btn_fold").find("img").attr("src", g_RootURL+"image/common/fold.png");

			var visibleItems = $("[id=slip_item]:visible");


			// var cntToDisplay = target.slipRange - (visibleItems.length % target.slipRange);

			// var limit = 0;
			var parentFold = true;
			var targetThumbs = [];

			for(var i = 0; i < arThumbInfo.length; i++) {
				var res = null;
				var item = parent.objSlipItem[arThumbInfo[i]];

				if (arThumbInfo.indexOf(item.SLIP_IRN) < arThumbInfo.indexOf(id) || item.SDOC_NO === groupNo) {
					continue;
				} else {
					if(item.SDOCNO_INDEX === "1") {
						parentFold = item.IS_FOLD ? item.IS_FOLD : parent.IS_FOLD;
						res = item;
					}
					else {
						if(parentFold) {
							continue;
						}
						else {
							res = item;
						}
					}
				}

				/*if(++limit > cntToDisplay) {
					break;
				}*/
				// else
				{
					if(res !== null) {
						targetThumbs.push(res);
					}
				}
			}

			var filteredTargetThumbs = [];
			$.each(targetThumbs,function () {
				var elItem = $("#slip_masonry").find("[idx=" + this.SLIP_IRN + "]")
				if (elItem.length) {
					elItem.show();
				} else {
					//		if(this.SDOC_NO === groupNo) {
					filteredTargetThumbs.push(this);
					//		}
				}
			});

			$('#slip_masonry').masonry('layout');
		//	$("#area_slip").getNiceScroll().resize();

			if(filteredTargetThumbs.length > 0) {
				$.Common.ShowProgress("#slip_progress","Waiting..","000000","0.7");
				$.Mobile.addSlipItem(filteredTargetThumbs);
			}
		},


		/**
		 * Set mouse events on target thumb.
		 */
		setThumbMouseEvent : function(elThumb) {
			

		},
		Display_MainView : function(element) {
			var flag = $(element).attr("flag");

			$.each($("#btn-main-viewpager").find("div"), function() {
					$(this).removeClass("selected");
			});

			$.each($("#view-wrapper").children("div"), function() {
					$(this).hide();
			});

			$(element).addClass("selected");

			switch(flag) {
				case "slip" : {
					$("#slip-wrapper").show();

					if($.Mobile.objSlipItem == null) {
						$.Common.ShowProgress("#slip_progress","Waiting..","000000","0.7");
						$.Mobile.Draw_SlipList($.Mobile.params);
					}
					else
					{
						$("#slip_masonry").masonry('layout');
					}
					break;
				}
				case "attach" : {

					$("#attach-wrapper").show();

					if($.Mobile.objAttachItem == null) {
						$.Common.ShowProgress("#attach_progress","Waiting..","000000","0.7");
						$.Mobile.Draw_AttachList($.Mobile.params);
					}
					else {

					}
					break;
				}
			}

		},
		Draw_AttachList : function(params){


			var start = $(".attach-item").size() == 0 ? 0 : $(".attach-item").size() + 1;
			var per =  $.Mobile.attachRange;

			// if(params.MULTI_KEY) {
			// 	start = null;
			// 	per = null;
			// 	$("#area_attach").unbind('scroll');
			// }

			var objListParams = {
				KEY : params.KEY,
				KEY_TYPE : params.KEY_TYPE,
				USER_ID : params.USER_ID,
				CORP_NO : params.CORP_NO,
				LANG : params.LANG,
				// START_IDX : start,
				// PER : per
			};

			$.when($.Common.RunCommand(g_ActorCommand, "GET_ATTACH_LIST", objListParams)).done(function(res) {

				var resCnt = Object.keys(res) == null ? 0 : Object.keys(res).length;
				if(res == null || resCnt <= 0) {
					$('.progress_attach_scroll').hide();
					return;
				}

				if($.Mobile.objAttachItem == null) {
					$.Mobile.objAttachItem = res;
				}
				else {

					Object.keys(res).forEach(function(dataKey) {
						$.Mobile.objAttachItem[dataKey] = res[dataKey];
					});
				}

				$.Mobile.addAttachItem(res, $("#area_attach"), $.Mobile.currentKey);
				//
				// if(resCnt !== $.Mobile.attachRange) {
				// 	$("#area_attach").unbind('scroll');
				// }
				// else {
				// 	$.Mobile.addScrollEvent($(".attach_wrapper"), function(){
				// 		if(!$.Mobile.isAttachLoading) {
				//
				// 			//	var start = $(".slip_item").size() === 0 ? 0 : $(".slip_item").size() + 1;
				//
				// 			$(".attach_wrapper").find('.progress_attach_scroll').show();
				// 			//$.Actor.getSlipList($.Actor.params,   $.Actor.slipRange);
				// 			//$.Mobile.Draw_AttachList($.Mobile.params);
				// 			$.Mobile.addAttachItem(res, $("#area_attach"), $.Mobile.currentKey);
				// 		}
				// 	});
				// }

				// if(isMultiKey) {
				// 	$.Actor.change_GroupKey($.Actor.currentKey);
				// }

			}).fail(function(res){
				$.Common.simpleToast("Failed to load attach.");

			}).always(function(){

				$.Common.HideProgress("#attach_progress");
				$('.progress_attach_scroll').hide();
			});
		},

		addAttachItem : function(arObjAttach,elDest, specificKey)
		{
			// elDest.empty();

			var nProcCnt = 0;
			$.each(arObjAttach,function(i){

				var elItem = $("#area_attach").find("[idx="+this.SDOC_NO+"]");

				if (elItem.length) {
					return true;
				}
				else {

					if (!$.Common.isBlank(specificKey) && this.JDOC_NO != specificKey) return true;

					var elAttach = $.Mobile.Get_AttachElement(this);

					elAttach.appendTo(elDest);

					nProcCnt ++ ;

					if($.Mobile.attachRange <= nProcCnt) {
						return false;
					}
				}
			});

			$('.progress_attach_scroll').hide();

			if($.Mobile.attachRange === nProcCnt) {
				$.Mobile.addScrollEvent($("#area_attach"), function(){
					if(!$.Mobile.isAttachLoading) {
						$('.progress_attach_scroll').show();
						//$.Actor.getAttachList($.Actor, $.Actor.params, $.Actor.attachRange);

						$.Mobile.addAttachItem($.Mobile.objAttachItem, $("#area_attach"), $.Mobile.currentKey);
					}
				});
			}
			else {
				$("#area_attach").unbind('scroll');
			}

			
		},
		Get_AttachElement : function(objData) {
			var elAttach = $(document.createElement('div'));
			elAttach.addClass("attach-item");
			elAttach.attr("id","attach-item");
			elAttach.attr("idx",objData.SDOC_NO);
			
			var elLeftArea = $(document.createElement('div'));
			elLeftArea.addClass("attach-area-left");
			elLeftArea.appendTo(elAttach);

			var elTitle = $(document.createElement('div'));
			elTitle.addClass("attach-title");
			elTitle.html(objData.SDOC_NAME);
			elTitle.appendTo(elLeftArea);

			var elAttachType = $(document.createElement('div'));
			elAttachType.addClass("attach-type");
			elAttachType.html(objData.SDOC_KINDNM);
			elAttachType.appendTo(elLeftArea);

			var elRightArea = $(document.createElement('div'));
			elRightArea.addClass("attach-area-right");
			elRightArea.appendTo(elAttach);
			elRightArea.ripple({
					maxDiameter: "200%"
			});
			elRightArea.unbind("click").bind("click",function(e){
				e.stopPropagation();
				 $.Operation.execute($.Mobile, "DOWN_ORIGINAL_ATTACH", objData)});
			
			var elDownBtn = $(document.createElement('img'));
			elDownBtn.addClass("down-attach");
			elDownBtn.attr("src", g_RootURL+"image/common/context/download_cs.png");
			elDownBtn.attr("id","down-attach");
			elDownBtn.appendTo(elRightArea);
			
			return elAttach;

		},
		Download_attach : function(sdocNo) {

		}

		
}