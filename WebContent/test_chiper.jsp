<%@ page language="java" contentType="text/html; charset=utf-8" pageEncoding="utf-8"%>
<!DOCTYPE html>
<%@ include file="/common/common.jsp"%>
<html>
<script>

    $.extend({
        runChiper : function() {
            $.ajax({
                url : g_RootURL + "ChiperTest.do?DATA="+$("#data").val(),
                type:'post',
                contentType: 'application/json; charset=UTF-8',
                dataType: 'html',
                success:function(result){

                    var res = result.split(';');
                    var combined = res[0];
                    var aria = res[1];
                    var base = res[2];
                    $("#res").html("Combined : "+ combined + "<br\>Aria : "+aria + "<br\>Base : "+base);
                }
            });
        }
    })



</script>
<input type="text" id="data" />
<button id="test" onclick="$.runChiper()">test</button>
<div id="res" style="width: 100%;height:100px; padding: 10px;"></div>
</html>