/*
==================================================
生活有解．心中有數｜共用計算紙
檔案：js/scratchpad.js

版本：4.0
全螢幕半透明書寫層版
==================================================

本版主要修改：

1. 計算紙改為全螢幕。
2. 開啟後鎖住後方網頁。
3. 關閉後恢復原本捲動位置。
4. 開啟／關閉同一題都保留計算內容。
5. 視窗旋轉或尺寸改變時保留內容。
6. 取消實際拖曳與縮放介面，
   但保留相容方法名稱。
7. 其他原有功能不變：
   - 畫筆
   - 橡皮擦
   - 顏色
   - 粗細
   - Undo
   - Redo
   - 清除
   - 下載
   - 快捷鍵
   - Pointer Events
   - 下一題自動清空
==================================================
*/


(function () {

  "use strict";


  class Scratchpad {


    constructor(
      options = {}
    ) {


      this.options =
        options;


      /*
      ==================================================
      元件 ID
      ==================================================
      */


      this.canvasId =
        options.canvasId ||
        "scratchpadCanvas";


      this.panelId =
        options.panelId ||
        "scratchpadPanel";


      this.headerId =
        options.headerId ||
        "scratchpadHeader";


      this.openButtonId =
        options.openButtonId ||
        "scratchpadOpenButton";


      this.closeButtonId =
        options.closeButtonId ||
        "scratchpadCloseButton";


      this.penButtonId =
        options.penButtonId ||
        "scratchpadPenButton";


      this.eraserButtonId =
        options.eraserButtonId ||
        "scratchpadEraserButton";


      this.undoButtonId =
        options.undoButtonId ||
        "scratchpadUndoButton";


      this.redoButtonId =
        options.redoButtonId ||
        "scratchpadRedoButton";


      this.clearButtonId =
        options.clearButtonId ||
        "scratchpadClearButton";


      this.downloadButtonId =
        options.downloadButtonId ||
        "scratchpadDownloadButton";


      /*
      ==================================================
      基本設定
      ==================================================
      */


      this.defaultColor =
        options.defaultColor ||
        "#111827";


      this.defaultSize =
        Number(
          options.defaultSize
        ) ||
        4;


      this.maxHistory =
        Number(
          options.maxHistory
        ) ||
        30;


      /*
      ==================================================
      DOM
      ==================================================
      */


      this.canvas =
        document.getElementById(
          this.canvasId
        );


      this.panel =
        document.getElementById(
          this.panelId
        );


      this.header =
        document.getElementById(
          this.headerId
        );


      this.openButton =
        document.getElementById(
          this.openButtonId
        );


      this.closeButton =
        document.getElementById(
          this.closeButtonId
        );


      this.penButton =
        document.getElementById(
          this.penButtonId
        );


      this.eraserButton =
        document.getElementById(
          this.eraserButtonId
        );


      this.undoButton =
        document.getElementById(
          this.undoButtonId
        );


      this.redoButton =
        document.getElementById(
          this.redoButtonId
        );


      this.clearButton =
        document.getElementById(
          this.clearButtonId
        );


      this.downloadButton =
        document.getElementById(
          this.downloadButtonId
        );


      this.toolbar =
        this.panel
          ?.querySelector(
            ".scratchpad-toolbar"
          ) ||
        null;


      this.colorButtons =
        this.panel
          ? Array.from(
              this.panel.querySelectorAll(
                "[data-scratchpad-color]"
              )
            )
          : [];


      this.sizeButtons =
        this.panel
          ? Array.from(
              this.panel.querySelectorAll(
                "[data-scratchpad-size]"
              )
            )
          : [];


      /*
      ==================================================
      Canvas
      ==================================================
      */


      this.ctx =
        null;


      this.tool =
        "pen";


      this.currentColor =
        this.defaultColor;


      this.currentSize =
        this.defaultSize;


      this.isDrawing =
        false;


      this.drawingPointerId =
        null;


      this.hasDrawnInCurrentStroke =
        false;


      this.lastX =
        0;


      this.lastY =
        0;


      /*
      ==================================================
      歷史
      ==================================================
      */


      this.undoStack =
        [];


      this.redoStack =
        [];


      /*
      同一題計算內容的目前圖片。

      開關計算紙、改變畫面尺寸時，
      都使用這張圖還原。
      */


      this.currentQuestionImage =
        null;


      this.isRestoringHistory =
        false;


      /*
      ==================================================
      視窗
      ==================================================
      */


      this.isOpen =
        false;


      this.isOpeningPanel =
        false;


      /*
      以下欄位保留，
      讓舊程式若有參照時不會出錯。

      全螢幕版不再真正拖曳。
      */


      this.isDraggingPanel =
        false;


      this.dragPointerId =
        null;


      this.dragOffsetX =
        0;


      this.dragOffsetY =
        0;


      this.savedPanelPosition =
        null;


      /*
      同理，保留舊縮放狀態欄位。
      */


      this.isResizingPanel =
        false;


      this.resizePointerId =
        null;


      this.resizeDirection =
        "";


      this.resizeHandles =
        [];


      /*
      ==================================================
      背景頁面鎖定
      ==================================================
      */


      this.savedBodyOverflow =
        "";


      this.savedHtmlOverflow =
        "";


      this.savedScrollX =
        0;


      this.savedScrollY =
        0;


      /*
      ==================================================
      其他
      ==================================================
      */


      this.eventCleanups =
        [];


      this.resizeTimer =
        null;


      this.isDestroyed =
        false;


      /*
      ==================================================
      驗證
      ==================================================
      */


      if (
        !this.canvas ||
        !this.panel
      ) {

        console.error(
          "Scratchpad 初始化失敗：找不到 Canvas 或面板。"
        );


        return;
      }


      this.ctx =
        this.canvas.getContext(
          "2d"
        );


      if (
        !this.ctx
      ) {

        console.error(
          "Scratchpad 初始化失敗：無法建立 Canvas 2D 繪圖環境。"
        );


        return;
      }


      this.initialize();

    }


    /*
    ==================================================
    初始化
    ==================================================
    */


    initialize() {


      this.initializeProtection();


      this.initializeDrawing();


      this.initializeToolbar();


      this.initializeWindow();


      this.initializeKeyboardShortcuts();


      /*
      舊版八方向縮放函式仍存在，
      但新版不建立控制點。
      */


      this.initializeResizeHandles();


      this.initializeResizeListener();


      /*
      面板初始 hidden，
      這裡先建立基本 Canvas 狀態。
      */


      this.setupCanvas(
        false
      );


      this.saveHistory(
        true
      );


      this.saveCurrentQuestionImage();


      this.updateToolbarState();

    }


    /*
    ==================================================
    共用事件管理
    ==================================================
    */


    addEvent(
      element,
      eventName,
      handler,
      options
    ) {


      if (
        !element
      ) {

        return;
      }


      element.addEventListener(
        eventName,
        handler,
        options
      );


      this.eventCleanups.push(
        () => {

          element.removeEventListener(
            eventName,
            handler,
            options
          );

        }
      );

    }


    /*
    ==================================================
    裝置
    ==================================================
    */


    isMobileView() {

      return (
        window.innerWidth <=
        768
      );

    }


    /*
    舊 API 保留。

    現在所有裝置固定全螢幕，
    不再使用自由縮放。
    */


    isDesktopResizeView() {

      return false;

    }


    getViewportMargin() {

      return 0;

    }


    getDefaultPanelSize() {

      return {

        width:
          window.innerWidth,

        height:
          window.innerHeight

      };

    }


    /*
    全螢幕由 CSS 決定，
    JS 不再寫入 px 尺寸。
    */


    applyResponsivePanelSize() {


      if (
        !this.panel
      ) {

        return;
      }


      this.panel.style.width =
        "";


      this.panel.style.height =
        "";


      this.panel.style.left =
        "";


      this.panel.style.top =
        "";


      this.panel.style.right =
        "";


      this.panel.style.bottom =
        "";

    }


    updateResponsiveMode() {

      this.applyResponsivePanelSize();

    }


    /*
    ==================================================
    Canvas 尺寸
    ==================================================
    */


    getPixelRatio() {

      return Math.max(
        1,
        window.devicePixelRatio ||
          1
      );

    }


    /*
    Canvas 重新建立尺寸。

    savedImageOverride：
    可指定重新建立後要畫回的圖片。

    preserveContent：
    若沒有指定圖片，就先抓目前 Canvas。
    */


    async setupCanvas(
      preserveContent = false,
      savedImageOverride = null
    ) {


      if (
        !this.canvas ||
        !this.ctx
      ) {

        return;
      }


      const rect =
        this.canvas
          .getBoundingClientRect();


      /*
      Panel 還沒真正顯示時，
      Canvas 可能是 0×0。
      不處理。
      */


      if (
        rect.width <= 0 ||
        rect.height <= 0
      ) {

        return;
      }


      let oldImage =
        savedImageOverride;


      if (
        !oldImage &&
        preserveContent &&
        this.canvas.width &&
        this.canvas.height
      ) {

        try {

          oldImage =
            this.canvas.toDataURL(
              "image/png"
            );

        } catch (_) {}

      }


      const ratio =
        this.getPixelRatio();


      this.canvas.width =
        Math.max(
          1,
          Math.round(
            rect.width *
            ratio
          )
        );


      this.canvas.height =
        Math.max(
          1,
          Math.round(
            rect.height *
            ratio
          )
        );


      this.ctx =
        this.canvas.getContext(
          "2d"
        );


      this.ctx.setTransform(
        ratio,
        0,
        0,
        ratio,
        0,
        0
      );


      this.ctx.lineCap =
        "round";


      this.ctx.lineJoin =
        "round";


      this.ctx.globalCompositeOperation =
        "source-over";


      if (
        oldImage
      ) {

        await this.drawImageToCanvas(
          oldImage
        );

      }

    }


    /*
    ==================================================
    將圖片還原到 Canvas
    ==================================================
    */


    drawImageToCanvas(
      imageData
    ) {


      return new Promise(
        (
          resolve,
          reject
        ) => {


          if (
            !imageData ||
            !this.canvas ||
            !this.ctx
          ) {

            resolve();

            return;
          }


          const image =
            new Image();


          image.onload =
            () => {


              if (
                !this.canvas ||
                !this.ctx
              ) {

                resolve();

                return;
              }


              this.isRestoringHistory =
                true;


              const width =
                this.canvas.width;


              const height =
                this.canvas.height;


              this.ctx.save();


              /*
              使用實際 Canvas pixel 座標還原。
              */


              this.ctx.setTransform(
                1,
                0,
                0,
                1,
                0,
                0
              );


              this.ctx.clearRect(
                0,
                0,
                width,
                height
              );


              /*
              將舊內容等比例延展至目前全螢幕畫布。

              這也是原本縮放視窗時
              保留內容的邏輯。
              */


              this.ctx.drawImage(
                image,
                0,
                0,
                width,
                height
              );


              this.ctx.restore();


              const ratio =
                this.getPixelRatio();


              this.ctx.setTransform(
                ratio,
                0,
                0,
                ratio,
                0,
                0
              );


              this.ctx.lineCap =
                "round";


              this.ctx.lineJoin =
                "round";


              this.ctx.globalCompositeOperation =
                "source-over";


              this.isRestoringHistory =
                false;


              resolve();

            };


          image.onerror =
            () => {


              this.isRestoringHistory =
                false;


              reject(
                new Error(
                  "無法還原計算紙內容。"
                )
              );

            };


          image.src =
            imageData;

        }
      );

    }


    /*
    ==================================================
    Canvas 尺寸改變時保留內容
    ==================================================
    */


    async resizeCanvasPreserveContent() {


      if (
        !this.canvas
      ) {

        return;
      }


      let saved =
        this.currentQuestionImage;


      /*
      如果目前 Canvas 有尺寸，
      優先保存最新內容。
      */


      if (
        this.canvas.width &&
        this.canvas.height
      ) {

        try {

          saved =
            this.canvas.toDataURL(
              "image/png"
            );

        } catch (_) {}

      }


      await this.setupCanvas(
        false,
        saved
      );


      this.saveCurrentQuestionImage();


      this.updateToolbarState();

    }


    /*
    ==================================================
    保存本題內容
    ==================================================
    */


    saveCurrentQuestionImage() {


      if (
        !this.canvas ||
        !this.canvas.width ||
        !this.canvas.height
      ) {

        return;
      }


      try {

        this.currentQuestionImage =
          this.canvas.toDataURL(
            "image/png"
          );

      } catch (
        error
      ) {

        console.warn(
          "計算紙內容保存失敗：",
          error
        );

      }

    }


    /*
    ==================================================
    還原本題內容
    ==================================================
    */


    async restoreCurrentQuestionImage() {


      if (
        !this.currentQuestionImage
      ) {

        return;
      }


      try {

        await this.drawImageToCanvas(
          this.currentQuestionImage
        );

      } catch (
        error
      ) {

        console.warn(
          "計算紙內容還原失敗：",
          error
        );

      }

    }


    /*
    ==================================================
    畫筆事件
    ==================================================
    */


    initializeDrawing() {


      this.addEvent(
        this.canvas,
        "pointerdown",
        (
          event
        ) =>
          this.startDrawing(
            event
          )
      );


      this.addEvent(
        this.canvas,
        "pointermove",
        (
          event
        ) =>
          this.draw(
            event
          )
      );


      this.addEvent(
        this.canvas,
        "pointerup",
        (
          event
        ) =>
          this.stopDrawing(
            event
          )
      );


      this.addEvent(
        this.canvas,
        "pointercancel",
        (
          event
        ) =>
          this.stopDrawing(
            event
          )
      );


      this.addEvent(
        this.canvas,
        "pointerleave",
        (
          event
        ) => {

          /*
          有 pointer capture 時，
          pointerleave 不代表書寫結束。
          因此不主動停止。
          */

          if (
            !this.canvas
              ?.hasPointerCapture
              ?.(event.pointerId)
          ) {

            this.stopDrawing(
              event
            );

          }

        }
      );


      this.addEvent(
        this.canvas,
        "contextmenu",
        (
          event
        ) =>
          event.preventDefault()
      );

    }


    /*
    ==================================================
    Pointer 座標
    ==================================================
    */


    getPointerPosition(
      event
    ) {


      const rect =
        this.canvas
          .getBoundingClientRect();


      return {

        x:
          event.clientX -
          rect.left,

        y:
          event.clientY -
          rect.top

      };

    }


    /*
    ==================================================
    開始書寫
    ==================================================
    */


    startDrawing(
      event
    ) {


      if (
        !this.isOpen
      ) {

        return;
      }


      if (
        event.pointerType ===
          "mouse" &&
        event.button !==
          0
      ) {

        return;
      }


      event.preventDefault();


      event.stopPropagation();


      this.isDrawing =
        true;


      this.drawingPointerId =
        event.pointerId;


      this.hasDrawnInCurrentStroke =
        false;


      try {

        this.canvas
          .setPointerCapture(
            event.pointerId
          );

      } catch (_) {}


      const point =
        this.getPointerPosition(
          event
        );


      this.lastX =
        point.x;


      this.lastY =
        point.y;


      this.canvas.classList.add(
        "scratchpad-canvas--drawing"
      );

    }


    /*
    ==================================================
    書寫
    ==================================================
    */


    draw(
      event
    ) {


      if (
        !this.isDrawing ||
        event.pointerId !==
          this.drawingPointerId ||
        !this.ctx
      ) {

        return;
      }


      event.preventDefault();


      event.stopPropagation();


      const point =
        this.getPointerPosition(
          event
        );


      this.ctx.beginPath();


      this.ctx.lineCap =
        "round";


      this.ctx.lineJoin =
        "round";


      if (
        this.tool ===
        "eraser"
      ) {


        this.ctx.globalCompositeOperation =
          "destination-out";


        this.ctx.strokeStyle =
          "rgba(0,0,0,1)";


        this.ctx.lineWidth =
          Math.max(
            this.currentSize *
              4,
            16
          );


      } else {


        this.ctx.globalCompositeOperation =
          "source-over";


        this.ctx.strokeStyle =
          this.currentColor;


        this.ctx.lineWidth =
          this.currentSize;

      }


      this.ctx.moveTo(
        this.lastX,
        this.lastY
      );


      this.ctx.lineTo(
        point.x,
        point.y
      );


      this.ctx.stroke();


      this.lastX =
        point.x;


      this.lastY =
        point.y;


      this.hasDrawnInCurrentStroke =
        true;

    }


    /*
    ==================================================
    結束書寫
    ==================================================
    */


    stopDrawing(
      event
    ) {


      if (
        !this.isDrawing
      ) {

        return;
      }


      if (
        event &&
        this.drawingPointerId !==
          null &&
        event.pointerId !==
          this.drawingPointerId
      ) {

        return;
      }


      this.isDrawing =
        false;


      this.canvas
        ?.classList.remove(
          "scratchpad-canvas--drawing"
        );


      if (
        this.ctx
      ) {


        this.ctx.closePath();


        this.ctx.globalCompositeOperation =
          "source-over";

      }


      if (
        event &&
        this.canvas
          ?.hasPointerCapture
          ?.(event.pointerId)
      ) {

        try {

          this.canvas
            .releasePointerCapture(
              event.pointerId
            );

        } catch (_) {}

      }


      this.drawingPointerId =
        null;


      /*
      每一筆完成後立即保存。

      因此即使立刻關閉計算紙，
      本題內容仍存在。
      */


      if (
        this.hasDrawnInCurrentStroke
      ) {


        this.saveHistory();


        this.saveCurrentQuestionImage();

      }


      this.hasDrawnInCurrentStroke =
        false;


      this.updateToolbarState();

    }


    /*
    ==================================================
    歷史快照
    ==================================================
    */


    getSnapshot() {


      if (
        !this.canvas ||
        !this.canvas.width ||
        !this.canvas.height
      ) {

        return null;
      }


      try {

        return this.canvas.toDataURL(
          "image/png"
        );

      } catch (_) {

        return null;

      }

    }


    /*
    ==================================================
    保存歷史
    ==================================================
    */


    saveHistory(
      force = false
    ) {


      if (
        !this.canvas ||
        this.isRestoringHistory
      ) {

        return;
      }


      const snapshot =
        this.getSnapshot();


      if (
        !snapshot
      ) {

        return;
      }


      if (
        !force &&
        this.undoStack[
          this.undoStack.length -
            1
        ] ===
        snapshot
      ) {

        return;
      }


      this.undoStack.push(
        snapshot
      );


      if (
        this.undoStack.length >
        this.maxHistory
      ) {

        this.undoStack.shift();

      }


      this.redoStack =
        [];


      this.updateToolbarState();

    }


    canUndo() {

      return (
        this.undoStack.length >
        1
      );

    }


    canRedo() {

      return (
        this.redoStack.length >
        0
      );

    }


    /*
    ==================================================
    Undo
    ==================================================
    */


    async undo() {


      if (
        !this.canUndo()
      ) {

        return;
      }


      const current =
        this.undoStack.pop();


      this.redoStack.push(
        current
      );


      const target =
        this.undoStack[
          this.undoStack.length -
            1
        ];


      await this.drawImageToCanvas(
        target
      );


      this.saveCurrentQuestionImage();


      this.updateToolbarState();

    }


    /*
    ==================================================
    Redo
    ==================================================
    */


    async redo() {


      if (
        !this.canRedo()
      ) {

        return;
      }


      const target =
        this.redoStack.pop();


      this.undoStack.push(
        target
      );


      await this.drawImageToCanvas(
        target
      );


      this.saveCurrentQuestionImage();


      this.updateToolbarState();

    }


    /*
    ==================================================
    是否空白
    ==================================================
    */


    isBlank() {


      if (
        !this.canvas ||
        !this.ctx ||
        !this.canvas.width ||
        !this.canvas.height
      ) {

        return true;
      }


      try {


        const pixels =
          this.ctx.getImageData(
            0,
            0,
            this.canvas.width,
            this.canvas.height
          ).data;


        for (
          let i =
            3;

          i <
            pixels.length;

          i +=
            4
        ) {


          if (
            pixels[i] !==
            0
          ) {

            return false;
          }

        }


      } catch (_) {


        /*
        部分瀏覽器或極端情況讀不到像素，
        不應誤判成空白。
        */


        return false;

      }


      return true;

    }


    /*
    ==================================================
    清除
    ==================================================
    */


    clear(
      saveToHistory = true
    ) {


      if (
        !this.canvas ||
        !this.ctx
      ) {

        return;
      }


      this.ctx.save();


      this.ctx.setTransform(
        1,
        0,
        0,
        1,
        0,
        0
      );


      this.ctx.clearRect(
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );


      this.ctx.restore();


      const ratio =
        this.getPixelRatio();


      this.ctx.setTransform(
        ratio,
        0,
        0,
        ratio,
        0,
        0
      );


      this.ctx.lineCap =
        "round";


      this.ctx.lineJoin =
        "round";


      this.ctx.globalCompositeOperation =
        "source-over";


      if (
        saveToHistory
      ) {

        this.saveHistory();

      }


      this.saveCurrentQuestionImage();


      this.updateToolbarState();

    }


    /*
    ==================================================
    新題目
    ==================================================

    這是唯一的「遊戲自動清除」入口。

    開啟、關閉、答題、顯示詳解
    都不會呼叫此函式。

    遊戲真正顯示下一題時才會：

    window.resetGameScratchpad()

    → mathScratchpad.newQuestion()
    */


    newQuestion() {


      this.clear(
        false
      );


      this.undoStack =
        [];


      this.redoStack =
        [];


      /*
      保留原本工具設定邏輯：
      新題目使用畫筆。
      */


      this.tool =
        "pen";


      this.currentColor =
        this.defaultColor;


      this.currentSize =
        this.defaultSize;


      this.saveHistory(
        true
      );


      this.saveCurrentQuestionImage();


      this.updateToolbarState();

    }


    /*
    ==================================================
    工具列初始化
    ==================================================
    */


    initializeToolbar() {


      this.colorButtons =
        this.panel
          ? Array.from(
              this.panel.querySelectorAll(
                "[data-scratchpad-color]"
              )
            )
          : [];


      this.sizeButtons =
        this.panel
          ? Array.from(
              this.panel.querySelectorAll(
                "[data-scratchpad-size]"
              )
            )
          : [];


      this.addEvent(
        this.penButton,
        "click",
        () =>
          this.setTool(
            "pen"
          )
      );


      this.addEvent(
        this.eraserButton,
        "click",
        () =>
          this.setTool(
            "eraser"
          )
      );


      this.addEvent(
        this.undoButton,
        "click",
        () =>
          this.undo()
      );


      this.addEvent(
        this.redoButton,
        "click",
        () =>
          this.redo()
      );


      /*
      手動清除仍維持原本功能。
      */


      this.addEvent(
        this.clearButton,
        "click",
        () =>
          this.clear(
            true
          )
      );


      this.addEvent(
        this.downloadButton,
        "click",
        () =>
          this.downloadImage()
      );


      this.colorButtons.forEach(
        (
          button
        ) => {


          this.addEvent(
            button,
            "click",
            () => {


              this.setColor(
                button.dataset
                  .scratchpadColor ||
                  this.defaultColor
              );

            }
          );

        }
      );


      this.sizeButtons.forEach(
        (
          button
        ) => {


          this.addEvent(
            button,
            "click",
            () => {


              this.setSize(
                Number(
                  button.dataset
                    .scratchpadSize
                ) ||
                  this.defaultSize
              );

            }
          );

        }
      );


      this.updateToolbarState();

    }


    /*
    ==================================================
    工具設定
    ==================================================
    */


    setTool(
      tool
    ) {


      this.tool =
        tool ===
        "eraser"

          ? "eraser"

          : "pen";


      this.updateToolbarState();

    }


    setColor(
      color
    ) {


      this.currentColor =
        color ||
        this.defaultColor;


      /*
      點顏色時自動切回畫筆。
      */


      this.tool =
        "pen";


      this.updateToolbarState();

    }


    setSize(
      size
    ) {


      this.currentSize =
        Math.max(
          1,
          Number(
            size
          ) ||
            this.defaultSize
        );


      this.updateToolbarState();

    }


    /*
    ==================================================
    工具列狀態
    ==================================================
    */


    updateToolbarState() {


      if (
        this.penButton
      ) {


        const active =
          this.tool ===
          "pen";


        this.penButton
          .classList.toggle(
            "scratchpad-tool-button--active",
            active
          );


        this.penButton
          .setAttribute(
            "aria-pressed",
            String(
              active
            )
          );

      }


      if (
        this.eraserButton
      ) {


        const active =
          this.tool ===
          "eraser";


        this.eraserButton
          .classList.toggle(
            "scratchpad-tool-button--active",
            active
          );


        this.eraserButton
          .setAttribute(
            "aria-pressed",
            String(
              active
            )
          );

      }


      this.colorButtons.forEach(
        (
          button
        ) => {


          const active =
            this.tool ===
              "pen" &&
            button.dataset
              .scratchpadColor ===
              this.currentColor;


          button.classList.toggle(
            "scratchpad-tool-button--active",
            active
          );


          button.setAttribute(
            "aria-pressed",
            String(
              active
            )
          );

        }
      );


      this.sizeButtons.forEach(
        (
          button
        ) => {


          const active =
            Number(
              button.dataset
                .scratchpadSize
            ) ===
            Number(
              this.currentSize
            );


          button.classList.toggle(
            "scratchpad-tool-button--active",
            active
          );


          button.setAttribute(
            "aria-pressed",
            String(
              active
            )
          );

        }
      );


      if (
        this.canvas
      ) {


        this.canvas
          .classList.toggle(
            "scratchpad-canvas--eraser",
            this.tool ===
              "eraser"
          );

      }


      if (
        this.undoButton
      ) {

        this.undoButton.disabled =
          !this.canUndo();

      }


      if (
        this.redoButton
      ) {

        this.redoButton.disabled =
          !this.canRedo();

      }


      const blank =
        this.isBlank();


      if (
        this.clearButton
      ) {

        this.clearButton.disabled =
          blank;

      }


      if (
        this.downloadButton
      ) {

        this.downloadButton.disabled =
          blank;

      }

    }


    /*
    ==================================================
    長按／選取／右鍵保護
    ==================================================
    */


    initializeProtection() {


      this.addEvent(
        this.panel,
        "contextmenu",
        (
          event
        ) => {

          event.preventDefault();

        }
      );


      if (
        !this.panel
      ) {

        return;
      }


      this.panel
        .querySelectorAll(
          "button, input, select, textarea, a"
        )
        .forEach(
          (
            control
          ) => {


            this.addEvent(
              control,
              "pointerdown",
              (
                event
              ) => {


                event.stopPropagation();


                if (
                  event.pointerType ===
                    "mouse" &&
                  event.button !==
                    0
                ) {

                  event.preventDefault();

                }

              }
            );


            this.addEvent(
              control,
              "contextmenu",
              (
                event
              ) => {


                event.preventDefault();


                event.stopPropagation();

              }
            );


            this.addEvent(
              control,
              "dragstart",
              (
                event
              ) =>
                event.preventDefault()
            );


            this.addEvent(
              control,
              "selectstart",
              (
                event
              ) =>
                event.preventDefault()
            );

          }
        );

    }


    /*
    ==================================================
    視窗開關
    ==================================================
    */


    initializeWindow() {


      this.addEvent(
        this.openButton,
        "click",
        () =>
          this.open()
      );


      this.addEvent(
        this.closeButton,
        "click",
        () =>
          this.close()
      );


      /*
      不再綁定 panel 拖曳事件。
      全螢幕面板固定不動。
      */


      this.applyResponsivePanelSize();

    }


    /*
    ==================================================
    鎖定背景
    ==================================================
    */


    lockBackgroundPage() {


      if (
        document.documentElement
          .classList.contains(
            "scratchpad-page-locked"
          )
      ) {

        return;
      }


      this.savedScrollX =
        window.scrollX ||
        window.pageXOffset ||
        0;


      this.savedScrollY =
        window.scrollY ||
        window.pageYOffset ||
        0;


      this.savedBodyOverflow =
        document.body
          .style
          .overflow;


      this.savedHtmlOverflow =
        document.documentElement
          .style
          .overflow;


      document.documentElement
        .classList.add(
          "scratchpad-page-locked"
        );


      document.body
        .classList.add(
          "scratchpad-page-locked"
        );

    }


    /*
    ==================================================
    解鎖背景
    ==================================================
    */


    unlockBackgroundPage() {


      document.documentElement
        .classList.remove(
          "scratchpad-page-locked"
        );


      document.body
        .classList.remove(
          "scratchpad-page-locked"
        );


      /*
      回到原本題目的同一個捲動位置。
      */


      requestAnimationFrame(
        () => {


          window.scrollTo(
            this.savedScrollX,
            this.savedScrollY
          );

        }
      );

    }


    /*
    ==================================================
    開啟
    ==================================================
    */


    async open() {


      if (
        !this.panel ||
        this.isOpen
      ) {

        return;
      }


      /*
      非常重要：

      開啟前先保存目前本題內容。

      即使上一秒計算紙剛關閉，
      重新開啟也不會遺失。
      */


      if (
        this.canvas.width &&
        this.canvas.height
      ) {

        this.saveCurrentQuestionImage();

      }


      this.isOpen =
        true;


      this.isOpeningPanel =
        true;


      this.lockBackgroundPage();


      this.panel.hidden =
        false;


      this.panel.classList.add(
        "scratchpad-panel--open",
        "scratchpad-panel--fullscreen"
      );


      this.panel.setAttribute(
        "aria-modal",
        "true"
      );


      if (
        this.openButton
      ) {

        this.openButton.setAttribute(
          "aria-expanded",
          "true"
        );

      }


      /*
      等瀏覽器把 full-screen layout 算完，
      再依新尺寸建立 Canvas。

      使用 currentQuestionImage 還原本題筆跡。
      */


      requestAnimationFrame(
        () => {


          requestAnimationFrame(
            async () => {


              try {


                const saved =
                  this.currentQuestionImage;


                await this.setupCanvas(
                  false,
                  saved
                );


                /*
                如果是最初完全沒有歷史，
                建立空白歷史狀態。
                */


                if (
                  this.undoStack.length ===
                  0
                ) {

                  this.saveHistory(
                    true
                  );

                }


                this.saveCurrentQuestionImage();


                this.updateToolbarState();


              } catch (
                error
              ) {


                console.error(
                  "計算紙開啟失敗：",
                  error
                );


              } finally {


                this.isOpeningPanel =
                  false;

              }


              /*
              讓 Canvas 可以立即接收 Pencil。
              */


              try {

                this.canvas.focus(
                  {
                    preventScroll:
                      true
                  }
                );

              } catch (_) {}

            }
          );

        }
      );


      this.panel.dispatchEvent(
        new CustomEvent(
          "scratchpadopen",
          {

            detail: {

              isOpen:
                true,

              isMobile:
                this.isMobileView(),

              fullscreen:
                true

            }

          }
        )
      );

    }


    /*
    ==================================================
    關閉
    ==================================================
    */


    close() {


      if (
        !this.panel ||
        !this.isOpen
      ) {

        return;
      }


      /*
      關閉之前一定保存。

      這就是：
      關閉再開啟同一題
      絕不清掉計算過程。
      */


      this.saveCurrentQuestionImage();


      this.isDrawing =
        false;


      this.drawingPointerId =
        null;


      this.isOpen =
        false;


      this.isOpeningPanel =
        false;


      this.panel.classList.remove(
        "scratchpad-panel--open",
        "scratchpad-panel--fullscreen"
      );


      this.panel.hidden =
        true;


      this.panel.setAttribute(
        "aria-modal",
        "false"
      );


      if (
        this.openButton
      ) {

        this.openButton.setAttribute(
          "aria-expanded",
          "false"
        );

      }


      this.unlockBackgroundPage();


      this.panel.dispatchEvent(
        new CustomEvent(
          "scratchpadclose",
          {

            detail: {

              isOpen:
                false,

              isMobile:
                this.isMobileView(),

              fullscreen:
                true

            }

          }
        )
      );

    }


    /*
    ==================================================
    切換開關
    ==================================================
    */


    toggle() {


      if (
        this.isOpen
      ) {

        this.close();

      } else {

        this.open();

      }

    }


    /*
    ==================================================
    舊版拖曳 API 相容
    ==================================================

    滿版版不執行拖曳，
    但保留函式名稱，
    避免舊程式呼叫時發生錯誤。
    */


    initializePanelDragging() {}


    startPanelDrag() {}


    dragPanel() {}


    stopPanelDrag() {}


    keepPanelInsideViewport() {}


    /*
    ==================================================
    舊版八方向縮放 API 相容
    ==================================================
    */


    initializeResizeHandles() {


      /*
      若舊頁面已有 resize handle，
      直接移除。
      */


      this.panel
        ?.querySelectorAll(
          ".scratchpad-resize-handle"
        )
        .forEach(
          (
            handle
          ) =>
            handle.remove()
        );


      this.resizeHandles =
        [];

    }


    initializeEightDirectionResize() {


      /*
      相容舊呼叫。
      */


      this.initializeResizeHandles();

    }


    startEightDirectionResize() {}


    resizeEightDirection() {}


    stopEightDirectionResize() {}


    /*
    ==================================================
    視窗尺寸／旋轉
    ==================================================
    */


    initializeResizeListener() {


      const handler =
        () => {


          clearTimeout(
            this.resizeTimer
          );


          this.resizeTimer =
            setTimeout(
              async () => {


                if (
                  !this.isOpen
                ) {

                  return;
                }


                try {


                  /*
                  iPad 旋轉、
                  手機方向改變、
                  瀏覽器尺寸變化時，
                  重新建立 Canvas，
                  並完整保留目前內容。
                  */


                  this.saveCurrentQuestionImage();


                  await this
                    .resizeCanvasPreserveContent();


                } catch (
                  error
                ) {


                  console.warn(
                    "計算紙重新調整尺寸失敗：",
                    error
                  );

                }

              },
              140
            );

        };


      this.addEvent(
        window,
        "resize",
        handler
      );


      this.addEvent(
        window,
        "orientationchange",
        handler
      );


      /*
      iPad Safari 使用 visualViewport
      時也監聽。
      */


      if (
        window.visualViewport
      ) {


        this.addEvent(
          window.visualViewport,
          "resize",
          handler
        );

      }

    }


    /*
    ==================================================
    鍵盤快捷鍵
    ==================================================
    */


    initializeKeyboardShortcuts() {


      this.addEvent(
        window,
        "keydown",
        (
          event
        ) =>
          this.handleKeyboardShortcut(
            event
          )
      );

    }


    handleKeyboardShortcut(
      event
    ) {


      if (
        !this.isOpen
      ) {

        return;
      }


      const activeElement =
        document.activeElement;


      const isTyping =
        activeElement &&
        (
          activeElement.tagName ===
            "INPUT" ||
          activeElement.tagName ===
            "TEXTAREA" ||
          activeElement.isContentEditable
        );


      if (
        isTyping
      ) {

        return;
      }


      const commandKey =
        event.ctrlKey ||
        event.metaKey;


      /*
      Ctrl / Cmd + Z
      */


      if (
        commandKey &&
        !event.shiftKey &&
        event.key.toLowerCase() ===
          "z"
      ) {


        event.preventDefault();


        this.undo();


        return;

      }


      /*
      Ctrl / Cmd + Y
      */


      if (
        commandKey &&
        event.key.toLowerCase() ===
          "y"
      ) {


        event.preventDefault();


        this.redo();


        return;

      }


      /*
      Ctrl / Cmd + Shift + Z
      */


      if (
        commandKey &&
        event.shiftKey &&
        event.key.toLowerCase() ===
          "z"
      ) {


        event.preventDefault();


        this.redo();


        return;

      }


      /*
      Delete 保留原版功能：
      清除計算紙。
      */


      if (
        event.key ===
          "Delete"
      ) {


        event.preventDefault();


        this.clear(
          true
        );


        return;

      }


      /*
      Escape 關閉。
      */


      if (
        event.key ===
          "Escape"
      ) {


        event.preventDefault();


        this.close();

      }

    }


    /*
    ==================================================
    下載
    ==================================================
    */


    createDownloadFilename() {


      const now =
        new Date();


      const pad =
        (
          value
        ) =>
          String(
            value
          )
            .padStart(
              2,
              "0"
            );


      return (

        "math-scratchpad-" +

        `${now.getFullYear()}-` +

        `${pad(
          now.getMonth() +
            1
        )}-` +

        `${pad(
          now.getDate()
        )}-` +

        `${pad(
          now.getHours()
        )}` +

        `${pad(
          now.getMinutes()
        )}.png`

      );

    }


    downloadImage(
      filename =
        this.createDownloadFilename()
    ) {


      if (
        !this.canvas ||
        this.isBlank()
      ) {

        return false;
      }


      if (
        !filename
          .toLowerCase()
          .endsWith(
            ".png"
          )
      ) {

        filename +=
          ".png";

      }


      const link =
        document.createElement(
          "a"
        );


      link.href =
        this.canvas.toDataURL(
          "image/png"
        );


      link.download =
        filename;


      document.body.appendChild(
        link
      );


      link.click();


      link.remove();


      return true;

    }


    /*
    ==================================================
    圖片資料
    ==================================================
    */


    getImageDataURL(
      type =
        "image/png",
      quality
    ) {


      if (
        !this.canvas
      ) {

        return null;
      }


      try {


        return this.canvas.toDataURL(
          type,
          quality
        );


      } catch (_) {


        return null;

      }

    }


    /*
    ==================================================
    狀態
    ==================================================
    */


    getState() {


      return {

        tool:
          this.tool,

        color:
          this.currentColor,

        size:
          this.currentSize,

        isOpen:
          this.isOpen,

        isBlank:
          this.isBlank(),

        canUndo:
          this.canUndo(),

        canRedo:
          this.canRedo(),

        /*
        全螢幕模式沒有浮動位置，
        但保留欄位供舊程式使用。
        */

        position:
          null,

        fullscreen:
          true

      };

    }


    getFullState() {


      return {

        ...this.getState(),

        canvasWidth:
          this.canvas
            ?.width ||
          0,

        canvasHeight:
          this.canvas
            ?.height ||
          0,

        undoCount:
          Math.max(
            this.undoStack.length -
              1,
            0
          ),

        redoCount:
          this.redoStack.length

      };

    }


    exportData() {


      return {

        version:
          "4.0",

        createdAt:
          new Date()
            .toISOString(),

        image:
          this.getImageDataURL(
            "image/png"
          ),

        state:
          this.getFullState()

      };

    }


    isReady() {


      return Boolean(

        !this.isDestroyed &&

        this.canvas &&

        this.ctx

      );

    }


    /*
    ==================================================
    銷毀
    ==================================================
    */


    destroy() {


      /*
      先保留目前內容，
      再關閉背景鎖定。
      */


      if (
        this.canvas
      ) {

        this.saveCurrentQuestionImage();

      }


      if (
        this.isOpen
      ) {

        this.close();

      }


      this.eventCleanups.forEach(
        (
          cleanup
        ) => {


          try {

            cleanup();

          } catch (_) {}

        }
      );


      this.eventCleanups =
        [];


      this.resizeHandles
        .forEach(
          (
            handle
          ) =>
            handle.remove()
        );


      this.resizeHandles =
        [];


      clearTimeout(
        this.resizeTimer
      );


      this.isDestroyed =
        true;


      this.ctx =
        null;


      this.canvas =
        null;


      this.panel =
        null;


      this.header =
        null;


      this.toolbar =
        null;


      this.openButton =
        null;


      this.closeButton =
        null;

    }

  }


  /*
  ==================================================
  公開
  ==================================================
  */


  window.Scratchpad =
    Scratchpad;


  window.createScratchpad =
    function (
      options = {}
    ) {


      return new Scratchpad(
        options
      );

    };


})();
