<%@page import="java.net.URLDecoder"%>
<%@ page language="java" contentType="text/html; charset=utf-8"
    pageEncoding="utf-8"%>
<%@ include file="/common/common.jsp"%> 


<html>
<script>
$(function(){
	var url = "http://127.0.0.1:8080/OfficeViewer_war_exploded/services/API/Run?COMMAND=UPLOAD_AFTER&KEY=test01010&USER_ID=woonam&CORP_NO=1000";
	$.ajax({
		url : url,
        type:'post',
        contentType: 'application/json; charset=UTF-8', 
        dataType: 'json',
        success:function(result){
        	
        	console.log(result);
        }
        });
})
</script>

</html>