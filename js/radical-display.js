/*
==================================================
RadicalDisplay 共用根號顯示元件
版本：1.0.0
==================================================

目的：
1. 根號勾形、斜線、轉折、上方橫線使用「同一條 SVG path」。
2. 根號橫線長度隨根號內容自然延伸。
3. 左側根號勾形不因內容變長而被水平拉伸。
4. 支援根號內次方、乘除、分數、多項式等複合內容。
5. 只負責「顯示」，不負責答案輸入與判定。

使用：
RadicalDisplay.sqrt("2<sup>3</sup> × 7")
RadicalDisplay.radical(3, 5)
RadicalDisplay.fraction("1", "2")
RadicalDisplay.divide(
  RadicalDisplay.sqrt("3"),
  RadicalDisplay.sqrt("5")
)
==================================================
*/

(function () {
  "use strict";

  const SELECTOR = "[data-radical-display]";

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function stripHTML(source) {
    const div = document.createElement("div");
    div.innerHTML = String(source ?? "");
    return (div.textContent || "")
      .replace(/\s+/g, "");
  }

  function isComplexContent(content) {
    const source = String(content ?? "");
    const plain = stripHTML(source);

    return (
      /<sup\b|<sub\b|<span\b|<math\b|<mfrac\b|<msup\b|<msub\b/i.test(source) ||
      /[×÷＋－+−·*/]/.test(plain) ||
      plain.length >= 5
    );
  }

  function sqrt(content, options = {}) {
    const complex =
      options.complex ??
      isComplexContent(content);

    const extraClass =
      options.className
        ? ` ${escapeHTML(options.className)}`
        : "";

    return `
      <span
        class="rd-radical${complex ? " rd-radical--complex" : ""}${extraClass}"
        data-radical-display
      >
        <svg
          class="rd-radical__svg"
          aria-hidden="true"
          focusable="false"
        >
          <path
            class="rd-radical__path"
          ></path>
        </svg>

        <span class="rd-radical__content">
          ${content}
        </span>
      </span>
    `;
  }

  function radical(coefficient, radicand, options = {}) {
    coefficient = Number(coefficient);

    if (Number(radicand) === 1) {
      return String(coefficient).replace("-", "−");
    }

    let prefix = "";

    if (coefficient === -1) {
      prefix = "−";
    } else if (coefficient !== 1) {
      prefix =
        String(coefficient)
          .replace("-", "−");
    }

    return `
      <span class="rd-math-expression">
        ${prefix}
        ${sqrt(
          String(radicand),
          options
        )}
      </span>
    `;
  }

  function fraction(top, bottom, options = {}) {
    const extraClass =
      options.className
        ? ` ${escapeHTML(options.className)}`
        : "";

    return `
      <span class="rd-fraction${extraClass}">
        <span class="rd-fraction__top">
          ${top}
        </span>
        <span class="rd-fraction__bottom">
          ${bottom}
        </span>
      </span>
    `;
  }

  function divide(top, bottom, options = {}) {
    return fraction(top, bottom, options);
  }

  function updateOne(root) {
    if (!root || !root.isConnected) {
      return;
    }

    const svg =
      root.querySelector(
        ".rd-radical__svg"
      );

    const path =
      root.querySelector(
        ".rd-radical__path"
      );

    if (!svg || !path) {
      return;
    }

    const rect =
      root.getBoundingClientRect();

    const width =
      Math.max(
        rect.width,
        36
      );

    const height =
      Math.max(
        rect.height,
        34
      );

    /*
    使用實際 CSS pixel 尺寸當 viewBox，
    因此左側根號勾形不會因根號內容變長而被水平拉伸。
    只有最後一段橫線的終點會跟著 width 延長。
    */

    const x0 = 1.5;
    const x1 = Math.max(5, height * 0.10);
    const x2 = Math.max(10, height * 0.19);
    const x3 = Math.max(16, height * 0.30);

    const yStart = height * 0.58;
    const yMiddle = height * 0.58;
    const yLow = height * 0.87;
    const yBottom = height * 0.94;
    const yTop = Math.max(3, height * 0.12);

    const xEnd =
      Math.max(
        x3 + 12,
        width - 2
      );

    svg.setAttribute(
      "viewBox",
      `0 0 ${width} ${height}`
    );

    svg.setAttribute(
      "preserveAspectRatio",
      "none"
    );

    path.setAttribute(
      "d",
      [
        `M ${x0} ${yStart}`,
        `L ${x1} ${yMiddle}`,
        `L ${x2} ${yLow}`,
        `L ${x2 + 3} ${yBottom}`,
        `L ${x3} ${yTop}`,
        `L ${xEnd} ${yTop}`
      ].join(" ")
    );
  }

  const observed =
    new WeakSet();

  let resizeObserver =
    null;

  function getResizeObserver() {
    if (
      resizeObserver ||
      typeof ResizeObserver !==
        "function"
    ) {
      return resizeObserver;
    }

    resizeObserver =
      new ResizeObserver(
        entries => {
          entries.forEach(
            entry => {
              updateOne(
                entry.target
              );
            }
          );
        }
      );

    return resizeObserver;
  }

  function mount(root = document) {
    const radicals = [];

    if (
      root instanceof Element &&
      root.matches(SELECTOR)
    ) {
      radicals.push(root);
    }

    root
      .querySelectorAll?.(
        SELECTOR
      )
      .forEach(
        element =>
          radicals.push(element)
      );

    radicals.forEach(
      element => {
        updateOne(element);

        if (!observed.has(element)) {
          observed.add(element);
          getResizeObserver()
            ?.observe(element);
        }
      }
    );
  }

  function startAutoMount() {
    mount(document);

    const observer =
      new MutationObserver(
        mutations => {
          mutations.forEach(
            mutation => {
              mutation.addedNodes
                .forEach(
                  node => {
                    if (
                      node.nodeType ===
                      Node.ELEMENT_NODE
                    ) {
                      mount(node);
                    }
                  }
                );
            }
          );
        }
      );

    observer.observe(
      document.documentElement,
      {
        childList: true,
        subtree: true
      }
    );

    window.addEventListener(
      "resize",
      () => mount(document),
      {
        passive: true
      }
    );
  }

  window.RadicalDisplay = {
    sqrt,
    radical,
    fraction,
    divide,
    mount,
    updateOne,
    isComplexContent
  };

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      startAutoMount,
      {
        once: true
      }
    );
  } else {
    startAutoMount();
  }
})();
