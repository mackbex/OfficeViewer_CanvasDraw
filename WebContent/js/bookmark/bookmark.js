$.Bookmark = {
    BOOKMARK_ENUM : {
        NONE : "0",
        MOVE :"1",
        NOTEBOX :"2",
        LIGHTPEN :"3",
        RECTANGLE :"4",
        ELLIPSE :"5",
        SELECT :"6",
        UNDRAW :"7"
    },
    Draw_BookmarkItem:function(element, item, degree) {

        if(degree == null) degree = 0;

        var ctx = element.getContext("2d");
        ctx.lineWidth = 0.9;


        $.each(item, function(){

            var rect = this.SLIP_RECT.split(",");

            var imageWidth = parseInt(rect[2]);
            var imageHeight = parseInt(rect[3]);

            var wRatio = element.width / imageWidth;
            var hRatio = element.height / imageHeight;

            var ratio = wRatio > hRatio ? hRatio : wRatio;

            this.RATIO = ratio;

            var shape = this.MARK_RECT.split(",");

            this.LEFT = parseInt(shape[0]) * ratio;
            this.TOP = parseInt(shape[1]) * ratio;
            this.RIGHT = parseInt(shape[2]) * ratio;
            this.BOTTOM = parseInt(shape[3]) * ratio;

            this.WIDTH =  this.RIGHT - this.LEFT;
            this.HEIGHT = this.BOTTOM - this.TOP;

            this.LINE_WIDTH =  parseInt(this.MARK_LineWidth) * 0.1;
            if(this.LINE_WIDTH < 1)  this.LINE_WIDTH = 1;


            switch (this.MARK_TYPE) {
                case $.Bookmark.BOOKMARK_ENUM.NOTEBOX :
                    $.Bookmark.drawNoteBox(element, ctx, this, degree);

                    break;
                case $.Bookmark.BOOKMARK_ENUM.RECTANGLE :
                    $.Bookmark.drawRectangle(element, ctx, this, degree);
                    break;
                case $.Bookmark.BOOKMARK_ENUM.ELLIPSE :
                    $.Bookmark.drawEllipse(element, ctx, this, degree);

                    break;
                case $.Bookmark.BOOKMARK_ENUM.LIGHTPEN :
                    $.Bookmark.drawLightPen(element, ctx, this, degree);

                    break;
                default:
                    return;
            }

        });

       // $.Common.rgbToHex()

    },
    drawNoteBox:function(element, ctx, rectInfo, degree) {

        if("1" === rectInfo.MARK_BackGround) {

            ctx.beginPath();

            ctx.rect(rectInfo.LEFT + (rectInfo.LINE_WIDTH / 2) ,
                rectInfo.TOP + (rectInfo.LINE_WIDTH / 2),
                rectInfo.WIDTH - rectInfo.LINE_WIDTH,
                rectInfo.HEIGHT - rectInfo.LINE_WIDTH);

            ctx.fillStyle = 'rgb('+rectInfo.MARK_BackColor+')';
            ctx.globalAlpha = (rectInfo.MARK_Alpha / 255.0);
            ctx.fill();
            ctx.closePath();
        }

        if(!$.Common.isBlank(rectInfo.MARK_Comment)) {
            ctx.beginPath();
            ctx.globalAlpha = 0.7;
            var sbFont = new StringBuffer();
            if("1" === rectInfo.MARK_Bold) {
                sbFont.append("bold");
                sbFont.append(" ");
            }

            if("1" === rectInfo.MARK_Italic) {
                sbFont.append("italic");
                sbFont.append(" ");
            }

            var fontSize = parseInt(rectInfo.MARK_FontSize) * 0.4;
            sbFont.append(fontSize);
            sbFont.append("px");
            sbFont.append(" ");
            sbFont.append(rectInfo.MARK_FontName);

            ctx.font = sbFont.toString(); //+ parseInt(rectInfo.MARK_FontSize) * 0.1 + "pt " + rectInfo.MARK_FontName ;
            ctx.fillStyle = 'rgb('+rectInfo.MARK_TextColor+')';
            ctx.textBaseline = "top";

            var comment = rectInfo.MARK_Comment;
            var rectWidth = rectInfo.WIDTH - rectInfo.LINE_WIDTH;

            //Draw text
            var tempComment = "";

            var nLine = 0;
            for(var i = 0; i < comment.length; i++) {
                tempComment += comment.charAt(i);
                if(ctx.measureText(tempComment).width >= rectWidth - fontSize) {
                    ctx.fillText(tempComment, rectInfo.LEFT + (rectInfo.LINE_WIDTH / 2),
                        (rectInfo.TOP + (rectInfo.LINE_WIDTH / 2)) + parseInt(rectInfo.MARK_FontSize) * 0.1 * nLine);
                    tempComment = "";
                    nLine++;
                }
            }

            //Draw left text
            if(!$.Common.isBlank(tempComment)) {
               ctx.fillText(tempComment, rectInfo.LEFT + (rectInfo.LINE_WIDTH / 2),
                    (rectInfo.TOP + (rectInfo.LINE_WIDTH / 2)) + parseInt(rectInfo.MARK_FontSize) * 0.1 * nLine);
                tempComment = "";
                nLine++;
            }

            ctx.closePath();

        }

        ctx.beginPath();
        ctx.globalAlpha = 0.7;
        ctx.lineWidth = rectInfo.LINE_WIDTH;
        ctx.strokeStyle = 'rgb('+rectInfo.MARK_LineColor+')';

        ctx.rect(rectInfo.LEFT , rectInfo.TOP, rectInfo.WIDTH, rectInfo.HEIGHT);
        ctx.stroke();



        if(degree !== 0) {
            this.Rotate_Shape(ctx, rectInfo.LEFT, rectInfo.TOP, rectInfo.WIDTH, rectInfo.HEIGHT, degree)
        }

        ctx.closePath();
    },
    drawLightPen:function(element, ctx, rectInfo, degree) {

        ctx.beginPath();

        ctx.rect(rectInfo.LEFT ,
            rectInfo.TOP,
            rectInfo.WIDTH,
            rectInfo.HEIGHT);

        ctx.fillStyle = 'rgb('+rectInfo.MARK_LineColor+')';
        ctx.globalAlpha = 0.7;
        ctx.fill();
        ctx.closePath();


        if(degree !== 0) {
            this.Rotate_Shape(ctx, rectInfo.LEFT, rectInfo.TOP, rectInfo.WIDTH, rectInfo.HEIGHT, degree)
        }

        ctx.closePath();
    },
    drawRectangle:function(element, ctx, rectInfo, degree) {


        if("0" === rectInfo.MARK_BackGround) {

            ctx.beginPath();

            ctx.rect(rectInfo.LEFT + (rectInfo.LINE_WIDTH / 2) ,
                rectInfo.TOP + (rectInfo.LINE_WIDTH / 2),
                rectInfo.WIDTH - rectInfo.LINE_WIDTH,
                rectInfo.HEIGHT - rectInfo.LINE_WIDTH);

            ctx.fillStyle = 'rgb('+rectInfo.MARK_BackColor+')';
            ctx.globalAlpha = 0.7;
            ctx.fill();
            ctx.closePath();
        }

        ctx.beginPath();
        ctx.lineWidth = rectInfo.LINE_WIDTH;
        ctx.strokeStyle = 'rgb('+rectInfo.MARK_LineColor+')';

        ctx.rect(rectInfo.LEFT , rectInfo.TOP, rectInfo.WIDTH, rectInfo.HEIGHT);
        ctx.stroke();

        if(degree !== 0) {
            this.Rotate_Shape(ctx, rectInfo.LEFT, rectInfo.TOP, rectInfo.WIDTH, rectInfo.HEIGHT, degree)
        }

        ctx.closePath();
    },
    drawEllipse:function(element, ctx, rectInfo, degree) {


        if("0" === rectInfo.MARK_BackGround) {

            ctx.beginPath();

            ctx.ellipse(rectInfo.LEFT + (rectInfo.WIDTH / 2) ,
                rectInfo.TOP + (rectInfo.HEIGHT / 2),
                (rectInfo.WIDTH - rectInfo.LINE_WIDTH) / 2,
                (rectInfo.HEIGHT - rectInfo.LINE_WIDTH) / 2,
                0,
                0,
                2 * Math.PI);

            ctx.fillStyle = 'rgb('+rectInfo.MARK_BackColor+')';
            ctx.globalAlpha = 0.7;
            ctx.fill();
            ctx.closePath();
        }

        ctx.beginPath();
        ctx.lineWidth = rectInfo.LINE_WIDTH;
        ctx.strokeStyle = 'rgb('+rectInfo.MARK_LineColor+')';

        ctx.ellipse(rectInfo.LEFT + (rectInfo.WIDTH / 2) ,
            rectInfo.TOP + (rectInfo.HEIGHT / 2),
            rectInfo.WIDTH / 2,
            rectInfo.HEIGHT / 2,
            0,
            0,
            2 * Math.PI);
        ctx.stroke();

        if(degree !== 0) {
            this.Rotate_Shape(ctx, rectInfo.LEFT, rectInfo.TOP, rectInfo.WIDTH, rectInfo.HEIGHT, degree)
        }

        // ctx.closePath();
    },
    Rotate_Shape:function(ctx, x, y, width, height, degree){

        var cx = x + 0.5 * width;
        var cy = y + 0.5 * height;

        ctx.translate(cx, cy);              //translate to center of shape
        ctx.rotate( (Math.PI / 180) * degree);  //rotate 25 degrees.
        ctx.translate(-cx, -cy);            //translate center back to 0,0

    }
}