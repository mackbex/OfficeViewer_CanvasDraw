$.CoCard = {
		localeMsg : null,
		colorSet : null,
		params : null,
		viewer : null,
		init : function(params) {
		//	$.Common.ShowProgress("#cocard_progress","Waiting..","000000","0.7");

			this.params 			= params;
			
			//Set globalization.
			$.CoCard.localeMsg = $.Common.Localize($.Lang, "data-i18n", params.LANG,"CoCard");

			//Set UI set
			$.CoCard.setUIColor();

			//Set datepicker
			var date = new Date();
			var firstDay = new Date(date.getFullYear(), date.getMonth() - 1, date.getDate());

			$('#date').datepicker({
				language:"ko",
				autoClose:true,
				range: true
			}).data('datepicker').selectDate([firstDay,new Date()]);

			//Allow only digits.
			$('#ipt_apprNo').bind('input paste', function(){
				this.value = this.value.replace(/[^0-9]/g, '');
			});

			$.CoCard.drawGridView();
			$.CoCard.viewer = $.CoCard.setImageViewer();
			if(!$.Common.isBlank($.CoCard.params.APPR_NO)) {
				$("#ipt_apprNo").val($.CoCard.params.APPR_NO);
				$.CoCard.Search(true);
			}
		},
		Remove : function() {

			var items = $.grep($("#result_list").jsGrid("option", "data"), function(obj){
				return obj.isChecked === true;
			});

			if(items.length <= 0)
			{
				items = [];

				var idx = $("#result_list").find(".selected-row").index() - 1;
				items.push($("#result_list").jsGrid("option", "data")[idx]);
			}

			if(items.length > 0) {
				$.Common.simpleConfirm(null,$.CoCard.localeMsg.CONFIRM_REMOVE_CHECKED, function(){

					var params = {
						FIELD : "SDOC_NO",
						VALUE :  $.map(items,function(obj) { return obj.sdocNo})
					}

					$.when($.Operation.execute($.CoCard, "REMOVE_SLIP_API", params)).then(function (flag) {
						if ("T" === flag) {
							$.CoCard.Search();
						} else {
							$.Common.simpleAlert(null, $.CoCard.localeMsg.FAILED_REMOVE_ITEM, null);
						}
					});
				});
			}
			else {
				$.Common.simpleAlert(null, $.CoCard.localeMsg.ALERT_CHECK_SLIP, 0.3);
			}
		},
		Update : function(item) {

			var deferred = $.Deferred();

			$.when($.Operation.execute($.CoCard, "UPDATE_COCARD_APPR", item)).then(function(res) {

				if("T" === res.toUpperCase()) {
					deferred.resolve(item);
				}
				else
				{
					$.Common.simpleAlert(null, $.CoCard.localeMsg.FAILED_UPDATE_COCARD_APPR, null);
					deferred.reject(null);
				}
			})
			.fail(function(error){
				deferred.reject(error);
			})
			.always(function(){
				var elRow = $(".selected-row").prev();
				var elTarget = elRow.find("td").eq(2);
				$.Common.RemoveProgress(elTarget);
			});

			return deferred.promise();
		},
		Search : function (isDefaultSearch) {
		//	$.CoCard.Push_SearchResultItem();

			$.CoCard.resetViewer();

			$.CoCard.changeCheckStatus(false);
			var params = $.CoCard.getSearchParams(isDefaultSearch);
			if(params !== null) {
//
				$("#result_list").jsGrid("option", "data", []);
//
				$.Common.ShowProgress("#result_progress","Waiting..","000000","0.7");
//
				$.when($.Operation.execute($.CoCard, "GET_COCARD_LIST", params)).then(function(res) {
					$.CoCard.Push_SearchResultItem(res);
				})
				.fail(function(error){
					$.Common.simpleAlert(null, $.CoCard.localeMsg.FAILED_SEARCH, null);
				})
				.always(function(){
					$.Common.HideProgress("#result_progress");
				});
			}
		},
		getSearchParams : function(isDefaultSearch){

			var params = {};

			var dateRange = $('#date').data('datepicker').selectedDates;

			if(!isDefaultSearch) {
				if(dateRange.length !== 2) {
					$.Common.simpleAlert(null,this.localeMsg.INPUT_DATE);
					return null;
				}
				else {
					params['FROM_DATE']     = $.Common.getDateWithFormat(dateRange[0], "-");
					params['TO_DATE']       = $.Common.getDateWithFormat(dateRange[1], "-");
				}
			}

			var userId = $("#ipt_userid").val();
			if(!$.Common.isBlank(userId)) {
				params['USER_ID'] = userId;
			}

			var apprNo = $("#ipt_apprNo").val();
			if(!$.Common.isBlank(apprNo)) {
				params['APPR_CARD'] = apprNo;
			}

			return params;
		},
		Push_SearchResultItem: function(res){

			var resCnt = Object.keys(res) == null ? 0 : Object.keys(res).length;
			if(res == null || resCnt <= 0) {
				return;
			}

			var arItems = [];

			Object.keys(res).forEach(function(dataKey) {
				var item = {
					"sdocNo": res[dataKey].SDOC_NO,
					"cabinet": res[dataKey].CABINET,//.replace(/(\d{4})(\d{2})(\d{2})/g, '$1-$2-$3'),
					"pages" : res[dataKey].SLIP_CNT,
					"apprNo" : res[dataKey].APPR_CARD,
					"isChecked":false
				}

				arItems.push(item);
			});

			$("#result_list").jsGrid("option", "data", arItems);
			$("#result_list").jsGrid("sort", { field: "cabinet", order: "desc" });

		},
		updateRow: function(e){

			var idx = $("#result_list").find(".selected-row").index() - 1;
			if(idx < 0) {
				$.Common.simpleAlert(null, $.CoCard.localeMsg.ALERT_CHECK_SLIP, 0.3);
			}
			else {

				var isEditing = $("#result_list").find(".jsgrid-edit-row").length;

				if(isEditing) {
					$("#result_list").jsGrid("updateItem");
				}
				else {
					$.Common.simpleAlert(null, $.CoCard.localeMsg.ALERT_CHECK_SLIP, 0.3);
				}
			}
		},
		getImageData : function(item) {

			var params = {
				KEY : item.sdocNo
			};

			$.Common.ShowProgress(".area_original","Waiting..","000000","0.7");
//

			$.when($.Operation.execute($.CoCard, "DISPLAY_COCARD", params)).then(function(res) {

				var resCnt = Object.keys(res) == null ? 0 : Object.keys(res).length;
				if(res == null || resCnt <= 0) {
					$.Common.simpleAlert(null, $.CoCard.localeMsg.FAILED_SEARCH, null);
				}
				else {
					$.CoCard.setSlipPager(res);
					$.CoCard.displayImage(res, Object.keys(res)[0]);
				}
			})
			.fail(function(error){
				$.Common.simpleAlert(null, $.CoCard.localeMsg.FAILED_SEARCH, null);
			})
			.always(function(){
				$.Common.RemoveProgress(".area_original");
			});
		},
		setSlipPager:function(obj) {
			if(Object.keys(obj).length > 1) {
				var areaSelectBox = $(document.createElement('div'))
					.addClass("area_slip_page")
					.attr("id","slipPager")
					.prependTo(".slip_title_right");

				var elSelect = $(document.createElement('select'))
					.unbind().bind('change', function(){

						$.CoCard.displayImage(obj, this.value);
					})
					.appendTo(areaSelectBox);


				var i = 1;
				Object.keys(obj).forEach(function(dataKey) {
					//objItem[dataKey] = obj[dataKey];
					elSelect.append($('<option>', {
						value: dataKey,
						text : "Page " + i
					}));

					i++;
				});
			}
		},
		changeSlipPage : function(obj){

		},
		displayImage : function(obj, key) {

			var elTarget = $("#originalImage");
			elTarget.empty();
			// var objItem = {};


			// Object.keys(obj).forEach(function(dataKey) {
			// 	objItem[dataKey] = obj[dataKey];
			// });

			var sbImgURL = new StringBuffer();
			sbImgURL.append(this.rootURL);
			sbImgURL.append("DownloadImage.do?");
			sbImgURL.append("&DocIRN="+obj[key].DOC_IRN);
			sbImgURL.append("&Idx="+obj[key].DOC_NO);
			sbImgURL.append("&degree="+obj[key].SLIP_ROTATE);
			sbImgURL.append("&UserID="+$.CoCard.params.USER_ID);
			sbImgURL.append("&CorpNo="+$.CoCard.params.CORP_NO);

			var elCenterVerticalHelper = $(document.createElement('span'));
			elCenterVerticalHelper.addClass("helper");
			elCenterVerticalHelper.appendTo(elTarget);

			var elImage = $(document.createElement('img'));
			elImage.attr({
				"src":sbImgURL.toString(),
				"key":obj[key].SDOC_NO
			});
			elImage.appendTo(elTarget);
			elImage.load(function() {
				var version = $.Common.GetBrowserVersion().ActingVersion;
				if(version >= 9) {

					var bookmarkItem = obj[key]["BOOKMARKS"];
					if(bookmarkItem != null && bookmarkItem.length > 0) {
						var bookmark = $(document.createElement('canvas'));
						bookmark.attr({
							"width": elImage.width(),
							"height": elImage.height(),
							"id": "bookmark",
							"class": "bookmark"
						});
						bookmark.appendTo(elTarget);

						$.Bookmark.Draw_BookmarkItem(bookmark[0], bookmarkItem, objData["SLIP_ROTATE"]);
					}
				}
			});

		},
		resetViewer : function() {
			if ($.CoCard.viewer != null) {
				$.CoCard.viewer.panzoom("reset", false);
			}

			$("#originalImage").empty();
			$("#slipPager").remove();
		},
		changeCheckStatus : function(isChecked) {

			$("[attr=cardItem]").prop("checked",isChecked);
			$("#chkAll").prop("checked",isChecked);

			$.each($("#result_list").jsGrid("option", "data"), function(){
				this.isChecked = isChecked;
			});
		},
		localizeGrid : function() {
			//  $("#result_list").jsGrid("fieldOption", "docNumber", 		"title", this.localeMsg.DOC_NO);
			$("#result_list").jsGrid("fieldOption", "cabinet", 		"title", this.localeMsg.CABINET);
			$("#result_list").jsGrid("fieldOption", "apprNo",		"title", this.localeMsg.APPR_NO);
			$("#result_list").jsGrid("fieldOption", "pages", 		"title", this.localeMsg.PAGES);
		//	$("#result_list").jsGrid("fieldOption", "select", 		"title", this.localeMsg.SELECT_ROW);

		},
		reset : function() {
			$("#ipt_title").val("");
			$("#ipt_content").val("");
		},
		setUIColor : function()
		{
			var objColor =  $.extend($.Color.PC.CoCard, $.Color.Common);
			
			if(objColor != null)
			{
				$(".area_cocard_title").css({"background":"#"+objColor.NAVIGATION, "color" : "#" + objColor.NAVIGATION_FONT});
				$(".cocard").css({"background":"#"+objColor.BACKGROUND});
				$(".item_separator").css({"background":"#"+objColor.ITEM_SEPARATOR_COLOR});
				$(".btn_search").css({"background":"#"+objColor.NAVIGATION,  "color" : "#" + objColor.NAVIGATION_FONT});
				$(".btn_remove").css({"background":"#"+objColor.REMOVE,  "color" : "#" + objColor.NAVIGATION_FONT});
				$(".btn_apply").css({"background":"#"+objColor.NAVIGATION,  "color" : "#" + objColor.NAVIGATION_FONT});
				$(".bar").css({"background":"#"+objColor.BAR});
				$(".area_image_viewer > div").css({"border-bottom":"2px solid #"+objColor.NAVIGATION});



				$.CoCard.colorSet = objColor;
			}
		},
		setImageViewer : function() {

			var panzoom = $("#originalImage").panzoom({
				minScale: 0.7,
				maxScale: 5,
				$zoomIn:$("#zoomIn"),
				$zoomOut:$("#zoomOut"),
				animate:true
			});

			panzoom.parent().on('mousewheel.focal', function(e) {
				e.preventDefault();
				var delta = e.delta || e.originalEvent.wheelDelta;
				var zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0;
				panzoom.panzoom('zoom', zoomOut, {
					animate: false,
					focal: e,
					increment:0.1
				});

				// var obj = $('#originalImage');
				// var transformMatrix = obj.css("-webkit-transform") ||
				// 	obj.css("-moz-transform")    ||
				// 	obj.css("-ms-transform")     ||
				// 	obj.css("-o-transform")      ||
				// 	obj.css("transform");
				// var matrix = transformMatrix.replace(/[^0-9\-.,]/g, '').split(',');
				// var x = matrix[12] || matrix[4];//translate x
				// var y = matrix[13] || matrix[5];//translate y
				//
				// $("#bookmark")[0].getContext("2d").transform(
				// 	matrix[0],
				// 	matrix[1],
				// 	matrix[2],
				// 	matrix[3],
				// 	matrix[4],
				// 	matrix[5]
				// );


			});

			return panzoom;
		},
		drawGridView : function() {

			var apprNoField = function(config) {
				jsGrid.TextField.call(this,config);
			};

			apprNoField.prototype = new jsGrid.TextField({

					editTemplate: function(value) {
						if(!this.editing)
							return this.itemTemplate.apply(this, arguments);

						var $result = this.editControl = this._createTextBox();
						var grid = this._grid;

						$result.attr({"maxLength":8});
						$result.bind('input paste', function(){
							this.value = this.value.replace(/[^0-9]/g, '');
						});
						$result.on("keyup", function(e) {
							if(e.which === 13) {
								grid.updateItem();
							}
							else if(e.which === 27) {
								grid.cancelEdit();
							}
						});

						$result.val(value);
						return $result;
					}
				}
			);

			jsGrid.fields.apprNoField = apprNoField;

			$("#result_list").jsGrid({
				width: "100%",
				height: "20px",//$(".result_list").height(),
				filtering: false,
				inserting: false,
				editing: true,
				selecting: true,
				sorting: true,
				paging: true,
				pageSize: 15,
				loadIndication:false,
				pageButtonCount: 5,
				noDataContent: "-",
				controller: {
					updateItem: function(item) {
						return $.CoCard.Update(item); //deferred.promise();
					}
				},

				rowClick : function(args) {

					var curKey = $("#originalImage > img").attr("key");
					if(args.item.sdocNo !== curKey) {
						$.CoCard.resetViewer();
						$.CoCard.getImageData(args.item);
					}

					// remove class for all rows
					$("#result_list tr").removeClass("selected-row")
					$selectedRow = $(args.event.target).closest("tr");
					// add class to highlight row
					$selectedRow.addClass("selected-row");

					$("#result_list").jsGrid("cancelEdit");
					return;
				},
				rowDoubleClick: function(args) {
					var elRow = $(args.event.target).closest("tr");
					var chkValue = elRow.find("input[type=checkbox]").is(":checked");
					this.editItem(elRow);

					var elEditRow = elRow.prev();
					var text = elEditRow.find("input[type=text]");
					elEditRow.find("input[type=checkbox]").prop("checked",chkValue);

					text.focus();
					text.select();
				},

				onRefreshed: function (args) {
					//sync column width on page load
					$.each(args.grid._headerGrid[0].rows[0].cells, function (i, obj) {
						$(args.grid._bodyGrid[0].rows[0].cells[i]).css("width", $(obj).css("width"));
					});

					//sync column width on column resize
					$("table").colResizable({
						onResize: function () {
							$.each(args.grid._headerGrid[0].rows[0].cells, function (i, obj) {
								$(args.grid._bodyGrid[0].rows[0].cells[i]).css("width", $(obj).css("width"));
							});
						}
					});
				},

				onItemUpdated: function(args) {

				},
				onItemUpdating: function(args) {

					// args.cancel = true;
					//
					var elRow = $(".selected-row").prev();
					var elTarget = elRow.find("td").eq(2);
					$.Common.ShowProgress(elTarget,"","000000","0.7");
					//
					if(args.item.apprNo.length !== 8) {
						args.cancel = true;
						$.Common.RemoveProgress(elTarget);

						$.Common.simpleToast($.CoCard.localeMsg.INPUT_8_DIGITED_APPR_NO);
						// setTimeout(function(){
						// 	$.Common.simpleAlert(null, $.CoCard.localeMsg.INPUT_8_DIGITED_APPR_NO, null);
						// }, 0);
					}
				},

				fields: [
					{name:"sdocNo",            title:"", width:0, align:"left"},
					//	{name:"docIrn",            title:"", width:0, align:"left"},
					{
						name:"isChecked",
						headerTemplate: function() {

							return $(document.createElement('div'))
								.addClass("cb_chk_all")
								.prepend(
									$(document.createElement('label'))
										.addClass("cb_container")
										.prepend([
											$(document.createElement('input'))
												.attr({
													"type" : "checkbox",
													"id":"chkAll"
												})
												.on("change", function () {
													$.CoCard.changeCheckStatus($(this).is(":checked"));
												}),
											$(document.createElement("span"))
												.addClass("checkbox")
										])
								)
						},
						itemTemplate: function(_, item) {
							return	$(document.createElement('div'))
								.addClass("cb_chk_all")
								.prepend(
									$(document.createElement('label'))
										.addClass("cb_container")
										.prepend([
											$(document.createElement('input'))
												.attr({
													"type": "checkbox",
													"sodcNo" : item.sdocNo,
													"attr":"cardItem"
												})
												.on("change", function () {
													item.isChecked = $(this).is(":checked");
													//	$.CoCard.changeCheckStatus($(this).is(":checked"));
												}),
											$(document.createElement("span"))
												.addClass("checkbox")
										])

								)
						},
						align: "center",
						width: 50,
						sorting: false
					},
					{name:"cabinet",             title:"", width:90, align:"center"},
					{ name: "apprNo", 		    type: "apprNoField", title:"", width:"auto",  align: "center" , css : "text-overflow"},
					{ name: "pages", 		  title:"", width: 50, align: "center" }

				]
			});

			$("#result_list").jsGrid("fieldOption", "sdocNo", "visible", false);
			//	$("#result_list").jsGrid("fieldOption", "docIrn", "visible", false);

			$.CoCard.localizeGrid();
		},
}