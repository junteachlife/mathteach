/*
==================================================
生活有解．心中有數｜共用計算紙
檔案：js/scratchpad.js

版本：4.2
手機／平板書寫平滑化版
==================================================

本版修正：

1. 全螢幕模式維持不變。
2. 背景鎖定維持不變。
3. 開關同一題內容保留。
4. 下一題才清除。
5. 畫筆、橡皮擦、顏色、粗細不變。
6. Undo / Redo 不變。
7. 清除不變。
8. 下載功能維持白底＋淡方格＋筆跡。
9. 手機／平板書寫平滑化：
   - 支援 getCoalescedEvents() 高密度觸控取樣。
   - 使用二次貝茲曲線平滑筆跡。
   - 手指、觸控筆、滑鼠採不同平滑強度。
   - 保留既有工具、Undo / Redo、清除、下載等功能。
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
      書寫平滑化
      ==================================================

      lastMidX / lastMidY：
      保存上一段曲線的中點，
      讓下一段可以用 quadraticCurveTo()
      平滑銜接。
      */


      this.lastMidX =
        0;


      this.lastMidY =
        0;


      this.activePointerType =
        "mouse";


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
      同一題目前計算內容。
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
      舊版拖曳相容欄位。
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
      舊版縮放相容欄位。
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
      背景頁面
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


      this.initializeResizeHandles();


      this.initializeResizeListener();


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
    共用事件
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
    圖片還原
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
    Canvas 改變尺寸時保留內容
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
    保存本題
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
    還原本題
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
    取得高密度 Pointer 取樣
    ==================================================

    Android Chrome、部分觸控筆瀏覽器
    會把同一幀中間遺漏的觸控點放在
    getCoalescedEvents() 裡。

    有支援時全部取出；
    沒支援時仍使用原本 event，
    因此桌機與舊瀏覽器不受影響。
    ==================================================
    */


    getPointerSamples(
      event
    ) {


      if (
        event &&
        typeof event.getCoalescedEvents ===
          "function"
      ) {


        try {


          const samples =
            event.getCoalescedEvents();


          if (
            Array.isArray(
              samples
            ) &&
            samples.length
          ) {

            return samples;

          }

        } catch (_) {}

      }


      return event
        ? [event]
        : [];

    }


    /*
    ==================================================
    不同輸入裝置的平滑強度
    ==================================================

    touch：
    手指取樣較容易抖動，平滑較明顯。

    pen：
    保留觸控筆細節，只做輕微平滑。

    mouse：
    幾乎完全依原始座標。
    ==================================================
    */


    getPointerSmoothing(
      pointerType
    ) {


      if (
        pointerType ===
        "touch"
      ) {

        return 0.64;

      }


      if (
        pointerType ===
        "pen"
      ) {

        return 0.82;

      }


      return 1;

    }


    /*
    ==================================================
    設定本次筆畫樣式
    ==================================================
    */


    applyDrawingStyle() {


      if (
        !this.ctx
      ) {

        return;

      }


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

    }


    /*
    ==================================================
    繪製一個平滑取樣點
    ==================================================

    核心：

    上一個曲線中點
          ↓
    quadraticCurveTo(
      上一個實際點,
      新的中點
    )

    不再使用一段一段的 lineTo()，
    因此手機快速書寫時不會出現
    明顯折角。
    ==================================================
    */


    drawSmoothPoint(
      rawPoint,
      pointerType =
        this.activePointerType
    ) {


      if (
        !this.ctx ||
        !rawPoint
      ) {

        return;

      }


      const smoothing =
        this.getPointerSmoothing(
          pointerType
        );


      const point = {

        x:
          this.lastX +
          (
            rawPoint.x -
            this.lastX
          ) *
          smoothing,

        y:
          this.lastY +
          (
            rawPoint.y -
            this.lastY
          ) *
          smoothing

      };


      const dx =
        point.x -
        this.lastX;


      const dy =
        point.y -
        this.lastY;


      const distanceSquared =
        dx * dx +
        dy * dy;


      /*
      極小抖動不畫，
      避免手指停留時產生毛邊。
      */


      if (
        distanceSquared <
        0.015
      ) {

        return;

      }


      const midX =
        (
          this.lastX +
          point.x
        ) /
        2;


      const midY =
        (
          this.lastY +
          point.y
        ) /
        2;


      this.applyDrawingStyle();


      this.ctx.beginPath();


      this.ctx.moveTo(
        this.lastMidX,
        this.lastMidY
      );


      this.ctx.quadraticCurveTo(
        this.lastX,
        this.lastY,
        midX,
        midY
      );


      this.ctx.stroke();


      this.lastMidX =
        midX;


      this.lastMidY =
        midY;


      this.lastX =
        point.x;


      this.lastY =
        point.y;


      this.hasDrawnInCurrentStroke =
        true;

    }


    /*
    ==================================================
    開始畫
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


      this.activePointerType =
        event.pointerType ||
        "mouse";


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


      this.lastMidX =
        point.x;


      this.lastMidY =
        point.y;


      this.canvas.classList.add(
        "scratchpad-canvas--drawing"
      );

    }


    /*
    ==================================================
    畫
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


      const samples =
        this.getPointerSamples(
          event
        );


      samples.forEach(
        sample => {


          if (
            sample.pointerId !==
              undefined &&
            sample.pointerId !==
              this.drawingPointerId
          ) {

            return;
          }


          const point =
            this.getPointerPosition(
              sample
            );


          this.drawSmoothPoint(
            point,
            sample.pointerType ||
              event.pointerType ||
              this.activePointerType
          );

        }
      );

    }


    /*
    ==================================================
    補上筆畫尾端
    ==================================================
    */


    finishSmoothStroke(
      event
    ) {


      if (
        !this.ctx
      ) {

        return;
      }


      if (
        event &&
        Number.isFinite(
          event.clientX
        ) &&
        Number.isFinite(
          event.clientY
        )
      ) {


        const point =
          this.getPointerPosition(
            event
          );


        this.drawSmoothPoint(
          point,
          event.pointerType ||
            this.activePointerType
        );

      }


      if (
        !this.hasDrawnInCurrentStroke
      ) {

        return;
      }


      this.applyDrawingStyle();


      this.ctx.beginPath();


      this.ctx.moveTo(
        this.lastMidX,
        this.lastMidY
      );


      this.ctx.quadraticCurveTo(
        this.lastX,
        this.lastY,
        this.lastX,
        this.lastY
      );


      this.ctx.stroke();

    }


    /*
    ==================================================
    結束畫
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


      /*
      在解除 drawing 狀態前先補齊最後一段，
      避免快速抬手時筆畫尾端被截斷。
      */


      this.finishSmoothStroke(
        event
      );


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


      if (
        this.hasDrawnInCurrentStroke
      ) {


        this.saveHistory();


        this.saveCurrentQuestionImage();

      }


      this.hasDrawnInCurrentStroke =
        false;


      this.activePointerType =
        "mouse";


      this.updateToolbarState();

    }


    /*
    ==================================================
    快照
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
    歷史
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
    空白判斷
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
    */


    newQuestion() {


      this.clear(
        false
      );


      this.undoStack =
        [];


      this.redoStack =
        [];


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
    工具列
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
    保護
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
    視窗
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
    Toggle
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
    舊拖曳 API 相容
    ==================================================
    */


    initializePanelDragging() {}


    startPanelDrag() {}


    dragPanel() {}


    stopPanelDrag() {}


    keepPanelInsideViewport() {}


    /*
    ==================================================
    舊縮放 API 相容
    ==================================================
    */


    initializeResizeHandles() {


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


      this.initializeResizeHandles();

    }


    startEightDirectionResize() {}


    resizeEightDirection() {}


    stopEightDirectionResize() {}


    /*
    ==================================================
    視窗尺寸改變
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


      if (
        commandKey &&
        event.key.toLowerCase() ===
          "y"
      ) {


        event.preventDefault();


        this.redo();


        return;

      }


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
    下載檔名
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


    /*
    ==================================================
    ★ 建立下載專用 Canvas
    ==================================================

    畫面上的 Canvas 必須透明，
    才能看到後面的題目。

    但是下載 PNG 時如果直接下載透明 Canvas，
    某些手機、平板或圖片程式
    會用黑色背景顯示透明區域。

    因此下載時另外製作：

    白底
    +
    淡方格
    +
    原本筆跡

    不會改到畫面上的半透明效果。
    ==================================================
    */


    createDownloadCanvas() {


      if (
        !this.canvas ||
        !this.canvas.width ||
        !this.canvas.height
      ) {

        return null;
      }


      const exportCanvas =
        document.createElement(
          "canvas"
        );


      exportCanvas.width =
        this.canvas.width;


      exportCanvas.height =
        this.canvas.height;


      const exportContext =
        exportCanvas.getContext(
          "2d"
        );


      if (
        !exportContext
      ) {

        return null;
      }


      /*
      ----------------------------------------------
      1. 白色背景
      ----------------------------------------------
      */


      exportContext.save();


      exportContext.fillStyle =
        "#ffffff";


      exportContext.fillRect(
        0,
        0,
        exportCanvas.width,
        exportCanvas.height
      );


      /*
      ----------------------------------------------
      2. 加入淡方格

      CSS 畫面使用 24px CSS pixel 方格。

      Canvas 是依 devicePixelRatio 放大的，
      因此輸出方格要乘上 pixel ratio。
      ----------------------------------------------
      */


      const ratio =
        this.getPixelRatio();


      const gridSize =
        24 *
        ratio;


      exportContext.strokeStyle =
        "rgba(148, 163, 184, 0.20)";


      exportContext.lineWidth =
        Math.max(
          1,
          ratio *
          0.6
        );


      exportContext.beginPath();


      /*
      垂直線
      */


      for (
        let x =
          gridSize;

        x <
          exportCanvas.width;

        x +=
          gridSize
      ) {


        exportContext.moveTo(
          Math.round(
            x
          ) +
          .5,
          0
        );


        exportContext.lineTo(
          Math.round(
            x
          ) +
          .5,
          exportCanvas.height
        );

      }


      /*
      水平線
      */


      for (
        let y =
          gridSize;

        y <
          exportCanvas.height;

        y +=
          gridSize
      ) {


        exportContext.moveTo(
          0,
          Math.round(
            y
          ) +
          .5
        );


        exportContext.lineTo(
          exportCanvas.width,
          Math.round(
            y
          ) +
          .5
        );

      }


      exportContext.stroke();


      /*
      ----------------------------------------------
      3. 疊上學生真正畫的筆跡
      ----------------------------------------------
      */


      exportContext.globalCompositeOperation =
        "source-over";


      exportContext.drawImage(
        this.canvas,
        0,
        0,
        exportCanvas.width,
        exportCanvas.height
      );


      exportContext.restore();


      return exportCanvas;

    }


    /*
    ==================================================
    ★ 下載 PNG
    ==================================================
    */


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


      /*
      使用下載專用白底 Canvas，
      不直接下載透明的 this.canvas。
      */


      const exportCanvas =
        this.createDownloadCanvas();


      if (
        !exportCanvas
      ) {

        console.warn(
          "無法建立計算紙下載圖片。"
        );


        return false;
      }


      const link =
        document.createElement(
          "a"
        );


      link.href =
        exportCanvas.toDataURL(
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
          "4.2",

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
