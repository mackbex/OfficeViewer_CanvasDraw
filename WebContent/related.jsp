<%@ page language="java" contentType="text/html; charset=utf-8"    pageEncoding="utf-8"%>
<!DOCTYPE html>
<%@ include file="/common/common.jsp"%>
<html>
<head>
    <title></title>
    <link rel="stylesheet" type="text/css" href="<c:url value='css/grid/jsgrid-theme.css' />" >
    <link rel="stylesheet" type="text/css" href="<c:url value='css/grid/jsgrid.css' />" >
    <link rel="stylesheet" type="text/css" href="<c:url value='css/style.css' />"/>
    <link href="<c:url value='css/datepicker/datepicker.css' />" rel="stylesheet" type="text/css">

    <%
        //Generate system id
        if(request.getParameterMap().size() > 0) {
            String strServerKey = g_profile.getString(request.getParameter("SVR_MODE"), "KEY", "");
            pageContext.setAttribute("SERVER_KEY", strServerKey);

            pageContext.setAttribute("MAIN_URL", g_profile.getString("INTERFACE", "MAIN_URL", ""));
            pageContext.setAttribute("ORG_OLD_URL", g_profile.getString("INTERFACE", "ORG_OLD_URL", ""));
            pageContext.setAttribute("ORG_CUR_URL", g_profile.getString("INTERFACE", "ORG_CUR_URL", ""));
            pageContext.setAttribute("OPEN_DOC_URL", g_profile.getString("INTERFACE","OPEN_DOC_URL", ""));
           // pageContext.setAttribute("PAYMENT_TYPE_URL", g_profile.getString("INTERFACE", "PAYMENT_TYPE_URL", ""));

            //Attach parameters to pageContext
            Map<String, String[]> mParams = request.getParameterMap();
            pageContext.setAttribute("mParams", mParams);
        }
    %>
    <script>
        $(function(){
            var params = {
                CORP_NO 				: "<c:out value="${sessionScope.CORP_NO}" />",
                USER_ID 				: "<c:out value="${sessionScope.USER_ID}" />",
                USER_NM 				: "<c:out value="${sessionScope.USER_NM}" />",
                PART_NO 				: "<c:out value="${sessionScope.PART_NO}" />",
                SERVER_KEY 			    : "<c:out value="${SERVER_KEY}" />",
                LANG 					: "<c:out value="${mParams['LANG'][0]}" />",
                KEY		 				: "<c:out value="${mParams['KEY'][0]}" />",
                VIEW_MODE			    : "<c:url value ="${mParams['VIEW_MODE'][0]}" />",
                SVR_MODE				: "<c:url value ="${mParams['SVR_MODE'][0]}" />",
                XPI_PORT_HTTP           : "<c:url value="${mParams['XPI_PORT_HTTP'][0]}" />",
                XPI_PORT_HTTPS          : "<c:url value="${mParams['XPI_PORT_HTTPS'][0]}" />",
                MAIN_URL                : "<c:url value="${MAIN_URL}" />",
                ORG_OLD_URL                : "<c:url value="${ORG_OLD_URL}" />",
                ORG_CUR_URL                : "<c:url value="${ORG_CUR_URL}" />",
                OPEN_DOC_URL            : "<c:url value="${OPEN_DOC_URL}" />",
                RELATED_PART_NO            : "<c:out value="${sessionScope.RELATED_PART_NO}" />",
            }
           $.Related.init(params);
        })
    </script>
</head>
<body>
<div class="related wrapper">

    <div class="area_related_title">
<%--        <div class="title_icon">--%>
<%--            <img src="<c:url value='/image/pc/comment/title.png' />" />--%>
<%--        </div>--%>
        <div class="related_title">
            <span class="title" data-i18n="TITLE"></span>
        </div>
    </div>

    <div class="area_search_option">
        <div class="option_box">
            <div class="option_title">
                <div class="title">
                    <span class="text_search_option" data-i18n="SEARCH_OPTION"></span>
                </div>
                <div class="area_selected_org" id="selectedOrg">
                    (<span data-i18n="ORG_LOCAL"></span>)
                </div>
                <div class="btn_move_doc" onclick="$.Related.Open_organization();">
                    <span data-i18n="MOVE_DOC"></span>
                </div>
                <div class="btn_search" onclick="$.Related.Search();">
                 <span data-i18n="SEARCH"></span>
                </div>
            </div>
            <div class="option_contents">
                <div class="option_contents_row">
                    <div class="option_contents_col">
                        <div class="item_title">
                            <div class="item_separator"></div>
                            <span class="title" data-i18n="ITEM_DOC_DATE"></span>
                        </div>
                        <div class="item_content">
<%--                            <input type='text' id="fromDate" class="date_picker"--%>
<%--                                   data-position="bottom left" maxlength="10"/>--%>
<%--                            ~--%>
                            <input type='text' id="sel_date" class="date_picker" data-min-view="months"
                                   data-view="months"
                                   data-position="bottom left" maxlength="7"/>
                        </div>
                    </div>
                    <div class="option_contents_col">
                        <div class="item_title">
                            <div class="item_separator"></div>
                            <span class="title" data-i18n="ITEM_FLAG"></span>
                        </div>
                        <div class="item_content">
                            <div class="area_radio_item">
                                <label class="radio_container">
                                    <div class="area_radio">
                                        <input type="radio" id="radio_all" name="chk_category" value="DOC_ALL" checked>
                                    </div>
                                    <div class="area_radio_title">
                                        <span class="title" data-i18n="RADIO_ALL"></span>
                                    </div>
                                </label>
                            </div>
                            <div class="area_radio_item">
                                <label class="radio_container">
                                    <div class="area_radio">
                                        <input type="radio" id="radio_product" name="chk_category" value="DOC_PROD">
                                    </div>
                                    <div class="area_radio_title">
                                        <span class="title" data-i18n="RADIO_PRODUCT"></span>
                                    </div>
                                </label>
                            </div>
                            <div class="area_radio_item">
                                <label class="radio_container">
                                    <div class="area_radio">
                                        <input type="radio" id="radio_receive" name="chk_category" value="DOC_RECV" >
                                    </div>
                                    <div class="area_radio_title">
                                        <span class="title" data-i18n="RADIO_RECEIVE"></span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="area_search_result">
        <div class="result_box">
            <div class="option_title">
                <div class="title">
                    <span class="text_search_option" data-i18n="SEARCH_RESULT"></span>
                </div>
                <div class="result">
                    <span data-i18n="TOTAL"></span>
                    <span id="result_cnt">0</span>
                    <span data-i18n="RESULT_UNIT"></span>
                </div>
            </div>
            <div class="area_search_result_list">
                <div id="related_progress" class="related_progress"></div>
                <div id="result_list"  class="result_list">
                </div>
            </div>
        </div>
    </div>

    <div class="area_command_btn">
        <div class="description_box">
            <div class="option_title">
                <div class="left_item">
                    <span class="command_description" data-i18n="COMMAND_DESCRIPTION"></span>
                </div>
                <div class="btn_add" onclick="$.Related.addToSelectedList();">
                    <span data-i18n="ADD"></span>
                </div>
                <div class="btn_confirm" onclick="$.Related.Confirm();">
                    <span data-i18n="CONFIRM"></span>
                </div>
                <div class="btn_cancel" onclick="$.Related.closePopup();">
                    <span data-i18n="CANCEL"></span>
                </div>
            </div>
        </div>
    </div>

    <div class="area_checked_list">
        <div class="result_box">
            <div class="option_title">
                <div class="title">
                    <span class="text_search_option" data-i18n="CHECKED_LIST"></span>
                </div>
                <div class="result">
                    <span data-i18n="TOTAL"></span>
                    <span id="checked_cnt">0</span>
                    <span data-i18n="RESULT_UNIT"></span>
                </div>
            </div>
            <div class="area_checked_result_list">
                <div id="checked_progress" class="related_progress"></div>
                <div id="checked_list"  class="checked_list">
                </div>
            </div>
        </div>
    </div>


    <!-- layer popup -->
    <div class="dim_layer_popup" id="organizationPopup">
        <div class="dim_bg"></div>
        <div class="layer">
            <div class="container">
                <div class="contents" >
                    <div class="title">
                        <span data-i18n="SELECT_ORG"></span>
                        <span class="sel_year">
                            <select id="doc_year">
                            </select>

                        </span>
                    </div>
                    <div class="org_list" id="org_list">
                        <div id="org_list_progress" class="org_list_progress"></div>
                        <div id="conts">

                        </div>
                    </div>
                    <div class="bottom">
                        <div class="left">
                            <span data-i18n="SELECTED_ORG"></span>
                            <span ><b id="dimSelectedOrg"></b></span>
                        </div>
                        <div class="right">
                            <a href="javascript:$.Related.confirmOrgSelect()" class="btn_confirm_org">
                                <span data-i18n="CONFIRM"></span></a>
                            <a href="javascript:$.Related.closeLayer()" class="btn_close">
                                <span data-i18n="CLOSE"></span></a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>


<script src="<c:url value='js/localWAS/OfficeXPI.js' />"></script>
<script src="<c:url value='js/view/related.js' />"></script>
<script src="<c:url value='js/operation.js' />"></script>
<script src="<c:url value='js/datepicker/datepicker.min.js' />"></script>
<script src="<c:url value='js/grid/colResizable-1.6.min.js' />"></script>
<script src="<c:url value='js/grid/jsgrid.js' />"></script>
<!-- Include English language -->
<script src="<c:url value='js/datepicker/i18n/datepicker.ko.js' />"></script>
</body>
</html>