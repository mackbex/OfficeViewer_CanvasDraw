$.Payment = {
    elListContainer : null,
    params : null,
    localeMsg : null,
    colorSet: null,
    init : function(params) {
        $.Common.ShowProgress("#area_progress","Waiting..","000000","0.7");

        this.params 	= params;

        //Set globalization.
        $.Payment.localeMsg = $.Common.Localize($.Lang, "data-i18n", params.LANG,"Payment");

        if($.Common.isBlank(this.params.PAYMENT_LIST_URL)) {
            $.Common.simpleAlert(null,this.localeMsg.PAYMENT_URL_NULL);
            return
        }

        $("#ipt_doc_title, #ipt_drafter").on("keyup", function(e){
            if (e.keyCode === 13) {
                $.Payment.Search();
            }
        });

        $("#ipt_drafter").val($.Payment.params.USER_ID);

        $(".date_picker").on("keyup", function(e){
            if (e.keyCode === 8) {
               e.preventDefault();
               return;
            }
        });


        $.Payment.setFormList();


        //Set UI set
        $.Payment.setUIColor();
        $.Payment.initializePayment();
    },
    initInputDateProc : function() {
        $("#fromDate, #toDate").inputFilter(function(value) {
            return /^[0-9/\-]*$/.test(value);    // Allow digits only, using a RegExp
        });

        $("#fromDate, #toDate").on("click", function(){
            $(this).select()
        });

        $("#fromDate, #toDate").on("keypress", function(){
            var val = $(this).val();
            if(val.length === 4 || val.length === 7) {
                $(this).val(val+"/");
            }
        });

        $("#fromDate").on("keyup", function(e){

            if (e.keyCode === 13) {
                var val = $(this).val();
                var date = new Date(val);
                if(val.length !== 10 || isNaN(date.getTime())) {
                    $.Common.simpleToast($.Payment.localeMsg.INPUT_VALID_DATE);
                }
                else {

                    var fromDate = $.Common.stringToDate($(this).val(), "/");

                    $('#fromDate').data('datepicker').selectDate(fromDate);

                    $("#toDate").select();
                }
            }
        });

        $("#toDate").on("keyup", function(e){

            if (e.keyCode === 13) {
                var val = $(this).val();
                var date = new Date(val);
                if(val.length !== 10 || isNaN(date.getTime())) {
                    $.Common.simpleToast($.Payment.localeMsg.INPUT_VALID_DATE);
                }
                else {

                    var toDate = $.Common.stringToDate($(this).val(), "/");
                    $('#toDate').data('datepicker').selectDate(toDate);
                    $.Payment.Search();
                }
            }
        });

    },
    setInputDate : function(){
        var res = true;
        var inputDate = $("#date").val();
        if(inputDate.indexOf("-") > -1) {

            inputDate = inputDate.split("-");

            var startDate = inputDate[0].trim();
            var endDate = inputDate[1].trim();

            var startDivider = "";
            var endDivider = "";
            if(startDate.indexOf("/") > -1) {
                startDivider = "/";
                if(startDate.length != 10) res = false;
            }
            else {
                if(startDate.length != 8) res = false;
            }

            if(endDate.indexOf("/") > -1) {
                endDivider = "/";
                if(endDate.length != 10) res = false;
            }
            else {
                if(endDate.length != 8) res = false;
            }

            if(res) {

                startDate = $.Common.stringToDate(inputDate[0], startDivider);
                endDate = $.Common.stringToDate(inputDate[1], endDivider);

                $('#date').data('datepicker').selectDate([startDate, endDate]);
            }
            else {
                $.Common.simpleToast($.Payment.localeMsg.NOT_VALID_DATE);
                res = false;
            }
        }
        else {
            $.Common.simpleToast($.Payment.localeMsg.NOT_VALID_DATE);
            res = false;
        }

        return res;
    },
    setFormList : function() {

        $.Common.ShowProgress("#payment_progress","Waiting..","000000","0.7");

        $("#sel_form").append($('<option/>', {
            value: "",
            text : "- All -"
        }));

        $.ajax({
            type : "POST",
            url : $.Payment.params.PAYMENT_TYPE_URL,
            dataType : "json",
            success: function(data) {
                $.each(data, function(){
                    var name = this.FORM_NAME;
                    $("#sel_form").append($('<option/>', {
                        value: name,
                        text : name
                    }));
                });
            },
            error: function(error) {
                //     deferred.reject(error);
            },
            complete: function(){
                $.Common.HideProgress("#payment_progress");
            }
        });


    },
    initializePayment : function()
    {

        $(window).on('resize', $.Common.windowCallback(function(){
      //      $("#ipt_content").getNiceScroll().resize();
         //   $("#comtList").getNiceScroll().resize();
        }));

        $(window).on("unload", function() {
            if(window.opener != null)
            {
               window.opener.$.Actor.reset();
            }
        });

        //Set datepicker
        var date = new Date();
        var fromDate = new Date(date.getFullYear(), date.getMonth() - 1, date.getDate());


        $('#fromDate').datepicker({
            language:"ko",
            autoClose:true,
        }).data('datepicker').selectDate([fromDate]);

        $('#toDate').datepicker({
            language:"ko",
            autoClose:true,
        }).data('datepicker').selectDate([new Date()]);

        $.Payment.initInputDateProc()
        $.Payment.drawGridView();
        $.Payment.localizeGrid();

        /*
			 * Detect LocalWAS
			 */
        if(typeof OfficeXPI == "undefined")
        {

            //Load XPI Script
            $.getScript(g_XPI_URL, function() {

                var localWAS_URL =  null;
                if(location.protocol.indexOf("https") > -1) {
                    localWAS_URL = "https://127.0.0.1:" +  $.Payment.params.XPI_PORT_HTTPS;
                }
                else {
                    localWAS_URL = "http://127.0.0.1:" +  $.Payment.params.XPI_PORT_HTTP;
                }

                var XPIParams = {
                    LOCAL_WAS_URL		: localWAS_URL,
                    LANG 				: $.Payment.params.LANG,
                    SERVER_KEY 			: $.Payment.params.SERVER_KEY,
                };

                /**
                 * Call LocalWAS
                 */
                $.when($.OfficeXPI.init(XPIParams, $.Lang)).then(function(a){

                }).fail(function(){

                });
            }).fail(function(){

            }).always(function(){

            });
        }
    },
    Search : function() {

        // if(!$.Payment.setInputDate()) {
        //     return;
        // }

        // $.Payment.Push_SearchResultItem();
        var params = $.Payment.Get_SearchParams();
        if(params !== null) {

            $("#result_list").jsGrid("option", "data", []);

            $.Common.ShowProgress("#payment_progress","Waiting..","000000","0.7");

            var alKeys = Object.keys(params);

            var url = $.Payment.params.PAYMENT_LIST_URL;// + "?";

            // for(var i = 0 ; i < alKeys.length; i++)
            // {
            //     url += alKeys[i] + "=" + params[alKeys[i]];
            //
            //     if( i < alKeys.length -1) {
            //         url += "&";
            //     }
            // }
            //
            // $.getJSON(url)
            //     .success(function(data) {
            //         if(Array.isArray(data)) {
            //             $.Payment.Push_SearchResultItem(data);
            //         }
            //         else {
            //             $.Common.simpleToast(data);
            //         }
            //     })
            //     .error(function(jqXHR, textStatus, errorThrown) {
            //
            //     }).complete(function(){
            //         $.Common.HideProgress("#payment_progress");
            //     });

            $.ajax({
                type : "POST",
                url : url,
                dataType: 'json',
                data:params,
                success: function(data) {
                    if(Array.isArray(data)) {
                        $.Payment.Push_SearchResultItem(data);
                    }
                    else {
                        $.Common.simpleToast(data);
                    }
                },
                error: function(error) {
                    //     deferred.reject(error);
                },
                complete: function(){
                    $.Common.HideProgress("#payment_progress");
                }
            });
        }
    },
    Push_SearchResultItem : function(data) {
        var arItem = [];
        //
        // var arTest = [];
        // var objTest = {};
        // objTest["FORM_NAME"] = "품의서";
        // objTest["DRAFT_DATE"] = "2020-01-30 09:09:48.0";
        // objTest["VIEW_URL"] = "http://approval.skons.co.kr:8090/bms/com/hs/gwweb/appr/retrieveDoccrdInqire.act?APPRIDLIST=JHOMS200300002801000&K=00h2wAfm3&externalDocPrint=false";
        // objTest["DRAFTER_NAME"] = "홍길동";
        // objTest["DOC_REG_NO"] = "개발팀-20-35";
        // objTest["TITLE"] = "테스트";
        // objTest["PRINT_URL"] = "https://www.naver.com";
        // objTest["APPR_ID"] = "JHOMS200300002801000";
        // objTest["FORM_NAME"] = "품의서";
        //
        // arTest.push(objTest);
        // data = arTest;

        if(data != null ) {
            $.each(data, function(){
                this["DRAFT_DATE"] = this["DRAFT_DATE"].substring(0, 10);
                arItem.push(this);
            });

            $("#result_cnt").html(arItem.length);

            $("#result_list").jsGrid("option", "data", arItem);

            $("#history_list").jsGrid("sort", { field: "DRAFT_DATE", order: "desc" });
        }

    },
    /**
     * @return {null}
     */
    Get_SearchParams: function() {

        var params = {};

        params['TYPE'] = "PRIVATE";

        var title = $("#ipt_doc_title").val();
        params['DOC_TITLE'] = encodeURIComponent(title);

        var form = $("#sel_form").children("option:selected"). val();
        params['DOC_TYPE'] = form;

        var drafter = $("#ipt_drafter").val();
        if(!$.Common.isBlank(drafter)) {
            params['EMP_CODE'] = drafter;
        }
        else {
            params['TYPE'] = "DEPT";
            params['EMP_CODE'] = $.Payment.params.USER_ID;
            params['DEPT_CODE'] = $.Payment.params.PART_NO;
        }

        var fromDate = $('#fromDate').val();
        var date = new Date(fromDate);
        if(!$.Common.isBlank(fromDate) && !isNaN(date.getTime())) {
            params['SEARCH_STR_DATE'] = fromDate;
        }
        else {
            $.Common.simpleAlert(null,this.localeMsg.INPUT_VALID_DATE);
            return null;
        }


        var toDate = $('#toDate').val();
        date = new Date(toDate);
        if(!$.Common.isBlank(toDate) && !isNaN(date.getTime())) {
            params['SEARCH_END_DATE'] = toDate;
        }
        else {
            $.Common.simpleAlert(null,this.localeMsg.INPUT_VALID_DATE);
            return null;
        }

        // var dateRange = $('#date').data('datepicker').selectedDates;
        //
        // if(dateRange.length !== 2) {
        //     $.Common.simpleAlert(null,this.localeMsg.INPUT_DATE);
        //     return null;
        // }
        // else {
        //     var startDate    = $.Common.getDateWithFormat(dateRange[0], "/");
        //     var endDate      = $.Common.getDateWithFormat(dateRange[1], "/");
        //
        //     params['SEARCH_STR_DATE'] = startDate.substring(2, startDate.length);
        //     params['SEARCH_END_DATE'] = endDate.substring(2, startDate.length);
        //
        // }

       // params['COUNT'] = "-1";

        return params;
    },
    Check_checkBox : function(id) {
        var elCheck = $("#"+id)[0];
        elCheck.checked = !elCheck.checked;
    },
    pageSubmit: function(){
        window.close()
        window.opener.$.Actor.pageSubmit();

    },
    drawGridView : function() {

        $("#result_list").jsGrid({
            width: "100%",
            height:$(".area_search_result_list").height(),
            filtering: false,
            inserting: false,
            editing: false,
            selecting: true,
            sorting: true,
            paging: true,


            pageSize: 15,
            pageButtonCount: 5,
            rowDoubleClick: function(args) {

               if($.Operation.detectCS($.Payment, null, true)) {
                    $.Operation.Add_Payment($.Payment, args.item);
               }

            },

            //    data: arObjHistoryItems,

            // "docId": "68678c35-6715-4343-8aab-0e70d6750324",
            // "docNumber": "SKTL-19-000004",
            // "title": "test1",
            // "formName": "계약체결요청",
            // "registerId": "administrator",
            // "registerName": "관리자",
            // "registerDeptName": "그룹00",
            // "registerDate": "2019-05-31 03:09:33.197",
            // "updateDate": "2019-05-31 03:26:09.120"

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


            // "docId": "68678c35-6715-4343-8aab-0e70d6750324",
            // "docNumber": "SKTL-19-000004",
            // "title": "test1",
            // "formName": "계약체결요청",
            // "registerId": "administrator",
            // "registerName": "관리자",
            // "registerDeptName": "그룹00",
            // "registerDate": "2019-05-31 03:09:33.197",
            // "updateDate": "2019-05-31 03:26:09.120"

            fields: [
                {name:"APPR_ID",                type: "text", title:"", width:0, align:"left"},
                { name: "VIEW_URL", 		    type: "text", title:"", width: 0, align: "center" },
                { name: "PRINT_URL", 		    type: "text", title:"", width: 0, align: "center" },
                { name: "TITLE", 		        type: "text", title:"", width: 230, align: "center", css : "text-overflow"},
                { name: "FORM_NAME", 	    	type: "text", title:"", width: 200, align: "center", css : "text-overflow"},
                { name: "DRAFTER_NAME", 		type: "text", title:"", width: 95, align: "center"},
                { name: "DOC_REG_NO", 	    	type: "text", title:"", width: 95, align: "center" },
                { name: "DRAFT_DATE", 	        type: "text", title:"", width: 60, align: "center" }
            ]
        });

        $("#result_list").jsGrid("fieldOption", "APPR_ID", "visible", false);
        $("#result_list").jsGrid("fieldOption", "VIEW_URL", "visible", false);
        $("#result_list").jsGrid("fieldOption", "PRINT_URL", "visible", false);
    },
    localizeGrid : function() {
      //  $("#result_list").jsGrid("fieldOption", "docNumber", 		"title", this.localeMsg.DOC_NO);
        $("#result_list").jsGrid("fieldOption", "TITLE", 		"title", this.localeMsg.DOC_NM);
        $("#result_list").jsGrid("fieldOption", "FORM_NAME",		"title", this.localeMsg.FORM_NAME);
        $("#result_list").jsGrid("fieldOption", "DRAFTER_NAME", 		"title", this.localeMsg.REG_NM);
        $("#result_list").jsGrid("fieldOption", "DOC_REG_NO",	"title", this.localeMsg.REG_DEPT_NM);
        $("#result_list").jsGrid("fieldOption", "DRAFT_DATE", 		"title", this.localeMsg.DOC_REG_DATE);

    },
    reset : function() {
        $("#ipt_title").val("");
        $("#ipt_content").val("");
    },
    setUIColor : function()
    {
        var objColor = $.extend($.Color.PC.Payment, $.Color.Common);

        if(objColor != null)
        {
            $(".area_payment_title").css({"background":"#"+objColor.NAVIGATION, "color" : "#" + objColor.NAVIGATION_FONT});
            $(".wrapper").css({"background":"#"+objColor.BACKGROUND});
            $(".search_option").css({"color":"#"+objColor.TITLE_FONT_COLOR});
            $(".item_title").css({"color":"#"+objColor.ITEM_FONT_COLOR});
            $(".item_separator").css({"background":"#"+objColor.ITEM_SEPARATOR_COLOR});
            $(".btn_search").css({"background":"#"+objColor.NAVIGATION,  "color" : "#" + objColor.NAVIGATION_FONT});
            // $(".area_comment_write").css({"border-top":"1px solid #"+objColor.INPUT_AREA});
            // $(".ipt_content").niceScroll({cursorcolor:"#"+objColor.NAVIGATION});
            // $(".ipt_title:focus").css({"border-bottom":"2px solid #"+objColor.WRITE_BORDER});
            // $(".ipt_content:focus").css({"border-bottom":"2px solid #"+objColor.WRITE_BORDER});
            // $("#ipt_content").niceScroll({horizrailenabled: false, cursorcolor:"#"+objColor.NAVIGATION});
            // $(".apply").css({"background":"#"+objColor.WRITE_BUTTON});
            // $("#comtList").niceScroll({horizrailenabled: false, cursorcolor:"#"+objColor.NAVIGATION});
            $.Payment.colorSet = objColor;
        }
    },
}