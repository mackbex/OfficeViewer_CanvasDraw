

var Bookmark = function() {
    var bookmarkModule = {
        BOOKMARK_ENUM: {
            NONE: "0",
            MOVE: "1",
            NOTEBOX: "2",
            LIGHTPEN: "3",
            RECTANGLE: "4",
            ELLIPSE: "5",
            SELECT: "6",
            UNDRAW: "7"
        },
        stage: null,
        items: [],
        degree : 0,
        ratio : 1,
        init: function (canvas, items) {
            this.stage = new Konva.Stage({
                container: canvas.attr("id"),
                width: canvas.width(),
                height: canvas.height(),
            });
            this.items = items;
        },
        drawItems : function(degree) {
            if(degree !== undefined) {
                this.degree = degree;
            }
            var layer = new Konva.Layer();

            $.each(this.items, function () {
                bookmarkModule.draw(layer, this);
            });
            this.stage.add(layer);

            var shape = this.stage.find('#202010277C8C8095504697')[0];
            shape
        },
        draw : function (layer, item) {
            var rect = item.SLIP_RECT.split(",");

            var imageWidth = parseInt(rect[2]);
            var imageHeight = parseInt(rect[3]);

            var wRatio = bookmarkModule.stage.width() / imageWidth;
            var hRatio = bookmarkModule.stage.height() / imageHeight;

            var ratio = wRatio > hRatio ? hRatio : wRatio;

            this.ratio = ratio;

            var shape = item.MARK_RECT.split(",");

            item.LEFT = parseInt(shape[0]) * ratio;
            item.TOP = parseInt(shape[1]) * ratio;
            item.RIGHT = parseInt(shape[2]) * ratio;
            item.BOTTOM = parseInt(shape[3]) * ratio;

            item.WIDTH = item.RIGHT - item.LEFT;
            item.HEIGHT = item.BOTTOM - item.TOP;

            item.LINE_WIDTH = parseInt(item.MARK_LINEWIDTH) * ratio;
            if (item.LINE_WIDTH < 1) item.LINE_WIDTH = 1;


            switch (item.MARK_TYPE) {
                case bookmarkModule.BOOKMARK_ENUM.NOTEBOX :
                    bookmarkModule.drawNotebox(item, layer);
                    break;
                case bookmarkModule.BOOKMARK_ENUM.RECTANGLE :
                    bookmarkModule.drawRectangle(item, layer);
                    break;
                case bookmarkModule.BOOKMARK_ENUM.ELLIPSE :
                    bookmarkModule.drawEllipse(item, layer);
                    break;
                case bookmarkModule.BOOKMARK_ENUM.LIGHTPEN :
                    bookmarkModule.drawLightPen(item, layer);
                    // bookmarkModule.drawLightPen(element, ctx, item, $.Bookmark.degree);

                    break;
                default:
                    return;
            }
        },
        drawRectangle : function (item, layer) {

            var fillColor = null;

            if ("0" === item.MARK_BACKGROUND) {
                fillColor = 'rgb(' + item.MARK_BACKCOLOR + ')';
            }

            var rectangle = new Konva.Group({
                x: item.LEFT + (item.LINE_WIDTH / 2) ,
                y: item.TOP + (item.LINE_WIDTH / 2),
                width: item.WIDTH,
                height: item.HEIGHT,
                rotation: bookmarkModule.degree,
                draggable: true,
                id : item.MARK_IRN,
            });

            rectangle.add(new Konva.Rect({
                width: item.WIDTH,
                height: item.HEIGHT,
                fill: fillColor,
                opacity : 0.7,

            }));

            rectangle.add(new Konva.Rect({
                width: item.WIDTH,
                height: item.HEIGHT,
                stroke: 'rgb(' + item.MARK_LINECOLOR + ')',
                strokeWidth: item.LINE_WIDTH,

            }));

            layer.add(rectangle);
        },
        drawEllipse : function (item, layer) {
            var fillColor = null;

            if ("0" === item.MARK_BACKGROUND) {
                fillColor = 'rgb(' + item.MARK_BACKCOLOR + ')';
            }

            var ellipse = new Konva.Group({
                x: item.LEFT + (item.LINE_WIDTH / 2) + (item.WIDTH / 2),
                y: item.TOP + (item.LINE_WIDTH / 2) + (item.HEIGHT / 2),
                width: item.WIDTH,
                height: item.HEIGHT,
                rotation: bookmarkModule.degree,
                draggable: true,
                id : item.MARK_IRN,
            });

            ellipse.add(new Konva.Ellipse({
                 width: item.WIDTH,
                height: item.HEIGHT,
                fill: fillColor,
                opacity : 0.7,
            }));

            ellipse.add(new Konva.Ellipse({
                width: item.WIDTH,
                height: item.HEIGHT,
                stroke: 'rgb(' + item.MARK_LINECOLOR + ')',
                strokeWidth: item.LINE_WIDTH,
            }));

            layer.add(ellipse);
        },
        drawLightPen : function (item, layer) {


            layer.add(new Konva.Rect({
                x: item.LEFT + (item.LINE_WIDTH / 2),
                y: item.TOP + (item.LINE_WIDTH / 2),
                width: item.WIDTH,
                height: item.HEIGHT,
                fill: 'rgb(' + item.MARK_LINECOLOR + ')',
                opacity : 0.75,
                strokeWidth: item.LINE_WIDTH,
                rotation: bookmarkModule.degree,
                id : item.MARK_IRN
            }));

        },

        drawNotebox : function(item, layer) {

            var fontSize = parseInt(item.MARK_FONTSIZE) * 0.2;
            var fontName = item.MARK_FONTNAME;

            var notebox = new Konva.Group({
                x: item.LEFT + (item.LINE_WIDTH / 2),
                y: item.TOP + (item.LINE_WIDTH / 2),
                width: item.WIDTH,
                height: item.HEIGHT,
                rotation: bookmarkModule.degree,
                draggable: true,
                id : item.MARK_IRN,
            });

            notebox.add(new Konva.Text({
                fontFamily : fontName,
                fontSize : fontSize,
                width: item.WIDTH,
                height: item.HEIGHT,
                fill: 'rgb(' + item.MARK_TEXTCOLOR + ')',
                strokeWidth: item.LINE_WIDTH,
                text : item.MARK_COMMENT,
                padding:2,
                wrap: "word"}));

            var fillColor = null;

            if ("1" === item.MARK_BACKGROUND) {
                fillColor = 'rgb(' + item.MARK_BACKCOLOR + ')';
            }

            notebox.add(new Konva.Rect({
                fill: fillColor,
                opacity : (item.MARK_ALPHA / 255.0),
                width: item.WIDTH,
                height: item.HEIGHT,
            }));

            notebox.add(new Konva.Rect({
                stroke: 'rgb(' + item.MARK_LINECOLOR + ')',
                strokeWidth: item.LINE_WIDTH,
                width: item.WIDTH,
                height: item.HEIGHT,
            }));


            layer.add(notebox);
        },

        // drawNoteBox: function (element, ctx, rectInfo, degree) {
        //
        //     if ("1" === rectInfo.MARK_BACKGROUND) {
        //
        //         ctx.beginPath();
        //
        //         ctx.rect(rectInfo.LEFT + (rectInfo.LINE_WIDTH / 2),
        //             rectInfo.TOP + (rectInfo.LINE_WIDTH / 2),
        //             rectInfo.WIDTH - rectInfo.LINE_WIDTH,
        //             rectInfo.HEIGHT - rectInfo.LINE_WIDTH);
        //
        //         ctx.fillStyle = 'rgb(' + rectInfo.MARK_BACKCOLOR + ')';
        //         ctx.globalAlpha = (rectInfo.MARK_ALPHA / 255.0);
        //         ctx.fill();
        //         ctx.closePath();
        //     }
        //
        //     if (!$.Common.isBlank(rectInfo.MARK_COMMENT)) {
        //         ctx.beginPath();
        //         ctx.globalAlpha = 0.7;
        //         var sbFont = new StringBuffer();
        //         if ("1" === rectInfo.MARK_BOLD) {
        //             sbFont.append("bold");
        //             sbFont.append(" ");
        //         }
        //
        //         if ("1" === rectInfo.MARK_ITALIC) {
        //             sbFont.append("italic");
        //             sbFont.append(" ");
        //         }
        //
        //         var fontSize = parseInt(rectInfo.MARK_FONTSIZE) * 0.4;
        //         sbFont.append(fontSize);
        //         sbFont.append("px");
        //         sbFont.append(" ");
        //         sbFont.append(rectInfo.MARK_FONTNAME);
        //
        //         ctx.font = sbFont.toString(); //+ parseInt(rectInfo.MARK_FontSize) * 0.1 + "pt " + rectInfo.MARK_FontName ;
        //         ctx.fillStyle = 'rgb(' + rectInfo.MARK_TEXTCOLOR + ')';
        //         ctx.textBaseline = "top";
        //
        //         var comment = rectInfo.MARK_COMMENT;
        //         var rectWidth = rectInfo.WIDTH - rectInfo.LINE_WIDTH;
        //
        //         //Draw text
        //         var tempComment = "";
        //
        //         var nLine = 0;
        //         for (var i = 0; i < comment.length; i++) {
        //             tempComment += comment.charAt(i);
        //             if (ctx.measureText(tempComment).width >= rectWidth - fontSize) {
        //                 ctx.fillText(tempComment, rectInfo.LEFT + (rectInfo.LINE_WIDTH / 2),
        //                     (rectInfo.TOP + (rectInfo.LINE_WIDTH / 2)) + parseInt(rectInfo.MARK_FONTSIZE) * 0.1 * nLine);
        //                 tempComment = "";
        //                 nLine++;
        //             }
        //         }
        //
        //         //Draw left text
        //         if (!$.Common.isBlank(tempComment)) {
        //             ctx.fillText(tempComment, rectInfo.LEFT + (rectInfo.LINE_WIDTH / 2),
        //                 (rectInfo.TOP + (rectInfo.LINE_WIDTH / 2)) + parseInt(rectInfo.MARK_FONTSIZE) * 0.1 * nLine);
        //             tempComment = "";
        //             nLine++;
        //         }
        //
        //         ctx.closePath();
        //
        //     }
        //
        //     ctx.beginPath();
        //     ctx.globalAlpha = 0.7;
        //     ctx.lineWidth = rectInfo.LINE_WIDTH;
        //     ctx.strokeStyle = 'rgb(' + rectInfo.MARK_LINECOLOR + ')';
        //
        //     ctx.rect(rectInfo.LEFT, rectInfo.TOP, rectInfo.WIDTH, rectInfo.HEIGHT);
        //     ctx.stroke();
        //
        //
        //     if (degree !== 0) {
        //         this.Rotate_Shape(ctx, rectInfo.LEFT, rectInfo.TOP, rectInfo.WIDTH, rectInfo.HEIGHT, degree)
        //     }
        //
        //     ctx.closePath();
        // },
        // drawLightPen: function (element, ctx, rectInfo, degree) {
        //
        //     ctx.beginPath();
        //
        //     ctx.rect(rectInfo.LEFT,
        //         rectInfo.TOP,
        //         rectInfo.WIDTH,
        //         rectInfo.HEIGHT);
        //
        //     ctx.fillStyle = 'rgb(' + rectInfo.MARK_LINECOLOR + ')';
        //     ctx.globalAlpha = 0.7;
        //     ctx.fill();
        //     ctx.closePath();
        //
        //
        //     if (degree !== 0) {
        //         this.Rotate_Shape(ctx, rectInfo.LEFT, rectInfo.TOP, rectInfo.WIDTH, rectInfo.HEIGHT, degree)
        //     }
        //
        //     // ctx.closePath();
        // },
        // drawRectangle: function (element, ctx, rectInfo, degree) {
        //
        //
        //     if ("0" === rectInfo.MARK_BACKGROUND) {
        //
        //         ctx.beginPath();
        //
        //         ctx.rect(rectInfo.LEFT + (rectInfo.LINE_WIDTH / 2),
        //             rectInfo.TOP + (rectInfo.LINE_WIDTH / 2),
        //             rectInfo.WIDTH - rectInfo.LINE_WIDTH,
        //             rectInfo.HEIGHT - rectInfo.LINE_WIDTH);
        //
        //         ctx.fillStyle = 'rgb(' + rectInfo.MARK_BACKCOLOR + ')';
        //         ctx.globalAlpha = 0.7;
        //         ctx.fill();
        //         ctx.closePath();
        //     }
        //
        //     ctx.beginPath();
        //     ctx.lineWidth = rectInfo.LINE_WIDTH;
        //     ctx.strokeStyle = 'rgb(' + rectInfo.MARK_LINECOLOR + ')';
        //
        //     ctx.rect(rectInfo.LEFT, rectInfo.TOP, rectInfo.WIDTH, rectInfo.HEIGHT);
        //     ctx.stroke();
        //
        //     if (degree !== 0) {
        //         this.Rotate_Shape(ctx, rectInfo.LEFT, rectInfo.TOP, rectInfo.WIDTH, rectInfo.HEIGHT, degree)
        //     }
        //
        //     ctx.closePath();
        // },
        // drawEllipse: function (element, ctx, rectInfo, degree) {
        //
        //
        //     if ("0" === rectInfo.MARK_BACKGROUND) {
        //
        //         ctx.beginPath();
        //
        //         ctx.ellipse(rectInfo.LEFT + (rectInfo.WIDTH / 2),
        //             rectInfo.TOP + (rectInfo.HEIGHT / 2),
        //             (rectInfo.WIDTH - rectInfo.LINE_WIDTH) / 2,
        //             (rectInfo.HEIGHT - rectInfo.LINE_WIDTH) / 2,
        //             0,
        //             0,
        //             2 * Math.PI);
        //
        //         ctx.fillStyle = 'rgb(' + rectInfo.MARK_BACKCOLOR + ')';
        //         ctx.globalAlpha = 0.7;
        //         ctx.fill();
        //         ctx.closePath();
        //     }
        //
        //     ctx.beginPath();
        //     ctx.lineWidth = rectInfo.LINE_WIDTH;
        //     ctx.strokeStyle = 'rgb(' + rectInfo.MARK_LINECOLOR + ')';
        //
        //     ctx.ellipse(rectInfo.LEFT + (rectInfo.WIDTH / 2),
        //         rectInfo.TOP + (rectInfo.HEIGHT / 2),
        //         rectInfo.WIDTH / 2,
        //         rectInfo.HEIGHT / 2,
        //         0,
        //         0,
        //         2 * Math.PI);
        //     ctx.stroke();
        //
        //     if (degree !== 0) {
        //         this.Rotate_Shape(ctx, rectInfo.LEFT, rectInfo.TOP, rectInfo.WIDTH, rectInfo.HEIGHT, degree)
        //     }
        //
        //     ctx.closePath();
        // },
        Rotate_Shape: function (ctx, x, y, width, height, degree) {

            var cx = x + 0.5 * width;
            var cy = y + 0.5 * height;

            ctx.translate(cx, cy);              //translate to center of shape
            ctx.rotate((Math.PI / 180) * degree);  //rotate 25 degrees.
            ctx.translate(-cx, -cy);            //translate center back to 0,0

        }
    }
    return bookmarkModule;
};