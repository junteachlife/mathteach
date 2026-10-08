/*
==================================================
PolynomialAnswerInput 共用元件
生活有解．心中有數
版本：1.0.0

用途：
- 自由輸入整數係數多項式
- 支援 x² / x³ / x^2 / x^3
- 支援 X、Ｘ、ｘ與常見全形符號
- 「xⁿ 次方」按鈕：在游標位於 x 後方時開啟小型次方輸入框
- 即時顯示系統判讀結果
- 提供 validate / focus / reset / setDisabled / destroy

注意：
- 目前定位為「整數係數」自由輸入元件。
- 分數係數題可繼續使用既有 ExpressionInput。
==================================================
*/
(function () {
  "use strict";

  const SUPERSCRIPT_TO_DIGIT = {
    "⁰":"0","¹":"1","²":"2","³":"3","⁴":"4",
    "⁵":"5","⁶":"6","⁷":"7","⁸":"8","⁹":"9"
  };

  const DIGIT_TO_SUPERSCRIPT = {
    "0":"⁰","1":"¹","2":"²","3":"³","4":"⁴",
    "5":"⁵","6":"⁶","7":"⁷","8":"⁸","9":"⁹"
  };

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalizeText(raw, variable = "x") {
    const variablePattern = new RegExp(
      `${variable}([⁰¹²³⁴⁵⁶⁷⁸⁹]+)`,
      "gi"
    );

    // 必須先處理真正的上標，再 NFKC。
    // 否則某些瀏覽器會先把 ² 正規化成普通 2。
    return String(raw ?? "")
      .replace(/[ＸｘX]/g, variable)
      .replace(
        variablePattern,
        (_, digits) =>
          `${variable}^` +
          [...digits]
            .map(ch => SUPERSCRIPT_TO_DIGIT[ch] || ch)
            .join("")
      )
      .normalize("NFKC")
      .replace(/[ＸｘX]/g, variable)
      .replace(/[−－–—]/g, "-")
      .replace(/[＋﹢]/g, "+")
      .replace(/[＾]/g, "^")
      .replace(/[×＊]/g, "*")
      .replace(/\s+/g, "");
  }

  function normalizeTerms(terms) {
    const map = new Map();

    for (const term of terms || []) {
      const exponent = Number(term.exponent);
      const coefficient = Number(term.coefficient);

      if (!Number.isFinite(exponent) || !Number.isFinite(coefficient)) {
        continue;
      }

      map.set(
        exponent,
        (map.get(exponent) || 0) + coefficient
      );
    }

    return [...map.entries()]
      .filter(([, coefficient]) => coefficient !== 0)
      .map(([exponent, coefficient]) => ({
        exponent: Number(exponent),
        coefficient: Number(coefficient)
      }))
      .sort((a, b) => b.exponent - a.exponent);
  }

  function termsToHTML(terms, variable = "x") {
    const normalized = normalizeTerms(terms);

    if (!normalized.length) {
      return "0";
    }

    return normalized
      .map((term, index) => {
        const coefficient = Number(term.coefficient);
        const exponent = Number(term.exponent);
        const negative = coefficient < 0;
        const abs = Math.abs(coefficient);

        const sign =
          index === 0
            ? (negative ? "−" : "")
            : (negative ? " − " : " ＋ ");

        if (exponent === 0) {
          return `${sign}${abs}`;
        }

        const coefficientText =
          abs === 1 ? "" : String(abs);

        const variableText =
          exponent === 1
            ? variable
            : `${variable}<sup>${exponent}</sup>`;

        return `${sign}${coefficientText}${variableText}`;
      })
      .join("");
  }

  function parsePolynomial(raw, options = {}) {
    const variable = options.variable || "x";
    const maxExponent =
      Number.isInteger(options.maxExponent)
        ? options.maxExponent
        : 9;

    const allowBareExponent =
      options.allowBareExponent !== false;

    const source = normalizeText(raw, variable);

    if (!source) {
      return {
        valid: false,
        incomplete: true,
        message: "目前尚未輸入答案。"
      };
    }

    const allowed = new RegExp(
      `[^0-9${variable}+\\-^*.]`,
      "i"
    );

    if (allowed.test(source)) {
      return {
        valid: false,
        message:
          `目前有無法辨識的字元，請確認英文字母 ${variable} 與運算符號。`
      };
    }

    if (source.includes("*")) {
      return {
        valid: false,
        message:
          "答案請直接寫成多項式，不需要輸入乘號。"
      };
    }

    const prepared =
      /^[+-]/.test(source)
        ? source
        : `+${source}`;

    const chunks =
      prepared.match(/[+-][^+-]+/g) || [];

    if (
      !chunks.length ||
      chunks.join("") !== prepared
    ) {
      return {
        valid: false,
        message: "多項式格式還沒有完成。"
      };
    }
    const terms = [];

    for (const chunk of chunks) {
      const sign =
        chunk[0] === "-" ? -1 : 1;

      const body =
        chunk.slice(1);

      if (!body) {
        return {
          valid: false,
          incomplete: true,
          message: "有一項尚未輸入完成。"
        };
      }

      if (body.includes(variable)) {
        const variableEscaped =
          variable.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
          );

        const pattern =
          allowBareExponent
            ? new RegExp(
                `^(\\d*)${variableEscaped}(?:(?:\\^(\\d+))|(\\d+))?$`,
                "i"
              )
            : new RegExp(
                `^(\\d*)${variableEscaped}(?:\\^(\\d+))?$`,
                "i"
              );

        const match =
          body.match(pattern);

        if (!match) {
          return {
            valid: false,
            message:
              `無法辨識「${body}」，請使用例如 6${variable}^2、-3${variable}、5 的格式。`
          };
        }

        const coefficient =
          match[1] === ""
            ? 1
            : Number(match[1]);

        const exponentRaw =
          match[2] ??
          (allowBareExponent ? match[3] : undefined);

        const exponent =
          exponentRaw == null
            ? 1
            : Number(exponentRaw);

        if (
          !Number.isInteger(exponent) ||
          exponent < 0 ||
          exponent > maxExponent
        ) {
          return {
            valid: false,
            message:
              `次方請輸入 0～${maxExponent} 的整數。`
          };
        }

        terms.push({
          exponent,
          coefficient:
            sign * coefficient
        });
      } else {
        if (!/^\d+$/.test(body)) {
          return {
            valid: false,
            message:
              `無法辨識「${body}」。`
          };
        }

        terms.push({
          exponent: 0,
          coefficient:
            sign * Number(body)
        });
      }
    }

    const normalized =
      normalizeTerms(terms);

    return {
      valid: true,
      value: normalized,
      display:
        termsToHTML(normalized, variable),
      normalizedText: source
    };
  }

  class PolynomialAnswerInput {
    constructor(options = {}) {
      this.options = {
        mountId: "",
        variable: "x",
        maxExponent: 9,
        allowBareExponent: true,
        placeholder: "例如：6x²－3x＋5",
        ariaLabel: "多項式答案",
        primary: "#3f51b5",
        primaryDark: "#303f9f",
        primaryLight: "#e8eaf6",
        primaryBorder: "#9fa8da",
        helpText: "",
        autoFocus: true,
        onChange: null,
        ...options
      };

      this.mount =
        document.getElementById(
          this.options.mountId
        );

      if (!this.mount) {
        throw new Error(
          `PolynomialAnswerInput 找不到掛載位置：${this.options.mountId}`
        );
      }

      this.disabled = false;
      this.exponentPopup = null;
      this.exponentInsertPosition = null;

      this.render();
      this.bind();

      if (this.options.autoFocus) {
        setTimeout(
          () => this.focus(),
          0
        );
      }
    }

    static normalizeText(raw, options = {}) {
      return normalizeText(
        raw,
        options.variable || "x"
      );
    }

    static parse(raw, options = {}) {
      return parsePolynomial(
        raw,
        options
      );
    }

    static normalizeTerms(terms) {
      return normalizeTerms(terms);
    }

    static termsToHTML(terms, options = {}) {
      return termsToHTML(
        terms,
        options.variable || "x"
      );
    }

    defaultHelpText() {
      const v =
        escapeHTML(this.options.variable);

      return (
        `可直接輸入完整多項式。需要次方時，把游標放在 ${v} 後面按「次方」，` +
        `右上方會出現小型次方輸入格；輸入 2、3…後會自動寫成 ${v}²、${v}³，` +
        `並回到主答案框繼續輸入。` +
        `<strong>^ 也代表次方</strong>，例如 <strong>${v}^2</strong> 代表 ${v}²、` +
        `<strong>${v}^3</strong> 代表 ${v}³。` +
        `系統也會自動辨識 X、Ｘ、ｘ與常見全形符號。`
      );
    }

    render() {
      this.mount.innerHTML = `
        <div class="pai-shell"
             style="
               --pai-primary:${escapeHTML(this.options.primary)};
               --pai-primary-dark:${escapeHTML(this.options.primaryDark)};
               --pai-primary-light:${escapeHTML(this.options.primaryLight)};
               --pai-primary-border:${escapeHTML(this.options.primaryBorder)};
             ">
          <div class="pai-input-row">
            <div class="pai-main-wrap">
              <input
                class="pai-main-input"
                type="text"
                inputmode="text"
                autocapitalize="off"
                autocomplete="off"
                spellcheck="false"
                placeholder="${escapeHTML(this.options.placeholder)}"
                aria-label="${escapeHTML(this.options.ariaLabel)}"
              >
            </div>

            <button
              class="pai-exponent-button"
              type="button"
              title="先把游標放在 x 後面，再按次方"
            >
              <span class="pai-exponent-icon">${escapeHTML(this.options.variable)}ⁿ</span>
              次方
            </button>
          </div>

          <p class="pai-help">
            ${this.options.helpText || this.defaultHelpText()}
          </p>

          <div class="pai-preview pai-preview--incomplete">
            系統判斷：目前尚未輸入答案。
          </div>
        </div>
      `;

      this.root =
        this.mount.querySelector(
          ".pai-shell"
        );

      this.input =
        this.mount.querySelector(
          ".pai-main-input"
        );

      this.exponentButton =
        this.mount.querySelector(
          ".pai-exponent-button"
        );

      this.preview =
        this.mount.querySelector(
          ".pai-preview"
        );
    }

    bind() {
      this._handleInput =
        () => {
          this.updatePreview();

          if (
            typeof this.options.onChange ===
            "function"
          ) {
            this.options.onChange(
              this.validate()
            );
          }
        };

      this._handlePaste =
        () => {
          setTimeout(
            this._handleInput,
            0
          );
        };

      this._handleExponentClick =
        () => {
          this.openExponentPopup();
        };

      this.input.addEventListener(
        "input",
        this._handleInput
      );

      this.input.addEventListener(
        "blur",
        this._handleInput
      );

      this.input.addEventListener(
        "paste",
        this._handlePaste
      );

      this.exponentButton.addEventListener(
        "click",
        this._handleExponentClick
      );
    }

    parse() {
      return parsePolynomial(
        this.input?.value ?? "",
        {
          variable:
            this.options.variable,

          maxExponent:
            this.options.maxExponent,

          allowBareExponent:
            this.options.allowBareExponent
        }
      );
    }

    validate() {
      return this.parse();
    }

    updatePreview() {
      if (!this.preview) {
        return;
      }

      const result =
        this.parse();

      this.preview.classList.remove(
        "pai-preview--valid",
        "pai-preview--incomplete",
        "pai-preview--invalid"
      );

      if (result.valid) {
        this.preview.classList.add(
          "pai-preview--valid"
        );

        this.preview.innerHTML =
          `系統判斷目前填入的答案：<strong>${result.display}</strong>`;

        return;
      }

      if (result.incomplete) {
        this.preview.classList.add(
          "pai-preview--incomplete"
        );
      } else {
        this.preview.classList.add(
          "pai-preview--invalid"
        );
      }

      this.preview.textContent =
        `系統判斷：${result.message}`;
    }

    showPreviewMessage(
      message,
      type = "invalid"
    ) {
      if (!this.preview) {
        return;
      }

      this.preview.classList.remove(
        "pai-preview--valid",
        "pai-preview--incomplete",
        "pai-preview--invalid"
      );

      this.preview.classList.add(
        type === "valid"
          ? "pai-preview--valid"
          : type === "incomplete"
            ? "pai-preview--incomplete"
            : "pai-preview--invalid"
      );

      this.preview.textContent =
        `系統判斷：${message}`;
    }

    caretVisualPosition(caretIndex) {
      const input =
        this.input;

      const rect =
        input.getBoundingClientRect();

      const style =
        getComputedStyle(input);

      const canvas =
        PolynomialAnswerInput._canvas ||
        (
          PolynomialAnswerInput._canvas =
            document.createElement(
              "canvas"
            )
        );

      const context =
        canvas.getContext("2d");

      context.font =
        [
          style.fontStyle,
          style.fontVariant,
          style.fontWeight,
          style.fontSize,
          style.fontFamily
        ]
          .filter(Boolean)
          .join(" ");

      const before =
        input.value.slice(
          0,
          caretIndex
        );

      const width =
        context.measureText(
          before
        ).width;

      const paddingLeft =
        parseFloat(
          style.paddingLeft
        ) || 0;

      return {
        left:
          rect.left +
          paddingLeft +
          width -
          input.scrollLeft,

        top:
          rect.top +
          Math.max(
            2,
            rect.height * .08
          ),

        rect
      };
    }

    closeExponentPopup({
      restoreFocus = false
    } = {}) {
      this.exponentPopup?.remove();
      this.exponentPopup = null;

      if (
        restoreFocus &&
        this.input
      ) {
        this.input.focus({
          preventScroll: true
        });

        const position =
          Math.min(
            this.exponentInsertPosition ??
              this.input.value.length,
            this.input.value.length
          );

        this.input.setSelectionRange(
          position,
          position
        );
      }

      this.exponentInsertPosition =
        null;
    }

    insertSuperscriptDigit(digit) {
      if (
        !this.input ||
        this.exponentInsertPosition == null
      ) {
        return;
      }

      const superscript =
        DIGIT_TO_SUPERSCRIPT[
          String(digit)
        ];

      if (!superscript) {
        return;
      }

      const position =
        this.exponentInsertPosition;

      const value =
        this.input.value;

      this.input.value =
        value.slice(0, position) +
        superscript +
        value.slice(position);

      this.closeExponentPopup();

      const nextPosition =
        position +
        superscript.length;

      this.input.focus({
        preventScroll: true
      });

      this.input.setSelectionRange(
        nextPosition,
        nextPosition
      );

      this.input.dispatchEvent(
        new Event(
          "input",
          {
            bubbles: true
          }
        )
      );
    }

    openExponentPopup() {
      if (
        !this.input ||
        this.disabled ||
        this.input.disabled
      ) {
        return;
      }

      this.input.focus({
        preventScroll: true
      });

      const start =
        this.input.selectionStart ??
        this.input.value.length;

      const end =
        this.input.selectionEnd ??
        start;

      const previous =
        this.input.value.charAt(
          start - 1
        );

      if (
        start !== end ||
        start <= 0 ||
        !/[xXＸｘ]/.test(previous)
      ) {
        this.showPreviewMessage(
          "請先把游標放在 x 後面，再按「次方」。"
        );

        return;
      }

      this.closeExponentPopup();

      this.exponentInsertPosition =
        start;

      const position =
        this.caretVisualPosition(
          start
        );

      const popup =
        document.createElement(
          "input"
        );

      popup.className =
        "pai-exponent-popup";

      popup.type =
        "text";

      popup.inputMode =
        "numeric";

      popup.autocomplete =
        "off";

      popup.maxLength =
        1;

      popup.setAttribute(
        "aria-label",
        "輸入次方"
      );

      popup.placeholder =
        "n";

      const popupWidth =
        42;

      const left =
        Math.min(
          Math.max(
            position.left - 4,
            position.rect.left + 8
          ),
          position.rect.right -
            popupWidth -
            8
        );

      popup.style.left =
        `${left}px`;

      popup.style.top =
        `${position.top}px`;

      popup.style.setProperty(
        "--pai-primary",
        this.options.primary
      );

      popup.style.setProperty(
        "--pai-primary-dark",
        this.options.primaryDark
      );

      document.body.appendChild(
        popup
      );

      this.exponentPopup =
        popup;

      popup.addEventListener(
        "input",
        () => {
          const digit =
            (
              popup.value.match(
                /[0-9]/
              ) ||
              [""]
            )[0];

          if (!digit) {
            popup.value =
              "";
            return;
          }

          this.insertSuperscriptDigit(
            digit
          );
        }
      );

      popup.addEventListener(
        "keydown",
        event => {
          if (
            [
              "Escape",
              "ArrowRight",
              "Tab",
              "Enter"
            ].includes(
              event.key
            )
          ) {
            event.preventDefault();

            this.closeExponentPopup({
              restoreFocus: true
            });
          }
        }
      );

      popup.addEventListener(
        "blur",
        () => {
          setTimeout(
            () => {
              if (
                this.exponentPopup ===
                popup
              ) {
                this.closeExponentPopup();
              }
            },
            120
          );
        }
      );
      requestAnimationFrame(
        () =>
          popup.focus({
            preventScroll: true
          })
      );
    }

    focus() {
      this.input?.focus();
    }

    reset() {
      this.closeExponentPopup();

      if (this.input) {
        this.input.value = "";
      }

      this.updatePreview();
    }

    setDisabled(disabled) {
      this.disabled =
        Boolean(disabled);

      if (this.input) {
        this.input.disabled =
          this.disabled;
      }

      if (this.exponentButton) {
        this.exponentButton.disabled =
          this.disabled;
      }

      if (this.disabled) {
        this.closeExponentPopup();
      }
    }

    getRawValue() {
      return this.input?.value ?? "";
    }

    setValue(value) {
      if (!this.input) {
        return;
      }

      this.input.value =
        String(value ?? "");

      this.updatePreview();
    }

    destroy() {
      this.closeExponentPopup();

      this.input?.removeEventListener(
        "input",
        this._handleInput
      );

      this.input?.removeEventListener(
        "blur",
        this._handleInput
      );

      this.input?.removeEventListener(
        "paste",
        this._handlePaste
      );

      this.exponentButton?.removeEventListener(
        "click",
        this._handleExponentClick
      );

      this.mount.innerHTML = "";

      this.root = null;
      this.input = null;
      this.exponentButton = null;
      this.preview = null;
    }
  }

  window.PolynomialAnswerInput =
    PolynomialAnswerInput;

  window.PolynomialAnswerInputUtils = {
    normalizeText,
    parsePolynomial,
    normalizeTerms,
    termsToHTML
  };
})();
