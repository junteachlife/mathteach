/*
==================================================
數學遊戲樂園：共用遊戲導覽列
檔案位置：js/common-header.js
==================================================

版本：2.0
遊戲進行中離站防呆版

功能：
1. 回到數學遊戲樂園首頁
2. 前往排行榜
3. 前往我的成績
4. 自動依 common-header.js 的位置尋找網站根目錄
5. 不受目前頁面位於根目錄或 games 資料夾影響
6. 避免導覽連結錯誤跳到其他遊戲
7. 自動偵測正式答題畫面
8. 正式答題中點「首頁／排行榜／我的成績」會先確認
9. 結果畫面、開始畫面、檢討畫面自動解除防呆
10. 支援舊遊戲：若找不到標準 quiz-screen，會以計算紙按鈕顯示狀態作備援判斷
==================================================
*/

(function () {
  "use strict";

  const HEADER_ID =
    "mathGameCommonHeader";

  const STYLE_ID =
    "mathGameCommonHeaderStyle";

  const BODY_CLASS =
    "math-game-has-common-header";

  /*
  ==================================================
  取得目前 common-header.js 的網址
  ==================================================

  假設檔案位置為：

  https://網站網址/mathteach/js/common-header.js

  則網站根目錄為：

  https://網站網址/mathteach/
  */

  function getCurrentScriptUrl() {
    /*
    document.currentScript 在一般 script 載入時
    通常可以直接取得目前 JS 的網址。
    */

    if (
      document.currentScript &&
      document.currentScript.src
    ) {
      return new URL(
        document.currentScript.src,
        window.location.href
      );
    }

    /*
    若使用 defer 或其他載入方式，
    currentScript 偶爾可能無法取得，
    就從所有 script 中尋找 common-header.js。
    */

    const scripts =
      Array.from(
        document.querySelectorAll(
          "script[src]"
        )
      );

    const commonHeaderScript =
      scripts.find((script) => {
        try {
          const scriptUrl =
            new URL(
              script.src,
              window.location.href
            );

          return scriptUrl.pathname
            .endsWith(
              "/js/common-header.js"
            );
        } catch (error) {
          return false;
        }
      });

    if (
      commonHeaderScript &&
      commonHeaderScript.src
    ) {
      return new URL(
        commonHeaderScript.src,
        window.location.href
      );
    }

    return null;
  }

  /*
  ==================================================
  取得網站根目錄
  ==================================================
  */

  function getSiteRootUrl() {
    const scriptUrl =
      getCurrentScriptUrl();

    if (scriptUrl) {
      /*
      common-header.js 位於 js 資料夾，
      所以使用 ../ 回到網站根目錄。
      */

      return new URL(
        "../",
        scriptUrl
      );
    }

    /*
    保險方式：
    若目前頁面在 games 資料夾，
    就回上一層。

    否則以目前頁面所在資料夾為根目錄。
    */

    if (
      window.location.pathname
        .includes("/games/")
    ) {
      return new URL(
        "../",
        window.location.href
      );
    }

    return new URL(
      "./",
      window.location.href
    );
  }

  /*
  ==================================================
  建立網站頁面網址
  ==================================================
  */

  function createSiteUrl(
    filename
  ) {
    const rootUrl =
      getSiteRootUrl();

    return new URL(
      filename,
      rootUrl
    ).href;
  }

  /*
  ==================================================
  建立共用樣式
  ==================================================
  */

  function createStyle() {
    if (
      document.getElementById(
        STYLE_ID
      )
    ) {
      return;
    }

    const style =
      document.createElement(
        "style"
      );

    style.id =
      STYLE_ID;

    style.textContent = `
      body.${BODY_CLASS} {
        padding-top: 86px !important;
      }

      .math-game-common-header {
        position: fixed;
        top: 10px;
        left: 50%;
        z-index: 10000;

        width: min(
          1100px,
          calc(100% - 24px)
        );

        margin: 0;
        padding: 10px 12px;

        border: 1px solid #dbeafe;
        border-radius: 16px;

        background:
          rgba(255, 255, 255, 0.98);

        box-shadow:
          0 6px 18px
          rgba(30, 64, 175, 0.12);

        transform:
          translateX(-50%);

        backdrop-filter:
          blur(8px);

        -webkit-backdrop-filter:
          blur(8px);

        pointer-events: auto;
      }

      .math-game-common-header,
      .math-game-common-header * {
        box-sizing: border-box;
      }

      .math-game-common-header-inner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;

        width: 100%;
      }

      .math-game-common-brand {
        display: flex;
        align-items: center;
        gap: 9px;

        min-width: 0;

        color: #174a7e;
        font-weight: 900;
        white-space: nowrap;
      }

      .math-game-common-brand-icon {
        flex: 0 0 auto;
        font-size: 24px;
        line-height: 1;
      }

      .math-game-common-brand-text {
        overflow: hidden;

        font-size: 17px;
        line-height: 1.3;

        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .math-game-common-links {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;

        flex-wrap: wrap;
      }

      .math-game-common-link {
        position: relative;
        z-index: 1;

        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;

        min-height: 40px;
        padding: 8px 14px;

        border: 2px solid #2563eb;
        border-radius: 11px;

        background: #ffffff;
        color: #1d4ed8;

        font-family:
          "Microsoft JhengHei",
          "Noto Sans TC",
          sans-serif;

        font-size: 14px;
        font-weight: 800;
        line-height: 1.2;
        text-align: center;
        text-decoration: none;
        white-space: nowrap;

        cursor: pointer;
        pointer-events: auto;

        transition:
          transform 0.18s ease,
          background 0.18s ease,
          color 0.18s ease,
          border-color 0.18s ease,
          box-shadow 0.18s ease;
      }

      .math-game-common-link:hover {
        background: #2563eb;
        color: #ffffff;

        box-shadow:
          0 5px 12px
          rgba(37, 99, 235, 0.20);

        transform:
          translateY(-1px);
      }

      .math-game-common-link:active {
        transform:
          translateY(1px);
      }

      .math-game-common-link:focus-visible {
        outline:
          3px solid
          rgba(37, 99, 235, 0.28);

        outline-offset: 2px;
      }

      .math-game-common-link.ranking {
        border-color: #f59e0b;
        color: #b45309;
      }

      .math-game-common-link.ranking:hover {
        background: #f59e0b;
        border-color: #f59e0b;
        color: #ffffff;
      }

      .math-game-common-link.secondary {
        border-color: #64748b;
        color: #475569;
      }

      .math-game-common-link.secondary:hover {
        background: #64748b;
        border-color: #64748b;
        color: #ffffff;
      }

      @media (max-width: 720px) {
        body.${BODY_CLASS} {
          padding-top: 142px !important;
        }

        .math-game-common-header {
          top: 6px;
          width:
            calc(100% - 12px);

          padding: 9px;
          border-radius: 14px;
        }

        .math-game-common-header-inner {
          align-items: stretch;
          flex-direction: column;
          gap: 8px;
        }

        .math-game-common-brand {
          justify-content: center;
        }

        .math-game-common-links {
          display: grid;

          grid-template-columns:
            repeat(
              3,
              minmax(0, 1fr)
            );

          width: 100%;
          gap: 6px;
        }

        .math-game-common-link {
          min-width: 0;
          min-height: 38px;

          padding: 7px 5px;

          font-size: 13px;
          white-space: normal;
        }
      }

      @media (max-width: 430px) {
        body.${BODY_CLASS} {
          padding-top: 137px !important;
        }

        .math-game-common-brand-icon {
          font-size: 21px;
        }

        .math-game-common-brand-text {
          font-size: 15px;
        }

        .math-game-common-link {
          gap: 3px;
          padding: 7px 3px;
          font-size: 12px;
        }
      }
    `;

    document.head.appendChild(
      style
    );
  }

  /*
  ==================================================
  建立單一導覽連結
  ==================================================
  */


  /*
  ==================================================
  遊戲進行中離站防呆
  ==================================================

  不要求每一個遊戲另外修改：
  1. 優先自動偵測標準答題畫面。
  2. 舊遊戲若沒有標準畫面 ID，
     再用「計算紙按鈕目前是否顯示」作備援。
  3. 也保留 setGameActive() 給未來特殊遊戲手動控制。
  ==================================================
  */

  const GAME_ACTIVE_SCREEN_SELECTORS = [
    "#quiz-screen",
    "#quizScreen",
    "[data-screen='quiz']",
    "[data-game-screen='quiz']"
  ];

  let manualGameActive =
    null;

  let detectedGameActive =
    false;

  let gameStateObserver =
    null;

  function isElementActuallyVisible(
    element
  ) {
    if (!element) {
      return false;
    }

    if (
      element.hidden ||
      element.getAttribute(
        "aria-hidden"
      ) === "true" ||
      element.classList.contains(
        "hidden"
      )
    ) {
      return false;
    }

    const style =
      window.getComputedStyle(
        element
      );

    return (
      style.display !== "none" &&
      style.visibility !== "hidden"
    );
  }

  function findVisibleQuizScreen() {
    for (
      const selector of
      GAME_ACTIVE_SCREEN_SELECTORS
    ) {
      const element =
        document.querySelector(
          selector
        );

      if (
        isElementActuallyVisible(
          element
        )
      ) {
        return element;
      }
    }

    return null;
  }

  function isScratchpadChallengeVisible() {
    const button =
      document.getElementById(
        "scratchpadOpenButton"
      );

    if (!button) {
      return false;
    }

    return isElementActuallyVisible(
      button
    );
  }

  function detectGameActive() {
    /*
    正式新版遊戲：
    quiz-screen 顯示 = 正在答題。
    */
    if (
      findVisibleQuizScreen()
    ) {
      return true;
    }

    /*
    如果頁面本身有標準 quiz-screen，
    但現在沒有顯示，表示已經在開始／結果／檢討畫面。
    此時不使用計算紙備援，避免結果頁誤判。
    */
    const hasStandardQuizScreen =
      GAME_ACTIVE_SCREEN_SELECTORS
        .some(
          selector =>
            Boolean(
              document.querySelector(
                selector
              )
            )
        );

    if (
      hasStandardQuizScreen
    ) {
      return false;
    }

    /*
    舊遊戲備援：
    依目前共用規則，正式答題時才會顯示計算紙按鈕。
    */
    return isScratchpadChallengeVisible();
  }

  function refreshGameActiveState() {
    detectedGameActive =
      detectGameActive();

    if (document.body) {
      document.body.classList.toggle(
        "math-game-navigation-guard-active",
        isGameActive()
      );
    }

    return isGameActive();
  }

  function isGameActive() {
    if (
      typeof manualGameActive ===
      "boolean"
    ) {
      return manualGameActive;
    }

    return detectedGameActive;
  }

  function setGameActive(
    active = null
  ) {
    manualGameActive =
      typeof active === "boolean"
        ? active
        : null;

    refreshGameActiveState();

    return isGameActive();
  }

  function startGameStateObserver() {
    if (
      gameStateObserver ||
      !document.body
    ) {
      return;
    }

    refreshGameActiveState();

    gameStateObserver =
      new MutationObserver(
        () => {
          refreshGameActiveState();
        }
      );

    gameStateObserver.observe(
      document.body,
      {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: [
          "class",
          "hidden",
          "aria-hidden",
          "style"
        ]
      }
    );

    window.addEventListener(
      "pageshow",
      refreshGameActiveState
    );
  }

  function stopGameStateObserver() {
    if (
      gameStateObserver
    ) {
      gameStateObserver.disconnect();
      gameStateObserver =
        null;
    }
  }

  function confirmLeaveGame(
    destinationLabel
  ) {
    if (
      !isGameActive()
    ) {
      return true;
    }

    const label =
      destinationLabel ||
      "其他頁面";

    return window.confirm(
      "⚠️ 挑戰尚未結束\n\n" +
      `你正在進行遊戲，確定要前往「${label}」嗎？\n\n` +
      "按「取消」可繼續目前的挑戰。"
    );
  }


  function createLink({
    href,
    icon,
    label,
    className = ""
  }) {
    const link =
      document.createElement("a");

    link.className =
      [
        "math-game-common-link",
        className
      ]
        .filter(Boolean)
        .join(" ");

    /*
    使用完整網址，
    避免目前頁面路徑影響連結。
    */

    link.href =
      href;

    const iconElement =
      document.createElement("span");

    iconElement.setAttribute(
      "aria-hidden",
      "true"
    );

    iconElement.textContent =
      icon;

    const labelElement =
      document.createElement("span");

    labelElement.className =
      "math-game-common-link-label";

    labelElement.textContent =
      label;

    link.appendChild(
      iconElement
    );

    link.appendChild(
      labelElement
    );

    /*
    阻止外層卡片或遊戲連結接收到點擊事件。

    避免導覽列若被放進可點擊卡片中，
    點擊「排行榜」卻觸發遊戲開始連結。
    */

    link.addEventListener(
      "click",
      (event) => {

        /*
        先阻止外層卡片接收到導覽點擊。
        */
        event.stopPropagation();


        /*
        正式答題中：
        首頁／排行榜／我的成績都先做離站確認。

        開始畫面、結果畫面、檢討畫面：
        isGameActive() 會是 false，因此直接前往。
        */
        if (
          isGameActive()
        ) {

          event.preventDefault();

          event.stopImmediatePropagation();

          const canLeave =
            confirmLeaveGame(
              label
            );


          if (
            canLeave
          ) {

            window.location.assign(
              link.href
            );
          }
        }
      }
    );

    return link;
  }

  /*
  ==================================================
  建立共用導覽列
  ==================================================
  */

  function createHeader(
    options = {}
  ) {
    const existingHeader =
      document.getElementById(
        HEADER_ID
      );

    if (existingHeader) {
      return existingHeader;
    }

    if (
      !document.body ||
      !document.head
    ) {
      return null;
    }

    createStyle();

    document.body.classList.add(
      BODY_CLASS
    );

    /*
    共用導覽列建立時，同步啟動遊戲狀態偵測。
    */
    startGameStateObserver();

    const header =
      document.createElement(
        "header"
      );

    header.id =
      HEADER_ID;

    header.className =
      "math-game-common-header";

    header.setAttribute(
      "aria-label",
      "數學遊戲樂園共用導覽列"
    );

    const inner =
      document.createElement("div");

    inner.className =
      "math-game-common-header-inner";

    /*
    品牌區
    */

    const brand =
      document.createElement("div");

    brand.className =
      "math-game-common-brand";

    const brandIcon =
      document.createElement("span");

    brandIcon.className =
      "math-game-common-brand-icon";

    brandIcon.setAttribute(
      "aria-hidden",
      "true"
    );

    brandIcon.textContent =
      "🎮";

    const brandText =
      document.createElement("span");

    brandText.className =
      "math-game-common-brand-text";

    brandText.textContent =
      options.brandText ||
      "數學遊戲樂園";

    brand.appendChild(
      brandIcon
    );

    brand.appendChild(
      brandText
    );

    /*
    導覽連結
    */

    const navigation =
      document.createElement("nav");

    navigation.className =
      "math-game-common-links";

    navigation.setAttribute(
      "aria-label",
      "網站主要導覽"
    );

    const homeLink =
      createLink({
        href:
          createSiteUrl(
            "index.html"
          ),

        icon:
          "🏠",

        label:
          "回到首頁"
      });

    const rankingLink =
      createLink({
        href:
          createSiteUrl(
            "leaderboard.html"
          ),

        icon:
          "🏆",

        label:
          "排行榜",

        className:
          "ranking"
      });

    const scoresLink =
      createLink({
        href:
          createSiteUrl(
            "my-scores.html"
          ),

        icon:
          "📊",

        label:
          "我的成績",

        className:
          "secondary"
      });

    navigation.appendChild(
      homeLink
    );

    navigation.appendChild(
      rankingLink
    );

    navigation.appendChild(
      scoresLink
    );

    inner.appendChild(
      brand
    );

    inner.appendChild(
      navigation
    );

    header.appendChild(
      inner
    );

    /*
    優先使用指定掛載點。

    若掛載點位於其他可點擊元素中，
    導覽連結本身已使用 stopPropagation，
    可避免觸發外層遊戲連結。
    */

    const mountId =
      options.mountId ||
      "commonHeaderMount";

    const mount =
      document.getElementById(
        mountId
      );

    if (mount) {
      mount.appendChild(
        header
      );
    } else {
      /*
      直接放到 body 最後，
      fixed 定位不會影響頁面 flex 排版。
      */

      document.body.appendChild(
        header
      );
    }

    return header;
  }

  /*
  ==================================================
  移除導覽列
  ==================================================
  */

  function destroyHeader() {
    const header =
      document.getElementById(
        HEADER_ID
      );

    if (header) {
      header.remove();
    }

    if (document.body) {
      document.body.classList.remove(
        BODY_CLASS
      );

      document.body.classList.remove(
        "math-game-navigation-guard-active"
      );
    }

    stopGameStateObserver();
  }

  /*
  ==================================================
  對外功能
  ==================================================
  */

  window.MathGameCommonHeader = {
    init:
      createHeader,

    destroy:
      destroyHeader,

    getSiteRootUrl,

    createSiteUrl,

    /*
    以下 API 主要提供未來特殊遊戲使用。
    一般遊戲不需要另外呼叫，會自動偵測。
    */
    isGameActive,

    setGameActive,

    refreshGameActiveState
  };

  /*
  ==================================================
  自動初始化
  ==================================================
  */

  function autoInitialize() {
    createHeader();
  }

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      autoInitialize,
      {
        once: true
      }
    );
  } else {
    autoInitialize();
  }
})();
