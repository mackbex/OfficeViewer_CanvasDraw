<%@ page language="java" contentType="text/html; charset=utf-8" pageEncoding="utf-8"%>

<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"%>  
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<script src='<c:url value="/js/jquery-1.11.3.min.js" />'></script>  
<script src="<c:url value='js/interface/interface.js' />"></script>
<html>
<script>
        $("body").on({
            'click .test' : function(evt, tmpl){
                alert("A");
            }
        })



</script>
<button class="test">test</button>
</html>