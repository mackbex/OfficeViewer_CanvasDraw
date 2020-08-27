<%@ page language="java" contentType="text/html; charset=utf-8" pageEncoding="utf-8"%>

<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"%>  
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<script src='<c:url value="/js/jquery-1.11.3.min.js" />'></script>  
<script src="<c:url value='js/interface/interface.js' />"></script>
<html>
<script>
$(function(){

    $.ajax({
        url: 'http://approval.skons.co.kr:8090/jsp/sk3api/getApprovalList.jsp',
        type: 'post',
        data: {
            'EMP_CODE':"test004",
            'DOC_TITLE':"",
            'DOC_TYPE':"",
            'SEARCH_STR_DATE':"19/01/01",
            'SEARCH_END_DATE':"20/01/31",
        },
        dataType: 'json',
        success: function(result) {
            console.log(result);
            // object.innerHTML = result;

        },
        error: function(error, status) {
            console.log(status, error);
        }
    });

    // var params = {
	// 		"SERVER_KEY":"OfficeDOC3",
	// 		"SVR_MODE":"PRD",
	// 		"LANG":"KO",
	// 		"CORP_NO":"1000",
	// 		"USER_ID":"woonam",
	// 		"KEY_TYPE":"JDOC_NO",
	// 		"KEY":"test1",
	// 		"VIEW_MODE":"EDIT",
	// 		"OFFICE_VIEWER_URL":"http://localhost:8080/OfficeViewer/",
	//
	// };
	//
	// $.Interface.Run("VIEW_ORIGINAL_SLIP", params);
	//
	
})
</script>
</html>