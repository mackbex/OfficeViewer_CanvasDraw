var Bookmark = function() {
    var module = {
        SHAPE_TYPE: {
            NONE: "0",
            MOVE: "1",
            NOTEBOX: {
                KEY:"2",
                DEFAULT_VALUES : {
                    BACKGROUND : {
                        COLOR:"#ffff00",
                        OPACITY:50
                    },
                    FONT: {
                        SIZE : 20,
                        COLOR : "#329900",
                        TEXT : "New Memo",
                        FAMILY:"굴림"
                    },
                    LINE : {
                        COLOR : "#ef4df7",
                        WIDTH:1
                    }
                }
            },
            LIGHTPEN: {
                KEY : "3",
                DEFAULT_VALUES: {
                    BACKGROUND : {
                        HEIGHT:30,
                        COLOR:"#ffff00"
                    }
                }
            },
            RECTANGLE: {
                KEY : "4",
                DEFAULT_VALUES: {
                    BACKGROUND : {
                        COLOR:"#ef4df7",
                        OPACITY: 0.7,
                    },
                    LINE : {
                        COLOR : "#000000",
                        WIDTH:1
                    }

                }
            },
            ELLIPSE: {
                KEY : "5",
                DEFAULT_VALUES: {
                    BACKGROUND : {
                        COLOR:"#ef4df7",
                        OPACITY: 0.7,
                    },
                    LINE : {
                        COLOR : "#000000",
                        WIDTH:1
                    }

                }
            },
            SELECT: {
                KEY : "6"
            },
            UNDRAW: {
                KEY : "7"
            }
        },
        stage: null,
        items: [],
        degree : 0,
        fontZoom : 1,
        targetImage : null,
        targetImageInfo : null,
        minZoom : 0.5,
        maxZoom : 3.0,
        // padding : 10,
        scaleBy : 1.1,
        // bookmarkLayerId : null,
        shapeLayer: null,
        slipdocInfo : null,
        imageRatio : 1,
        actorComponent : null,
        init: function (container, targetImage, imgInfo, slipdocInfo, actorComponent) {

            this.targetImage        = targetImage;
            this.targetImageInfo    = imgInfo;
            // this.bookmarkLayerId    = ;
            this.slipdocInfo        = slipdocInfo;
            this.actorComponent     = actorComponent;

            this.stage = new Konva.Stage({
                container: container.attr("id"),
                width: container.width(),
                height: container.height(),
                draggable: true,
                name : "stage",
                parentObject : container.attr("parent"),
            });

            this.addScrollEvent();

            this.imageRatio = module.getImageRatio(imgInfo);
        },
        resizeStage : function(w, h) {
            module.stage.width(w);
            module.stage.height(h);
            module.stage.draw();
        },
        addScrollEvent : function(){
            var scaleBy = module.scaleBy;
            var stage = module.stage;
            stage.on('wheel', function(e) {
                e.evt.preventDefault();
                var oldScale = stage.scaleX();
                if(oldScale < module.minZoom) {
                    // stage.scale({x:bookmarkModule.minZoom, y:bookmarkModule.minZoom});
                    return;
                }
                else if(oldScale > module.maxZoom) {
                    // stage.scale({x:bookmarkModule.minZoom, y:bookmarkModule.minZoom});
                    return;
                }

                var pointer = stage.getPointerPosition();

                var mousePointTo = {
                    x: (pointer.x - stage.x()) / oldScale,
                    y: (pointer.y - stage.y()) / oldScale,
                };

                var newScale =
                    e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

                if(newScale < module.minZoom) {
                    newScale = module.minZoom;
                }
                else if(newScale > module.maxZoom) {
                    newScale = module.maxZoom;
                }
                stage.scale({ x: newScale, y: newScale });

                var newPos = {
                    x: pointer.x - mousePointTo.x * newScale,
                    y: pointer.y - mousePointTo.y * newScale,
                };
                stage.position(newPos);
                stage.batchDraw();
            });
        },
        zoomIn : function() {
            var stage = module.stage;
            var oldScale = stage.scaleX();
            var center = {
                x: stage.width() / 2,
                y: stage.height() / 2,
            };
            var relatedTo = {
                x: (center.x - stage.x()) / oldScale,
                y: (center.y - stage.y()) / oldScale,
            };
            var newScale =
                 oldScale * module.scaleBy;
            stage.scale({
                x: newScale,
                y: newScale
            });
            var newPos = {
                x: center.x - relatedTo.x * newScale,
                y: center.y - relatedTo.y * newScale,
            };
            stage.position(newPos);
            stage.batchDraw();
        },
        zoomOut : function() {
            var stage = module.stage;
            var oldScale = stage.scaleX();
            var center = {
                x: stage.width() / 2,
                y: stage.height() / 2,
            };
            var relatedTo = {
                x: (center.x - stage.x()) / oldScale,
                y: (center.y - stage.y()) / oldScale,
            };
            var newScale =
                oldScale / module.scaleBy;
            stage.scale({
                x: newScale,
                y: newScale
            });
            var newPos = {
                x: center.x - relatedTo.x * newScale,
                y: center.y - relatedTo.y * newScale,
            };
            stage.position(newPos);
            stage.batchDraw();
        },
        drawTargetImage : function(progressId) {
            var deferred = $.Deferred();

            this.targetImage[0].onload = function () {
                var imgWidth = this.width;
                var imgHeight = this.height;

                var wRatio = module.stage.getWidth() / imgWidth;
                var hRatio = module.stage.getHeight() / imgHeight

                var ratio = hRatio < wRatio ? hRatio : wRatio;

                var fitImgWidth = imgWidth * ratio;
                var fitImgHeight = imgHeight * ratio;


                var image = new Konva.Image({
                    image: module.targetImage[0],
                    width:fitImgWidth /*- bookmarkModule.padding*/,
                    height : fitImgHeight /*- bookmarkModule.padding*/,
                    shadowColor: 'black',
                    shadowBlur: 2,
                    shadowOffset: { x: 3, y: 3 },
                    shadowOpacity: 0.3,
                });
                image.id("ORI_IMAGE");

                module.centerShape(image);

                if(!$.Common.isBlank(progressId)) {
                    $.Common.HideProgress(progressId);
                }

                var layer = new Konva.Layer();
                layer.add(image);
                layer.batchDraw();
                module.stage.add(layer);
                module.zoomOut();

                deferred.resolve();
            }
            return deferred.promise();
        },
        centerShape : function(shape) {
            shape.x( (( module.stage.getWidth() - shape.getWidth() ) / 2) /*- (bookmarkModule.padding / 2)*/);
            shape.y( (( module.stage.getHeight() - shape.getHeight() ) / 2)/* + (bookmarkModule.padding / 2)*/);
        },
        setFontZoom : function() {
            var oriRect = this.targetImageInfo["SLIP_RECT"].split(",");
            var oriWidth = (oriRect[2] / 720 * this.targetImageInfo['IMG_DPI']);
            var zoom = this.targetImage[0].naturalWidth / oriWidth;

            this.fontZoom = zoom;
        },
        drawItems : function(bookmarkItem, degree) {
            if(degree !== undefined) {
                this.degree = degree;
            }

            module.items = null;
            if(null !== module.shapeLayer) {
                module.shapeLayer.destroy();
            }
            module.shapeLayer = new Konva.Layer();
            module.shapeLayer.id(module.stage.container().id);
            module.items = bookmarkItem !== undefined ? bookmarkItem : [];
            module.setFontZoom();

            $.each(this.items, function (i) {
                module.draw(module.shapeLayer, this);
            });

            module.stage.add(module.shapeLayer);

            // var shape = this.stage.find('#202010277C8C8095504697')[0];
            // this.stage.off('mousemove');
        },
        addShape : function (shape) {

            var oriImg =  this.stage.find("#ORI_IMAGE")[0];
            var left = (shape.x() - oriImg.x()) / module.imageRatio;
            var top = (shape.y() - oriImg.y()) / module.imageRatio;
            var right = (shape.width() + shape.x() - oriImg.x()) / module.imageRatio;
            var bottom = (shape.height() + shape.y() - oriImg.y()) / module.imageRatio;

            var item = {};
            item['CORP_NO'] = this.slipdocInfo.CORP_NO;
            item['DEVICE'] = "PC";
            item['ENABLE'] = "1";
            item['MARK_RECT'] = parseInt(left) + "," + parseInt(top) + "," + parseInt(right) + "," + parseInt(bottom);
            item['REG_USER'] = this.slipdocInfo.USER_ID;
            item['SDOC_NO'] = this.targetImageInfo.SDOC_NO;
            item['SLIP_IRN'] = this.targetImageInfo.SLIP_IRN;
            item['SLIP_RECT'] = this.targetImageInfo.SLIP_RECT;

            switch (shape.attrs.shapeType) {
                case module.SHAPE_TYPE.LIGHTPEN :
                    var lineColor = Konva.Util.getRGB(shape.fill());
                    item['MARK_ALPHA'] = "0";
                    item['MARK_BACKCOLOR'] = '255,255,255';
                    item['MARK_BACKGROUND'] = "1";
                    item['MARK_BOLD'] = "0";
                    item['MARK_COMMENT'] = "";
                    item['MARK_FONTNAME'] = "";
                    item['MARK_FONTSIZE'] = "0";
                    item['MARK_IRN'] = shape.id();
                    item['MARK_ITALIC'] = "0";
                    item['MARK_LINECOLOR'] = lineColor['r']+","+lineColor['g']+","+lineColor['b'];
                    item['MARK_LINEWIDTH'] = shape.height();
                    item['MARK_STYLE'] = "";
                    item['MARK_TEXTCOLOR'] = "255,255,255";
                    item['MARK_TYPE'] = module.SHAPE_TYPE.LIGHTPEN.KEY;
                    break;
                case module.SHAPE_TYPE.NOTEBOX :
                    var lineColor = Konva.Util.getRGB(shape.find("#line")[0].stroke());
                    var bgColor = Konva.Util.getRGB(shape.find("#background")[0].fill());
                    var fontColor = Konva.Util.getRGB(shape.find("#text")[0].fill());

                    item['MARK_ALPHA'] = $.Common.getRawOpacity(shape.find("#background")[0].opacity());
                    item['MARK_BACKCOLOR'] = bgColor['r']+","+bgColor['g']+","+bgColor['b'];
                    item['MARK_BACKGROUND'] = "1";
                    item['MARK_BOLD'] = "0";
                    item['MARK_COMMENT'] = shape.find("#text")[0].text();
                    item['MARK_FONTNAME'] = module.SHAPE_TYPE.NOTEBOX.DEFAULT_VALUES.FONT.FAMILY;
                    item['MARK_FONTSIZE'] = shape.find("#text")[0].fontSize();
                    item['MARK_IRN'] = shape.id();
                    item['MARK_ITALIC'] = "0";
                    item['MARK_LINECOLOR'] = lineColor['r']+","+lineColor['g']+","+lineColor['b'];
                    item['MARK_LINEWIDTH'] = shape.find("#line")[0].strokeWidth();
                    item['MARK_STYLE'] = "";
                    item['MARK_TEXTCOLOR'] = fontColor['r']+","+fontColor['g']+","+fontColor['b'];
                    item['MARK_TYPE'] = module.SHAPE_TYPE.NOTEBOX.KEY;
                    break;
                case module.SHAPE_TYPE.RECTANGLE :
                    var lineColor = Konva.Util.getRGB(shape.find("#line")[0].stroke());
                    var bgColor = Konva.Util.getRGB(shape.find("#background")[0].fill());
                    item['MARK_ALPHA'] = "0";
                    item['MARK_BACKCOLOR'] = bgColor['r']+","+bgColor['g']+","+bgColor['b'];
                    item['MARK_BACKGROUND'] = shape.find("#background")[0].opacity() === 0 ? "1" : "0";
                    item['MARK_BOLD'] = "0";
                    item['MARK_COMMENT'] = "";
                    item['MARK_FONTNAME'] = "";
                    item['MARK_FONTSIZE'] = "0";
                    item['MARK_IRN'] = shape.id();
                    item['MARK_ITALIC'] = "0";
                    item['MARK_LINECOLOR'] = lineColor['r']+","+lineColor['g']+","+lineColor['b'];
                    item['MARK_LINEWIDTH'] = shape.find("#line")[0].strokeWidth();
                    item['MARK_STYLE'] = "";
                    item['MARK_TEXTCOLOR'] = "255,255,255";
                    item['MARK_TYPE'] = module.SHAPE_TYPE.RECTANGLE.KEY;
                    break;
                case module.SHAPE_TYPE.ELLIPSE :
                    var lineColor = Konva.Util.getRGB(shape.find("#line")[0].stroke());
                    var bgColor = Konva.Util.getRGB(shape.find("#background")[0].fill());
                    item['MARK_ALPHA'] = "0";
                    item['MARK_BACKCOLOR'] = bgColor['r']+","+bgColor['g']+","+bgColor['b'];
                    item['MARK_BACKGROUND'] = shape.find("#background")[0].opacity() === 0 ? "1" : "0";
                    item['MARK_BOLD'] = "0";
                    item['MARK_COMMENT'] = "";
                    item['MARK_FONTNAME'] = "";
                    item['MARK_FONTSIZE'] = "0";
                    item['MARK_IRN'] = shape.id();
                    item['MARK_ITALIC'] = "0";
                    item['MARK_LINECOLOR'] = lineColor['r']+","+lineColor['g']+","+lineColor['b'];
                    item['MARK_LINEWIDTH'] = shape.find("#line")[0].strokeWidth();
                    item['MARK_STYLE'] = "";
                    item['MARK_TEXTCOLOR'] = "255,255,255";
                    item['MARK_TYPE'] = module.SHAPE_TYPE.ELLIPSE.KEY;
                    break;
                default: return;
            }
            this.items.push(item);
            return item;
        },
        getImageRatio :function(item){
            var rect = item.SLIP_RECT.split(",");

            var imageWidth = parseInt(rect[2]);
            var imageHeight = parseInt(rect[3]);

            var wRatio = module.stage.width() / imageWidth;
            var hRatio = module.stage.height() / imageHeight;

            var ratio = wRatio > hRatio ? hRatio : wRatio;
            return ratio;
        },
        draw : function (layer, item) {
            var ratio = module.getImageRatio(item);

            // module.imageRatio = ratio;

            var shape = item.MARK_RECT.split(",");

            //console.log(this.targetImage[0].offsetLeft)
            item.LEFT = parseInt(shape[0]) * ratio;
            item.TOP = parseInt(shape[1]) * ratio;
            item.RIGHT = parseInt(shape[2]) * ratio;
            item.BOTTOM = parseInt(shape[3]) * ratio;

            item.WIDTH = item.RIGHT - item.LEFT;
            item.HEIGHT = item.BOTTOM - item.TOP;

            var oriImg = module.stage.find('#ORI_IMAGE')[0];
            if(undefined !== oriImg) {
                item.LEFT += oriImg.x();
                item.TOP += oriImg.y();
                item.RIGHT += oriImg.x();
                item.BOTTOM += oriImg.y();
            }
            //
            // var offsetLeft = ((( bookmarkModule.stage.getWidth() - (bookmarkModule.targetImage.width() * ratio)) / 2) - (bookmarkModule.padding / 2));
            // var offsetTop = ((( bookmarkModule.stage.getHeight() - (bookmarkModule.targetImage.height()* ratio)) / 2) - (bookmarkModule.padding / 2));

            // item.LEFT += offsetLeft;
            // item.TOP += offsetTop;
            // item.RIGHT += offsetLeft;
            // item.BOTTOM += offsetTop;

            item.LINE_WIDTH = parseInt(item.MARK_LINEWIDTH)// * ratio;
            if("actor" === module.stage.attrs.parentObject.toLowerCase()) {
                item.LINE_WIDTH = item.LINE_WIDTH * ratio * 10;
                if (item.LINE_WIDTH < 1) item.LINE_WIDTH = 1;
            }
            // if (item.LINE_WIDTH < 1) item.LINE_WIDTH = 1;


            var shapeNode = null;
            switch (item.MARK_TYPE) {
                case module.SHAPE_TYPE.NOTEBOX.KEY :
                    shapeNode = module.drawNotebox(item, layer);
                    break;
                case module.SHAPE_TYPE.RECTANGLE.KEY :
                    shapeNode = module.drawRectangle(item, layer);
                    break;
                case module.SHAPE_TYPE.ELLIPSE.KEY :
                    shapeNode = module.drawEllipse(item, layer);
                    break;
                case module.SHAPE_TYPE.LIGHTPEN.KEY :
                    shapeNode = module.drawLightPen(item, layer);
                    break;
                default:
                    return;
            }
            return shapeNode;
        },
        refreshThumbBookmark : function () {
            if(null !== module.actorComponent) {
                module.targetImageInfo.BOOKMARKS = module.items;
                module.actorComponent.reloadBookmark(module.targetImageInfo);
            }
        },
        refreshShape : function(markIrn) {
            var shape = module.stage.find("#"+markIrn)[0];
            shape.destroy();
            var shapeNode = module.draw(module.shapeLayer, module.getShapeInfo(markIrn));
            // if(null !== shapeNode) {
            //     shape.draggable(true);
            module.stage.draw();

            return shapeNode;
            // }
        },
        drawRectangle : function (item, layer) {

            var opacity = 0;

            if ("0" === item.MARK_BACKGROUND) {
                opacity = module.SHAPE_TYPE.RECTANGLE.DEFAULT_VALUES.BACKGROUND.OPACITY;
            }

            var rectangle = new Konva.Group({
                x: item.LEFT  ,
                y: item.TOP ,
                width: item.WIDTH,
                height: item.HEIGHT,
                rotation: module.degree,
                // draggable: true,
                id : item.MARK_IRN,
                shapeType : module.SHAPE_TYPE.RECTANGLE
            });

            rectangle.add(new Konva.Rect({
                width: item.WIDTH,
                height: item.HEIGHT,
                fill: 'rgb(' + item.MARK_BACKCOLOR + ')',
                opacity : opacity,
                id:"background"

            }));

            rectangle.add(new Konva.Rect({
                width: item.WIDTH,
                height: item.HEIGHT,
                stroke: 'rgb(' + item.MARK_LINECOLOR + ')',
                strokeWidth: item.LINE_WIDTH,
                id:"line"

            }));

            layer.add(rectangle);
            return rectangle;
        },
        drawEllipse : function (item, layer) {
            var opacity = 0;

            if ("0" === item.MARK_BACKGROUND) {
                opacity = module.SHAPE_TYPE.ELLIPSE.DEFAULT_VALUES.BACKGROUND.OPACITY;
            }

            var ellipse = new Konva.Group({
                x: item.LEFT ,
                y: item.TOP ,
                width: item.WIDTH,
                height: item.HEIGHT,
                rotation: module.degree,
                // draggable: true,
                id : item.MARK_IRN,
                shapeType : module.SHAPE_TYPE.ELLIPSE
            });

            ellipse.add(new Konva.Ellipse({
                 width: item.WIDTH,
                height: item.HEIGHT,
                fill: 'rgb(' + item.MARK_BACKCOLOR + ')',
                opacity : opacity,
                id:"background"
            }));

            ellipse.add(new Konva.Ellipse({
                width: item.WIDTH,
                height: item.HEIGHT,
                stroke: 'rgb(' + item.MARK_LINECOLOR + ')',
                strokeWidth: item.LINE_WIDTH,
                id:"line"
            }));

            layer.add(ellipse);
            return ellipse;
        },
        drawLightPen : function (item, layer) {

            var lightPen = new Konva.Rect({
                x: item.LEFT ,
                y: item.TOP ,
                width: item.WIDTH,
                height: item.HEIGHT,
                fill: 'rgb(' + item.MARK_LINECOLOR + ')',
                opacity : 0.75,
                strokeWidth: item.LINE_WIDTH,
                rotation: module.degree,
                // draggable: true,
                id : item.MARK_IRN,
                shapeType : module.SHAPE_TYPE.LIGHTPEN
            });

            layer.add(lightPen);

            return lightPen;
        },

        drawNotebox : function(item, layer) {

            var fontSize = parseInt(item.MARK_FONTSIZE) * module.imageRatio * 10; //module.fontZoom;

            var fontName = item.MARK_FONTNAME;

            var notebox = new Konva.Group({
                x: item.LEFT,
                y: item.TOP ,
                width: item.WIDTH,
                height: item.HEIGHT,
                rotation: module.degree,
                // draggable: true,
                id : item.MARK_IRN,
                shapeType : module.SHAPE_TYPE.NOTEBOX,

            });

            var padding = 2;
            var text = new Konva.Text({
                fontFamily : fontName,
                fontSize : fontSize,
                width: item.WIDTH + padding,
                height: item.HEIGHT + padding,
                fill: 'rgb(' + item.MARK_TEXTCOLOR + ')',
                // strokeWidth: item.LINE_WIDTH,
                text : item.MARK_COMMENT,
                padding:padding,
                id:"text",
                wrap: "word",// set minimum width of text
                boundBoxFunc: function (oldBox, newBox) {
                    newBox.width = Math.max(30, newBox.width);
                    return newBox;
                },
            });
            notebox.add(text);

            var fillColor = null;

            if ("1" === item.MARK_BACKGROUND) {
                fillColor = 'rgb(' + item.MARK_BACKCOLOR + ')';
            }

            var bg = new Konva.Rect({
                fill: fillColor,
                opacity : $.Common.getFloatOpacity(item.MARK_ALPHA),
                width: item.WIDTH,
                height: item.HEIGHT,
                id:"background",
            });
            notebox.add(bg);

            var line = new Konva.Rect({
                stroke: 'rgb(' + item.MARK_LINECOLOR + ')',
                strokeWidth: item.LINE_WIDTH,
                width: item.WIDTH,
                height: item.HEIGHT,
                id:"line",
            });
            notebox.add(line);
            text.zIndex(2);
            bg.zIndex(0);
            line.zIndex(0);


            layer.add(notebox);
            return notebox;
        },
        getShapeInfo:function(markIrn) {
          return $.grep(module.items, function(item){
              return item.MARK_IRN === markIrn;
          })[0];
        },
    }
    return module;
};