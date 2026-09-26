/*
==================================================
生活有解．心中有數｜共用計算紙
檔案：js/scratchpad.js
版本：4.6
低延遲書寫＋Visual Viewport 固定工具列版
==================================================

延續 v4.4：
- 全螢幕、背景鎖定、Visual Viewport 安全關閉
- 同一題關閉再開保留內容；下一題才清除
- 下一題保留最後畫筆顏色與粗細，但回到畫筆
- Undo / Redo / 清除 / 下載白底淡方格
- getCoalescedEvents()＋二次貝茲曲線

v4.5 效能優化：
1. 手指平滑 0.64 → 0.86，降低追不上手指的延遲感。
2. 同一 pointermove 的 coalesced points 合併成一次 Path / Stroke。
3. 同一 pointermove 只讀一次 getBoundingClientRect()。
4. 每次抬筆只做一次 PNG 快照，History 與本題共用。
5. 工具列更新不再每次 getImageData() 掃描整張 Canvas。
6. 橡皮擦「是否全空白」改在 idle / 延後時間檢查。
7. DPR：手機最高 2、平板最高 2.5、桌機最高 3。
8. 支援 desynchronized Canvas（瀏覽器支援時）。
9. exportData 版本同步為 4.6。
10. Visual Viewport 固定工具列：
   - 正常 100% 顯示時維持原本工具列版面。
   - 放大、縮小或拖動畫面後，工具列會跟著目前真正可視區移動。
   - 關閉 × 與工具列都持續留在目前可視範圍的上方。
   - 可視寬度不足時，工具列改到 × 下方。
   - 工具列保持單列，可左右滑動使用全部工具。
   - 不修改任何既有工具與書寫功能。
==================================================
*/

(function () {
  "use strict";

  class Scratchpad {
    constructor(options = {}) {
      this.options = options;

      this.canvasId = options.canvasId || "scratchpadCanvas";
      this.panelId = options.panelId || "scratchpadPanel";
      this.headerId = options.headerId || "scratchpadHeader";
      this.openButtonId = options.openButtonId || "scratchpadOpenButton";
      this.closeButtonId = options.closeButtonId || "scratchpadCloseButton";
      this.penButtonId = options.penButtonId || "scratchpadPenButton";
      this.eraserButtonId = options.eraserButtonId || "scratchpadEraserButton";
      this.undoButtonId = options.undoButtonId || "scratchpadUndoButton";
      this.redoButtonId = options.redoButtonId || "scratchpadRedoButton";
      this.clearButtonId = options.clearButtonId || "scratchpadClearButton";
      this.downloadButtonId = options.downloadButtonId || "scratchpadDownloadButton";

      this.defaultColor = options.defaultColor || "#111827";
      this.defaultSize = Number(options.defaultSize) || 4;
      this.maxHistory = Number(options.maxHistory) || 30;

      this.canvas = document.getElementById(this.canvasId);
      this.panel = document.getElementById(this.panelId);
      this.header = document.getElementById(this.headerId);
      this.openButton = document.getElementById(this.openButtonId);
      this.closeButton = document.getElementById(this.closeButtonId);
      this.penButton = document.getElementById(this.penButtonId);
      this.eraserButton = document.getElementById(this.eraserButtonId);
      this.undoButton = document.getElementById(this.undoButtonId);
      this.redoButton = document.getElementById(this.redoButtonId);
      this.clearButton = document.getElementById(this.clearButtonId);
      this.downloadButton = document.getElementById(this.downloadButtonId);

      this.toolbar = this.panel?.querySelector(".scratchpad-toolbar") || null;
      this.colorButtons = this.panel ? Array.from(this.panel.querySelectorAll("[data-scratchpad-color]")) : [];
      this.sizeButtons = this.panel ? Array.from(this.panel.querySelectorAll("[data-scratchpad-size]")) : [];

      this.ctx = null;
      this.tool = "pen";
      this.currentColor = this.defaultColor;
      this.currentSize = this.defaultSize;

      this.isDrawing = false;
      this.drawingPointerId = null;
      this.hasDrawnInCurrentStroke = false;
      this.lastX = 0;
      this.lastY = 0;
      this.lastMidX = 0;
      this.lastMidY = 0;
      this.activePointerType = "mouse";

      this.hasInk = false;
      this.blankStateUnknown = false;
      this.blankCheckTimer = null;
      this.blankCheckIdleId = null;

      this.undoStack = [];
      this.redoStack = [];
      this.currentQuestionImage = null;
      this.blankSnapshot = null;
      this.isRestoringHistory = false;

      this.isOpen = false;
      this.isOpeningPanel = false;

      this.isDraggingPanel = false;
      this.dragPointerId = null;
      this.dragOffsetX = 0;
      this.dragOffsetY = 0;
      this.savedPanelPosition = null;

      this.isResizingPanel = false;
      this.resizePointerId = null;
      this.resizeDirection = "";
      this.resizeHandles = [];

      this.savedBodyOverflow = "";
      this.savedHtmlOverflow = "";
      this.savedScrollX = 0;
      this.savedScrollY = 0;

      this.eventCleanups = [];
      this.resizeTimer = null;
      this.isDestroyed = false;

      if (!this.canvas || !this.panel) {
        console.error("Scratchpad 初始化失敗：找不到 Canvas 或面板。");
        return;
      }

      this.ctx = this.create2DContext();

      if (!this.ctx) {
        console.error("Scratchpad 初始化失敗：無法建立 Canvas 2D 繪圖環境。");
        return;
      }

      this.initialize();
    }

    create2DContext() {
      if (!this.canvas) return null;
      try {
        return this.canvas.getContext("2d", { alpha: true, desynchronized: true }) || this.canvas.getContext("2d");
      } catch (_) {
        return this.canvas.getContext("2d");
      }
    }

    initialize() {
      this.initializeProtection();
      this.initializeDrawing();
      this.initializeToolbar();
      this.initializeWindow();
      this.initializeKeyboardShortcuts();
      this.initializeResizeHandles();
      this.initializeResizeListener();

      this.setupCanvas(false)
        .then(() => {
          if (this.canvas && this.canvas.width && this.canvas.height) {
            const snapshot = this.getSnapshot();
            if (snapshot) {
              this.blankSnapshot = snapshot;
              this.currentQuestionImage = snapshot;
              this.saveHistory(true, snapshot);
            }
          }
          this.updateToolbarState();
        })
        .catch(() => this.updateToolbarState());
    }

    addEvent(element, eventName, handler, options) {
      if (!element) return;
      element.addEventListener(eventName, handler, options);
      this.eventCleanups.push(() => element.removeEventListener(eventName, handler, options));
    }

    isMobileView() {
      return window.innerWidth <= 768;
    }

    isTouchDevice() {
      try {
        if ((navigator.maxTouchPoints || 0) > 0) return true;
        return window.matchMedia?.("(pointer: coarse)")?.matches || false;
      } catch (_) {
        return false;
      }
    }

    isDesktopResizeView() { return false; }
    getViewportMargin() { return 0; }

    getDefaultPanelSize() {
      return { width: window.innerWidth, height: window.innerHeight };
    }

    applyResponsivePanelSize() {
      if (!this.panel) return;
      this.panel.style.width = "";
      this.panel.style.height = "";
      this.panel.style.left = "";
      this.panel.style.top = "";
      this.panel.style.right = "";
      this.panel.style.bottom = "";
    }

    updateResponsiveMode() {
      this.applyResponsivePanelSize();
    }

    getPixelRatio() {
      const rawRatio = Math.max(1, Number(window.devicePixelRatio) || 1);
      const isTouch = this.isTouchDevice();
      const width = Math.max(1, window.innerWidth || 1);

      if (isTouch && width <= 768) return Math.min(rawRatio, 2);
      if (isTouch) return Math.min(rawRatio, 2.5);
      return Math.min(rawRatio, 3);
    }

    async setupCanvas(preserveContent = false, savedImageOverride = null) {
      if (!this.canvas) return;

      const rect = this.canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      let oldImage = savedImageOverride;

      if (!oldImage && preserveContent && this.canvas.width && this.canvas.height) {
        try { oldImage = this.canvas.toDataURL("image/png"); } catch (_) {}
      }

      const ratio = this.getPixelRatio();
      this.canvas.width = Math.max(1, Math.round(rect.width * ratio));
      this.canvas.height = Math.max(1, Math.round(rect.height * ratio));

      this.ctx = this.create2DContext();
      if (!this.ctx) return;

      this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      this.ctx.lineCap = "round";
      this.ctx.lineJoin = "round";
      this.ctx.globalCompositeOperation = "source-over";

      if (oldImage) await this.drawImageToCanvas(oldImage);
    }

    drawImageToCanvas(imageData) {
      return new Promise((resolve, reject) => {
        if (!imageData || !this.canvas || !this.ctx) {
          resolve();
          return;
        }

        const image = new Image();

        image.onload = () => {
          if (!this.canvas || !this.ctx) {
            resolve();
            return;
          }

          this.isRestoringHistory = true;
          const width = this.canvas.width;
          const height = this.canvas.height;

          this.ctx.save();
          this.ctx.setTransform(1, 0, 0, 1, 0, 0);
          this.ctx.clearRect(0, 0, width, height);
          this.ctx.drawImage(image, 0, 0, width, height);
          this.ctx.restore();

          const ratio = this.getPixelRatio();
          this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
          this.ctx.lineCap = "round";
          this.ctx.lineJoin = "round";
          this.ctx.globalCompositeOperation = "source-over";

          this.isRestoringHistory = false;
          resolve();
        };

        image.onerror = () => {
          this.isRestoringHistory = false;
          reject(new Error("無法還原計算紙內容。"));
        };

        image.src = imageData;
      });
    }

    async resizeCanvasPreserveContent() {
      if (!this.canvas) return;

      let saved = this.currentQuestionImage;
      if (this.isDrawing || this.blankStateUnknown) {
        const fresh = this.getSnapshot();
        if (fresh) saved = fresh;
      }

      await this.setupCanvas(false, saved);
      if (saved) this.currentQuestionImage = saved;
      this.updateToolbarState();
    }

    getSnapshot() {
      if (!this.canvas || !this.canvas.width || !this.canvas.height) return null;
      try { return this.canvas.toDataURL("image/png"); } catch (_) { return null; }
    }

    saveCurrentQuestionImage(snapshotOverride = null) {
      if (!this.canvas || !this.canvas.width || !this.canvas.height) return null;
      const snapshot = snapshotOverride || this.getSnapshot();
      if (!snapshot) return null;
      this.currentQuestionImage = snapshot;
      return snapshot;
    }

    commitCurrentStrokeSnapshot() {
      const snapshot = this.getSnapshot();
      if (!snapshot) return null;
      this.currentQuestionImage = snapshot;
      this.saveHistory(false, snapshot);
      return snapshot;
    }

    async restoreCurrentQuestionImage() {
      if (!this.currentQuestionImage) return;
      try {
        await this.drawImageToCanvas(this.currentQuestionImage);
      } catch (error) {
        console.warn("計算紙內容還原失敗：", error);
      }
    }

    initializeDrawing() {
      this.addEvent(this.canvas, "pointerdown", event => this.startDrawing(event));
      this.addEvent(this.canvas, "pointermove", event => this.draw(event));
      this.addEvent(this.canvas, "pointerup", event => this.stopDrawing(event));
      this.addEvent(this.canvas, "pointercancel", event => this.stopDrawing(event));
      this.addEvent(this.canvas, "pointerleave", event => {
        if (!this.canvas?.hasPointerCapture?.(event.pointerId)) this.stopDrawing(event);
      });
      this.addEvent(this.canvas, "contextmenu", event => event.preventDefault());
    }

    getPointerPosition(event, rectOverride = null) {
      const rect = rectOverride || this.canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }

    getPointerSamples(event) {
      if (event && typeof event.getCoalescedEvents === "function") {
        try {
          const samples = event.getCoalescedEvents();
          if (Array.isArray(samples) && samples.length) return samples;
        } catch (_) {}
      }
      return event ? [event] : [];
    }

    getPointerSmoothing(pointerType) {
      if (pointerType === "touch") return 0.86;
      if (pointerType === "pen") return 0.90;
      return 1;
    }

    applyDrawingStyle() {
      if (!this.ctx) return;

      this.ctx.lineCap = "round";
      this.ctx.lineJoin = "round";

      if (this.tool === "eraser") {
        this.ctx.globalCompositeOperation = "destination-out";
        this.ctx.strokeStyle = "rgba(0,0,0,1)";
        this.ctx.lineWidth = Math.max(this.currentSize * 4, 16);
      } else {
        this.ctx.globalCompositeOperation = "source-over";
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = this.currentSize;
      }
    }

    calculateSmoothPoint(rawPoint, pointerType = this.activePointerType) {
      if (!rawPoint) return null;

      const smoothing = this.getPointerSmoothing(pointerType);
      const point = {
        x: this.lastX + (rawPoint.x - this.lastX) * smoothing,
        y: this.lastY + (rawPoint.y - this.lastY) * smoothing
      };

      const dx = point.x - this.lastX;
      const dy = point.y - this.lastY;
      if (dx * dx + dy * dy < 0.015) return null;
      return point;
    }

    drawSampleBatch(samples, rect, fallbackPointerType) {
      if (!this.ctx || !Array.isArray(samples) || !samples.length) return false;

      this.applyDrawingStyle();
      this.ctx.beginPath();
      this.ctx.moveTo(this.lastMidX, this.lastMidY);

      let drewAny = false;

      for (const sample of samples) {
        if (
          sample.pointerId !== undefined &&
          this.drawingPointerId !== null &&
          sample.pointerId !== this.drawingPointerId
        ) continue;

        const rawPoint = this.getPointerPosition(sample, rect);
        const point = this.calculateSmoothPoint(
          rawPoint,
          sample.pointerType || fallbackPointerType || this.activePointerType
        );

        if (!point) continue;

        const midX = (this.lastX + point.x) / 2;
        const midY = (this.lastY + point.y) / 2;

        this.ctx.quadraticCurveTo(this.lastX, this.lastY, midX, midY);
        this.lastMidX = midX;
        this.lastMidY = midY;
        this.lastX = point.x;
        this.lastY = point.y;
        drewAny = true;
      }

      if (drewAny) {
        this.ctx.stroke();
        this.hasDrawnInCurrentStroke = true;
      } else {
        this.ctx.closePath();
      }

      return drewAny;
    }

    drawSmoothPoint(rawPoint, pointerType = this.activePointerType) {
      if (!this.ctx || !rawPoint) return;

      this.applyDrawingStyle();
      const point = this.calculateSmoothPoint(rawPoint, pointerType);
      if (!point) return;

      const midX = (this.lastX + point.x) / 2;
      const midY = (this.lastY + point.y) / 2;

      this.ctx.beginPath();
      this.ctx.moveTo(this.lastMidX, this.lastMidY);
      this.ctx.quadraticCurveTo(this.lastX, this.lastY, midX, midY);
      this.ctx.stroke();

      this.lastMidX = midX;
      this.lastMidY = midY;
      this.lastX = point.x;
      this.lastY = point.y;
      this.hasDrawnInCurrentStroke = true;
    }

    startDrawing(event) {
      if (!this.isOpen) return;
      if (event.pointerType === "mouse" && event.button !== 0) return;

      event.preventDefault();
      event.stopPropagation();
      this.cancelScheduledBlankCheck();

      this.isDrawing = true;
      this.drawingPointerId = event.pointerId;
      this.hasDrawnInCurrentStroke = false;
      this.activePointerType = event.pointerType || "mouse";

      try { this.canvas.setPointerCapture(event.pointerId); } catch (_) {}

      const rect = this.canvas.getBoundingClientRect();
      const point = this.getPointerPosition(event, rect);

      this.lastX = point.x;
      this.lastY = point.y;
      this.lastMidX = point.x;
      this.lastMidY = point.y;
      this.canvas.classList.add("scratchpad-canvas--drawing");
    }

    draw(event) {
      if (!this.isDrawing || event.pointerId !== this.drawingPointerId || !this.ctx) return;

      event.preventDefault();
      event.stopPropagation();

      const samples = this.getPointerSamples(event);
      const rect = this.canvas.getBoundingClientRect();

      this.drawSampleBatch(samples, rect, event.pointerType || this.activePointerType);
    }

    finishSmoothStroke(event) {
      if (!this.ctx) return;

      if (event && Number.isFinite(event.clientX) && Number.isFinite(event.clientY)) {
        const rect = this.canvas.getBoundingClientRect();
        this.drawSampleBatch([event], rect, event.pointerType || this.activePointerType);
      }

      if (!this.hasDrawnInCurrentStroke) return;

      this.applyDrawingStyle();
      this.ctx.beginPath();
      this.ctx.moveTo(this.lastMidX, this.lastMidY);
      this.ctx.quadraticCurveTo(this.lastX, this.lastY, this.lastX, this.lastY);
      this.ctx.stroke();
    }

    stopDrawing(event) {
      if (!this.isDrawing) return;

      if (
        event &&
        this.drawingPointerId !== null &&
        event.pointerId !== this.drawingPointerId
      ) return;

      this.finishSmoothStroke(event);
      this.isDrawing = false;
      this.canvas?.classList.remove("scratchpad-canvas--drawing");

      if (this.ctx) {
        this.ctx.closePath();
        this.ctx.globalCompositeOperation = "source-over";
      }

      if (event && this.canvas?.hasPointerCapture?.(event.pointerId)) {
        try { this.canvas.releasePointerCapture(event.pointerId); } catch (_) {}
      }

      this.drawingPointerId = null;

      if (this.hasDrawnInCurrentStroke) {
        if (this.tool === "pen") {
          this.hasInk = true;
          this.blankStateUnknown = false;
        } else {
          this.blankStateUnknown = true;
          this.scheduleBlankCheck();
        }

        this.commitCurrentStrokeSnapshot();
      }

      this.hasDrawnInCurrentStroke = false;
      this.activePointerType = "mouse";
      this.updateToolbarState();
    }

    saveHistory(force = false, snapshotOverride = null) {
      if (!this.canvas || this.isRestoringHistory) return;

      const snapshot = snapshotOverride || this.getSnapshot();
      if (!snapshot) return;

      if (!force && this.undoStack[this.undoStack.length - 1] === snapshot) return;

      this.undoStack.push(snapshot);
      if (this.undoStack.length > this.maxHistory) this.undoStack.shift();

      this.redoStack = [];
      this.updateToolbarState();
    }

    canUndo() { return this.undoStack.length > 1; }
    canRedo() { return this.redoStack.length > 0; }

    async undo() {
      if (!this.canUndo()) return;
      this.cancelScheduledBlankCheck();

      const current = this.undoStack.pop();
      this.redoStack.push(current);
      const target = this.undoStack[this.undoStack.length - 1];

      await this.drawImageToCanvas(target);
      this.currentQuestionImage = target;
      this.hasInk = this.blankSnapshot ? target !== this.blankSnapshot : true;
      this.blankStateUnknown = false;
      this.updateToolbarState();
    }

    async redo() {
      if (!this.canRedo()) return;
      this.cancelScheduledBlankCheck();

      const target = this.redoStack.pop();
      this.undoStack.push(target);

      await this.drawImageToCanvas(target);
      this.currentQuestionImage = target;
      this.hasInk = this.blankSnapshot ? target !== this.blankSnapshot : true;
      this.blankStateUnknown = false;
      this.updateToolbarState();
    }

    scanCanvasIsBlank() {
      if (!this.canvas || !this.ctx || !this.canvas.width || !this.canvas.height) return true;

      try {
        const pixels = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height).data;
        for (let i = 3; i < pixels.length; i += 4) {
          if (pixels[i] !== 0) return false;
        }
      } catch (_) {
        return false;
      }

      return true;
    }

    isBlank(forceScan = false) {
      if (forceScan) {
        const blank = this.scanCanvasIsBlank();
        this.hasInk = !blank;
        this.blankStateUnknown = false;
        return blank;
      }
      return !this.hasInk;
    }

    cancelScheduledBlankCheck() {
      if (this.blankCheckTimer) {
        clearTimeout(this.blankCheckTimer);
        this.blankCheckTimer = null;
      }

      if (this.blankCheckIdleId !== null && typeof window.cancelIdleCallback === "function") {
        try { window.cancelIdleCallback(this.blankCheckIdleId); } catch (_) {}
        this.blankCheckIdleId = null;
      }
    }

    scheduleBlankCheck() {
      this.cancelScheduledBlankCheck();

      const runCheck = () => {
        this.blankCheckTimer = null;
        this.blankCheckIdleId = null;

        if (this.isDrawing || this.isDestroyed || !this.blankStateUnknown) return;

        const blank = this.scanCanvasIsBlank();
        this.hasInk = !blank;
        this.blankStateUnknown = false;

        if (blank) {
          const snapshot = this.getSnapshot();
          if (snapshot) this.currentQuestionImage = snapshot;
        }

        this.updateToolbarState();
      };

      if (typeof window.requestIdleCallback === "function") {
        this.blankCheckIdleId = window.requestIdleCallback(runCheck, { timeout: 700 });
      } else {
        this.blankCheckTimer = setTimeout(runCheck, 260);
      }
    }

    clearCanvasPixels() {
      if (!this.canvas || !this.ctx) return;

      this.ctx.save();
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.restore();

      const ratio = this.getPixelRatio();
      this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      this.ctx.lineCap = "round";
      this.ctx.lineJoin = "round";
      this.ctx.globalCompositeOperation = "source-over";

      this.hasInk = false;
      this.blankStateUnknown = false;
    }

    clear(saveToHistory = true) {
      if (!this.canvas || !this.ctx) return;

      this.cancelScheduledBlankCheck();
      this.clearCanvasPixels();

      const snapshot = this.getSnapshot();
      if (snapshot) {
        this.currentQuestionImage = snapshot;
        if (saveToHistory) this.saveHistory(false, snapshot);
      }

      this.updateToolbarState();
    }

    newQuestion() {
      if (!this.canvas || !this.ctx) return;

      this.cancelScheduledBlankCheck();
      this.clearCanvasPixels();
      this.undoStack = [];
      this.redoStack = [];

      /* 保留 currentColor / currentSize，只回到畫筆工具。 */
      this.tool = "pen";

      const snapshot = this.getSnapshot();
      if (snapshot) {
        this.blankSnapshot = snapshot;
        this.currentQuestionImage = snapshot;
        this.saveHistory(true, snapshot);
      }

      this.updateToolbarState();
    }

    initializeToolbar() {
      this.colorButtons = this.panel ? Array.from(this.panel.querySelectorAll("[data-scratchpad-color]")) : [];
      this.sizeButtons = this.panel ? Array.from(this.panel.querySelectorAll("[data-scratchpad-size]")) : [];

      this.addEvent(this.penButton, "click", () => this.setTool("pen"));
      this.addEvent(this.eraserButton, "click", () => this.setTool("eraser"));
      this.addEvent(this.undoButton, "click", () => this.undo());
      this.addEvent(this.redoButton, "click", () => this.redo());
      this.addEvent(this.clearButton, "click", () => this.clear(true));
      this.addEvent(this.downloadButton, "click", () => this.downloadImage());

      this.colorButtons.forEach(button => {
        this.addEvent(button, "click", () => this.setColor(button.dataset.scratchpadColor || this.defaultColor));
      });

      this.sizeButtons.forEach(button => {
        this.addEvent(button, "click", () => this.setSize(Number(button.dataset.scratchpadSize) || this.defaultSize));
      });

      this.updateToolbarState();
    }

    setTool(tool) {
      this.tool = tool === "eraser" ? "eraser" : "pen";
      this.updateToolbarState();
    }

    setColor(color) {
      this.currentColor = color || this.defaultColor;
      this.tool = "pen";
      this.updateToolbarState();
    }

    setSize(size) {
      this.currentSize = Math.max(1, Number(size) || this.defaultSize);
      this.updateToolbarState();
    }

    updateToolbarState() {
      if (this.penButton) {
        const active = this.tool === "pen";
        this.penButton.classList.toggle("scratchpad-tool-button--active", active);
        this.penButton.setAttribute("aria-pressed", String(active));
      }

      if (this.eraserButton) {
        const active = this.tool === "eraser";
        this.eraserButton.classList.toggle("scratchpad-tool-button--active", active);
        this.eraserButton.setAttribute("aria-pressed", String(active));
      }

      this.colorButtons.forEach(button => {
        const active = this.tool === "pen" && button.dataset.scratchpadColor === this.currentColor;
        button.classList.toggle("scratchpad-tool-button--active", active);
        button.setAttribute("aria-pressed", String(active));
      });

      this.sizeButtons.forEach(button => {
        const active = Number(button.dataset.scratchpadSize) === Number(this.currentSize);
        button.classList.toggle("scratchpad-tool-button--active", active);
        button.setAttribute("aria-pressed", String(active));
      });

      if (this.canvas) {
        this.canvas.classList.toggle("scratchpad-canvas--eraser", this.tool === "eraser");
      }

      if (this.undoButton) this.undoButton.disabled = !this.canUndo();
      if (this.redoButton) this.redoButton.disabled = !this.canRedo();

      /* 不再每次掃整張 Canvas。 */
      const blank = !this.hasInk;
      if (this.clearButton) this.clearButton.disabled = blank;
      if (this.downloadButton) this.downloadButton.disabled = blank;
    }

    initializeProtection() {
      this.addEvent(this.panel, "contextmenu", event => event.preventDefault());
      if (!this.panel) return;

      this.panel.querySelectorAll("button, input, select, textarea, a").forEach(control => {
        this.addEvent(control, "pointerdown", event => {
          event.stopPropagation();
          if (event.pointerType === "mouse" && event.button !== 0) event.preventDefault();
        });
        this.addEvent(control, "contextmenu", event => {
          event.preventDefault();
          event.stopPropagation();
        });
        this.addEvent(control, "dragstart", event => event.preventDefault());
        this.addEvent(control, "selectstart", event => event.preventDefault());
      });
    }

    getVisualViewportSafeMargin() {
      let margin = 12;
      try {
        const source = this.panel || document.documentElement;
        const value = parseFloat(getComputedStyle(source).getPropertyValue("--scratchpad-viewport-safe-margin"));
        if (Number.isFinite(value)) margin = value;
      } catch (_) {}
      return Math.max(6, margin);
    }

    resetCloseButtonViewportPosition() {
      if (!this.closeButton) return;
      this.closeButton.classList.remove("scratchpad-close-button--viewport-safe");
      this.closeButton.style.left = "";
      this.closeButton.style.top = "";
      this.closeButton.style.right = "";
      this.closeButton.style.bottom = "";
    }

    /*
    ==================================================
    Visual Viewport 安全工具列
    ==================================================

    正常 100% 顯示時：
      完全沿用原本工具列位置與排版。

    放大、縮小或拖動畫面後：
      1. 工具列跟著 Visual Viewport 移動。
      2. 關閉 × 維持在目前可視區右上角。
      3. 空間足夠時，工具列與 × 同一排。
      4. 可視範圍太窄時，工具列移到 × 下方。
      5. 工具列維持單列，可左右滑動。
    ==================================================
    */

    resetToolbarViewportPosition() {
      if (!this.toolbar) return;

      this.toolbar.classList.remove(
        "scratchpad-toolbar--viewport-safe"
      );

      this.toolbar.style.left = "";
      this.toolbar.style.top = "";
      this.toolbar.style.right = "";
      this.toolbar.style.bottom = "";
      this.toolbar.style.width = "";
      this.toolbar.style.maxWidth = "";
      this.toolbar.style.maxHeight = "";
    }

    updateToolbarViewportPosition() {
      if (!this.toolbar || !this.panel || !this.isOpen) {
        this.resetToolbarViewportPosition();
        return;
      }

      const viewport = window.visualViewport;

      if (!viewport) {
        this.resetToolbarViewportPosition();
        return;
      }

      const viewportScale = Number(viewport.scale) || 1;
      const viewportOffsetLeft = Number(viewport.offsetLeft) || 0;
      const viewportOffsetTop = Number(viewport.offsetTop) || 0;

      const needsViewportSafety =
        viewportScale > 1.01 ||
        Math.abs(viewportOffsetLeft) > 0.5 ||
        Math.abs(viewportOffsetTop) > 0.5;

      if (!needsViewportSafety) {
        this.resetToolbarViewportPosition();
        return;
      }

      const margin = this.getVisualViewportSafeMargin();

      const panelWidth =
        this.panel.clientWidth ||
        document.documentElement.clientWidth ||
        window.innerWidth ||
        viewport.width;

      const visualLeft = Math.max(
        0,
        viewportOffsetLeft
      );

      const visualTop = Math.max(
        0,
        viewportOffsetTop
      );

      const visualWidth = Math.max(
        1,
        Number(viewport.width) ||
          panelWidth
      );

      const closeWidth =
        this.closeButton?.offsetWidth ||
        44;

      const closeHeight =
        this.closeButton?.offsetHeight ||
        44;

      const gap = 8;

      /*
      優先讓工具列和 × 位於同一排。
      若目前真正可視寬度太窄，
      工具列自動移到 × 下方。
      */
      const sameRowWidth =
        visualWidth -
        margin * 3 -
        closeWidth;

      let left =
        visualLeft +
        margin;

      let top =
        visualTop +
        margin;

      let width =
        sameRowWidth;

      if (sameRowWidth < 150) {
        top =
          visualTop +
          margin +
          closeHeight +
          gap;

        width =
          visualWidth -
          margin * 2;
      }

      width =
        Math.max(
          1,
          width
        );

      /*
      防止瀏覽器在極端 pinch zoom 時
      回報些微超出 layout viewport 的數值。
      */
      left =
        Math.max(
          0,
          left
        );

      const maxWidth =
        Math.max(
          1,
          panelWidth -
          left -
          margin
        );

      width =
        Math.min(
          width,
          maxWidth
        );

      this.toolbar.classList.add(
        "scratchpad-toolbar--viewport-safe"
      );

      this.toolbar.style.left =
        `${Math.round(left * 100) / 100}px`;

      this.toolbar.style.top =
        `${Math.round(top * 100) / 100}px`;

      this.toolbar.style.right =
        "auto";

      this.toolbar.style.bottom =
        "auto";

      this.toolbar.style.width =
        `${Math.round(width * 100) / 100}px`;

      this.toolbar.style.maxWidth =
        `${Math.round(width * 100) / 100}px`;

      this.toolbar.style.maxHeight =
        "58px";
    }

    updateCloseButtonViewportPosition() {
      if (!this.closeButton || !this.panel || !this.isOpen) {
        this.resetCloseButtonViewportPosition();
        return;
      }

      const viewport = window.visualViewport;
      if (!viewport) {
        this.resetCloseButtonViewportPosition();
        return;
      }

      const viewportScale = Number(viewport.scale) || 1;
      const viewportOffsetLeft = Number(viewport.offsetLeft) || 0;
      const viewportOffsetTop = Number(viewport.offsetTop) || 0;

      const needsViewportSafety =
        viewportScale > 1.01 ||
        Math.abs(viewportOffsetLeft) > 0.5 ||
        Math.abs(viewportOffsetTop) > 0.5;

      if (!needsViewportSafety) {
        this.resetCloseButtonViewportPosition();
        return;
      }

      const margin = this.getVisualViewportSafeMargin();
      const buttonWidth = this.closeButton.offsetWidth || 44;
      const buttonHeight = this.closeButton.offsetHeight || 44;
      const panelWidth = this.panel.clientWidth || document.documentElement.clientWidth || window.innerWidth || viewport.width;
      const panelHeight = this.panel.clientHeight || document.documentElement.clientHeight || window.innerHeight || viewport.height;
      const visualLeft = Math.max(0, viewportOffsetLeft);
      const visualTop = Math.max(0, viewportOffsetTop);
      const visualWidth = Math.max(1, Number(viewport.width) || panelWidth);
      const visualHeight = Math.max(1, Number(viewport.height) || panelHeight);

      let left = visualLeft + visualWidth - buttonWidth - margin;
      let top = visualTop + margin;

      const minimumLeft = Math.max(0, visualLeft);
      const maximumLeft = Math.max(minimumLeft, panelWidth - buttonWidth - margin);
      const minimumTop = Math.max(0, visualTop);
      const maximumTop = Math.max(minimumTop, panelHeight - buttonHeight - margin);

      left = Math.min(Math.max(left, minimumLeft), maximumLeft);
      top = Math.min(Math.max(top, minimumTop), maximumTop);

      const visualMaximumTop = visualTop + visualHeight - buttonHeight - margin;
      if (Number.isFinite(visualMaximumTop)) {
        top = Math.min(top, Math.max(minimumTop, visualMaximumTop));
      }

      this.closeButton.classList.add("scratchpad-close-button--viewport-safe");
      this.closeButton.style.left = `${Math.round(left * 100) / 100}px`;
      this.closeButton.style.top = `${Math.round(top * 100) / 100}px`;
      this.closeButton.style.right = "auto";
      this.closeButton.style.bottom = "auto";
    }

    initializeWindow() {
      this.addEvent(this.openButton, "click", () => this.open());
      this.addEvent(this.closeButton, "click", () => this.close());
      this.applyResponsivePanelSize();
      this.updateCloseButtonViewportPosition();
      this.updateToolbarViewportPosition();
    }

    lockBackgroundPage() {
      if (document.documentElement.classList.contains("scratchpad-page-locked")) return;

      this.savedScrollX = window.scrollX || window.pageXOffset || 0;
      this.savedScrollY = window.scrollY || window.pageYOffset || 0;
      this.savedBodyOverflow = document.body.style.overflow;
      this.savedHtmlOverflow = document.documentElement.style.overflow;

      document.documentElement.classList.add("scratchpad-page-locked");
      document.body.classList.add("scratchpad-page-locked");
    }

    unlockBackgroundPage() {
      document.documentElement.classList.remove("scratchpad-page-locked");
      document.body.classList.remove("scratchpad-page-locked");
      requestAnimationFrame(() => window.scrollTo(this.savedScrollX, this.savedScrollY));
    }

    async open() {
      if (!this.panel || this.isOpen) return;

      this.isOpen = true;
      this.isOpeningPanel = true;
      this.lockBackgroundPage();

      this.panel.hidden = false;
      this.panel.classList.add("scratchpad-panel--open", "scratchpad-panel--fullscreen");
      this.updateCloseButtonViewportPosition();
      this.updateToolbarViewportPosition();
      this.panel.setAttribute("aria-modal", "true");

      if (this.openButton) this.openButton.setAttribute("aria-expanded", "true");

      requestAnimationFrame(() => {
        requestAnimationFrame(async () => {
          this.updateCloseButtonViewportPosition();
          this.updateToolbarViewportPosition();
      this.updateToolbarViewportPosition();

          try {
            const saved = this.currentQuestionImage;
            await this.setupCanvas(false, saved);

            if (this.undoStack.length === 0) {
              const snapshot = this.getSnapshot();
              if (snapshot) {
                this.blankSnapshot = snapshot;
                this.currentQuestionImage = snapshot;
                this.saveHistory(true, snapshot);
              }
            }

            this.updateToolbarState();
          } catch (error) {
            console.error("計算紙開啟失敗：", error);
          } finally {
            this.isOpeningPanel = false;
          }

          try { this.canvas.focus({ preventScroll: true }); } catch (_) {}
        });
      });

      this.panel.dispatchEvent(new CustomEvent("scratchpadopen", {
        detail: { isOpen: true, isMobile: this.isMobileView(), fullscreen: true }
      }));
    }

    close() {
      if (!this.panel || !this.isOpen) return;

      if (this.isDrawing && this.drawingPointerId !== null) {
        this.stopDrawing({ pointerId: this.drawingPointerId });
      }

      this.isDrawing = false;
      this.drawingPointerId = null;
      this.isOpen = false;
      this.isOpeningPanel = false;

      this.panel.classList.remove("scratchpad-panel--open", "scratchpad-panel--fullscreen");
      this.resetCloseButtonViewportPosition();
      this.resetToolbarViewportPosition();
      this.panel.hidden = true;
      this.panel.setAttribute("aria-modal", "false");

      if (this.openButton) this.openButton.setAttribute("aria-expanded", "false");

      this.unlockBackgroundPage();

      this.panel.dispatchEvent(new CustomEvent("scratchpadclose", {
        detail: { isOpen: false, isMobile: this.isMobileView(), fullscreen: true }
      }));
    }

    toggle() { this.isOpen ? this.close() : this.open(); }

    initializePanelDragging() {}
    startPanelDrag() {}
    dragPanel() {}
    stopPanelDrag() {}
    keepPanelInsideViewport() {}

    initializeResizeHandles() {
      this.panel?.querySelectorAll(".scratchpad-resize-handle").forEach(handle => handle.remove());
      this.resizeHandles = [];
    }

    initializeEightDirectionResize() { this.initializeResizeHandles(); }
    startEightDirectionResize() {}
    resizeEightDirection() {}
    stopEightDirectionResize() {}

    initializeResizeListener() {
      const resizeHandler = () => {
        this.updateCloseButtonViewportPosition();
      this.updateToolbarViewportPosition();
        clearTimeout(this.resizeTimer);

        this.resizeTimer = setTimeout(async () => {
          if (!this.isOpen) return;
          try {
            await this.resizeCanvasPreserveContent();
            this.updateCloseButtonViewportPosition();
            this.updateToolbarViewportPosition();
          this.updateToolbarViewportPosition();
      this.updateToolbarViewportPosition();
          } catch (error) {
            console.warn("計算紙重新調整尺寸失敗：", error);
          }
        }, 180);
      };

      const visualViewportScrollHandler = () => {
        if (!this.isOpen) return;
        this.updateCloseButtonViewportPosition();
      this.updateToolbarViewportPosition();
      };

      this.addEvent(window, "resize", resizeHandler);
      this.addEvent(window, "orientationchange", resizeHandler);

      if (window.visualViewport) {
        this.addEvent(window.visualViewport, "resize", resizeHandler);
        this.addEvent(window.visualViewport, "scroll", visualViewportScrollHandler, { passive: true });
      }
    }

    initializeKeyboardShortcuts() {
      this.addEvent(window, "keydown", event => this.handleKeyboardShortcut(event));
    }

    handleKeyboardShortcut(event) {
      if (!this.isOpen) return;

      const activeElement = document.activeElement;
      const isTyping = activeElement && (
        activeElement.tagName === "INPUT" ||
        activeElement.tagName === "TEXTAREA" ||
        activeElement.isContentEditable
      );
      if (isTyping) return;

      const commandKey = event.ctrlKey || event.metaKey;

      if (commandKey && !event.shiftKey && event.key.toLowerCase() === "z") {
        event.preventDefault();
        this.undo();
        return;
      }

      if (commandKey && event.key.toLowerCase() === "y") {
        event.preventDefault();
        this.redo();
        return;
      }

      if (commandKey && event.shiftKey && event.key.toLowerCase() === "z") {
        event.preventDefault();
        this.redo();
        return;
      }

      if (event.key === "Delete") {
        event.preventDefault();
        this.clear(true);
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        this.close();
      }
    }

    createDownloadFilename() {
      const now = new Date();
      const pad = value => String(value).padStart(2, "0");
      return "math-scratchpad-" +
        `${now.getFullYear()}-` +
        `${pad(now.getMonth() + 1)}-` +
        `${pad(now.getDate())}-` +
        `${pad(now.getHours())}` +
        `${pad(now.getMinutes())}.png`;
    }

    createDownloadCanvas() {
      if (!this.canvas || !this.canvas.width || !this.canvas.height) return null;

      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = this.canvas.width;
      exportCanvas.height = this.canvas.height;

      const exportContext = exportCanvas.getContext("2d");
      if (!exportContext) return null;

      exportContext.save();
      exportContext.fillStyle = "#ffffff";
      exportContext.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

      const ratio = this.getPixelRatio();
      const gridSize = 24 * ratio;

      exportContext.strokeStyle = "rgba(148, 163, 184, 0.20)";
      exportContext.lineWidth = Math.max(1, ratio * 0.6);
      exportContext.beginPath();

      for (let x = gridSize; x < exportCanvas.width; x += gridSize) {
        exportContext.moveTo(Math.round(x) + 0.5, 0);
        exportContext.lineTo(Math.round(x) + 0.5, exportCanvas.height);
      }

      for (let y = gridSize; y < exportCanvas.height; y += gridSize) {
        exportContext.moveTo(0, Math.round(y) + 0.5);
        exportContext.lineTo(exportCanvas.width, Math.round(y) + 0.5);
      }

      exportContext.stroke();
      exportContext.globalCompositeOperation = "source-over";
      exportContext.drawImage(this.canvas, 0, 0, exportCanvas.width, exportCanvas.height);
      exportContext.restore();

      return exportCanvas;
    }

    downloadImage(filename = this.createDownloadFilename()) {
      if (!this.canvas || this.isBlank(true)) {
        this.updateToolbarState();
        return false;
      }

      if (!filename.toLowerCase().endsWith(".png")) filename += ".png";

      const exportCanvas = this.createDownloadCanvas();
      if (!exportCanvas) {
        console.warn("無法建立計算紙下載圖片。");
        return false;
      }

      const link = document.createElement("a");
      link.href = exportCanvas.toDataURL("image/png");
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      return true;
    }

    getImageDataURL(type = "image/png", quality) {
      if (!this.canvas) return null;
      try { return this.canvas.toDataURL(type, quality); } catch (_) { return null; }
    }

    getState() {
      return {
        tool: this.tool,
        color: this.currentColor,
        size: this.currentSize,
        isOpen: this.isOpen,
        isBlank: !this.hasInk,
        canUndo: this.canUndo(),
        canRedo: this.canRedo(),
        position: null,
        fullscreen: true
      };
    }

    getFullState() {
      return {
        ...this.getState(),
        canvasWidth: this.canvas?.width || 0,
        canvasHeight: this.canvas?.height || 0,
        undoCount: Math.max(this.undoStack.length - 1, 0),
        redoCount: this.redoStack.length
      };
    }

    exportData() {
      return {
        version: "4.6",
        createdAt: new Date().toISOString(),
        image: this.getImageDataURL("image/png"),
        state: this.getFullState()
      };
    }

    isReady() {
      return Boolean(!this.isDestroyed && this.canvas && this.ctx);
    }

    destroy() {
      this.cancelScheduledBlankCheck();
      if (this.isOpen) this.close();

      this.eventCleanups.forEach(cleanup => {
        try { cleanup(); } catch (_) {}
      });
      this.eventCleanups = [];

      this.resizeHandles.forEach(handle => handle.remove());
      this.resizeHandles = [];

      clearTimeout(this.resizeTimer);

      this.isDestroyed = true;
      this.ctx = null;
      this.canvas = null;
      this.panel = null;
      this.header = null;
      this.toolbar = null;
      this.openButton = null;
      this.closeButton = null;
    }
  }

  window.Scratchpad = Scratchpad;

  window.createScratchpad = function (options = {}) {
    return new Scratchpad(options);
  };
})();
