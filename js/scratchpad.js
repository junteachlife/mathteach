/*
==================================================
生活有解．心中有數｜共用計算紙
檔案：js/scratchpad.js

版本：4.8
完整功能保留＋手機書寫低延遲優化版
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
10. 平板／手機放大畫面安全關閉：
   - 使用 Visual Viewport 追蹤目前真正可視範圍。
   - 放大、縮小、拖動畫面後，關閉鍵仍保持在可視區右上角。
   - 不禁止瀏覽器縮放，不增加底部關閉鍵。
   - 不支援 Visual Viewport 的瀏覽器自動沿用原本標題列位置。
11. 保留既有工具、Undo / Redo、清除、下載等功能。
12. 同一個頁面工作階段內保留使用者最後的畫筆偏好：
   - 進入下一題時，畫布仍會清空。
   - Undo / Redo 仍會重設為新題目。
   - 畫筆顏色維持上一題最後選擇。
   - 畫筆粗細維持上一題最後選擇。
   - 新題目會回到畫筆工具，避免上一題若停在橡皮擦，
     下一題誤把內容擦掉。
   - 關閉／重新整理頁面後，才重新使用預設顏色與粗細。
   - 不使用 localStorage，不會跨頁永久保存偏好。
13. 本版重新以 v4.4 完整程式為基底，避免原有功能被覆蓋或遺漏。
14. 裝置效能採低風險優化：
   - 手機 Canvas DPR 最高 2。
   - 平板／大型觸控裝置最高 2.5。
   - 桌機最高 3。
   - 手指平滑係數 0.86，觸控筆 0.90。
15. Visual Viewport 固定工具列：
   - 正常 100% 顯示時完全維持原有工具列。
   - 放大／縮小／拖動畫面後，工具列固定在目前可視區上方。
   - 工具列仍保留原本換行、捲動與全部按鈕，不改工具功能。
16. v4.8 手機書寫順暢度優化：
   - 同一個 pointermove 的高密度觸控點合併成一次 Path / Stroke。
   - 同一個 pointermove 只取得一次 Canvas 位置，不重複觸發版面計算。
   - 每次抬筆只產生一次 PNG 快照，Undo 與本題保存共用同一份。
   - 一般畫筆抬筆後不再立刻掃描整張 Canvas 像素。
   - 手指平滑係數微調為 0.90，降低筆跡追不上手指的感覺。
   - Undo / Redo、清除、下載、橡皮擦、顏色、粗細、縮放固定工具列等功能不變。
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

      const rawRatio =
        Math.max(
          1,
          window.devicePixelRatio ||
            1
        );


      let touchDevice =
        false;


      try {

        touchDevice =
          (
            navigator.maxTouchPoints >
              0
          ) ||
          Boolean(
            window.matchMedia
              ?.(
                "(pointer: coarse)"
              )
              ?.matches
          );

      } catch (_) {}


      const viewportWidth =
        Math.max(
          1,
          window.innerWidth ||
            1
        );


      if (
        touchDevice &&
        viewportWidth <=
          768
      ) {

        return Math.min(
          rawRatio,
          2
        );

      }


      if (
        touchDevice
      ) {

        return Math.min(
          rawRatio,
          2.5
        );

      }


      return Math.min(
        rawRatio,
        3
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
      );this.saveCurrentQuestionImage();


      this.updateToolbarState();

    }


    /*
    ==================================================
    保存本題
    ==================================================
    */


    saveCurrentQuestionImage(
      snapshotOverride = null
    ) {


      if (
        !this.canvas ||
        !this.canvas.width ||
        !this.canvas.height
      ) {

        return;
      }


      try {

        this.currentQuestionImage =
          snapshotOverride ||
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
      event,
      rectOverride = null
    ) {


      const rect =
        rectOverride ||
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

        return 0.90;

      }


      if (
        pointerType ===
        "pen"
      ) {

        return 0.90;

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
    批次繪製同一個 pointermove 的取樣點
    ==================================================

    手機瀏覽器可能在一個 pointermove 裡提供多個
    getCoalescedEvents() 取樣點。

    舊版：
      每一個取樣點都 beginPath() / stroke() 一次。

    v4.8：
      同一批取樣點只 beginPath() 一次、stroke() 一次，
      但仍逐點使用原本的 quadraticCurveTo() 平滑演算法。

    因此：
      - 筆跡形狀與原本邏輯一致。
      - 手機主執行緒工作量明顯降低。
      - 不改 Undo / Redo 與其他工具。
    ==================================================
    */


    drawSmoothSamples(
      samples,
      rect,
      fallbackPointerType =
        this.activePointerType
    ) {


      if (
        !this.ctx ||
        !samples ||
        !samples.length
      ) {

        return;

      }


      this.applyDrawingStyle();


      this.ctx.beginPath();


      this.ctx.moveTo(
        this.lastMidX,
        this.lastMidY
      );


      let drewAny =
        false;


      for (
        const sample of
        samples
      ) {


        if (
          sample.pointerId !==
            undefined &&
          sample.pointerId !==
            this.drawingPointerId
        ) {

          continue;

        }


        const rawPoint =
          this.getPointerPosition(
            sample,
            rect
          );


        const pointerType =
          sample.pointerType ||
          fallbackPointerType ||
          this.activePointerType;


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


        if (
          distanceSquared <
          0.015
        ) {

          continue;

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


        this.ctx.quadraticCurveTo(
          this.lastX,
          this.lastY,
          midX,
          midY
        );


        this.lastMidX =
          midX;


        this.lastMidY =
          midY;


        this.lastX =
          point.x;


        this.lastY =
          point.y;


        drewAny =
          true;

      }


      if (
        drewAny
      ) {

        this.ctx.stroke();


        this.hasDrawnInCurrentStroke =
          true;

      } else {

        this.ctx.closePath();

      }

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


      /*
      同一個 pointermove 只取一次 Canvas 位置。
      */


      const rect =
        this.canvas
          .getBoundingClientRect();


      /*
      同一批 coalesced events
      合併成一次 Path / Stroke。
      */


      this.drawSmoothSamples(
        samples,
        rect,
        event.pointerType ||
          this.activePointerType
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


      let knownBlank =
        null;


      if (
        this.hasDrawnInCurrentStroke
      ) {


        /*
        每次抬筆只 PNG 編碼一次。
        同一份快照同時給 Undo 歷史與本題保存。
        */


        const snapshot =
          this.getSnapshot();


        if (
          snapshot
        ) {

          this.saveHistory(
            false,
            snapshot,
            true
          );


          this.saveCurrentQuestionImage(
            snapshot
          );

        }


        /*
        畫筆完成一筆後，一定不是空白。
        直接告知工具列，不再同步掃描整張 Canvas。

        橡皮擦仍沿用原本 isBlank() 精確判斷，
        確保全部擦空後清除／下載按鈕狀態正確。
        */


        if (
          this.tool ===
          "pen"
        ) {

          knownBlank =
            false;

        }

      }


      this.hasDrawnInCurrentStroke =
        false;


      this.activePointerType =
        "mouse";


      this.updateToolbarState(
        knownBlank
      );

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
      force = false,
      snapshotOverride = null,
      skipToolbarUpdate = false
    ) {


      if (
        !this.canvas ||
        this.isRestoringHistory
      ) {

        return;
      }


      const snapshot =
        snapshotOverride ||
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


      if (
        !skipToolbarUpdate
      ) {

        this.updateToolbarState();

      }

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


      /*
      新題目仍回到畫筆工具，
      但保留使用者在本頁面最後選擇的
      畫筆顏色與粗細。

      currentColor / currentSize
      只會在元件第一次建立時使用預設值；
      重新整理或重新進入頁面後才會恢復預設。
      */


      this.tool =
        "pen";


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


    updateToolbarState(
      knownBlank = null
    ) {


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
        typeof knownBlank ===
          "boolean"

          ? knownBlank

          : this.isBlank();


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


    /*
    ==================================================
    Visual Viewport 安全關閉
    ==================================================

    手機／平板使用雙指放大後，
    使用者真正看得到的是 Visual Viewport，
    它可能只佔 Layout Viewport 的一部分。

    因此不能只把關閉鈕固定在版面右上角，
    而要依 visualViewport 的：

    offsetLeft / offsetTop / width / height

    重新計算目前「真正可視區」的右上角。
    ==================================================
    */


    getVisualViewportSafeMargin() {


      let margin =
        12;


      try {


        const source =
          this.panel ||
          document.documentElement;


        const value =
          parseFloat(
            getComputedStyle(
              source
            )
              .getPropertyValue(
                "--scratchpad-viewport-safe-margin"
              )
          );


        if (
          Number.isFinite(
            value
          )
        ) {

          margin =
            value;

        }

      } catch (_) {}


      return Math.max(
        6,
        margin
      );

    }


    resetCloseButtonViewportPosition() {


      if (
        !this.closeButton
      ) {

        return;

      }


      this.closeButton
        .classList.remove(
          "scratchpad-close-button--viewport-safe"
        );


      this.closeButton.style.left =
        "";


      this.closeButton.style.top =
        "";


      this.closeButton.style.right =
        "";


      this.closeButton.style.bottom =
        "";

    }


    /*
    ==================================================
    Visual Viewport 安全工具列
    ==================================================

    只在 pinch zoom 或 Visual Viewport 位移時啟用。
    正常 100% 顯示完全沿用原工具列。

    工具列仍保留：
    1. 原本 flex-wrap 換行。
    2. 原本 overflow-y 捲動。
    3. 畫筆／橡皮擦。
    4. 顏色／粗細。
    5. Undo / Redo。
    6. 清除／下載。
    ==================================================
    */


    resetToolbarViewportPosition() {


      if (
        !this.toolbar
      ) {

        return;

      }


      this.toolbar
        .classList.remove(
          "scratchpad-toolbar--viewport-safe"
        );


      this.toolbar.style.left =
        "";


      this.toolbar.style.top =
        "";


      this.toolbar.style.right =
        "";


      this.toolbar.style.bottom =
        "";


      this.toolbar.style.width =
        "";


      this.toolbar.style.maxWidth =
        "";


      this.toolbar.style.maxHeight =
        "";

    }


    updateToolbarViewportPosition() {


      if (
        !this.toolbar ||
        !this.panel ||
        !this.isOpen
      ) {

        this.resetToolbarViewportPosition();

        return;

      }


      const viewport =
        window.visualViewport;


      if (
        !viewport
      ) {

        this.resetToolbarViewportPosition();

        return;

      }


      const viewportScale =
        Number(
          viewport.scale
        ) ||
        1;


      const offsetLeft =
        Number(
          viewport.offsetLeft
        ) ||
        0;


      const offsetTop =
        Number(
          viewport.offsetTop
        ) ||
        0;


      const needsViewportSafety =
        viewportScale >
          1.01 ||
        Math.abs(
          offsetLeft
        ) >
          0.5 ||
        Math.abs(
          offsetTop
        ) >
          0.5;


      if (
        !needsViewportSafety
      ) {

        this.resetToolbarViewportPosition();

        return;

      }


      const margin =
        this.getVisualViewportSafeMargin();


      const closeHeight =
        this.closeButton
          ?.offsetHeight ||
        44;


      const visualLeft =
        Math.max(
          0,
          offsetLeft
        );


      const visualTop =
        Math.max(
          0,
          offsetTop
        );


      const visualWidth =
        Math.max(
          1,
          Number(
            viewport.width
          ) ||
          window.innerWidth
        );


      const visualHeight =
        Math.max(
          1,
          Number(
            viewport.height
          ) ||
          window.innerHeight
        );


      const panelWidth =
        this.panel.clientWidth ||
        document.documentElement.clientWidth ||
        window.innerWidth ||
        visualWidth;


      const left =
        Math.max(
          0,
          visualLeft +
          margin
        );


      let width =
        Math.max(
          1,
          visualWidth -
          margin * 2
        );


      width =
        Math.min(
          width,
          Math.max(
            1,
            panelWidth -
            left -
            margin
          )
        );


      const top =
        visualTop +
        margin +
        closeHeight +
        8;


      const safeMaxHeight =
        Math.min(
          120,
          Math.max(
            48,
            visualHeight -
            closeHeight -
            margin * 3 -
            8
          )
        );


      this.toolbar
        .classList.add(
          "scratchpad-toolbar--viewport-safe"
        );


      this.toolbar.style.left =
        `${Math.round(
          left *
          100
        ) /
        100}px`;


      this.toolbar.style.top =
        `${Math.round(
          top *
          100
        ) /
        100}px`;


      this.toolbar.style.right =
        "auto";


      this.toolbar.style.bottom =
        "auto";


      this.toolbar.style.width =
        `${Math.round(
          width *
          100
        ) /
        100}px`;


      this.toolbar.style.maxWidth =
        `${Math.round(
          width *
          100
        ) /
        100}px`;


      this.toolbar.style.maxHeight =
        `${Math.round(
          safeMaxHeight *
          100
        ) /
        100}px`;

    }


    updateCloseButtonViewportPosition() {


      if (
        !this.closeButton ||
        !this.panel ||
        !this.isOpen
      ) {

        this.resetCloseButtonViewportPosition();

        return;

      }


      const viewport =
        window.visualViewport;


      /*
      舊瀏覽器沒有 Visual Viewport 時，
      完全沿用原本標題列右上角位置。
      */


      if (
        !viewport
      ) {

        this.resetCloseButtonViewportPosition();

        return;

      }


      /*
      正常 100% 比例時完全保留原本標題列排版。
      只有真的發生 pinch zoom 或 Visual Viewport 位移時，
      才啟用安全浮動位置。
      */


      const viewportScale =
        Number(
          viewport.scale
        ) ||
        1;


      const viewportOffsetLeft =
        Number(
          viewport.offsetLeft
        ) ||
        0;


      const viewportOffsetTop =
        Number(
          viewport.offsetTop
        ) ||
        0;const needsViewportSafety =
        viewportScale >
          1.01 ||
        Math.abs(
          viewportOffsetLeft
        ) >
          0.5 ||
        Math.abs(
          viewportOffsetTop
        ) >
          0.5;


      if (
        !needsViewportSafety
      ) {

        this.resetCloseButtonViewportPosition();

        return;

      }


      const margin =
        this.getVisualViewportSafeMargin();


      const buttonWidth =
        this.closeButton.offsetWidth ||
        44;


      const buttonHeight =
        this.closeButton.offsetHeight ||
        44;


      const panelWidth =
        this.panel.clientWidth ||
        document.documentElement.clientWidth ||
        window.innerWidth ||
        viewport.width;


      const panelHeight =
        this.panel.clientHeight ||
        document.documentElement.clientHeight ||
        window.innerHeight ||
        viewport.height;


      const visualLeft =
        Math.max(
          0,
          viewportOffsetLeft
        );


      const visualTop =
        Math.max(
          0,
          viewportOffsetTop
        );


      const visualWidth =
        Math.max(
          1,
          Number(
            viewport.width
          ) ||
          panelWidth
        );


      const visualHeight =
        Math.max(
          1,
          Number(
            viewport.height
          ) ||
          panelHeight
        );


      let left =
        visualLeft +
        visualWidth -
        buttonWidth -
        margin;


      let top =
        visualTop +
        margin;


      /*
      極端縮放／瀏覽器回報誤差時，
      再限制在計算紙面板範圍內。
      */


      const minimumLeft =
        Math.max(
          0,
          visualLeft
        );


      const maximumLeft =
        Math.max(
          minimumLeft,
          panelWidth -
          buttonWidth -
          margin
        );


      const minimumTop =
        Math.max(
          0,
          visualTop
        );


      const maximumTop =
        Math.max(
          minimumTop,
          panelHeight -
          buttonHeight -
          margin
        );


      left =
        Math.min(
          Math.max(
            left,
            minimumLeft
          ),
          maximumLeft
        );


      top =
        Math.min(
          Math.max(
            top,
            minimumTop
          ),
          maximumTop
        );


      /*
      visualHeight 雖然不直接決定 top，
      仍做最後保護，避免按鈕因極端 viewport
      回報值而落在可視區下方。
      */


      const visualMaximumTop =
        visualTop +
        visualHeight -
        buttonHeight -
        margin;


      if (
        Number.isFinite(
          visualMaximumTop
        )
      ) {

        top =
          Math.min(
            top,
            Math.max(
              minimumTop,
              visualMaximumTop
            )
          );

      }


      this.closeButton
        .classList.add(
          "scratchpad-close-button--viewport-safe"
        );


      this.closeButton.style.left =
        `${Math.round(
          left *
          100
        ) /
        100}px`;


      this.closeButton.style.top =
        `${Math.round(
          top *
          100
        ) /
        100}px`;


      this.closeButton.style.right =
        "auto";


      this.closeButton.style.bottom =
        "auto";

    }


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


      this.updateCloseButtonViewportPosition();


      this.updateToolbarViewportPosition();

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


      /*
      計算紙顯示後立刻依目前 Visual Viewport
      把關閉鍵放回學生真正看得到的右上角。
      */


      this.updateCloseButtonViewportPosition();


      this.updateToolbarViewportPosition();


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


              this.updateCloseButtonViewportPosition();


              this.updateToolbarViewportPosition();


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


      this.resetCloseButtonViewportPosition();


      this.resetToolbarViewportPosition();


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


      const resizeHandler =
        () => {


          /*
          先更新關閉鍵位置，
          不必等 Canvas resize debounce 完成。
          */


          this.updateCloseButtonViewportPosition();


          this.updateToolbarViewportPosition();


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


                  /*
                  Canvas 尺寸重新建立後，
                  再確認一次關閉鍵位置。
                  */


                  this.updateCloseButtonViewportPosition();


                  this.updateToolbarViewportPosition();


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


      const visualViewportScrollHandler =
        () => {


          if (
            !this.isOpen
          ) {

            return;

          }


          /*
          pinch zoom 後拖動畫面時，
          visualViewport 會發生 scroll，
          但 layout viewport 本身不一定 scroll。

          這裡只重定位關閉鍵，
          不重建 Canvas，避免拖動畫面時反覆保存圖片。
          */


          this.updateCloseButtonViewportPosition();


          this.updateToolbarViewportPosition();

        };


      this.addEvent(
        window,
        "resize",
        resizeHandler
      );


      this.addEvent(
        window,
        "orientationchange",
        resizeHandler
      );


      if (
        window.visualViewport
      ) {


        this.addEvent(
          window.visualViewport,
          "resize",
          resizeHandler
        );


        this.addEvent(
          window.visualViewport,
          "scroll",
          visualViewportScrollHandler,
          {
            passive:
              true
          }
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

      }if (
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
          "4.8",

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
