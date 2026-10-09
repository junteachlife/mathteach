/*
==================================================
QuestionLayout｜共用題目換行排版元件
版本：1.0.0
==================================================

規則：
1. 題目單行時置中。
2. 題目實際需要換行時，整段靠左對齊。
3. 重要數學名稱／條件使用 nowrap，避免詞組被拆開。
4. 數學式、根號、分數、MathML、SVG 圖式視為完整單位。
==================================================
*/

(function () {
  "use strict";

  const QUESTION_SELECTOR = ".question-content, #question-content";
  const KEEP_CLASS = "question-keep-together";

  const IMPORTANT_PHRASES = [
    "一元二次方程式",
    "一元一次方程式",
    "直角三角形",
    "畢氏定理",
    "斜邊上的高",
    "兩點距離",
    "完全平方公式",
    "平方差公式",
    "乘法公式",
    "十字交乘法",
    "十字交乘",
    "因式分解",
    "標準分解式",
    "質因數分解",
    "最簡根式",
    "平方根",
    "根式乘法",
    "根式除法",
    "根式加減",
    "有理化分母",
    "有理化",
    "配方法",
    "公式解",
    "判別式",
    "重根",
    "兩相異實根",
    "無實數解",
    "公因式",
    "最大公因式",
    "多項式",
    "單項式",
    "餘式定理",
    "平方數",
    "三邊長",
    "斜邊長",
    "兩股長",
    "根號外係數",
    "根號內",
    "分子",
    "分母"
  ].sort((a, b) => b.length - a.length);

  const PROCESSING = new WeakSet();

  function escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  const phrasePattern = new RegExp(
    `(${IMPORTANT_PHRASES.map(escapeRegExp).join("|")})`,
    "g"
  );

  /*
  數值條件，例如：
  9、12、16
  3, 4, 5
  8、15、17
  保持為一組，避免在數字清單中間斷行。
  */
  const numberGroupPattern = /(-?\d+(?:\.\d+)?(?:\s*[、,，]\s*-?\d+(?:\.\d+)?){1,4})/g;

  function shouldSkipTextNode(node) {
    const parent = node.parentElement;

    if (!parent) return true;

    return Boolean(
      parent.closest(
        `.${KEEP_CLASS},
         .math,
         .math-inline,
         .math-expression,
         .formula-box,
         .rd-radical,
         .rd-fraction,
         .fraction,
         .display-radical,
         math,
         svg,
         button,
         input,
         textarea,
         select`
      )
    );
  }

  function wrapMatchesInTextNode(node) {
    if (
      !node ||
      node.nodeType !== Node.TEXT_NODE ||
      shouldSkipTextNode(node)
    ) {
      return;
    }

    const text = node.nodeValue || "";

    if (!text.trim()) return;

    const combinedPattern = new RegExp(
      `${phrasePattern.source}|${numberGroupPattern.source}`,
      "g"
    );

    if (!combinedPattern.test(text)) return;

    combinedPattern.lastIndex = 0;

    const fragment = document.createDocumentFragment();
    let lastIndex = 0;
    let match;

    while ((match = combinedPattern.exec(text))) {
      if (match.index > lastIndex) {
        fragment.appendChild(
          document.createTextNode(
            text.slice(lastIndex, match.index)
          )
        );
      }

      const span = document.createElement("span");
      span.className = KEEP_CLASS;
      span.textContent = match[0];
      fragment.appendChild(span);

      lastIndex = combinedPattern.lastIndex;
    }

    if (lastIndex < text.length) {
      fragment.appendChild(
        document.createTextNode(text.slice(lastIndex))
      );
    }

    node.replaceWith(fragment);
  }

  function protectImportantPhrases(element) {
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT
    );

    const nodes = [];
    let current;

    while ((current = walker.nextNode())) {
      nodes.push(current);
    }

    nodes.forEach(wrapMatchesInTextNode);
  }

  function hasIntentionalBreak(element) {
    return Boolean(
      element.querySelector("br") ||
      /\n\s*\n/.test(element.textContent || "")
    );
  }

  function getNaturalNoWrapWidth(element) {
    const clone = element.cloneNode(true);

    clone.classList.remove("question-wrap-left");
    clone.classList.add("question-measure-clone");

    Object.assign(clone.style, {
      position: "fixed",
      left: "-100000px",
      top: "0",
      width: "max-content",
      maxWidth: "none",
      minWidth: "0",
      whiteSpace: "nowrap",
      visibility: "hidden",
      pointerEvents: "none",
      textAlign: "left"
    });

    document.body.appendChild(clone);
    const width = clone.getBoundingClientRect().width;
    clone.remove();

    return width;
  }

  function updateAlignment(element) {
    if (!element || !element.isConnected) return;

    const availableWidth = element.getBoundingClientRect().width;

    if (availableWidth <= 0) return;

    const naturalWidth = getNaturalNoWrapWidth(element);
    const wrapped =
      hasIntentionalBreak(element) ||
      naturalWidth > availableWidth + 2;

    element.classList.toggle("question-wrap-left", wrapped);
    element.classList.toggle("question-single-line", !wrapped);
  }

  function apply(element) {
    if (!element || PROCESSING.has(element)) return;

    PROCESSING.add(element);

    try {
      protectImportantPhrases(element);
      updateAlignment(element);
    } finally {
      PROCESSING.delete(element);
    }
  }

  function applyAll(root = document) {
    const elements = [];

    if (
      root instanceof Element &&
      root.matches(QUESTION_SELECTOR)
    ) {
      elements.push(root);
    }

    root
      .querySelectorAll?.(QUESTION_SELECTOR)
      .forEach(element => elements.push(element));

    elements.forEach(apply);
  }

  let resizeTimer = 0;

  function scheduleApplyAll() {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => applyAll(document), 30);
  }

  function start() {
    applyAll(document);

    const observer = new MutationObserver(mutations => {
      const targets = new Set();

      mutations.forEach(mutation => {
        const target =
          mutation.target instanceof Element
            ? mutation.target
            : mutation.target.parentElement;

        const question = target?.closest?.(QUESTION_SELECTOR);

        if (question && !PROCESSING.has(question)) {
          targets.add(question);
        }

        mutation.addedNodes.forEach(node => {
          if (node.nodeType !== Node.ELEMENT_NODE) return;

          if (node.matches?.(QUESTION_SELECTOR)) {
            targets.add(node);
          }

          node
            .querySelectorAll?.(QUESTION_SELECTOR)
            .forEach(item => targets.add(item));
        });
      });

      targets.forEach(element => {
        window.requestAnimationFrame(() => apply(element));
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });

    window.addEventListener("resize", scheduleApplyAll, { passive: true });
  }

  window.QuestionLayout = {
    apply,
    applyAll,
    protectImportantPhrases,
    updateAlignment
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
