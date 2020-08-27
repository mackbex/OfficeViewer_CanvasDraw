<%@page import="com.google.gson.JsonObject"%>
<%@ page import="com.woonam.connect.AgentConnect" %>
<%@ page import="com.woonam.model.GetModel" %>
<%@ page language="java" contentType="text/html; charset=utf-8" pageEncoding="utf-8"%>
<!DOCTYPE html>
<%@ include file="/common/common.jsp"%>
<html>
<head>
<title>CoCard Viewer</title>
	<link rel="stylesheet" type="text/css" href="<c:url value='css/grid/jsgrid-theme.css' />" >
	<link rel="stylesheet" type="text/css" href="<c:url value='css/grid/jsgrid.css' />" >
	<link rel="stylesheet" type="text/css" href="<c:url value='css/style.css' />"/>
	<link href="<c:url value='css/datepicker/datepicker.css' />" rel="stylesheet" type="text/css">
<%
	//Generate system id

	//Attach parameters to pageContext
	if(request.getParameterMap().size() > 0) {
		Map<String, String[]> mParams = request.getParameterMap();
		pageContext.setAttribute("mParams", mParams);

		try
		{
			String userId = mParams.get("USER_ID") == null ? null : mParams.get("USER_ID")[0];
			String corpNo = mParams.get("CORP_NO") == null ? null : mParams.get("CORP_NO")[0];
			String apprNo = mParams.get("APPR_NO") == null ? null : mParams.get("APPR_NO")[0];
			String lang = mParams.get("LANG") == null ? "ko" : mParams.get("LANG")[0];

			//Verify UserInfo
			AgentConnect AC			= new AgentConnect(g_profile);
			GetModel GD				= new GetModel(AC, request.getSession());

			JsonObject objUserInfo = GD.getUserInfo(userId, corpNo, lang);
			if(objUserInfo == null)
			{
				RequestDispatcher rd = request.getRequestDispatcher("slip_error.jsp?ERR_MSG=NO_USER_INFO");
				rd.forward(request,response);
				return;
			}
			else {
				String strResUserID 	= objUserInfo.get("USER_ID").getAsString();
				String strResCorpNo 	= objUserInfo.get("CORP_NO").getAsString();

				if(!userId.equalsIgnoreCase(strResUserID) || !corpNo.equalsIgnoreCase(strResCorpNo))
				{
					RequestDispatcher rd = request.getRequestDispatcher("slip_error.jsp?ERR_MSG=NO_USER_INFO");
					rd.forward(request,response);
					return;
				}


				session.setAttribute("CORP_NO", 	objUserInfo.get("CORP_NO").getAsString());
				session.setAttribute("PART_NO", 	objUserInfo.get("PART_NO").getAsString());
				session.setAttribute("USER_ID", 		userId);
				session.setAttribute("USER_LANG",	lang.toLowerCase());
			//	session.setAttribute("VIEW_MODE",	strViewMode);
			}
		}
		catch(Exception e) {
			logger.error("Failed to verify user info.",e);
			RequestDispatcher rd = request.getRequestDispatcher("slip_error.jsp?ERR_MSG=NO_USER_INFO");
			rd.forward(request,response);
		}

	}

%>
<script>
$(function(){
	
	var params = {
		CORP_NO 					: "<c:out value="${sessionScope.CORP_NO}" />",
		USER_ID 					: "<c:out value="${sessionScope.USER_ID}" />",
		APPR_NO 					: "<c:out value="${mParams['APPR_NO'][0]}" />",
		LANG 						: "ko",//"<c:out value="${mParams['LANG'][0]}" />",
		VIEW_MODE 					: "EDIT"//"<c:out value="${mParams['VIEW_MODE'][0]}" />",
	}

	$.CoCard.init(params);
})
</script>
</head>
<body>
<div class="wrapper cocard">
	<div class="area_cocard_title">
		<div class="title_icon">
			<img src="<c:url value='/image/pc/cocard/title.png' />" />
		</div>
		<div class="cocard_title">
			<span class="title" data-i18n="TITLE"></span>
		</div>
	</div>
	<div class="area_cocard_contents" >
		<div class="area_card_list">
			<div class="area_option_box">
				<div class="option_box">
					<div class="option_title">
						<div class="title">
							<span class="text_search_option" data-i18n="SEARCH_OPTION"></span>
						</div>
						<div class="btn btn_search" onclick="$.CoCard.Search();">
							<span data-i18n="SEARCH"></span>
						</div>
					</div>
					<div class="option_contents">
						<div class="option_contents_row">
							<div class="option_contents_col">
								<div class="item_title">
									<div class="item_separator"></div>
									<span class="title" data-i18n="USER_ID"></span>
								</div>
								<div class="item_content">
									<input type="text" id="ipt_userid" name="ipt_userid" />
								</div>
							</div>
						</div>
						<div class="option_contents_row">
							<div class="option_contents_col">
								<div class="item_title">
									<div class="item_separator"></div>
									<span class="title" data-i18n="APPR_NO"></span>
								</div>
								<div class="item_content">
									<input type="text" id="ipt_apprNo" name="ipt_apprNo" maxlength="8"/>
								</div>
							</div>
						</div>
						<div class="option_contents_row">
							<div class="option_contents_col">
								<div class="item_title">
									<div class="item_separator"></div>
									<span class="title" data-i18n="CABINET"></span>
								</div>
								<div class="item_content">
									<input type='text' id="fromDate" class="date_picker"
										   data-position="bottom left" maxlength="10"/>
									~
									<input type='text' id="toDate" class="date_picker"
										   data-position="bottom left" maxlength="10"/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="area_search_result">
				<div>
					<div class="no-border option_title ">
						<div class="title">
							<span class="text_search_option" data-i18n="SEARCH_RESULT"></span>
						</div>
						<div class="btn btn_remove" onclick="$.CoCard.Remove();">
							<span data-i18n="REMOVE"></span>
						</div>

						<div class="btn btn_apply" onclick="$.CoCard.updateRow(this);">
							<span data-i18n="APPLY"></span>
						</div>
					</div>
					<div id="result_progress"></div>
					<div id="result_list" class="result_list">

					</div>
				</div>
			</div>
		</div>
		<div class="bar"></div>
		<div class="area_image_viewer">
			<div>
				<div id="original_progress" class="original_progress" style="display: none;"></div>
				<div class="title" style="border-top: 2px solid rgb(43, 51, 59);">
					<div class="slip_title_left">
<%--						<div class="icon-btn" onclick="javascript:$.Viewer.Download_Original(this);" command="DOWN_ORIGINAL_SLIP">--%>
<%--							<img src="<c:url value="/image/pc/viewer/icon_down.png" />">--%>
<%--						</div>--%>
						<div class="icon-btn" id="zoomIn">
							<img src="<c:url value="/image/pc/viewer/zoom_in.png" />">
						</div>
						<div class="icon-btn" id="zoomOut">
							<img src="<c:url value="/image/pc/viewer/zoom_out.png" />">
						</div>
					</div>
					<div class="slip_title_right">
					</div>
				</div>
				<div class="area_original">
					<div id="originalImage">

					</div>
				</div>

			</div>
		</div>
	</div>




</div>
	

<script src="<c:url value='js/view/cocard.js' />"></script>
<script src="<c:url value='/js/jquery.nicescroll.min.js' />"></script>
<script src="<c:url value='js/datepicker/datepicker.min.js' />"></script>
<script src="<c:url value='js/grid/colResizable-1.6.min.js' />"></script>
<script src="<c:url value='js/grid/jsgrid.js' />"></script>
<!-- Include English language -->
<script src="<c:url value='js/datepicker/i18n/datepicker.ko.js' />"></script>
<script src="<c:url value='js/operation.js' />"></script>
<script src="<c:url value='js/bookmark/bookmark.js' />"></script>
<script src="<c:url value='js/zoom/jquery.mousewheel.js' />"></script>
<script src="<c:url value='js/zoom/jquery.panzoom.js' />"></script>
<script src="<c:url value='js/zoom/rotate.js' />"></script>
<script src="<c:url value='/js/jquery.nicescroll.min.js' />"></script>
</body>
</html>