
var Draw = function() {
    var module = {
        TAB_OPTION : {
            BACKGROUND : 0,
            LINE : 1,
            FONT : 2,
        },
        STATUS : {
            IDLE : 0,
            DRAWING : 1,
            EDITING : 2,
            READEY_DRAWING : 3,
        },
        Bookmark: null,
        btnContainer: $("#bookmarkBtnList"),
        drawPanelContainer: $("#drawPanel"),
        // toolboxHeight: "260px",
        isToolboxVisible: false,
        // viewer : null,
        localMsg : null,
        currentShape : null,
        shapeLayer : null,
        colorPicker : null,
        drawingMode : null,
        minimumSize : 10,
        drawingInfo : {
            currentTab : null,
            shapeType : null,
            posStart : null,
            posNow : null,
            height : null,
            opacity : null,
            fontSize : null,
            fontColor : null,
            lineColor : null,
            lineWidth : null,
            background : 0 // 0 : Visible , 1 : Invisible
        },
        panelType: null,
        init: function (bookmark, localMsg, colorPickerContainer) {

            module.drawingMode = module.STATUS.IDLE;

            this.toggleToolbox(false);
            this.Bookmark = bookmark;
            // this.viewer = viewer;
            this.localMsg =  localMsg;

            this.addToolBtn();
            this.setStageEvents();
            this.setShapeEvents();
            this.initColorPicker(colorPickerContainer);

            this.initRightClickMenu();

        },
        initRightClickMenu : function () {


            // var menu = $(document.createElement('div')).css({
            //     display:"inline-table",
            //     // left:left,
            //     // top:top,
            //     position:"fixed",
            //     zIndex:9999,
            //     width:"auto"
            // });


            $(document).on('contextmenu', function(e) {
                e.preventDefault();

                if(module.currentShape === null) return;

                $('[id=drawContextMenu]').remove();

                var padding = 10;

                var menu = $("<div id='drawContextMenu' class='draw_contextmenu'>" +
                    "<div class='menu_item' id='removeShape'>"+module.localMsg.REMOVE_SHAPE+"</div>" +
                    "</div>")
                    .appendTo("#originalImage");

                $("#removeShape").off('click').on('click', function(){
                    module.removeCurrentShape()
                });
                //Check left breaks through window
                var menuWidth 		= menu.width();
                var estimatedWidth 	= e.offsetX + menuWidth;
                var documentWidth 	= module.Bookmark.stage.width();
                var left = 0;
                if(estimatedWidth > documentWidth)
                {
                    left = e.offsetX - menuWidth + padding;
                }
                else {
                    left = e.offsetX + padding;
                }

                menu.css({
                    left:left,
                });

                var top = 0;
                var menuHeight 		= menu.height();
                var estimatedHeight = e.offsetY + menuHeight;
                var windowHeight 	= module.Bookmark.stage.height();

                // var isBottomAlign = menu.attr("bottom_align");
                // if("true" === isBottomAlign) {
                //     top = e.offsetY + module.currentShape.height() - menuHeight;
                // }
                // else
                // {
                if(estimatedHeight  > windowHeight)
                {
                    top = windowHeight - menuHeight;
                }
                else {
                    top = e.offsetY + padding;
                }
                // }
                //
                // var isSpacingTop = menu.attr("spacing_top");
                // if("true" === isSpacingTop) {
                //     top =  top + (module.currentShape.height() / 4)
                // }
                menu.css({
                    top:top,
                });

                menu.fadeIn(300, function(){ $(this).show(); });

                $(window).blur(function () {
                    menu.remove();
                });

                $(window).on('resize', function () {
                    menu.remove();
                });
                $(window).on('mousewheel', function(){
                    menu.remove();
                });

                $(window).on('click', function(){
                    menu.remove();
                });
            });
        },
        initColorPicker : function(colorPickerContainer){
            $.getMultiScripts([
                g_RootURL+"js/colorpicker/spectrum.js",
                g_RootURL+"js/rangeslider/ion.rangeSlider.min.js"
            ]).done(function() {
                var pickerCssPath = g_RootURL + "/css/colorpicker/spectrum.css";
                $('head').append('<link rel="stylesheet" type="text/css" href="' + pickerCssPath + '">');
                var sliderCssPath = g_RootURL + "/css/rangeslider/ion.rangeSlider.css";
                $('head').append('<link rel="stylesheet" type="text/css" href="' + sliderCssPath + '">');

                module.colorPicker = $(colorPickerContainer).spectrum({
                    type: "flat",
                    showButtons: false,
                    allowEmpty: false,
                    showInput: true,
                    showAlpha: false,
                    showSelectionPalette: false,
                    palette: [
                        ["#000", "#444", "#666", "#999", "#ccc", "#eee", "#f3f3f3", "#fff"],
                        ["#f00", "#f90", "#ff0", "#0f0", "#0ff", "#00f", "#90f", "#f0f"],
                        ["#f4cccc", "#fce5cd", "#fff2cc", "#d9ead3", "#d0e0e3", "#cfe2f3", "#d9d2e9", "#ead1dc"],
                        ["#ea9999", "#f9cb9c", "#ffe599", "#b6d7a8", "#a2c4c9", "#9fc5e8", "#b4a7d6", "#d5a6bd"],
                        ["#e06666", "#f6b26b", "#ffd966", "#93c47d", "#76a5af", "#6fa8dc", "#8e7cc3", "#c27ba0"],
                        ["#c00", "#e69138", "#f1c232", "#6aa84f", "#45818e", "#3d85c6", "#674ea7", "#a64d79"],
                    ],

                    move: function (color) {

                        switch (module.drawingInfo.currentTab) {
                            case module.TAB_OPTION.BACKGROUND :
                                module.drawingInfo.bgColor = color.toHexString();
                                break;
                            case module.TAB_OPTION.FONT :
                                module.drawingInfo.fontColor = color.toHexString();
                                break;
                            case module.TAB_OPTION.LINE :
                                module.drawingInfo.lineColor = color.toHexString();
                                break;
                            default: break;
                        }

                        if (module.drawingMode === module.STATUS.EDITING && null !== module.currentShape) {
                            switch (module.currentShape.attrs.shapeType) {
                                case module.Bookmark.SHAPE_TYPE.LIGHTPEN :
                                    module.currentShape.fill(color.toHexString());
                                    module.Bookmark.items = module.updateShapeColor(module.Bookmark.items, "MARK_LINECOLOR" , color);
                                    break;
                                case module.Bookmark.SHAPE_TYPE.NOTEBOX :
                                    switch (module.drawingInfo.currentTab) {
                                        case module.TAB_OPTION.BACKGROUND :
                                            module.currentShape.find("#background").fill(color.toHexString());
                                            module.Bookmark.items = module.updateShapeColor(module.Bookmark.items, "MARK_BACKCOLOR" , color);
                                            break;
                                        case module.TAB_OPTION.LINE :
                                            module.currentShape.find("#line").stroke(color.toHexString());
                                            module.Bookmark.items = module.updateShapeColor(module.Bookmark.items, "MARK_LINECOLOR" , color);
                                            break;
                                        case module.TAB_OPTION.FONT :
                                            module.currentShape.find("#text").fill(color.toHexString());
                                            module.Bookmark.items = module.updateShapeColor(module.Bookmark.items, "MARK_TEXTCOLOR" , color);
                                            break;
                                        default: break;
                                    }
                                case module.Bookmark.SHAPE_TYPE.RECTANGLE :
                                    switch (module.drawingInfo.currentTab) {
                                        case module.TAB_OPTION.BACKGROUND :
                                            module.currentShape.find("#background").fill(color.toHexString());
                                            module.Bookmark.items = module.updateShapeColor(module.Bookmark.items, "MARK_BACKCOLOR" , color);
                                            break;
                                        case module.TAB_OPTION.LINE :
                                            module.currentShape.find("#line").stroke(color.toHexString());
                                            module.Bookmark.items = module.updateShapeColor(module.Bookmark.items, "MARK_LINECOLOR" , color);
                                            break;
                                    }
                                    break;
                                case module.Bookmark.SHAPE_TYPE.ELLIPSE :
                                    switch (module.drawingInfo.currentTab) {
                                        case module.TAB_OPTION.BACKGROUND :
                                            module.currentShape.find("#background").fill(color.toHexString());
                                            module.Bookmark.items = module.updateShapeColor(module.Bookmark.items, "MARK_BACKCOLOR" , color);
                                            break;
                                        case module.TAB_OPTION.LINE :
                                            module.currentShape.find("#line").stroke(color.toHexString());
                                            module.Bookmark.items = module.updateShapeColor(module.Bookmark.items, "MARK_LINECOLOR" , color);
                                            break;
                                    }
                                    break;
                                default:
                                    break;
                            }

                            module.shapeLayer.draw();
                            module.Bookmark.refreshThumbBookmark();

                        }
                    }
                })
            })
            .fail(function(){
                $.Common.simpleToast("Failed to load ColorPicker");
            });
        },
        updateShapeColor: function(items, target, picker){
            return $.map(items, function(item) {
                if(item.MARK_IRN === module.currentShape.id()) {
                    item[target] = parseInt(picker['_r'])+","+parseInt(picker['_g'])+","+parseInt(picker['_b']);
                }
                return item;
            });
        },
        updateShapeValue: function(items, target, value) {
            return $.map(items, function(item) {
                if(item.MARK_IRN === module.currentShape.id()) {
                    item[target] = value;
                }
                return item;
            });
        } ,
        setStageEvents: function() {
            module.Bookmark.stage.on("click",function(e){
                if("ORI_IMAGE" === e.target.id() || null === e.target.id() || "stage" === e.target.name()) {
                    module.deSelectAll();
                    module.drawingMode = module.STATUS.IDLE;
                }
            })
        },
        setShapeEvents: function () {
            module.shapeLayer = module.Bookmark.shapeLayer;
            $.map(module.shapeLayer.children, function(shape){

                    module.addClickEvent(shape);
                // });
            })
        },
        addClickEvent : function(shape) {
            // module.toggleToolbox(false);

            if(shape.attrs.shapeType === module.Bookmark.SHAPE_TYPE.NOTEBOX) {
                module.addModifyTextEvent(shape.find("#text")[0]);
            }

            shape.off('click').on('click', function(e) {
                // e.cancelBubble = true;
                // module.Bookmark.
                module.deSelectAll();
                module.removeStageDrawEvent();
                module.drawingMode = module.STATUS.EDITING;
                module.currentShape = shape;
                shape.draggable(true);

                var tr = new Konva.Transformer({
                    anchorSize: 0,
                    borderDash: [3, 3],
                    borderStroke: 'black',
                    nodes: [shape],
                });
                tr.rotateEnabled(false);
                module.shapeLayer.add(tr);
                module.shapeLayer.draw();

                module.setCurrentProps();

            });
            shape.off('dragstart').on('dragstart', function(){
                $('[id=drawContextMenu]').remove();
            });
            shape.off('dragend').on('dragend', function() {
                module.updateShapeMatrix(shape);
            });
        },
        updateShapeMatrix:function(shape){
            module.Bookmark.items = $.map(module.Bookmark.items, function (item) {
                // var item = this;
                if (item.MARK_IRN === module.currentShape.id()) {
                    var oriImg =  module.Bookmark.stage.find("#ORI_IMAGE")[0];
                    var left = (shape.x() - oriImg.x()) / module.Bookmark.imageRatio;
                    var top = (shape.y() - oriImg.y()) / module.Bookmark.imageRatio;
                    var right = (shape.width() + shape.x() - oriImg.x()) / module.Bookmark.imageRatio;
                    var bottom = (shape.height() + shape.y() - oriImg.y()) / module.Bookmark.imageRatio;
                    item.MARK_RECT = left + "," + top + "," + right + "," + bottom;
                }
                return item;
            });

            module.Bookmark.refreshThumbBookmark();
        },
        setCurrentProps: function() {
            var shape = module.currentShape;
            module.showPanel(shape.attrs.shapeType);
        },
        deSelectAll : function() {
            module.shapeLayer.find('Transformer').detach();
            $.map(module.shapeLayer.children, function(shape){
                shape.draggable(false);
            })
            module.shapeLayer.draw();
            module.hideToolbox();
            module.currentShape = null;
            // module.deSelectAll();
        },

        // disablePanzoom : function() {
        drawShape : function(type) {

            // module.mode = module.STATUS.DRAWING;
            module.deSelectAll();



            // this.disablePanzoom();
            module.drawingMode = module.STATUS.IDLE;
            // switch (type) {
            //     case module.Bookmark.SHAPE_TYPE.LIGHTPEN :
            //         module.drawingInfo.currentTab = module.TAB_OPTION.BACKGROUND;
            //         break;
            //     case module.Bookmark.SHAPE_TYPE.NOTEBOX :
            //         module.drawingInfo.currentTab = module.TAB_OPTION.BACKGROUND;
            //         break;
            //     case module.Bookmark.SHAPE_TYPE.RECTANGLE :
            //         module.drawingInfo.currentTab = module.TAB_OPTION.BACKGROUND;
            //         break;
            //     case module.Bookmark.SHAPE_TYPE.ELL :
            //         module.drawingInfo.currentTab = module.TAB_OPTION.BACKGROUND;
            //         break;
            //     default: return;
            // }

            module.showPanel(type);
            module.addStageDrawEvent(type);

        },
        addStageDrawEvent : function(type) {

            module.Bookmark && module.Bookmark.stage.draggable(false);
            module.Bookmark && module.Bookmark.stage.off('mousedown.drawShape').on('mousedown.drawShape', function(e){

                if(null !== e.target.id() && "stage" !== e.target.name() && "ORI_IMAGE" !== e.target.id()) {
                    module.drawingMode = module.STATUS.EDITING;
                    return;
                }
                else {
                  module.drawingMode = module.STATUS.DRAWING;
                }
                var newShape = null;
                module.currentShape = null;
                switch(type) {
                    case module.Bookmark.SHAPE_TYPE.LIGHTPEN :
                        newShape = new Konva.Rect({
                            x: 0,
                            y: 0,
                            width: 0,
                            height: 0,
                            fill: module.drawingInfo.bgColor,//module.colorPicker.spectrum("get").toHexString(),
                            opacity : 0.75,
                            id : $.Common.getIRN(),
                            shapeType : module.Bookmark.SHAPE_TYPE.LIGHTPEN
                        });
                        break;
                    case module.Bookmark.SHAPE_TYPE.RECTANGLE :
                        newShape = new Konva.Group({
                            x: 0,
                            y: 0,
                            width: 0,
                            height: 0,
                            rotation: module.degree,
                            // draggable: true,
                            opacity : 0.7,
                            id : $.Common.getIRN(),
                            shapeType : module.Bookmark.SHAPE_TYPE.RECTANGLE,
                        });

                        var bg = new Konva.Rect({
                            fill: module.drawingInfo.bgColor != null ? module.drawingInfo.bgColor : type.DEFAULT_VALUES.BACKGROUND.COLOR,
                            // opacity : $.Common.getFloatOpacity(module.drawingInfo.opacity),
                            width: newShape.width(),
                            height: newShape.height(),
                            id:"background",
                        });
                        newShape.add(bg);

                        var line = new Konva.Rect({
                            stroke: module.drawingInfo.lineColor != null ? module.drawingInfo.lineColor : type.DEFAULT_VALUES.LINE.COLOR,
                            strokeWidth: module.drawingInfo.lineWidth != null ? module.drawingInfo.lineWidth : type.DEFAULT_VALUES.LINE.WIDTH,
                            width: newShape.width(),
                            height: newShape.height(),
                            id:"line",
                        });
                        newShape.add(line);

                        break;
                    case module.Bookmark.SHAPE_TYPE.ELLIPSE :
                        newShape = new Konva.Group({
                            x: 0,
                            y: 0,
                            width: 0,
                            height: 0,
                            rotation: module.degree,
                            // draggable: true,
                            opacity : 0.7,
                            id : $.Common.getIRN(),
                            shapeType : module.Bookmark.SHAPE_TYPE.ELLIPSE,
                        });

                        var bg = new Konva.Ellipse({
                            fill: module.drawingInfo.bgColor != null ? module.drawingInfo.bgColor : type.DEFAULT_VALUES.BACKGROUND.COLOR,
                            // opacity : $.Common.getFloatOpacity(module.drawingInfo.opacity),
                            width: newShape.width(),
                            height: newShape.height(),
                            id:"background",
                        });
                        newShape.add(bg);

                        var line = new Konva.Ellipse({
                            stroke: module.drawingInfo.lineColor != null ? module.drawingInfo.lineColor : type.DEFAULT_VALUES.LINE.COLOR,
                            strokeWidth: module.drawingInfo.lineWidth != null ? module.drawingInfo.lineWidth : type.DEFAULT_VALUES.LINE.WIDTH,
                            width: newShape.width(),
                            height: newShape.height(),
                            id:"line",
                        });
                        newShape.add(line);

                        break;
                    case module.Bookmark.SHAPE_TYPE.NOTEBOX :
                        newShape = new Konva.Group({
                            x: 0,
                            y: 0,
                            width: 0,
                            height: 0,
                            rotation: module.degree,
                            // draggable: true,
                            id : $.Common.getIRN(),
                            shapeType : module.Bookmark.SHAPE_TYPE.NOTEBOX,
                        });

                        var padding = 2;
                        var text = new Konva.Text({
                            fontFamily : type.DEFAULT_VALUES.FONT.FAMILY,
                            fontSize : module.drawingInfo.fontSize,
                            width: newShape.width(),
                            height: newShape.height(),
                            fill: module.drawingInfo.fontColor != null ? module.drawingInfo.fontColor : type.DEFAULT_VALUES.FONT.COLOR,
                            // strokeWidth: type.DEFAULT_VALUES.LINE.WIDTH,
                            text : type.DEFAULT_VALUES.FONT.TEXT,
                            padding:padding,
                            id:"text",
                            wrap: "word",// set minimum width of text
                            boundBoxFunc: function (oldBox, newBox) {
                                newBox.width = Math.max(30, newBox.width);
                                return newBox;
                            },
                        });
                        newShape.add(text);

                        var bg = new Konva.Rect({
                            fill: module.drawingInfo.bgColor != null ? module.drawingInfo.bgColor : type.DEFAULT_VALUES.BACKGROUND.COLOR,
                            opacity : $.Common.getFloatOpacity(module.drawingInfo.opacity),
                            width: newShape.width(),
                            height: newShape.height(),
                            id:"background",
                        });
                        newShape.add(bg);

                        var line = new Konva.Rect({
                            stroke: module.drawingInfo.lineColor != null ? module.drawingInfo.lineColor : type.DEFAULT_VALUES.LINE.COLOR,
                            strokeWidth: module.LINE_WIDTH,
                            width: newShape.width(),
                            height: newShape.height(),
                            id:"line",
                        });
                        newShape.add(line);
                        text.zIndex(2);
                        bg.zIndex(0);
                        line.zIndex(0);
                        break;
                    default: return;
                }

                module.drawingInfo.posStart = module.getRelativePointerPosition(module.Bookmark.stage);//{x: e.evt.layerX, y: e.evt.layerY};

                module.currentShape = newShape;
                module.currentShape.listening(false); // stop r2 catching our mouse events.
                module.shapeLayer.add(module.currentShape);
                module.shapeLayer.draw();
            })

            module.Bookmark && module.Bookmark.stage.off('mousemove.drawShape').on('mousemove.drawShape', function(e){
                if (module.drawingMode === module.STATUS.DRAWING) {

                    module.drawingInfo.posNow = module.getRelativePointerPosition(module.Bookmark.stage);//{x: e.evt.layerX, y: e.evt.layerY};
                    var posRect = module.checkMouseDragReverse(module.drawingInfo.posStart, module.drawingInfo.posNow);

                    var x = posRect.x1;
                    var y = posRect.y1;
                    var width = 0; //posRect.x2 - posRect.x1
                    var height = 0; //posRect.y2 - posRect.y1
                    switch(type) {
                        case module.Bookmark.SHAPE_TYPE.LIGHTPEN :
                            y = module.drawingInfo.posStart.y < module.drawingInfo.posNow.y ? posRect.y1 : posRect.y2;
                            width = posRect.x2 - posRect.x1;
                            height = module.drawingInfo.height;
                            break;
                        case module.Bookmark.SHAPE_TYPE.NOTEBOX :
                            width = posRect.x2 - posRect.x1;
                            height = posRect.y2 - posRect.y1;
                            break;
                        case module.Bookmark.SHAPE_TYPE.RECTANGLE :
                            width = posRect.x2 - posRect.x1;
                            height = posRect.y2 - posRect.y1;
                            break;
                        case module.Bookmark.SHAPE_TYPE.ELLIPSE :
                            width = posRect.x2 - posRect.x1;
                            height = posRect.y2 - posRect.y1;
                            x = x + width / 2;
                            y = y + height / 2;

                            break;
                        default: return;
                    }

                    module.currentShape.x(x);
                    module.currentShape.y(y);
                    module.currentShape.width(width);
                    module.currentShape.height(height);
                    if(module.currentShape.hasChildren()) {
                        $.map(module.currentShape.children, function(childShape){
                            childShape.width(width);
                            childShape.height(height);
                        });
                    }
                    module.shapeLayer.draw();
                }
            })

            module.Bookmark && module.Bookmark.stage.off('mouseup.drawShape').on('mouseup.drawShape', function(e){
                if (module.drawingMode === module.STATUS.DRAWING) {
                    // module.drawingMode = module.STATUS.IDLE;

                    if(module.currentShape.width() < module.minimumSize || module.currentShape.height() < module.minimumSize) {
                        $.Common.simpleToast(module.localMsg.ERR_TOO_SMALL);
                        module.currentShape.destroy();
                        module.Bookmark.stage.draw();
                        return;
                    }
                    else {
                        var item = module.Bookmark.addShape(module.currentShape);
                        $.when($.BookmarkOperation.execute($.BookmarkOperation.COMMAND.ADD_BOOKMARK, item)).then(function(res) {
                            $.Common.ShowProgress("#bookmarkProgress","","000000","0", 'rotation', 30);

                            var shape = module.getCurrentShape(item['MARK_IRN']);
                            shape.listening(true);
                            module.shapeLayer.draw()
                            module.addClickEvent(shape);

                            module.Bookmark.refreshThumbBookmark();
                        })
                        .fail(function (err){
                            var shape = module.getCurrentShape(item['MARK_IRN']);
                            module.Bookmark.items = $(module.Bookmark.items).filter(function() {
                                return this.MARK_IRN !== item['MARK_IRN'];
                            });
                            shape.destroy();
                            module.shapeLayer.draw()
                        })
                        .always(function(){
                            $.Common.RemoveProgress("#bookmarkProgress");
                        });
                    }


                }
            })
        },

        getCurrentShape : function(markIrn) {
          return module.Bookmark.stage.find("#"+markIrn)[0];
        },
        removeStageDrawEvent : function(){
            module.Bookmark && module.Bookmark.stage.draggable(true);
            module.currentShape = null;
            module.drawingMode = module.STATUS.IDLE;
            module.Bookmark && module.Bookmark.stage.off('mousedown.drawShape');
            module.Bookmark && module.Bookmark.stage.off('mousemove.drawShape');
            module.Bookmark && module.Bookmark.stage.off('mouseup.drawShape');
        },
        showPanel : function(type) {

            module.panelType = type;

            $("#drawPanel #panelTitle").empty();
            $("#tabTitle").empty();
            $("#options").empty();

            this.drawPanelContainer.find("#panelClose").unbind("click").bind("click", function(){
                module.deSelectAll();
            });

            module.drawingInfo.shapeType = type;
            var curShape = module.currentShape;

            var title = "";
            switch (type) {
                case module.Bookmark.SHAPE_TYPE.LIGHTPEN :
                    this.showToolbox(302);

                    title = module.localMsg.TITLE_LIGHTPEN_SETTING;

                    //set panel values
                    var sliderVal = type.DEFAULT_VALUES.BACKGROUND.HEIGHT;
                    var colorPickerVal = type.DEFAULT_VALUES.BACKGROUND.COLOR;


                    if(null !== curShape) {
                        sliderVal = Math.floor(curShape.height());
                        colorPickerVal = curShape.fill();
                    }

                    //set colorPicker options
                    module.colorPicker.spectrum("set", colorPickerVal);

                    module.drawingInfo.height = sliderVal;
                    module.drawingInfo.bgColor = colorPickerVal;

                    //add tab
                    module.addTabElement(module.localMsg.TAB_BG,"tabTitle").off("on").on("click", function(){
                        module.drawingInfo.currentTab = module.TAB_OPTION.BACKGROUND;
                        $(".tab_title_container").children().removeClass('focus');
                        $(this).addClass("focus");
                    }).trigger("click");

                    //add slider
                    var id = "heightRange";
                    module.addRangeSlider(id,
                        module.localMsg.PEN_HEIGHT,
                        sliderVal,
                        1,
                        100,
                        "options").off('change').on('change', function(){
                            var curVal = $(this).data("from");
                            module.drawingInfo.height = curVal;
                            //  module.currentShape.setHeight(data.from);
                            $("#"+id+"_val").html(curVal);
                            if(module.drawingMode === module.STATUS.EDITING && null !== module.currentShape) {
                                // switch (type) {
                                //     case module.Bookmark.SHAPE_TYPE.LIGHTPEN :
                                        module.currentShape.height(curVal);
                                        module.updateShapeMatrix(module.currentShape);
                                        // break;
                                    // default:
                                    //     break;
                                // }
                                module.shapeLayer.draw();
                            }
                        });
                    break;
                case module.Bookmark.SHAPE_TYPE.RECTANGLE :
                    this.showToolbox(302);

                    title = module.localMsg.TITLE_RECTANGLE_SETTING;

                    //set panel values
                    var lineWidth = type.DEFAULT_VALUES.LINE.WIDTH;
                    var colorPickerVal = type.DEFAULT_VALUES.BACKGROUND.COLOR;


                    if(null !== curShape) {
                        lineWidth = Math.floor(curShape.find("#line")[0].strokeWidth());
                        colorPickerVal = curShape.find("#background")[0].fill();
                    }

                    //set colorPicker options
                    module.colorPicker.spectrum("set", colorPickerVal);

                    module.drawingInfo.lineWidth = lineWidth;
                    module.drawingInfo.bgColor = colorPickerVal;

                    //add tab
                    module.addTabElement(module.localMsg.TAB_BG,"tabTitle").off("on").on("click", function(){
                        module.drawingInfo.currentTab = module.TAB_OPTION.BACKGROUND;
                        $(".tab_title_container").children().removeClass('focus');
                        $(this).addClass("focus");
                    }).trigger("click");
                    //add tab
                    module.addTabElement(module.localMsg.TAB_LINE,"tabTitle").off("on").on("click", function(){
                        module.drawingInfo.currentTab = module.TAB_OPTION.LINE;
                        $(".tab_title_container").children().removeClass('focus');
                        $(this).addClass("focus");
                    });
                    //add tab
                    var chk = module.addCheckBox(module.localMsg.NO_BACKGROUND,"tabTitle").off("change").on("change", function(){
                        if(this.checked) {
                            module.drawingInfo.background = 1;
                            module.currentShape.find("#background")[0].opacity(0);
                        }
                        else {
                            module.drawingInfo.background = 0;
                            module.currentShape.find("#background")[0].opacity(type.DEFAULT_VALUES.BACKGROUND.OPACITY);
                        }
                        module.shapeLayer.draw();
                        module.updateShapeValue(module.Bookmark.items, 'MARK_BACKGROUND', module.drawingInfo.background+"");
                        module.Bookmark.refreshThumbBookmark();
                    });


                    if(module.currentShape !== null && 0 === module.currentShape.find("#background")[0].opacity()) {
                        chk.prop('checked', true);
                    }

                    //add slider
                    var id = "lineRange";
                    module.addRangeSlider(id,
                        module.localMsg.LINE_WIDTH,
                        lineWidth,
                        1,
                        100,
                        "options").off('change').on('change', function(){
                        var curVal = $(this).data("from");
                        module.drawingInfo.lineWidth = curVal;
                        //  module.currentShape.setHeight(data.from);
                        $("#"+id+"_val").html(curVal);
                        if(module.drawingMode === module.STATUS.EDITING && null !== module.currentShape) {
                            module.currentShape.find("#line")[0].strokeWidth(curVal);
                            module.shapeLayer.draw();
                            module.updateShapeValue(module.Bookmark.items, 'MARK_LINEWIDTH', curVal);
                            module.Bookmark.refreshThumbBookmark();
                        }
                    });
                    break;
                case module.Bookmark.SHAPE_TYPE.ELLIPSE :
                    this.showToolbox(302);

                    title = module.localMsg.TITLE_ELLIPSE_SETTING;

                    //set panel values
                    var lineWidth = type.DEFAULT_VALUES.LINE.WIDTH;
                    var colorPickerVal = type.DEFAULT_VALUES.BACKGROUND.COLOR;


                    if(null !== curShape) {
                        lineWidth = Math.floor(curShape.find("#line")[0].strokeWidth());
                        colorPickerVal = curShape.find("#background")[0].fill();
                    }

                    //set colorPicker options
                    module.colorPicker.spectrum("set", colorPickerVal);

                    module.drawingInfo.lineWidth = lineWidth;
                    module.drawingInfo.bgColor = colorPickerVal;

                    //add tab
                    module.addTabElement(module.localMsg.TAB_BG,"tabTitle").off("on").on("click", function(){
                        module.drawingInfo.currentTab = module.TAB_OPTION.BACKGROUND;
                        $(".tab_title_container").children().removeClass('focus');
                        $(this).addClass("focus");
                    }).trigger("click");
                    //add tab
                    module.addTabElement(module.localMsg.TAB_LINE,"tabTitle").off("on").on("click", function(){
                        module.drawingInfo.currentTab = module.TAB_OPTION.LINE;
                        $(".tab_title_container").children().removeClass('focus');
                        $(this).addClass("focus");
                    });
                    //add tab
                    var chk = module.addCheckBox(module.localMsg.NO_BACKGROUND,"tabTitle").off("change").on("change", function(){
                        if(this.checked) {
                            module.drawingInfo.background = 1;
                            module.currentShape.find("#background")[0].opacity(0);
                        }
                        else {
                            module.drawingInfo.background = 0;
                            module.currentShape.find("#background")[0].opacity(type.DEFAULT_VALUES.BACKGROUND.OPACITY);
                        }
                        module.shapeLayer.draw();
                        module.updateShapeValue(module.Bookmark.items, 'MARK_BACKGROUND', module.drawingInfo.background+"");
                        module.Bookmark.refreshThumbBookmark();
                    });


                    if(module.currentShape !== null && 0 === module.currentShape.find("#background")[0].opacity()) {
                        chk.prop('checked', true);
                    }

                    //add slider
                    var id = "lineRange";
                    module.addRangeSlider(id,
                        module.localMsg.LINE_WIDTH,
                        lineWidth,
                        1,
                        100,
                        "options").off('change').on('change', function(){
                        var curVal = $(this).data("from");
                        module.drawingInfo.lineWidth = curVal;
                        //  module.currentShape.setHeight(data.from);
                        $("#"+id+"_val").html(curVal);
                        if(module.drawingMode === module.STATUS.EDITING && null !== module.currentShape) {
                            module.currentShape.find("#line")[0].strokeWidth(curVal);
                            module.shapeLayer.draw();
                            module.updateShapeValue(module.Bookmark.items, 'MARK_LINEWIDTH', curVal);
                            module.Bookmark.refreshThumbBookmark();
                        }
                    });
                    break;
                case module.Bookmark.SHAPE_TYPE.NOTEBOX :
                    this.showToolbox(338);

                    title = module.localMsg.TITLE_NOTEBOX_SETTING;
                    module.drawingInfo.currentTab = module.TAB_OPTION.BACKGROUND;

                    var opacityVal = type.DEFAULT_VALUES.BACKGROUND.OPACITY;
                    var fontSizeVal = type.DEFAULT_VALUES.FONT.SIZE;
                    var colorPickerVal = type.DEFAULT_VALUES.BACKGROUND.COLOR;

                    if(null !== curShape) {
                        colorPickerVal = curShape.find("#background")[0].fill();
                        opacityVal = $.Common.getRawOpacity(curShape.find("#background")[0].opacity());
                        fontSizeVal = curShape.find("#text")[0].fontSize();
                    }

                    //set colorPicker options
                    module.colorPicker.spectrum("set", colorPickerVal);

                    module.drawingInfo.opacity = opacityVal;
                    module.drawingInfo.fontSize = fontSizeVal;
                    module.drawingInfo.bgColor = colorPickerVal;

                    //add tab
                    module.addTabElement(module.localMsg.TAB_BG,"tabTitle").off("on").on("click", function(){
                        module.drawingInfo.currentTab = module.TAB_OPTION.BACKGROUND;
                        $(".tab_title_container").children().removeClass('focus');
                        $(this).addClass("focus");
                    }).trigger("click");

                    //add tab
                    module.addTabElement(module.localMsg.TAB_FONT,"tabTitle").off("on").on("click", function(){
                        module.drawingInfo.currentTab = module.TAB_OPTION.FONT;
                        $(".tab_title_container").children().removeClass('focus');
                        $(this).addClass("focus");
                    });

                    //add tab
                    module.addTabElement(module.localMsg.TAB_LINE,"tabTitle").off("on").on("click", function(){
                        module.drawingInfo.currentTab = module.TAB_OPTION.LINE;
                        $(".tab_title_container").children().removeClass('focus');
                        $(this).addClass("focus");
                    });

                    //add slider
                    var alphaId = "alphaRange";
                    module.addRangeSlider(alphaId,
                        module.localMsg.OPACITY,
                        opacityVal,
                        1,
                        255,
                        "options").off('change').on('change', function(){
                        var curVal = $(this).data("from");
                        module.drawingInfo.opacity = curVal;
                        //  module.currentShape.setHeight(data.from);
                        $("#"+alphaId+"_val").html(curVal);
                        if(module.drawingMode === module.STATUS.EDITING && null !== module.currentShape) {
                            // switch (type) {
                            //     case module.Bookmark.SHAPE_TYPE.LIGHTPEN :
                            module.currentShape.find("#background").opacity($.Common.getFloatOpacity(curVal));

                            module.shapeLayer.draw();
                            module.updateShapeValue(module.Bookmark.items, 'MARK_ALPHA', curVal);
                            module.Bookmark.refreshThumbBookmark();
                        }
                    });

                    //add slider
                    var fontId = "fontRange";
                    module.addRangeSlider(fontId,
                        module.localMsg.FONT_SIZE,
                        fontSizeVal,
                        1,
                        100,
                        "options").off('change').on('change', function(){
                        var curVal = $(this).data("from");
                        module.drawingInfo.fontSize = curVal;
                        //  module.currentShape.setHeight(data.from);
                        $("#"+fontId+"_val").html(curVal);
                        if(module.drawingMode === module.STATUS.EDITING && null !== module.currentShape) {
                            module.currentShape.find("#text").fontSize(curVal);
                            // module.shapeLayer.draw();
                            module.shapeLayer.draw();
                            module.updateShapeValue(module.Bookmark.items, 'MARK_FONTSIZE', curVal);
                            module.Bookmark.refreshThumbBookmark();
                        }
                    });


                    break;
                default : return;
            }

            //set panel title
            $("#drawPanel #panelTitle").html(title);
        },
        addCheckBox : function(title, targetId){
            var container = $("<div class='area_chk'></div>");
            container.appendTo("#"+targetId);

            var chkbox = $("<div class='area_cb'>" +
                "<label class='cb_container'>" +
                "<input type='checkbox' id='chk' />" +
                "<span class='checkbox'></span>" +
                "<div class='chk_title'>" + title + "</div>" +
                "</label>" +
                "</div>")
                .appendTo(container);
            return chkbox.find("#chk");
        },
        addRangeSlider : function(id, title, val, min, max, targetId) {
            $("<div class='container_option'>" +
                "<div class='option_title'>"+title+"</div>" +
                "<div class='container_contents'>" +
                "<div class='slider'><input type='range' id='"+id+"' data-rangeslider /></div>" +
                "<div class='slider_val' id='"+id+"_val'>"+val+"</div>" +
                "</div>" +
                "</div>")
                .appendTo("#"+targetId);

            return  $("#"+id).ionRangeSlider({
                    min:min,
                    max:max,
                    hide_min_max: true,
                    hide_from_to:true,
                    force_edges:true,
                    from:val});
        },
        addTabElement:function(title, targetId) {
            return $('<div class="tab_title">'+title+'</div>')
                // .on("click", function(){
                //     module.drawingInfo.currentTab = module.TAB_OPTION.BACKGROUND;
                // })
                .appendTo("#"+targetId);
        },

        getRelativePointerPosition : function(node) {
            // the function will return pointer position relative to the passed node
            var transform = node.getAbsoluteTransform().copy();
            // to detect relative position we need to invert transform
            transform.invert();

            // get pointer (say mouse or touch) position
            var pos = node.getStage().getPointerPosition();

            // now we find relative point
            return transform.point(pos);
        },
        toggleToolbox: function (willOpen) {
            if (willOpen === undefined) {
                if (this.isToolboxVisible) {
                    this.hideToolbox();
                } else {
                    this.showToolbox();
                }
            } else {
                if (willOpen) {
                    this.showToolbox();
                } else {
                    this.hideToolbox();
                }
            }
        },
        showToolbox: function (distance) {
            // var top = distance;
            $(".viewer_left .viewer_main").css("top", distance);
            $(".viewer_left #viewerInfo").hide();
            $(".viewer_left #drawPanel").show();
            $("#area_slip").getNiceScroll().resize();

            this.isToolboxVisible = true;
        },
        hideToolbox: function () {
            $(".viewer_left .viewer_main").css("top", "210px");
            $(".viewer_left #viewerInfo").show();
            $(".viewer_left #drawPanel").hide();
            $("#area_slip").getNiceScroll().resize();

            module.drawingInfo.shapeType = null,
            module.removeStageDrawEvent();
            module.drawingInfo.posNow = null;
            module.drawingInfo.posStart = null;

            this.isToolboxVisible = false;
        },
        addToolBtn: function () {
            $("#bookmarkBtnList").empty();
            var lightPen = $('<div class="icon-btn">' +
                                '<img src="'+g_RootURL+'image/pc/viewer/draw_pen.png" />' +
                            '</div>')
                            .on("click", function(){
                                module.drawShape(module.Bookmark.SHAPE_TYPE.LIGHTPEN);
                            })
                            .appendTo(this.btnContainer);

            var memo = $('<div class="icon-btn">' +
                            '<img src="'+g_RootURL+'image/pc/viewer/draw_memo.png" />' +
                        '</div>')
                        .on("click", function(){
                            module.drawShape(module.Bookmark.SHAPE_TYPE.NOTEBOX);
                        })
                        .appendTo(this.btnContainer);

            var rect = $('<div class="icon-btn">' +
                            '<img src="'+g_RootURL+'image/pc/viewer/draw_rect.png" />' +
                        '</div>')
                        .on("click", function(){
                            module.drawShape(module.Bookmark.SHAPE_TYPE.RECTANGLE);
                        })
                        .appendTo(this.btnContainer);

            var circle = $('<div class="icon-btn">' +
                            '<img src="'+g_RootURL+'image/pc/viewer/draw_circle.png" />' +
                        '</div>')
                        .on("click", function(){
                            module.drawShape(module.Bookmark.SHAPE_TYPE.ELLIPSE);
                        })
                        .appendTo(this.btnContainer);
        },
        checkMouseDragReverse : function(r1, r2){
            // reverse co-ords if user drags left / up

            var r1x = r1.x, r1y = r1.y, r2x = r2.x,  r2y = r2.y, d;
            if (r1x > r2x ){
                d = Math.abs(r1x - r2x);
                r1x = r2x; r2x = r1x + d;
            }
            if (r1y > r2y ){
                d = Math.abs(r1y - r2y);
                r1y = r2y; r2y = r1y + d;
            }
            return ({x1: r1x, y1: r1y, x2: r2x, y2: r2y}); // return the corrected rect.

        },
        removeCurrentShape : function() {
          var shape = module.currentShape;
          if(shape === null) return;

          if(true/*remove bookmark query*/) {
              // shape.destroy();


              shape.destroy();
              module.shapeLayer.draw();
              // module.Bookmark.removeShape(shape);
              module.Bookmark.items = $(module.Bookmark.items).filter(function() {
                  return this.MARK_IRN !== shape.id();
              });
              // module.Bookmark.items = $.Common.removeKey(module.Bookmark.items, shape.id());
              // module.shapeLayer.draw();
              module.deSelectAll();

              module.Bookmark.refreshThumbBookmark();
          }
          else {
              $.Common.simpleToast(this.localMsg.FAILED_REMOVE_BOOKMARK);
          }
        },
        reset : function (bookmark) {
            module.drawingMode = module.STATUS.IDLE;
            module.Bookmark = bookmark;
            this.hideToolbox();
            this.setStageEvents();
            this.setShapeEvents();
        },
        addModifyTextEvent:function(textNode) {
            textNode.on('dblclick', () => {
                // hide text node and transformer:
                textNode.hide();
                // tr.hide();
                module.shapeLayer.draw();

                // create textarea over canvas with absolute position
                // first we need to find position for textarea
                // how to find it?

                // at first lets find position of text node relative to the stage:
                var textPosition = textNode.absolutePosition();

                // then lets find position of stage container on the page:
                var stageBox = module.Bookmark.stage.container().getBoundingClientRect();

                // so position of textarea will be the sum of positions above:
                var areaPosition = {
                    x: stageBox.left + textPosition.x,
                    y: stageBox.top + textPosition.y,
                };

                // create textarea and style it
                var textarea = document.createElement('textarea');
                document.body.appendChild(textarea);

                // apply many styles to match text on canvas as close as possible
                // remember that text rendering on canvas and on the textarea can be different
                // and sometimes it is hard to make it 100% the same. But we will try...
                textarea.value = textNode.text();
                textarea.style.position = 'absolute';
                textarea.style.top = areaPosition.y + 'px';
                textarea.style.left = areaPosition.x + 'px';
                textarea.style.width = textNode.width() - textNode.padding() * 2 + 'px';
                textarea.style.height =
                    textNode.height() - textNode.padding() * 2 + 5 + 'px';
                textarea.style.fontSize = textNode.fontSize() + 'px';
                textarea.style.border = 'none';
                textarea.style.padding = '0px';
                textarea.style.margin = '0px';
                textarea.style.overflow = 'hidden';
                textarea.style.background = 'none';
                textarea.style.outline = 'none';
                textarea.style.resize = 'none';
                textarea.style.lineHeight = textNode.lineHeight();
                textarea.style.fontFamily = textNode.fontFamily();
                textarea.style.transformOrigin = 'left top';
                textarea.style.textAlign = textNode.align();
                textarea.style.color = textNode.fill();
                textarea.style.zIndex = 9999;
                rotation = textNode.rotation();
                var transform = '';
                if (rotation) {
                    transform += 'rotateZ(' + rotation + 'deg)';
                }

                var px = 0;
                // also we need to slightly move textarea on firefox
                // because it jumps a bit
                var isFirefox =
                    navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
                if (isFirefox) {
                    px += 2 + Math.round(textNode.fontSize() / 20);
                }
                transform += 'translateY(-' + px + 'px)';

                textarea.style.transform = transform;

                // reset height
                textarea.style.height = 'auto';
                // after browsers resized it we can set actual value
                textarea.style.height = textarea.scrollHeight + 3 + 'px';

                textarea.focus();

                function removeTextarea() {
                    textarea.parentNode.removeChild(textarea);
                    window.removeEventListener('click', handleOutsideClick);
                    textNode.show();
                    // tr.show();
                    // tr.forceUpdate();
                    module.shapeLayer.draw();
                }

                function setTextareaWidth(newWidth) {
                    if (!newWidth) {
                        // set width for placeholder
                        newWidth = textNode.placeholder.length * textNode.fontSize();
                    }
                    // some extra fixes on different browsers
                    var isSafari = /^((?!chrome|android).)*safari/i.test(
                        navigator.userAgent
                    );
                    var isFirefox =
                        navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
                    if (isSafari || isFirefox) {
                        newWidth = Math.ceil(newWidth);
                    }

                    var isEdge =
                        document.documentMode || /Edge/.test(navigator.userAgent);
                    if (isEdge) {
                        newWidth += 1;
                    }
                    textarea.style.width = newWidth + 'px';
                }

                textarea.addEventListener('keydown', function (e) {
                    // hide on enter
                    // but don't hide on shift + enter
                    if (e.keyCode === 13 && !e.shiftKey) {
                        textNode.text(textarea.value);
                        module.updateShapeValue(module.Bookmark.items, 'MARK_COMMENT', textarea.value);
                        module.Bookmark.refreshThumbBookmark();
                        removeTextarea();
                    }
                    // on esc do not set value back to node
                    if (e.keyCode === 27) {
                        removeTextarea();
                    }
                });

                textarea.addEventListener('keydown', function (e) {
                    scale = textNode.getAbsoluteScale().x;
                    setTextareaWidth(textNode.width() * scale);
                    textarea.style.height = 'auto';
                    textarea.style.height =
                        textarea.scrollHeight + textNode.fontSize() + 'px';
                });

                function handleOutsideClick(e) {
                    if (e.target !== textarea) {
                        textNode.text(textarea.value);
                        removeTextarea();
                    }
                }
                setTimeout(() => {
                    window.addEventListener('click', handleOutsideClick);
                });
            });
        },
    }
    return module;
}

$.BookmarkOperation = {
    COMMAND : {
        ADD_BOOKMARK : 1,
    },
    execute : function(cmd, params){
        var deferred = $.Deferred();

        switch (cmd) {
            case this.COMMAND.ADD_BOOKMARK : {
                deferred = $.BookmarkOperation.addBookmark(params);
            }
            break;
            default: break;
        }

        return deferred.promise();
    },
    addBookmark : function(params) {
        var deferred = $.Deferred();
        //Encoding
        params["MARK_COMMENT"] = encodeURIComponent(encodeURIComponent(params["MARK_COMMENT"]));
        $.when($.Common.RunCommand(g_BookmarkCommand, "ADD_BOOKMARK", params)).then(function(objRes) {

            deferred.resolve(objRes);

        }, function (reason) {
            deferred.reject(reason)
        });

        return deferred.promise();
    }
}