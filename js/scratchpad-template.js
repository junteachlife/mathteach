/*
==================================================
數學遊戲樂園：共用計算紙畫面元件
檔案：js/scratchpad-template.js

版本：3.1
工具列關閉按鈕版
==================================================

本版調整：
1. 「關閉計算紙」從全螢幕右上角移到工具列最右側。
2. 關閉按鈕放在「下載」後方，操作距離更短，
   適合教室大型觸控螢幕、平板與電腦。
3. 關閉按鈕改為「✕ 關閉計算紙」膠囊按鈕。
4. 覆蓋 scratchpad.js 舊版 Visual Viewport 右上角定位，
   關閉按鈕永遠留在工具列內。
5. 原有畫筆、橡皮擦、顏色、粗細、復原、重做、
   清除、下載、開啟／關閉 API 全部保留。
==================================================
*/

(function () {
  "use strict";

  function createScratchpadMarkup() {
    if (document.getElementById("scratchpadPanel")) {
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.id = "scratchpadComponent";

    wrapper.innerHTML = `
      <style id="scratchpadToolbarCloseStyle">
        /*
        ==================================================
        關閉按鈕移至工具列
        ==================================================
        */

        .scratchpad-toolbar .scratchpad-tool-group--close {
          position: relative;
          flex: 0 0 auto;
          margin-left: 2px;
          padding-left: 10px;
          background: transparent;
        }

        .scratchpad-toolbar .scratchpad-tool-group--close::before {
          content: "";
          position: absolute;
          left: 0;
          top: 7px;
          bottom: 7px;
          width: 1px;
          background: rgba(148, 163, 184, .55);
        }

        .scratchpad-toolbar .scratchpad-close-button,
        .scratchpad-toolbar .scratchpad-close-button.scratchpad-close-button--viewport-safe {
          position: static !important;
          inset: auto !important;
          left: auto !important;
          top: auto !important;
          right: auto !important;
          bottom: auto !important;
          transform: none !important;
          z-index: auto !important;

          width: auto !important;
          height: 36px !important;
          min-width: 126px;
          flex: 0 0 auto !important;

          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;

          margin: 0 !important;
          padding: 7px 12px !important;

          border: 1px solid #ef4444 !important;
          border-radius: 11px !important;

          background: rgba(255,255,255,.92) !important;
          color: #b91c1c !important;

          font: inherit;
          font-size: 13px !important;
          font-weight: 900 !important;
          line-height: 1 !important;

          cursor: pointer;
          white-space: nowrap;
          touch-action: manipulation !important;
          pointer-events: auto !important;

          box-shadow: none !important;
          -webkit-tap-highlight-color: transparent;
        }

        .scratchpad-toolbar .scratchpad-close-button:hover {
          border-color: #dc2626 !important;
          background: #fee2e2 !important;
        }

        .scratchpad-toolbar .scratchpad-close-button:active {
          transform: scale(.97) !important;
        }

        .scratchpad-toolbar .scratchpad-close-button:focus-visible {
          outline: none;
          box-shadow: 0 0 0 4px rgba(239,68,68,.20) !important;
        }

        .scratchpad-close-button__icon {
          font-size: 17px;
          line-height: 1;
        }

        .scratchpad-close-button__text {
          white-space: nowrap;
        }

        @media (max-width: 1024px) {
          .scratchpad-toolbar .scratchpad-tool-group--close {
            padding-left: 8px;
          }

          .scratchpad-toolbar .scratchpad-close-button,
          .scratchpad-toolbar .scratchpad-close-button.scratchpad-close-button--viewport-safe {
            height: 34px !important;
            min-width: 114px;
            padding: 6px 10px !important;
            font-size: 12px !important;
          }
        }

        @media (max-width: 640px) {
          .scratchpad-toolbar .scratchpad-tool-group--close {
            padding-left: 5px;
          }

          .scratchpad-toolbar .scratchpad-tool-group--close::before {
            top: 5px;
            bottom: 5px;
          }

          .scratchpad-toolbar .scratchpad-close-button,
          .scratchpad-toolbar .scratchpad-close-button.scratchpad-close-button--viewport-safe {
            height: 31px !important;
            min-width: 84px;
            padding: 5px 8px !important;
            font-size: 11px !important;
          }

          .scratchpad-close-button__long {
            display: none;
          }
        }

        @media (max-height: 560px) {
          .scratchpad-toolbar .scratchpad-close-button,
          .scratchpad-toolbar .scratchpad-close-button.scratchpad-close-button--viewport-safe {
            height: 28px !important;
            min-width: 78px;
            padding: 4px 7px !important;
          }
        }
      </style>

      <!-- 開啟計算紙按鈕 -->
      <button
        type="button"
        id="scratchpadOpenButton"
        class="scratchpad-open-button"
        aria-controls="scratchpadPanel"
        aria-expanded="false"
        hidden
      >
        <span class="scratchpad-open-button__icon" aria-hidden="true">✏️</span>
        <span>開啟計算紙</span>
      </button>

      <!-- 計算紙浮動面板 -->
      <section
        id="scratchpadPanel"
        class="scratchpad-panel"
        role="dialog"
        aria-modal="false"
        aria-labelledby="scratchpadTitle"
        hidden
      >
        <!-- 標題列：只保留標題，不再把關閉鈕放在最右上角 -->
        <header
          id="scratchpadHeader"
          class="scratchpad-header"
        >
          <div class="scratchpad-header__title-area">
            <span class="scratchpad-header__icon" aria-hidden="true">📝</span>

            <div>
              <h2
                id="scratchpadTitle"
                class="scratchpad-header__title"
              >
                我的計算紙
              </h2>

              <p class="scratchpad-header__subtitle">
                可以自由寫下計算過程
              </p>
            </div>
          </div>
        </header>

        <div class="scratchpad-content">
          <!-- 工具列 -->
          <div
            class="scratchpad-toolbar"
            role="toolbar"
            aria-label="計算紙工具列"
          >
            <!-- 工具 -->
            <div class="scratchpad-tool-group">
              <span class="scratchpad-tool-group__label">工具</span>

              <button
                type="button"
                id="scratchpadPenButton"
                class="scratchpad-tool-button scratchpad-tool-button--active"
                aria-label="使用畫筆"
                aria-pressed="true"
                title="畫筆"
              >
                <span class="scratchpad-tool-button__icon" aria-hidden="true">✏️</span>
                <span class="scratchpad-tool-button__text">畫筆</span>
              </button>

              <button
                type="button"
                id="scratchpadEraserButton"
                class="scratchpad-tool-button"
                aria-label="使用橡皮擦"
                aria-pressed="false"
                title="橡皮擦"
              >
                <span class="scratchpad-tool-button__icon" aria-hidden="true">🧽</span>
                <span class="scratchpad-tool-button__text">橡皮擦</span>
              </button>
            </div>

            <!-- 顏色 -->
            <div class="scratchpad-tool-group">
              <span class="scratchpad-tool-group__label">顏色</span>

              <button
                type="button"
                class="scratchpad-color-button scratchpad-color-button--black scratchpad-tool-button--active"
                data-scratchpad-color="#111827"
                aria-label="黑色畫筆"
                aria-pressed="true"
                title="黑色"
              ></button>

              <button
                type="button"
                class="scratchpad-color-button scratchpad-color-button--blue"
                data-scratchpad-color="#2563eb"
                aria-label="藍色畫筆"
                aria-pressed="false"
                title="藍色"
              ></button>

              <button
                type="button"
                class="scratchpad-color-button scratchpad-color-button--red"
                data-scratchpad-color="#dc2626"
                aria-label="紅色畫筆"
                aria-pressed="false"
                title="紅色"
              ></button>

              <button
                type="button"
                class="scratchpad-color-button scratchpad-color-button--green"
                data-scratchpad-color="#16a34a"
                aria-label="綠色畫筆"
                aria-pressed="false"
                title="綠色"
              ></button>
            </div>

            <!-- 粗細 -->
            <div class="scratchpad-tool-group">
              <span class="scratchpad-tool-group__label">粗細</span>

              <button
                type="button"
                class="scratchpad-size-button"
                data-scratchpad-size="2"
                aria-label="細畫筆"
                aria-pressed="false"
                title="細畫筆"
              >
                <span class="scratchpad-size-dot scratchpad-size-dot--small"></span>
              </button>

              <button
                type="button"
                class="scratchpad-size-button scratchpad-tool-button--active"
                data-scratchpad-size="4"
                aria-label="中畫筆"
                aria-pressed="true"
                title="中畫筆"
              >
                <span class="scratchpad-size-dot scratchpad-size-dot--medium"></span>
              </button>

              <button
                type="button"
                class="scratchpad-size-button"
                data-scratchpad-size="8"
                aria-label="粗畫筆"
                aria-pressed="false"
                title="粗畫筆"
              >
                <span class="scratchpad-size-dot scratchpad-size-dot--large"></span>
              </button>
            </div>

            <!-- 復原 / 重做 -->
            <div class="scratchpad-tool-group">
              <button
                type="button"
                id="scratchpadUndoButton"
                class="scratchpad-tool-button scratchpad-tool-button--compact"
                aria-label="復原上一筆"
                title="復原 Ctrl+Z"
                disabled
              >
                <span class="scratchpad-tool-button__icon" aria-hidden="true">↶</span>
                <span class="scratchpad-tool-button__text">復原</span>
              </button>

              <button
                type="button"
                id="scratchpadRedoButton"
                class="scratchpad-tool-button scratchpad-tool-button--compact"
                aria-label="重做下一筆"
                title="重做 Ctrl+Y"
                disabled
              >
                <span class="scratchpad-tool-button__icon" aria-hidden="true">↷</span>
                <span class="scratchpad-tool-button__text">重做</span>
              </button>
            </div>

            <!-- 清除 / 下載 -->
            <div class="scratchpad-tool-group">
              <button
                type="button"
                id="scratchpadClearButton"
                class="scratchpad-tool-button scratchpad-tool-button--danger scratchpad-tool-button--compact"
                aria-label="清除全部計算內容"
                title="清除全部"
                disabled
              >
                <span class="scratchpad-tool-button__icon" aria-hidden="true">🗑️</span>
                <span class="scratchpad-tool-button__text">清除</span>
              </button>

              <button
                type="button"
                id="scratchpadDownloadButton"
                class="scratchpad-tool-button scratchpad-tool-button--download scratchpad-tool-button--compact"
                aria-label="下載計算紙圖片"
                title="下載圖片"
                disabled
              >
                <span class="scratchpad-tool-button__icon" aria-hidden="true">⬇️</span>
                <span class="scratchpad-tool-button__text">下載</span>
              </button>
            </div>

            <!-- 關閉：移到工具列最右側 -->
            <div class="scratchpad-tool-group scratchpad-tool-group--close">
              <button
                type="button"
                id="scratchpadCloseButton"
                class="scratchpad-close-button"
                aria-label="關閉計算紙"
                title="關閉計算紙"
              >
                <span class="scratchpad-close-button__icon" aria-hidden="true">✕</span>
                <span class="scratchpad-close-button__text">
                  關閉<span class="scratchpad-close-button__long">計算紙</span>
                </span>
              </button>
            </div>
          </div>

          <!-- Canvas -->
          <div class="scratchpad-canvas-container">
            <div
              id="scratchpadCanvasHint"
              class="scratchpad-canvas-hint"
            >
              在這裡寫下計算過程
            </div>

            <canvas
              id="scratchpadCanvas"
              class="scratchpad-canvas"
              tabindex="0"
              aria-label="數學計算紙畫布"
            >
              您的瀏覽器不支援 Canvas。
            </canvas>
          </div>
        </div>
      </section>
    `;

    document.body.appendChild(wrapper);
  }


  function initializeScratchpadComponent() {
    createScratchpadMarkup();

    if (typeof window.createScratchpad !== "function") {
      console.error(
        "找不到 createScratchpad()，請確認 scratchpad.js 已正確載入。"
      );
      return null;
    }

    if (window.mathScratchpad) {
      return window.mathScratchpad;
    }

    window.mathScratchpad =
      window.createScratchpad({
        canvasId: "scratchpadCanvas",
        panelId: "scratchpadPanel",
        headerId: "scratchpadHeader",
        openButtonId: "scratchpadOpenButton",
        closeButtonId: "scratchpadCloseButton",
        penButtonId: "scratchpadPenButton",
        eraserButtonId: "scratchpadEraserButton",
        undoButtonId: "scratchpadUndoButton",
        redoButtonId: "scratchpadRedoButton",
        clearButtonId: "scratchpadClearButton",
        downloadButtonId: "scratchpadDownloadButton",
        defaultColor: "#111827",
        defaultSize: 4
      });

    bindCanvasHint();
    hideScratchpadButton();

    return window.mathScratchpad;
  }


  function bindCanvasHint() {
    const canvas =
      document.getElementById(
        "scratchpadCanvas"
      );

    const hint =
      document.getElementById(
        "scratchpadCanvasHint"
      );

    if (!canvas || !hint) {
      return;
    }

    const hideHint = function () {
      hint.hidden = true;
    };

    canvas.addEventListener(
      "pointerdown",
      hideHint,
      {
        once: true
      }
    );
  }


  function showScratchpadButton() {
    const button =
      document.getElementById(
        "scratchpadOpenButton"
      );

    if (!button) {
      return;
    }

    button.hidden = false;
    button.style.display =
      "inline-flex";
  }


  function hideScratchpadButton() {
    const button =
      document.getElementById(
        "scratchpadOpenButton"
      );

    if (!button) {
      return;
    }

    if (
      window.mathScratchpad &&
      typeof window.mathScratchpad.close ===
        "function"
    ) {
      window.mathScratchpad.close();
    }

    button.hidden = true;
    button.style.display = "none";
  }


  window.setGameScratchpadButtonVisible =
    function (visible) {
      if (visible) {
        showScratchpadButton();
      } else {
        hideScratchpadButton();
      }
    };


  window.showGameScratchpadButton =
    function () {
      showScratchpadButton();
    };


  window.hideGameScratchpadButton =
    function () {
      hideScratchpadButton();
    };


  window.resetGameScratchpad =
    function () {
      if (
        window.mathScratchpad &&
        typeof window.mathScratchpad
          .newQuestion ===
          "function"
      ) {
        window.mathScratchpad
          .newQuestion();
      }

      const hint =
        document.getElementById(
          "scratchpadCanvasHint"
        );

      if (hint) {
        hint.hidden = false;
      }

      bindCanvasHint();
    };


  window.openGameScratchpad =
    function () {
      if (
        window.mathScratchpad &&
        typeof window.mathScratchpad.open ===
          "function"
      ) {
        window.mathScratchpad.open();
      }
    };


  window.closeGameScratchpad =
    function () {
      if (
        window.mathScratchpad &&
        typeof window.mathScratchpad.close ===
          "function"
      ) {
        window.mathScratchpad.close();
      }
    };


  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initializeScratchpadComponent
    );
  } else {
    initializeScratchpadComponent();
  }

})();
