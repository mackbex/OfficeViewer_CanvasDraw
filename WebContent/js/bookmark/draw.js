$.Draw = {
    Bookmark : null,
    Canvas : null,
    btnContainer : $("#bookmarkBtnList"),
    toolboxContainer : $("#drawToolbox"),
    toolboxHeight : "240px",
    isToolboxVisible : false,

    init : function(bookmark, elCanvas){

        this.Bookmark = bookmark;
        this.Canvas = elCanvas;
        this.addToolBtn();
        this.toggleToolbox();


        var ctx = this.Canvas.getContext('2d');

        this.Canvas.addEventListener('click', function(e) {
            // Check whether point is inside circle
            $.each(this.Bookmark.Items, function(){

            });


        });

    },
    detectShape : function() {

    },
    toggleToolbox : function(willOpen) {
        if(willOpen === undefined) {
            if(this.isToolboxVisible) {
                this.hideToolbox();
            }
            else {
                this.showToolbox();
            }
        }
        else {
            if(willOpen) {
                this.showToolbox();
            }
            else {
                this.hideToolbox();
            }
        }
    },
    showToolbox : function() {

        $("#viewerContainer").css("top",this.toolboxHeight);
        $("#area_slip").getNiceScroll().resize();

        $(this.toolboxContainer).css("height",this.toolboxHeight);


        this.isToolboxVisible = true;
    },
    hideToolbox : function() {
        $("#viewerContainer").css("top","0");
        $("#area_slip").getNiceScroll().resize();

        $(this.toolboxContainer).css("height","0");

        this.isToolboxVisible = false;
    },
    addToolBtn: function() {
        var lightPen = $(document.createElement('div'))
            .addClass("icon-btn")
            .append($(document.createElement('img'))
                .attr("src",g_RootURL+"image/pc/viewer/draw_pen.png"))
            .appendTo(this.btnContainer);

        var memo = $(document.createElement('div'))
            .addClass("icon-btn")
            .append($(document.createElement('img'))
                .attr("src",g_RootURL+"image/pc/viewer/draw_memo.png"))
            .appendTo(this.btnContainer);

        var rect = $(document.createElement('div'))
            .addClass("icon-btn")
            .append($(document.createElement('img'))
                .attr("src",g_RootURL+"image/pc/viewer/draw_rect.png"))
            .appendTo(this.btnContainer);

        var circle = $(document.createElement('div'))
            .addClass("icon-btn")
            .append($(document.createElement('img'))
                .attr("src",g_RootURL+"image/pc/viewer/draw_circle.png"))
            .appendTo(this.btnContainer);
    }
}