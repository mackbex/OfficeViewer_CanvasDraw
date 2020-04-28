<%@ page language="java" contentType="text/html; charset=utf-8" pageEncoding="utf-8"%>
<!DOCTYPE html>
<%@ include file="/common/common.jsp"%>
<html>

<script>

    $(function() {
        var version = $.Common.GetBrowserVersion().ActingVersion;
        if(version <= 8) {
            $("#zoom_test").elevateZoom({
                zoomType: "inner",
                cursor: "crosshair"
            });
        }
        else {
            $("#zoom_test").elevateZoom({scrollZoom: true});
        }

    });
</script>
<div >
    <img id="zoom_test" src="./image/pc/install/small_scanner.png" data-zoom-image="./image/pc/install/scanner.png" />

</div>
<script src="<c:url value='/js/zoom/jquery.elevatezoom.js' />"></script>
</html>