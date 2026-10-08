/*
==================================================
PolynomialAnswerInput 共用元件
生活有解．心中有數
版本：3.0.0

v3 重點：
- 完整保留 v1 的整數係數多項式輸入與次方小框。
- 新增 coefficientMode: "rational"，可輸入分數係數。
- rational 模式支援「分數」按鈕：彈出分子在上、分母在下的小輸入框。
- rational 模式的「主答案框」直接以真正上下分數顯示，不再只顯示 2/5。
- 系統判斷預覽同樣以真正上下分數顯示。
- 支援 x² / x³ / x^2 / x^3、X／Ｘ／ｘ、全形符號。
- integer 模式回傳數字係數，維持 1-1、1-2 向下相容。
- rational 模式回傳 {numerator, denominator} 係數。
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

  function gcd(a, b) {
    a = Math.abs(Number(a) || 0);
    b = Math.abs(Number(b) || 0);
    while (b) {
      const t = a % b;
      a = b;
      b = t;
    }
    return a || 1;
  }

  function fraction(numerator, denominator = 1) {
    let n = Number(numerator);
    let d = Number(denominator);

    if (!Number.isFinite(n) || !Number.isFinite(d) || d === 0) {
      return null;
    }

    if (d < 0) {
      n = -n;
      d = -d;
    }

    if (n === 0) {
      return { numerator: 0, denominator: 1 };
    }

    const g = gcd(n, d);
    return {
      numerator: n / g,
      denominator: d / g
    };
  }

  function addFractions(a, b) {
    return fraction(
      a.numerator * b.denominator + b.numerator * a.denominator,
      a.denominator * b.denominator
    );
  }

  function sameFraction(a, b) {
    const x = fraction(a?.numerator ?? a, a?.denominator ?? 1);
    const y = fraction(b?.numerator ?? b, b?.denominator ?? 1);
    return !!x && !!y && x.numerator === y.numerator && x.denominator === y.denominator;
  }

  function coefficientToFraction(value) {
    if (value && typeof value === "object") {
      return fraction(value.numerator, value.denominator);
    }
    return fraction(Number(value), 1);
  }

  function normalizeText(raw, variable = "x") {
    const variablePattern = new RegExp(
      `${variable}([⁰¹²³⁴⁵⁶⁷⁸⁹]+)`,
      "gi"
    );

    // 先處理真正上標，再 NFKC，避免 ² 被瀏覽器先轉成普通 2。
    return String(raw ?? "")
      .replace(/[ＸｘX]/g, variable)
      .replace(
        variablePattern,
        (_, digits) =>
          `${variable}^` +
          [...digits].map(ch => SUPERSCRIPT_TO_DIGIT[ch] || ch).join("")
      )
      .normalize("NFKC")
      .replace(/[ＸｘX]/g, variable)
      .replace(/[−－–—]/g, "-")
      .replace(/[＋﹢]/g, "+")
      .replace(/[＾]/g, "^")
      .replace(/[／]/g, "/")
      .replace(/[×＊]/g, "*")
      .replace(/\s+/g, "");
  }

  function normalizeTerms(terms, coefficientMode = "integer") {
    const map = new Map();

    for (const term of terms || []) {
      const exponent = Number(term.exponent);
      const value = coefficientToFraction(term.coefficient);

      if (!Number.isFinite(exponent) || !value) {
        continue;
      }

      const current = map.get(exponent) || { numerator: 0, denominator: 1 };
      map.set(exponent, addFractions(current, value));
    }

    return [...map.entries()]
      .filter(([, c]) => c && c.numerator !== 0)
      .map(([exponent, c]) => ({
        exponent: Number(exponent),
        coefficient:
          coefficientMode === "rational"
            ? { numerator: c.numerator, denominator: c.denominator }
            : c.numerator / c.denominator
      }))
      .sort((a, b) => b.exponent - a.exponent);
  }

  function fractionHTML(value) {
    const f = coefficientToFraction(value);
    if (!f) return "?";

    const negative = f.numerator < 0;
    const absN = Math.abs(f.numerator);

    if (f.denominator === 1) {
      return `${negative ? "−" : ""}${absN}`;
    }

    return `${negative ? "−" : ""}<span class="pai-math-fraction"><span class="pai-math-fraction-top">${absN}</span><span class="pai-math-fraction-bottom">${f.denominator}</span></span>`;
  }

  function termsToHTML(terms, variable = "x", coefficientMode = "integer") {
    const normalized = normalizeTerms(terms, "rational");

    if (!normalized.length) return "0";

    return normalized.map((term, index) => {
      const f = coefficientToFraction(term.coefficient);
      const exponent = Number(term.exponent);
      const negative = f.numerator < 0;
      const absF = { numerator: Math.abs(f.numerator), denominator: f.denominator };
      const sign = index === 0 ? (negative ? "−" : "") : (negative ? " − " : " ＋ ");

      if (exponent === 0) {
        return `${sign}${fractionHTML(absF)}`;
      }

      const omitOne = absF.numerator === absF.denominator;
      const coefficientHTML = omitOne ? "" : fractionHTML(absF);
      const variableHTML = exponent === 1 ? variable : `${variable}<sup>${exponent}</sup>`;
      return `${sign}${coefficientHTML}${variableHTML}`;
    }).join("");
  }


  function rawTextToRichHTML(raw, variable = "x") {
    let source = String(raw ?? "");

    if (!source) {
      return "";
    }

    // 先做基本安全處理，再把可辨識的數學片段轉成排版。
    source = escapeHTML(source)
      .replace(/[ＸｘX]/g, variable)
      .replace(/[−－–—]/g, "−")
      .replace(/[＋﹢]/g, "＋")
      .replace(/[／]/g, "/");

    // x^2 / x＾2 顯示成右上角次方。
    source = source.replace(
      new RegExp(`${variable}(?:\\^|＾)([0-9]+)`, "gi"),
      `${variable}<sup>$1</sup>`
    );

    // 真正的上標字元保留原樣；分數轉成上下式。
    source = source.replace(
      /(\d+)\/(\d+)/g,
      (_, numerator, denominator) =>
        `<span class="pai-math-fraction"><span class="pai-math-fraction-top">${numerator}</span><span class="pai-math-fraction-bottom">${denominator}</span></span>`
    );

    return source;
  }

  function parseCoefficient(text, coefficientMode, requireSimplifiedFraction) {
    if (!text) {
      return { valid: true, value: { numerator: 1, denominator: 1 } };
    }

    if (/^\d+$/.test(text)) {
      return {
        valid: true,
        value: { numerator: Number(text), denominator: 1 }
      };
    }

    if (coefficientMode !== "rational") {
      return {
        valid: false,
        message: `無法辨識係數「${text}」，目前只接受整數係數。`
      };
    }

    const match = text.match(/^(\d+)\/(\d+)$/);
    if (!match) {
      return {
        valid: false,
        message: `無法辨識分數係數「${text}」，請使用例如 3/2 的格式。`
      };
    }

    const numerator = Number(match[1]);
    const denominator = Number(match[2]);

    if (denominator === 0) {
      return { valid: false, message: "分母不可為 0。" };
    }

    if (requireSimplifiedFraction && gcd(numerator, denominator) !== 1) {
      return {
        valid: false,
        message: `分數 ${numerator}/${denominator} 還不是最簡分數，請先約分。`
      };
    }

    return {
      valid: true,
      value: fraction(numerator, denominator)
    };
  }

  function parsePolynomial(raw, options = {}) {
    const variable = options.variable || "x";
    const maxExponent = Number.isInteger(options.maxExponent) ? options.maxExponent : 9;
    const allowBareExponent = options.allowBareExponent !== false;
    const coefficientMode = options.coefficientMode === "rational" ? "rational" : "integer";
    const requireSimplifiedFraction = options.requireSimplifiedFraction !== false;
    const source = normalizeText(raw, variable);

    if (!source) {
      return { valid: false, incomplete: true, message: "目前尚未輸入答案。" };
    }

    const allowed = new RegExp(`[^0-9${variable}+\\-^*/.]`, "i");
    if (allowed.test(source)) {
      return {
        valid: false,
        message: `目前有無法辨識的字元，請確認英文字母 ${variable}、分數與運算符號。`
      };
    }

    if (source.includes("*")) {
      return { valid: false, message: "答案請直接寫成整理後的多項式，不需要輸入乘號。" };
    }

    const prepared = /^[+-]/.test(source) ? source : `+${source}`;
    const chunks = prepared.match(/[+-][^+-]+/g) || [];

    if (!chunks.length || chunks.join("") !== prepared) {
      return { valid: false, message: "多項式格式還沒有完成。" };
    }

    const terms = [];

    for (const chunk of chunks) {
      const sign = chunk[0] === "-" ? -1 : 1;
      const body = chunk.slice(1);

      if (!body) {
        return { valid: false, incomplete: true, message: "有一項尚未輸入完成。" };
      }

      if (body.includes(variable)) {
        const variableEscaped = variable.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const pattern = allowBareExponent
          ? new RegExp(`^((?:\\d+(?:/\\d+)?)?)${variableEscaped}(?:(?:\\^(\\d+))|(\\d+))?$`, "i")
          : new RegExp(`^((?:\\d+(?:/\\d+)?)?)${variableEscaped}(?:\\^(\\d+))?$`, "i");

        const match = body.match(pattern);
        if (!match) {
          return {
            valid: false,
            message: `無法辨識「${body}」，請使用例如 6${variable}^2、3/2${variable}、5 的格式。`
          };
        }

        const coefficientResult = parseCoefficient(
          match[1],
          coefficientMode,
          requireSimplifiedFraction
        );

        if (!coefficientResult.valid) return coefficientResult;

        const exponentRaw = match[2] ?? (allowBareExponent ? match[3] : undefined);
        const exponent = exponentRaw == null ? 1 : Number(exponentRaw);

        if (!Number.isInteger(exponent) || exponent < 0 || exponent > maxExponent) {
          return { valid: false, message: `次方請輸入 0～${maxExponent} 的整數。` };
        }

        terms.push({
          exponent,
          coefficient: {
            numerator: sign * coefficientResult.value.numerator,
            denominator: coefficientResult.value.denominator
          }
        });
      } else {
        const coefficientResult = parseCoefficient(
          body,
          coefficientMode,
          requireSimplifiedFraction
        );

        if (!coefficientResult.valid) return coefficientResult;

        terms.push({
          exponent: 0,
          coefficient: {
            numerator: sign * coefficientResult.value.numerator,
            denominator: coefficientResult.value.denominator
          }
        });
      }
    }

    const rationalTerms = normalizeTerms(terms, "rational");
    const value = coefficientMode === "rational"
      ? rationalTerms
      : rationalTerms.map(term => ({
          exponent: term.exponent,
          coefficient: term.coefficient.numerator / term.coefficient.denominator
        }));

    return {
      valid: true,
      value,
      display: termsToHTML(rationalTerms, variable, "rational"),
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
        coefficientMode: "integer",
        requireSimplifiedFraction: true,
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

      this.options.coefficientMode =
        this.options.coefficientMode === "rational" ? "rational" : "integer";

      this.mount = document.getElementById(this.options.mountId);
      if (!this.mount) {
        throw new Error(`PolynomialAnswerInput 找不到掛載位置：${this.options.mountId}`);
      }

      this.disabled = false;
      this.exponentPopup = null;
      this.exponentInsertPosition = null;
      this.fractionPopup = null;
      this.fractionInsertPosition = null;

      this.render();
      this.bind();

      if (this.options.autoFocus) {
        setTimeout(() => this.focus(), 0);
      }
    }

    static normalizeText(raw, options = {}) {
      return normalizeText(raw, options.variable || "x");
    }

    static parse(raw, options = {}) {
      return parsePolynomial(raw, options);
    }

    static normalizeTerms(terms, options = {}) {
      return normalizeTerms(terms, options.coefficientMode || "integer");
    }

    static termsToHTML(terms, options = {}) {
      return termsToHTML(
        terms,
        options.variable || "x",
        options.coefficientMode || "integer"
      );
    }

    defaultHelpText() {
      const v = escapeHTML(this.options.variable);
      const fractionHelp = this.options.coefficientMode === "rational"
        ? `需要分數係數時可按「分數」，在上方填分子、下方填分母；請化成最簡分數。`
        : "";

      return (
        `可直接輸入完整多項式。需要次方時，把游標放在 ${v} 後面按「次方」，` +
        `輸入 2、3…後會自動寫成 ${v}²、${v}³。` +
        `${fractionHelp}` +
        `<strong>^ 也代表次方</strong>，例如 <strong>${v}^2</strong> 代表 ${v}²。` +
        `系統也會自動辨識 X、Ｘ、ｘ與常見全形符號。`
      );
    }

    render() {
      const fractionButton = this.options.coefficientMode === "rational"
        ? `<button class="pai-fraction-button" type="button" title="插入分數係數"><span class="pai-fraction-icon"><span>□</span><span>□</span></span>分數</button>`
        : "";

      const richMode =
        this.options.coefficientMode === "rational";

      this.mount.innerHTML = `
        <div class="pai-shell ${richMode ? "pai-shell--rational" : ""}"
             style="--pai-primary:${escapeHTML(this.options.primary)};--pai-primary-dark:${escapeHTML(this.options.primaryDark)};--pai-primary-light:${escapeHTML(this.options.primaryLight)};--pai-primary-border:${escapeHTML(this.options.primaryBorder)};">
          <div class="pai-input-row">
            <div class="pai-main-wrap">
              ${
                richMode
                  ? `<div class="pai-rich-input-display pai-rich-input-display--placeholder">${escapeHTML(this.options.placeholder)}</div>`
                  : ""
              }
              <input class="pai-main-input ${richMode ? "pai-main-input--rich-source" : ""}" type="text" inputmode="text" autocapitalize="off" autocomplete="off" spellcheck="false" placeholder="${richMode ? "" : escapeHTML(this.options.placeholder)}" aria-label="${escapeHTML(this.options.ariaLabel)}">
            </div>
            <div class="pai-tool-buttons">
              <button class="pai-exponent-button" type="button" title="先把游標放在 x 後面，再按次方"><span class="pai-exponent-icon">${escapeHTML(this.options.variable)}ⁿ</span>次方</button>
              ${fractionButton}
            </div>
          </div>
          <p class="pai-help">${this.options.helpText || this.defaultHelpText()}</p>
          <div class="pai-preview pai-preview--incomplete">系統判斷：目前尚未輸入答案。</div>
        </div>
      `;

      this.root = this.mount.querySelector(".pai-shell");
      this.input = this.mount.querySelector(".pai-main-input");
      this.richDisplay = this.mount.querySelector(".pai-rich-input-display");
      this.exponentButton = this.mount.querySelector(".pai-exponent-button");
      this.fractionButton = this.mount.querySelector(".pai-fraction-button");
      this.preview = this.mount.querySelector(".pai-preview");

      this.updateRichDisplay();
    }

    bind() {
      this._handleInput = () => {
        this.updatePreview();
        if (typeof this.options.onChange === "function") {
          this.options.onChange(this.validate());
        }
      };

      this._handlePaste = () => setTimeout(this._handleInput, 0);
      this._handleExponentClick = () => this.openExponentPopup();
      this._handleFractionClick = () => this.openFractionPopup();

      this.input.addEventListener("input", this._handleInput);
      this.input.addEventListener("blur", this._handleInput);
      this.input.addEventListener("paste", this._handlePaste);
      this.exponentButton.addEventListener("click", this._handleExponentClick);
      this.fractionButton?.addEventListener("click", this._handleFractionClick);
    }

    parse() {
      return parsePolynomial(this.input?.value ?? "", {
        variable: this.options.variable,
        maxExponent: this.options.maxExponent,
        allowBareExponent: this.options.allowBareExponent,
        coefficientMode: this.options.coefficientMode,
        requireSimplifiedFraction: this.options.requireSimplifiedFraction
      });
    }

    validate() {
      return this.parse();
    }

    updateRichDisplay() {
      if (!this.richDisplay) {
        return;
      }

      const raw =
        this.input?.value ?? "";

      if (!raw) {
        this.richDisplay.classList.add(
          "pai-rich-input-display--placeholder"
        );
        this.richDisplay.textContent =
          this.options.placeholder;
        return;
      }

      this.richDisplay.classList.remove(
        "pai-rich-input-display--placeholder"
      );

      const result =
        this.parse();

      this.richDisplay.innerHTML =
        result.valid
          ? result.display
          : rawTextToRichHTML(
              raw,
              this.options.variable
            );
    }

    updatePreview() {
      this.updateRichDisplay();
      if (!this.preview) return;
      const result = this.parse();

      this.preview.classList.remove(
        "pai-preview--valid",
        "pai-preview--incomplete",
        "pai-preview--invalid"
      );

      if (result.valid) {
        this.preview.classList.add("pai-preview--valid");
        this.preview.innerHTML = `系統判斷目前填入的答案：<strong>${result.display}</strong>`;
        return;
      }

      this.preview.classList.add(
        result.incomplete ? "pai-preview--incomplete" : "pai-preview--invalid"
      );
      this.preview.textContent = `系統判斷：${result.message}`;
    }

    showPreviewMessage(message, type = "invalid") {
      if (!this.preview) return;
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
      this.preview.textContent = `系統判斷：${message}`;
    }

    caretVisualPosition(caretIndex) {
      const input = this.input;
      const rect = input.getBoundingClientRect();
      const style = getComputedStyle(input);
      const canvas = PolynomialAnswerInput._canvas || (PolynomialAnswerInput._canvas = document.createElement("canvas"));
      const context = canvas.getContext("2d");

      context.font = [
        style.fontStyle,
        style.fontVariant,
        style.fontWeight,
        style.fontSize,
        style.fontFamily
      ].filter(Boolean).join(" ");

      const before = input.value.slice(0, caretIndex);
      const width = context.measureText(before).width;
      const paddingLeft = parseFloat(style.paddingLeft) || 0;

      return {
        left: rect.left + paddingLeft + width - input.scrollLeft,
        top: rect.top + Math.max(2, rect.height * .08),
        rect
      };
    }

    closeExponentPopup({ restoreFocus = false } = {}) {
      this.exponentPopup?.remove();
      this.exponentPopup = null;

      if (restoreFocus && this.input) {
        this.input.focus({ preventScroll: true });
        const position = Math.min(
          this.exponentInsertPosition ?? this.input.value.length,
          this.input.value.length
        );
        this.input.setSelectionRange(position, position);
      }

      this.exponentInsertPosition = null;
    }

    insertSuperscriptDigit(digit) {
      if (!this.input || this.exponentInsertPosition == null) return;
      const superscript = DIGIT_TO_SUPERSCRIPT[String(digit)];
      if (!superscript) return;

      const position = this.exponentInsertPosition;
      const value = this.input.value;
      this.input.value = value.slice(0, position) + superscript + value.slice(position);
      this.closeExponentPopup();

      const nextPosition = position + superscript.length;
      this.input.focus({ preventScroll: true });
      this.input.setSelectionRange(nextPosition, nextPosition);
      this.input.dispatchEvent(new Event("input", { bubbles: true }));
    }

    openExponentPopup() {
      if (!this.input || this.disabled || this.input.disabled) return;

      this.closeFractionPopup();
      this.input.focus({ preventScroll: true });

      const start = this.input.selectionStart ?? this.input.value.length;
      const end = this.input.selectionEnd ?? start;
      const previous = this.input.value.charAt(start - 1);

      if (start !== end || start <= 0 || !/[xXＸｘ]/.test(previous)) {
        this.showPreviewMessage("請先把游標放在 x 後面，再按「次方」。");
        return;
      }

      this.closeExponentPopup();
      this.exponentInsertPosition = start;
      const position = this.caretVisualPosition(start);
      const popup = document.createElement("input");

      popup.className = "pai-exponent-popup";
      popup.type = "text";
      popup.inputMode = "numeric";
      popup.autocomplete = "off";
      popup.maxLength = 1;
      popup.setAttribute("aria-label", "輸入次方");
      popup.placeholder = "n";

      const popupWidth = 42;
      const left = Math.min(
        Math.max(position.left - 4, position.rect.left + 8),
        position.rect.right - popupWidth - 8
      );

      popup.style.left = `${left}px`;
      popup.style.top = `${position.top}px`;
      popup.style.setProperty("--pai-primary", this.options.primary);
      popup.style.setProperty("--pai-primary-dark", this.options.primaryDark);
      document.body.appendChild(popup);
      this.exponentPopup = popup;

      popup.addEventListener("input", () => {
        const digit = (popup.value.match(/[0-9]/) || [""])[0];
        if (!digit) {
          popup.value = "";
          return;
        }
        this.insertSuperscriptDigit(digit);
      });

      popup.addEventListener("keydown", event => {
        if (["Escape", "ArrowRight", "Tab", "Enter"].includes(event.key)) {
          event.preventDefault();
          this.closeExponentPopup({ restoreFocus: true });
        }
      });

      popup.addEventListener("blur", () => {
        setTimeout(() => {
          if (this.exponentPopup === popup) this.closeExponentPopup();
        }, 120);
      });

      requestAnimationFrame(() => popup.focus({ preventScroll: true }));
    }

    closeFractionPopup({ restoreFocus = false } = {}) {
      this.fractionPopup?.remove();
      this.fractionPopup = null;

      if (restoreFocus && this.input) {
        this.input.focus({ preventScroll: true });
        const position = Math.min(
          this.fractionInsertPosition ?? this.input.value.length,
          this.input.value.length
        );
        this.input.setSelectionRange(position, position);
      }

      this.fractionInsertPosition = null;
    }

    insertFraction(numerator, denominator) {
      if (!this.input || this.fractionInsertPosition == null) return;

      const n = Number(numerator);
      const d = Number(denominator);

      if (!Number.isInteger(n) || !Number.isInteger(d) || d === 0) {
        this.showPreviewMessage("分子、分母請輸入整數，而且分母不可為 0。");
        return;
      }

      const sign = n < 0 ? "-" : "";
      const absN = Math.abs(n);
      const token = `${sign}${absN}/${Math.abs(d)}`;
      const position = this.fractionInsertPosition;
      const value = this.input.value;

      this.input.value = value.slice(0, position) + token + value.slice(position);
      this.closeFractionPopup();

      const nextPosition = position + token.length;
      this.input.focus({ preventScroll: true });
      this.input.setSelectionRange(nextPosition, nextPosition);
      this.input.dispatchEvent(new Event("input", { bubbles: true }));
    }

    openFractionPopup() {
      if (
        this.options.coefficientMode !== "rational" ||
        !this.input ||
        this.disabled ||
        this.input.disabled
      ) return;

      this.closeExponentPopup();
      this.input.focus({ preventScroll: true });
      const start = this.input.selectionStart ?? this.input.value.length;
      const end = this.input.selectionEnd ?? start;

      if (start !== end) {
        this.showPreviewMessage("插入分數前，請先把游標放在要輸入係數的位置。分數按鈕目前不會覆蓋選取文字。");
        return;
      }

      this.closeFractionPopup();
      this.fractionInsertPosition = start;
      const position = this.caretVisualPosition(start);
      const popup = document.createElement("div");

      popup.className = "pai-fraction-popup";
      popup.style.setProperty("--pai-primary", this.options.primary);
      popup.style.setProperty("--pai-primary-dark", this.options.primaryDark);
      popup.innerHTML = `
        <div class="pai-fraction-popup-title">輸入分數係數</div>
        <input class="pai-fraction-numerator" type="text" inputmode="numeric" autocomplete="off" placeholder="分子" aria-label="分子">
        <div class="pai-fraction-line"></div>
        <input class="pai-fraction-denominator" type="text" inputmode="numeric" autocomplete="off" placeholder="分母" aria-label="分母">
        <div class="pai-fraction-popup-actions">
          <button type="button" class="pai-fraction-cancel">取消</button>
          <button type="button" class="pai-fraction-confirm">插入</button>
        </div>
      `;

      const popupWidth = 154;
      const left = Math.min(
        Math.max(position.left - 54, 8),
        window.innerWidth - popupWidth - 8
      );
      const top = Math.min(position.rect.bottom + 6, window.innerHeight - 190);

      popup.style.left = `${left}px`;
      popup.style.top = `${Math.max(8, top)}px`;
      document.body.appendChild(popup);
      this.fractionPopup = popup;

      const num = popup.querySelector(".pai-fraction-numerator");
      const den = popup.querySelector(".pai-fraction-denominator");
      const confirm = popup.querySelector(".pai-fraction-confirm");
      const cancel = popup.querySelector(".pai-fraction-cancel");

      const commit = () => {
        const numeratorRaw = num.value.trim();
        const denominatorRaw = den.value.trim();

        if (!/^-?\d+$/.test(numeratorRaw) || !/^\d+$/.test(denominatorRaw)) {
          this.showPreviewMessage("請完整填入分子與分母。分子可以是負數，分母請輸入正整數。");
          return;
        }

        const numerator = Number(numeratorRaw);
        const denominator = Number(denominatorRaw);

        if (denominator === 0) {
          this.showPreviewMessage("分母不可為 0。");
          return;
        }

        if (this.options.requireSimplifiedFraction && gcd(numerator, denominator) !== 1) {
          this.showPreviewMessage(`分數 ${numerator}/${denominator} 還不是最簡分數，請先約分。`);
          return;
        }

        this.insertFraction(numerator, denominator);
      };

      num.addEventListener("keydown", event => {
        if (event.key === "Enter") {
          event.preventDefault();
          den.focus();
        } else if (event.key === "Escape") {
          event.preventDefault();
          this.closeFractionPopup({ restoreFocus: true });
        }
      });

      den.addEventListener("keydown", event => {
        if (event.key === "Enter") {
          event.preventDefault();
          commit();
        } else if (event.key === "Escape") {
          event.preventDefault();
          this.closeFractionPopup({ restoreFocus: true });
        }
      });

      confirm.addEventListener("click", commit);
      cancel.addEventListener("click", () => this.closeFractionPopup({ restoreFocus: true }));

      requestAnimationFrame(() => num.focus({ preventScroll: true }));
    }

    focus() {
      this.input?.focus();
    }

    reset() {
      this.closeExponentPopup();
      this.closeFractionPopup();
      if (this.input) this.input.value = "";
      this.updateRichDisplay();
      this.updatePreview();
    }

    setDisabled(disabled) {
      this.disabled = Boolean(disabled);
      if (this.input) this.input.disabled = this.disabled;
      if (this.exponentButton) this.exponentButton.disabled = this.disabled;
      if (this.fractionButton) this.fractionButton.disabled = this.disabled;
      if (this.disabled) {
        this.closeExponentPopup();
        this.closeFractionPopup();
      }
    }

    getRawValue() {
      return this.input?.value ?? "";
    }

    setValue(value) {
      if (!this.input) return;
      this.input.value = String(value ?? "");
      this.updateRichDisplay();
      this.updatePreview();
    }

    destroy() {
      this.closeExponentPopup();
      this.closeFractionPopup();

      this.input?.removeEventListener("input", this._handleInput);
      this.input?.removeEventListener("blur", this._handleInput);
      this.input?.removeEventListener("paste", this._handlePaste);
      this.exponentButton?.removeEventListener("click", this._handleExponentClick);
      this.fractionButton?.removeEventListener("click", this._handleFractionClick);

      this.mount.innerHTML = "";
      this.root = null;
      this.input = null;
      this.richDisplay = null;
      this.exponentButton = null;
      this.fractionButton = null;
      this.preview = null;
    }
  }

  window.PolynomialAnswerInput = PolynomialAnswerInput;
  window.PolynomialAnswerInputUtils = {
    normalizeText,
    parsePolynomial,
    normalizeTerms,
    termsToHTML,
    rawTextToRichHTML,
    fraction,
    sameFraction,
    coefficientToFraction
  };
})();
