$.Related = {
    elListContainer : null,
    params : null,
    localeMsg : null,
    colorSet: null,
    orgTreeXml : $.parseXML("<org/>"),
    curOrg : {name:"", code:"815000001"},
  //  orgTree : new StringBuffer(),
    init : function(params) {
        $.Common.ShowProgress("#area_progress","Waiting..","000000","0.7");

        this.params 	= params;

        //Set globalization.
        $.Related.localeMsg = $.Common.Localize($.Lang, "data-i18n", params.LANG,"Related");

        // if($.Common.isBlank(this.params.RELATED_LIST_URL)) {
        //     $.Common.simpleAlert(null,this.localeMsg.RELATED_TYPE_URL);
        //     return
        // }

        $("#ipt_doc_title, #ipt_drafter").on("keyup", function(e){
            if (e.keyCode === 13) {
                $.Related.Search();
            }
        });

        $("#ipt_drafter").val($.Related.params.USER_ID);

        $(".date_picker").on("keyup", function(e){
            if (e.keyCode === 8) {
               e.preventDefault();
               return;
            }
        });


        // $.Related.setFormList();


        //Set UI set
        $.Related.setUIColor();
        $.Related.initializeRelated();
    },
    initInputDateProc : function() {
        $("#sel_date").inputFilter(function(value) {
            return /^[0-9/\-]*$/.test(value);    // Allow digits only, using a RegExp
        });

        $("#sel_date").on("click", function(){
            $(this).select()
        });

        $("#sel_date").on("keypress", function(){
            var val = $(this).val();
            if(val.length === 4) {
                $(this).val(val+"-");
            }
        });

        $("#sel_date").on("keyup", function(e){

            if (e.keyCode === 13) {
                var val = $(this).val();
                var date = new Date(val);
                if(val.length !== 7 || isNaN(date.getTime())) {
                    $.Common.simpleToast($.Related.localeMsg.INPUT_VALID_DATE);
                }
                else {

                    var toDate = $.Common.stringToDate($(this).val(), "-");
                    $('#sel_date').data('datepicker').selectDate(toDate);
                    // $.Related.Search();
                }
            }
        });

    },


    initializeRelated : function()
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


        // $('#fromDate').datepicker({
        //     language:"ko",
        //     autoClose:true,
        // }).data('datepicker').selectDate([fromDate]);

        $('#sel_date').datepicker({
            language:"ko",
            autoClose:true,
        }).data('datepicker').selectDate([new Date()]);

        $.Related.initInputDateProc()
        $.Related.drawGridView();
        $.Related.localizeGrid();

        // /*
		// 	 * Detect LocalWAS
		// 	 */
        // if(typeof OfficeXPI == "undefined")
        // {
        //
        //     //Load XPI Script
        //     $.getScript(g_XPI_URL, function() {
        //
        //         var localWAS_URL =  null;
        //         if(location.protocol.indexOf("https") > -1) {
        //             localWAS_URL = "https://127.0.0.1:" +  $.Related.params.XPI_PORT_HTTPS;
        //         }
        //         else {
        //             localWAS_URL = "http://127.0.0.1:" +  $.Related.params.XPI_PORT_HTTP;
        //         }
        //
        //         var XPIParams = {
        //             LOCAL_WAS_URL		: localWAS_URL,
        //             LANG 				: $.Related.params.LANG,
        //             SERVER_KEY 			: $.Related.params.SERVER_KEY,
        //         };
        //
        //         /**
        //          * Call LocalWAS
        //          */
        //         $.when($.OfficeXPI.init(XPIParams, $.Lang)).then(function(a){
        //
        //         }).fail(function(){
        //
        //         });
        //     }).fail(function(){
        //
        //     }).always(function(){
        //
        //     });
        // }

        // $.Related.setYearSelectbox();

    },
    setYearSelectbox : function() {
        var curYear = new Date().getFullYear();

        $('#doc_year').append($('<option>', {
            value: "cur",
            text: $.Related.localeMsg.CURRENT_ORG
        }));

        for(var i = curYear; i >= new Date("2008").getFullYear(); i --)
        {
            $('#doc_year').append($('<option>', {
                value: i,
                text: i
            }));
        }

        $('#doc_year').off('change').on('change', function (e) {
            // var optionSelected = $("option:selected", this);
            var valueSelected = this.value;

            $.Related.getOrgList(valueSelected);
        });
    },
    Open_organization : function() {
        $("#organizationPopup").show();
        $.Related.setYearSelectbox();

        // if($.Common.isEmptyObject($("#org_list #conts"))) {

            $.Related.getOrgList("cur");

    },
    getOrgList : function(year) {
        // var optionSelected = $("#doc_year").find(":selected").val();
        // var isEmptyTree = $.Common.isEmptyObject($("#org_list #conts"));
        // if(optionSelected === year && !isEmptyTree) {
        //     return;
        // }
        $.Common.ShowProgress("#org_list_progress","Waiting..","000000","0.7");

        var url = new StringBuffer();
        url.append($.Related.params.MAIN_URL);

        if($.Common.isBlank(year) || year === "cur") {
            url.append($.Related.params.ORG_CUR_URL);
        }
        else {
            url.append("org/old/");
            url.append(year);
            url.append(".nsf/");
            url.append($.Related.params.ORG_OLD_URL);
        }
        url.append("readviewentries&count=1000&start=1");

        var params = {
            URL : url.toString()
        };


        // $.when($.Common.RunCommand(g_RelatedCommand, "GET_ORG_LIST", params)).then(function(objRes){
        //     if("T" === objRes.RESULT.toUpperCase())
        //     {
        //         try {
        //             var res = $.parseXML(objRes.MSG);
        //             $.Related.displayOrgList(res);
        //         }
        //         catch(e) {
        //             $.Common.simpleToast($.Related.localeMsg.CHECK_SSO);
        //         }
        //     }
        //     else
        //     {
        //         $.Common.simpleToast("Failed get result.");
        //     }
        //     $.Common.HideProgress("#org_list_progress");
        // });


         $.ajax({
             type: "GET",
             // url : url.toString(),
             url: g_RootURL + "testdoc_2020",
             dataType: 'xml',
             crossOrigin : true,
             success: function (data) {
                 if($.Common.isBlank(year) || year === "cur") {
                     $.Related.displayOrgListForCur(data);
                 }
                 else {
                     $.Related.displayOrgList(data);
                 }
             },
             fail :function(e) {
                 $.Common.simpleToast($.Related.localeMsg.FAILED_LOAD_ORGLIST);
             },
             error : function(d, textStatus, error) {
                 $.Common.simpleToast($.Related.localeMsg.CHECK_SSO);
             },
             complete: function () {
                 $.Common.HideProgress("#org_list_progress");
             }
             // jsonp : "callback",
        //     contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
             // data: params,
             // success: function (data) {
             //     $.Related.displayOrgList(data);
             // },
             // fail :function(d, textStatus, error) {
             //     $.Common.simpleToast($.Related.localeMsg.FAILED_LOAD_ORGLIST);
             // },
             // error : function() {
             //     $.Common.simpleToast($.Related.localeMsg.CHECK_SSO);
             // },
             // complete: function () {
             //     $.Common.HideProgress("#org_list_progress");
             // }
         });


    },
    displayOrgList : function(data) {

        var tree = {};
        $.Related.orgTreeXml = $.parseXML("<org/>");
        $(data).find("entrydata").each(function(i){

            if($(this).attr("columnnumber") === "5") {
                var val = $(this).find("text").text();
                if($.Common.isBlank(val)) {
                    return true;
                }

                val = val.split("^");

                var objDeptItem = {};
                $.each(val, function(){
                    var pair = this.split("=");
                    switch(pair[0]) {
                        case "DeptCode" :
                        case "DeptUniqueCode" :
                        case "DeptName" :
                        case "DeptFullCode" :
                        case "DeptFullName" :
                            objDeptItem[pair[0]] = pair[1];
                            break;
                    }
                });

                try {
                    var deptCodes = objDeptItem["DeptFullCode"].split("!");
                    var deptNames = objDeptItem["DeptFullName"].split("!");
                    var key = objDeptItem["DeptUniqueCode"];
                }
                catch (e) {
                    $.Common.simpleToast("Failed get org list.");
                    // objDeptItem
                   // console.log(e)
                }

                //Get organization list.
                var parentCode = null;
                $.each(deptCodes, function(i) {
                    parentCode = $.Related.getTreeSection(parentCode, key, this, deptNames[i]);
                });
            }
        });


        //Draw org tree
        $.Related.drawOrgTree();

    },

    createRootNodeForCur : function(strName, code) {
        var newElement = $.Related.orgTreeXml.createElement("item");
        // newElement.appendChild(document.createTextNode(name));
        newElement.setAttribute("code", code);
        // newElement.setAttribute("key", key);
        newElement.setAttribute("name", strName);
        $.Related.orgTreeXml.documentElement.appendChild(newElement);
        newElement.setAttribute("child",true);
        newElement.setAttribute("isRoot",true);
            // <P id="NODE_ROOT">ROOT1{`본/지사{`is_node=1^kind=2^DeptCode=ROOT1^DeptName=본/지사^DeptAlias=본/지사^DeptUniqueCode=ROOT1^</P>
            // <P id="NODE_ROOT">ROOT6{`혈액{`is_node=1^kind=2^DeptCode=ROOT6^DeptName=혈액^DeptAlias=혈액^DeptUniqueCode=ROOT6^</P>
            // <P id="NODE_ROOT">ROOT3{`병원{`is_node=1^kind=2^DeptCode=ROOT3^DeptName=병원^DeptAlias=병원^DeptUniqueCode=ROOT3^</P>
            // <P id="NODE_ROOT">ROOT4{`기타{`is_node=1^kind=2^DeptCode=ROOT4^DeptName=기타^DeptAlias=기타^DeptUniqueCode=ROOT4^</P>
    },

    displayOrgListForCur : function(data) {

        var tree = {};
        $.Related.orgTreeXml = $.parseXML("<org/>");

        $.Related.createRootNodeForCur("본/지사","NODE_ROOT1");
        $.Related.createRootNodeForCur("혈액","NODE_ROOT6");
        $.Related.createRootNodeForCur("병원","NODE_ROOT3");
        $.Related.createRootNodeForCur("기타","NODE_ROOT4");

        $(data).find("entrydata").each(function(){
            if($(this).attr("columnnumber") === "5") {

                var entry = $(this).parent().find("entrydata[columnnumber=0]");
                var rootNode = entry.find("text").text().toUpperCase();
                rootNode = rootNode.substring(rootNode.indexOf("\"") + 1, rootNode.lastIndexOf("\""));
                //verify valid node
                if (rootNode.indexOf("ROOT") > -1) {

                    var child = $.Related.orgTreeXml.documentElement.childNodes;

                    for(var i = 0; i < child.length; i++) {
                        var curChild = $.Related.orgTreeXml.documentElement.childNodes[i];
                        var code = curChild.getAttribute("code");

                        if(code === rootNode) {
                            var childCode = $(this).parent().find("entrydata[columnnumber=1]").find("text").text();
                            var curChildVal = curChild.getAttribute("childcode");
                            if($.Common.isBlank(curChildVal)) {
                                curChildVal = childCode;
                            }
                            else {
                                curChildVal = curChildVal + ";" + childCode;
                            }
                            curChild.setAttribute("childcode",curChildVal);
                        }
                    }
                }
            }
        })

        $(data).find("entrydata").each(function(i){

            if($(this).attr("columnnumber") === "5") {

                var entry       = $(this).parent().find("entrydata[columnnumber=0]");
                var rootNode    = entry.find("text").text().toUpperCase();
                rootNode = rootNode.substring(rootNode.indexOf("\"") + 1, rootNode.lastIndexOf("\""));

                var val = $(this).find("text").text();
                if($.Common.isBlank(val)) {
                    return true;
                }

                val = val.split("^");

                var objDeptItem = {};
                $.each(val, function(){
                    var pair = this.split("=");
                    switch(pair[0]) {
                        case "DeptCode" :
                        case "DeptUniqueCode" :
                        case "DeptName" :
                        case "DeptFullCode" :
                        case "DeptFullName" :
                            objDeptItem[pair[0]] = pair[1];
                            break;
                    }
                });

                try {
                    var deptCodes = objDeptItem["DeptFullCode"].split("!");
                    var deptNames = objDeptItem["DeptFullName"].split("!");
                    var key = objDeptItem["DeptUniqueCode"];

                    var roots = $.Related.orgTreeXml.documentElement.childNodes;
                    for(var i = 0; i < roots.length; i++) {
                        var curChild = roots[i];
                        var childCode = curChild.getAttribute("childcode").split(";");

                        var isFound = false;
                        for(var j = 0; j < childCode.length; j++) {
                            if(deptCodes[0] === childCode[j]) {
                                deptNames.unshift(curChild.getAttribute("name"));
                                deptCodes.unshift(curChild.getAttribute("code"));
                                isFound = true;
                                break;
                            }
                        }

                        if(isFound) {
                            break;
                        }

                    }

                }
                catch (e) {
                    $.Common.simpleToast("Failed get org list.");
                    // objDeptItem
                    // console.log(e)
                }

                //Get organization list.
                var parentCode = null;
                $.each(deptCodes, function(i) {
                    parentCode = $.Related.getTreeSection(parentCode, key, this, deptNames[i]);
                });
            }
        });


        //Draw org tree
        $.Related.drawOrgTree();

    },

    getTreeSection : function(parentCode, key, code, name) {
        var org = $.Related.orgTreeXml;

        var target = null;
        if($.Common.isBlank(parentCode)) {
            target = org.documentElement;
        }
        else {
            target = $(org).find("[code='"+parentCode+"']")[0];
        }


        if(!$(target).find("[code="+code+"]").length) {
            var newElement = $.Related.orgTreeXml.createElement("item");
            // newElement.appendChild(document.createTextNode(name));
            newElement.setAttribute("code", code);
            // newElement.setAttribute("key", key);
            newElement.setAttribute("name", name);
            target.appendChild(newElement);
            target.setAttribute("child",true);

            // parent = newElement;
          //    xmlString = (new XMLSerializer()).serializeToString(org);
           // console.log(xmlString);
            // return parent;
        }
        return code;
    },

    checkOrg:function(code, name) {
        $("#dimSelectedOrg").html(name);

        $.Related.curOrg = {"code":code, "name": name};

    },

    convertTreeHtml:function (object, node) {
        var list = document.createElement("ul");
        for (var i = 0; i < object.childNodes.length; i++) {
            var child = object.childNodes[i];
            var code = child.getAttribute("code");
            var name = child.getAttribute("name");
            var isRoot = child.getAttribute("isRoot");
            var item = document.createElement("li");

            if(!isRoot) {
                var itemName = new StringBuffer();
                itemName.append("<a href=\"javascript:$.Related.checkOrg('"+code+"','"+name+"')\">");
                itemName.append(name);
                itemName.append("</a>");
                item.innerHTML = itemName.toString();
            }
            if(!$.Common.isBlank(code)) {
                item.setAttribute('code', code);
                $(list).addClass("nested");
            }
            // else {
            //     $(list).addClass("root");
            // }
            // var grandChildren = child.children;
            // if (typeof(grandChildren) == "object") {
            if(child.childNodes != null && child.childNodes.length > 0) {
                // if(!$.Common.isBlank(code)) {
                    // var old = item.innerHTML;
                    // item.innerHTML = "<span class=\"caret\"></span>"+old;

                    var modified = new StringBuffer();
                    modified.append("<span class=\"caret\"></span>");
                    if(!isRoot) {
                        modified.append("<a href=\"javascript:$.Related.checkOrg('" + code + "','" + name + "')\">");
                        modified.append(name);
                        modified.append("</a>");
                    }
                    else {
                        modified.append(name);
                    }

                    $(item).html(modified.toString());
                // }

                $.Related.convertTreeHtml(child, item);
            }
            // else {
            //     console.log("no child");
            // }
            list.appendChild(item);
        }
        if (list.parentElement != null) {
            item.appendChild(list);
        }
        if($(list).find('li').length > 0) {
            $(node).append(list);
        }
    },



    drawOrgTree : function() {

        xmlString = (new XMLSerializer()).serializeToString($.Related.orgTreeXml);
        console.log(xmlString);


        $("#conts").empty();
        $.Related.convertTreeHtml($.Related.orgTreeXml.documentElement, $("#conts"));

        $("#conts").find("ul:first-child").removeClass("nested");

        var toggler = document.getElementsByClassName("caret");
        var i;

        for (i = 0; i < toggler.length; i++) {
            toggler[i].addEventListener("click", function() {
                this.parentElement.querySelector(".nested").classList.toggle("active");
                this.classList.toggle("caret-down");
            });
        }
    },

    addToSelectedList : function() {
        var items = $.grep($("#result_list").jsGrid("option", "data"), function(obj){
            return obj.isChecked === true;
        });

        if(items.length > 0) {

            var curCheckedData = $("#checked_list").jsGrid("option", "data");

            $.each(items, function(i) {
                var curUnid = this.UNID;
                var duplicated = $.grep(curCheckedData, function(obj){
                    return obj.UNID === curUnid;
                });

                var info = new StringBuffer();
                if($.Related.curOrg !== null && $.Related.curOrg.code !== "815000001") {
                    info.append($.Related.curOrg.name);
                }
                else {
                    info.append($.Related.localeMsg.ORG_LOCAL);
                }
                info.append("-");
                info.append(this.REG_NO);

                if(duplicated.length > 0) {
                    var alertMsg = new StringBuffer();
                    alertMsg.append("\"");
                    alertMsg.append(info.toString())
                    alertMsg.append("\" ");
                    alertMsg.append($.Related.localeMsg.ALERT_ALREADY_DOC_ADDED);
                    $.Common.simpleToast(alertMsg.toString());
                    return true;
                }

                // this.INDEX = curCheckedData.length + 1;


                this.INFO = info.toString();
                $("#checked_list").jsGrid("insertItem",this);

            });

            $.Related.changeCheckStatus(false);

            $("#checked_cnt").html($("#checked_list").jsGrid("option", "data").length);

            $("#checked_list").jsGrid("sort", { field: "INDEX", order: "asc" });
        }
        else {
            $.Common.simpleToast($.Related.localeMsg.ALERT_SELECT_DOCUMENT);
            return;
        }
    },

    closePopup : function() {
      window.close();
    },
    Search : function() {

        var params = $.Related.Get_SearchParams();
        if(params !== null) {

            $.Related.changeCheckStatus(false);


            $("#result_list").jsGrid("option", "data", []);

            $.Common.ShowProgress("#related_progress","Waiting..","000000","0.7");

            var category = $("input[name='chk_category']:checked").val();

            var url = new StringBuffer();
            url.append($.Related.params.MAIN_URL);
            url.append("approve/repository/doc");
            url.append($.Related.curOrg.code);
            url.append("_");
            url.append(params.SELECT_DATE.substring(0, 4));
            url.append(".nsf/web_by_aprv_all_link?readviewentries&view=web_by_aprv_all_link&start=1&count=10000&page_no=1&all_view=0&flat_view=0&RestrictToCategory=");
            url.append(params.SELECT_DATE);
            url.append("&category=");
            url.append(params.SELECT_DATE);
            url.append("&category_text=");
            url.append(encodeURIComponent($.Related.localeMsg[category]));
            url.append("&outputformat=json");

            var params = {
                URL : url.toString()
            };

            $.when($.Common.RunCommand(g_RelatedCommand, "GET_DOC_LIST", params)).then(function(objRes){
                if("T" === objRes.RESULT.toUpperCase())
                {
                    try {
                        // var res = $.parseXML(objRes.MSG);
                        var res = $.parseJSON(objRes.MSG);
                        $.Related.Push_SearchResultItem(res);
                    }
                    catch(e) {
                        $.Common.simpleToast($.Related.localeMsg.CHECK_SSO);
                    }
                }
                else
                {
                    $.Common.simpleToast($.Related.localeMsg.FAILED_LOAD_DOCLIST);
                }

                $.Common.HideProgress("#related_progress");
            });

            // $.ajax({
            //     type : "GET",
            //     url : url.toString(),
            //     // url: g_RootURL + "searchRes.json",
            //     dataType: 'json',
            //     crossOrigin : true,
            //     data:params,
            //      success: function(data) {
            //         $.Related.Push_SearchResultItem(data);
            //     },
            //     error: function(error) {
            //         $.Common.simpleToast("Failed get result.");
            //         //     deferred.reject(error);
            //     },
            //     //
            //     // success: function(data) {
            //     //     $.Related.Push_SearchResultItem(data);
            //     // },
            //     // error: function(error) {
            //     //     $.Common.simpleToast("Failed get result.");
            //     //     //     deferred.reject(error);
            //     // },
            //     //
            //     // complete: function(){
            //     //     $.Common.HideProgress("#related_progress");
            //     // }
            // });
        }
    },

    Push_SearchResultItem : function(data) {
        var arItem = [];

        if(data != null && data["viewentry"] != null) {
            $.each(data["viewentry"], function(){

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

                var docInfo = this["entrydata"][2]["text"][0].split("{`");
                var docTitle = this["entrydata"][5]["text"][0];

                if($.Common.isBlank(docTitle)) {
                    return true;
                }

                var objDoc = {};
                objDoc["UNID"] = this["@unid"];
                objDoc["REG_FLAG"] = docInfo[0];
                objDoc["DOC_TYPE"] = docInfo[1];
                objDoc["REG_NO"] = docInfo[2];
                objDoc["DOC_NM"] = docTitle;
                objDoc["REG_USER"] = docInfo[3];
                objDoc["REG_DATE"] = docInfo[4];
                objDoc["ENFORCE_DATE"] = docInfo[5];

                arItem.push(objDoc);
            });

            $("#result_cnt").html(arItem.length);

            $("#result_list").jsGrid("option", "data", arItem);

           $("#result_list_").jsGrid("sort", { field: "REG_NO", order: "desc" });
        }

    },
    /**
     * @return {null}
     */
    Get_SearchParams: function() {

        var params = {};

        // params['TYPE'] = "PRIVATE";
        //
        // var title = $("#ipt_doc_title").val();
        // params['DOC_TITLE'] = encodeURIComponent(title);
        //
        // var form = $("#sel_form").children("option:selected"). val();
        // params['DOC_TYPE'] = form;
        //
        // var drafter = $("#ipt_drafter").val();
        // if(!$.Common.isBlank(drafter)) {
        //     params['EMP_CODE'] = drafter;
        // }
        // else {
        //     params['TYPE'] = "DEPT";
        //     params['EMP_CODE'] = $.Related.params.USER_ID;
        //     params['DEPT_CODE'] = $.Related.params.PART_NO;
        // }



        var toDate = $('#sel_date').val();
        var date = new Date(toDate);
        if(!$.Common.isBlank(toDate) && !isNaN(date.getTime())) {
            params['SELECT_DATE'] = toDate;
        }
        else {
            $.Common.simpleAlert(null,this.localeMsg.INPUT_VALID_DATE);
            return null;
        }


        return params;
    },
    Confirm : function(){

        var items = $("#checked_list").jsGrid("option","data");


        if(items.length > 0) {
            // $.Common.simpleToast("items");
            if(items.length > 40) {
                $.Common.simpleToast($.Related.localeMsg.ALERT_MAX_REACHED);
                return;
            }

            var params = {};
            var docInfo = [];



            var optionSelected = $("#doc_year").find(":selected").val();
            if(optionSelected === "cur" || $.Common.isBlank(optionSelected)) {
                optionSelected = new Date().getFullYear();
            }

            $.each(items, function(){
                var url = new StringBuffer();
                url.append("/doc");
                url.append($.Related.curOrg.code);
                url.append("_");
                url.append(optionSelected);
                url.append(".nsf/view_by_unid/");
                url.append(this.UNID);
                url.append("?opendocument");

                var objInfo = {};
                objInfo["URL"] = $.Related.params.MAIN_URL + "names.nsf?login&username=rmsadmin&password=passw0rd&redirectto=/approve/repository" + url.toString();
                objInfo["TITLE"] = encodeURIComponent(encodeURIComponent(this.DOC_NM));


                docInfo.push(JSON.stringify(objInfo));
            });
            params["DOC_INFO"] = docInfo;
            params["JDOC_NO"] = $.Related.params.KEY;

            $.when($.Common.RunCommand(g_RelatedCommand, "ADD_DOC", params)).then(function(objRes){
                if("T" === objRes.RESULT.toUpperCase())
                {
                    window.opener.$.Actor.pageSubmit();
                    $.Related.closePopup();
                }
                else
                {
                    $.Common.simpleAlert(null, $.Related.localeMsg.FAILED_UPLOAD_DOCUMENT, null);
                    //	return;
                }
            });

        }
        else {
            $.Common.simpleToast($.Related.localeMsg.ALERT_SELECT_DOCUMENT);
            return;
        }

    },
    Check_checkBox : function(id) {
        var elCheck = $("#"+id)[0];
        elCheck.checked = !elCheck.checked;
    },
    confirmOrgSelect : function() {

        if($.Related.curOrg !== null && $.Related.curOrg.code !== "815000001") {

            $("#selectedOrg").html("("+$.Related.curOrg.name+")");
            $.Related.closeLayer();
            $.Related.Search();
        }
        else {
            $.Common.simpleToast($.Related.localeMsg.ALERT_SELECT_ORG);
        }
    },
    pageSubmit: function(){
        window.close()
        window.opener.$.Actor.pageSubmit();

    },
    changeCheckStatus : function(isChecked) {

        $("[attr=cardItem]").prop("checked",isChecked);
        $("#chkAll").prop("checked",isChecked);


        var curRowItems = $.map($("#result_list").find("tr"), function(row) {
            return $(row).data("JSGridItem");
        });

        $.each(curRowItems, function(){
            this.isChecked = isChecked;
        });
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

            confirmDeleting: false,

            pageSize: 15,
            pageButtonCount: 5,
            // rowDoubleClick: function(args) {
            //
            //    if($.Operation.detectCS($.Related, null, true)) {
            //         // $.Operation.Add_Related($.Related, args.item);
            //    }
            //
            // },
            rowClick: function(args) {
                var elRow = $(args.event.target).closest("tr");
                var chkValue = elRow.find("input[type=checkbox]").is(":checked");
                elRow.find("input[type=checkbox]").prop("checked",!chkValue);
                args.item.isChecked = !chkValue;
                // this.editItem(elRow);


                // var elEditRow = elRow.prev();
                // var text = elEditRow.find("input[type=text]");
                // elEditRow.find("input[type=checkbox]").prop("checked",chkValue);
                //
                // text.focus();
                // text.select();
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
                // {name:"APPR_ID",                type: "text", title:"", width:0, align:"left"},
                // { name: "VIEW_URL", 		    type: "text", title:"", width: 0, align: "center" },
                // { name: "PRINT_URL", 		    type: "text", title:"", width: 0, align: "center" },
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
                                                $.Related.changeCheckStatus($(this).is(":checked"));
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
                    width: 10,
                    sorting: false
                },
                { name: "UNID", 	        type: "text" },
                { name: "REG_FLAG", 	        type: "text", title:"", width: 10, align: "center" },
                { name: "DOC_TYPE", 	        type: "text", title:"", width: 20, align: "center" },
                { name: "REG_NO", 	        type: "text", title:"", width: 10, align: "center" },
                { name: "DOC_NM", 	        type: "text", title:"", width:140, align: "center" },
                { name: "REG_USER", 	        type: "text", title:"", width: 40, align: "center" },
                { name: "REG_DATE", 	        type: "text", title:"", width: 40, align: "center" },
                { name: "ENFORCE_DATE", 	        type: "text", title:"", width: 40, align: "center" },
            ]
        });

        $("#result_list").jsGrid("fieldOption", "UNID", "visible", false);

        // $("#result_list").jsGrid("fieldOption", "APPR_ID", "visible", false);
        // $("#result_list").jsGrid("fieldOption", "VIEW_URL", "visible", false);
        // $("#result_list").jsGrid("fieldOption", "PRINT_URL", "visible", false);


        $("#checked_list").jsGrid({
            width: "100%",
            height:$(".area_checked_result_list").height(),
            filtering: false,
            inserting: false,
            editing: false,
            selecting: true,
            sorting: true,
            paging: true,
            noDataContent : "-",

            confirmDeleting: false,
            pageSize: 15,
            pageButtonCount: 5,

            onItemInserting : function(args) {
                args.item.INDEX = args.grid.data.length + 1;

            },

            onItemDeleted : function(args){
                $("#checked_cnt").html(args.grid.data.length);

                $.each(args.grid.data, function(i){
                    this.INDEX = i + 1;
                });

                $("#checked_list").jsGrid("refresh");
            },
            // rowDoubleClick: function(args) {
            //
            //     if($.Operation.detectCS($.Related, null, true)) {
            //         // $.Operation.Add_Related($.Related, args.item);
            //     }
            //
            // },


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


            fields: [
                // {name:"APPR_ID",                type: "text", title:"", width:0, align:"left"},
                // { name: "VIEW_URL", 		    type: "text", title:"", width: 0, align: "center" },
                // { name: "PRINT_URL", 		    type: "text", title:"", width: 0, align: "center" },

                { name: "UNID", 	        type: "text" },
                { name: "INDEX", 	        type: "text", title:"No", width: 20, align: "center" },
                { name: "INFO", 	        type: "text", title:"Info", width: 140, align: "center" },
                { name: "DOC_NM", 	        type: "text", title:"",  width:400, align: "left" },

                { type: "control", modeSwitchButton: false, editButton: false }
            ]
        });

        $("#checked_list").jsGrid("fieldOption", "UNID", "visible", false);

    },

    localizeGrid : function() {
      //  $("#result_list").jsGrid("fieldOption", "docNumber", 		"title", this.localeMsg.DOC_NO);
        $("#result_list").jsGrid("fieldOption", "REG_FLAG", 		"title", this.localeMsg.REG_FLAG);
        $("#result_list").jsGrid("fieldOption", "DOC_TYPE",		"title", this.localeMsg.DOC_TYPE);
        $("#result_list").jsGrid("fieldOption", "REG_NO", 		"title", this.localeMsg.REG_NO);
        $("#result_list").jsGrid("fieldOption", "DOC_NM",	        "title", this.localeMsg.DOC_NM);
        $("#result_list").jsGrid("fieldOption", "REG_USER", 		"title", this.localeMsg.REG_USER);
        $("#result_list").jsGrid("fieldOption", "REG_DATE", 		"title", this.localeMsg.REG_DATE);
        $("#result_list").jsGrid("fieldOption", "ENFORCE_DATE", 		"title", this.localeMsg.ENFORCE_DATE);

        // $("#checked_list").jsGrid("fieldOption", "REG_FLAG", 		"title", this.localeMsg.REG_FLAG);
        // $("#checked_list").jsGrid("fieldOption", "DOC_TYPE",		"title", this.localeMsg.DOC_TYPE);
        // $("#checked_list").jsGrid("fieldOption", "REG_NO", 		"title", this.localeMsg.REG_NO);
        $("#checked_list").jsGrid("fieldOption", "DOC_NM",	        "title", this.localeMsg.DOC_NM);
        // $("#checked_list").jsGrid("fieldOption", "REG_USER", 		"title", this.localeMsg.REG_USER);
        // $("#checked_list").jsGrid("fieldOption", "REG_DATE", 		"title", this.localeMsg.REG_DATE);
        // $("#checked_list").jsGrid("fieldOption", "ENFORCE_DATE", 		"title", this.localeMsg.ENFORCE_DATE);

    },
    reset : function() {
        $.Related.orgTreeXml = $.parseXML("<org/>");
        $("#dimSelectedOrg").empty();
        $("#conts").empty();
        $("#organizationPopup").hide();
        $("#doc_year").empty();
    },
    closeLayer : function() {
        $.Related.reset();
    },
    setUIColor : function()
    {
        var objColor = $.extend($.Color.PC.Related, $.Color.Common);

        if(objColor != null)
        {
            $(".area_related_title").css({"background":"#"+objColor.NAVIGATION, "color" : "#" + objColor.NAVIGATION_FONT});
            $(".wrapper").css({"background":"#"+objColor.BACKGROUND});
            $(".search_option").css({"color":"#"+objColor.TITLE_FONT_COLOR});
            $(".item_title").css({"color":"#"+objColor.ITEM_FONT_COLOR});
            $(".item_separator").css({"background":"#"+objColor.ITEM_SEPARATOR_COLOR});
            $(".btn_search").css({"background":"#"+objColor.NAVIGATION,  "color" : "#" + objColor.NAVIGATION_FONT});
            $(".btn_add").css({"border":"1px solid #"+objColor.NAVIGATION,  "color" : "#" + objColor.NAVIGATION});
            $(".btn_confirm").css({"border":"1px solid #"+objColor.NAVIGATION,  "color" : "#" + objColor.NAVIGATION});
            $(".btn_close").css({"border":"1px solid #"+objColor.NAVIGATION,  "color" : "#" + objColor.NAVIGATION});
            $(".btn_cancel").css({"border":"1px solid #"+objColor.NAVIGATION,  "color" : "#" + objColor.NAVIGATION});
            $(".btn_move_doc").css({"border":"1px solid #"+objColor.NAVIGATION,  "color" : "#" + objColor.NAVIGATION})
            $(".dim_layer_popup .layer").css({"border":"5px solid #"+objColor.NAVIGATION,   "color" : "#" + objColor.NAVIGATION})
            $(".btn_confirm_org").css({"background":"#"+objColor.NAVIGATION, "border":"1px solid #"+objColor.NAVIGATION,  "color" : "#" + objColor.NAVIGATION_FONT});

            // $(".area_comment_write").css({"border-top":"1px solid #"+objColor.INPUT_AREA});
            // $(".ipt_content").niceScroll({cursorcolor:"#"+objColor.NAVIGATION});
            // $(".ipt_title:focus").css({"border-bottom":"2px solid #"+objColor.WRITE_BORDER});
            // $(".ipt_content:focus").css({"border-bottom":"2px solid #"+objColor.WRITE_BORDER});
            // $("#ipt_content").niceScroll({horizrailenabled: false, cursorcolor:"#"+objColor.NAVIGATION});
            // $(".apply").css({"background":"#"+objColor.WRITE_BUTTON});
            // $("#comtList").niceScroll({horizrailenabled: false, cursorcolor:"#"+objColor.NAVIGATION});
            $.Related.colorSet = objColor;
        }
    },

}