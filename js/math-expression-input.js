/*
==================================================
MathExpressionInput 共用數學運算式輸入元件
版本：1.7.0
==================================================

設計原則：
- 介面只保留「一個答案框＋必要功能鍵」。
- 數字、+、- 直接用鍵盤輸入。
- 特殊符號才使用按鈕：√ 根號、分數、± 正負號、次方、x。
- 次方是通用功能，可接在數字、x、括號、根號或其他完整底數後。
- 分數內可以再插入根號；根號內也可以再插入分數。
- 主答案框直接顯示正式數學排版。
- 實際鍵盤輸入仍使用原生 input，避免 Android contenteditable 問題。

編輯時直接使用可讀數學符號：
√5
(2√5)/(3)
√((3)/(5))
2√3+√7
==================================================
*/

(function () {
  "use strict";

  const PLACEHOLDER = "□";

  const DEFAULTS = {
    mountId: "",
    placeholder: "請輸入答案",
    allowRadical: true,
    allowFraction: true,
    allowPower: false,
    allowVariable: false,
    allowPlusMinus: false,
    variable: "x",

    /*
    numeric-radical：
      原本數值／根式模式

    polynomial：
      支援 x、多項式、括號、乘法、分數係數與任意整數次方
    */
    validationMode: "numeric-radical",

    /*
    工具列順序可依遊戲調整。
    */
    toolOrder: [
      "radical",
      "fraction",
      "plusMinus",
      "power",
      "variable"
    ],
    requireSimplifiedRadical: true,
    requireSimplifiedFraction: true,
    requireRationalDenominator: true,
    autoFocus: true,
    theme: {
      primary: "#7b1fa2",
      dark: "#4a148c",
      light: "#f3e5f5",
      border: "#ce93d8"
    }
  };

  function escapeHTML(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }


  const SUPERSCRIPT_DIGITS = {
    "0":"⁰","1":"¹","2":"²","3":"³","4":"⁴",
    "5":"⁵","6":"⁶","7":"⁷","8":"⁸","9":"⁹"
  };

  function toSuperscriptDigits(value) {
    return String(value ?? "")
      .split("")
      .map(ch => SUPERSCRIPT_DIGITS[ch] || "")
      .join("");
  }

  function needsGrouping(source) {
    source = String(source ?? "").trim();

    if (!source) {
      return false;
    }

    let depth = 0;

    for (let i = 0; i < source.length; i++) {
      const ch = source[i];

      if (ch === "(") {
        depth++;
      } else if (ch === ")") {
        depth = Math.max(0, depth - 1);
      } else if (
        depth === 0 &&
        (
          ch === "+" ||
          ch === "±" ||
          (
            ch === "-" &&
            i > 0
          )
        )
      ) {
        return true;
      }
    }

    return false;
  }

  function gcd(a, b) {
    a = Math.abs(Math.trunc(Number(a) || 0));
    b = Math.abs(Math.trunc(Number(b) || 0));

    while (b) {
      const t = a % b;
      a = b;
      b = t;
    }

    return a || 1;
  }

  function gcdMany(values) {
    const nums = values
      .map(v => Math.abs(Math.trunc(Number(v) || 0)))
      .filter(v => v !== 0);

    if (!nums.length) {
      return 1;
    }

    return nums.reduce((a, b) => gcd(a, b));
  }

  function largestSquareFactor(n) {
    n = Math.abs(Math.trunc(Number(n)));

    if (!Number.isFinite(n) || n <= 1) {
      return 1;
    }

    let largest = 1;

    for (let i = 2; i * i <= n; i++) {
      const sq = i * i;

      if (n % sq === 0) {
        largest = sq;
      }
    }

    return largest;
  }

  function simplifySquareRoot(n) {
    n = Math.trunc(Number(n));

    if (!Number.isFinite(n) || n < 0) {
      return null;
    }

    if (n === 0) {
      return {
        coefficient: 0,
        radicand: 1
      };
    }

    const square =
      largestSquareFactor(n);

    return {
      coefficient:
        Math.sqrt(square),
      radicand:
        n / square
    };
  }

  class Fraction {
    constructor(numerator = 0, denominator = 1) {
      numerator = Number(numerator);
      denominator = Number(denominator);

      if (
        !Number.isInteger(numerator) ||
        !Number.isInteger(denominator)
      ) {
        throw new Error("Fraction 只接受整數分子與分母。");
      }

      if (denominator === 0) {
        throw new Error("分母不能是 0。");
      }

      if (denominator < 0) {
        numerator *= -1;
        denominator *= -1;
      }

      const d =
        gcd(
          Math.abs(numerator),
          denominator
        );

      this.numerator =
        numerator / d;

      this.denominator =
        denominator / d;
    }

    add(other) {
      other = Fraction.from(other);

      return new Fraction(
        this.numerator * other.denominator +
          other.numerator * this.denominator,
        this.denominator * other.denominator
      );
    }

    subtract(other) {
      return this.add(
        Fraction.from(other).negate()
      );
    }

    multiply(other) {
      other = Fraction.from(other);

      return new Fraction(
        this.numerator * other.numerator,
        this.denominator * other.denominator
      );
    }

    divide(other) {
      other = Fraction.from(other);

      if (other.numerator === 0) {
        throw new Error("不能除以 0。");
      }

      return new Fraction(
        this.numerator * other.denominator,
        this.denominator * other.numerator
      );
    }

    negate() {
      return new Fraction(
        -this.numerator,
        this.denominator
      );
    }

    isZero() {
      return this.numerator === 0;
    }

    isInteger() {
      return this.denominator === 1;
    }

    equals(other) {
      other = Fraction.from(other);

      return (
        this.numerator === other.numerator &&
        this.denominator === other.denominator
      );
    }

    static from(value) {
      return value instanceof Fraction
        ? value
        : new Fraction(value, 1);
    }
  }

  function normalizeSource(raw) {
    return String(raw ?? "")
      .replace(/[＋﹢]/g, "+")
      .replace(/[－−–—]/g, "-")
      .replace(/[×＊]/g, "*")
      .replace(/[÷／]/g, "/")
      .replace(/[ＸｘX]/g, "x")
      .replace(/sqrt\s*/gi, "√")
      .replace(
        /[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g,
        superscriptRun => {
          const map = {
            "⁰":"0","¹":"1","²":"2","³":"3","⁴":"4",
            "⁵":"5","⁶":"6","⁷":"7","⁸":"8","⁹":"9"
          };

          const digits =
            [...superscriptRun]
              .map(ch => map[ch] || "")
              .join("");

          return digits
            ? `^(${digits})`
            : "";
        }
      )
      .replace(/\s+/g, "");
  }

  function tokenize(source) {
    const tokens = [];
    let i = 0;

    while (i < source.length) {
      const ch = source[i];

      if (/\d/.test(ch)) {
        let text = ch;
        i++;

        while (
          i < source.length &&
          /\d/.test(source[i])
        ) {
          text += source[i++];
        }

        tokens.push({
          type: "number",
          value: Number(text),
          raw: text
        });

        continue;
      }

      if (
        /[a-zA-Z]/.test(ch)
      ) {
        let word = ch;
        i++;

        while (
          i < source.length &&
          /[a-zA-Z]/.test(source[i])
        ) {
          word += source[i++];
        }

        tokens.push({
          type: "word",
          value: word.toLowerCase()
        });

        continue;
      }

      if (ch === PLACEHOLDER) {
        tokens.push({
          type: "placeholder",
          value: ch
        });
        i++;
        continue;
      }

      if (ch === "√") {
        tokens.push({
          type: "sqrtSymbol",
          value: ch
        });
        i++;
        continue;
      }

      if ("+-*/^(),±".includes(ch)) {
        tokens.push({
          type: ch,
          value: ch
        });
        i++;
        continue;
      }

      throw new Error(
        `無法辨識的符號：${ch}`
      );
    }

    tokens.push({
      type: "eof",
      value: ""
    });

    return tokens;
  }

  class Parser {
    constructor(source, variable = "x") {
      this.source =
        normalizeSource(source);

      this.variable =
        String(variable || "x")
          .toLowerCase();

      this.tokens =
        tokenize(this.source);

      this.index = 0;
    }

    peek(offset = 0) {
      return (
        this.tokens[
          this.index + offset
        ] ||
        {
          type: "eof"
        }
      );
    }

    consume(type) {
      const token =
        this.peek();

      if (
        type &&
        token.type !== type
      ) {
        throw new Error(
          `預期 ${type}，但讀到 ${token.type}。`
        );
      }

      this.index++;

      return token;
    }

    match(type) {
      if (
        this.peek().type ===
        type
      ) {
        this.index++;
        return true;
      }

      return false;
    }

    isFactorStart(token = this.peek()) {
      return (
        token.type === "number" ||
        token.type === "placeholder" ||
        token.type === "sqrtSymbol" ||
        token.type === "(" ||
        (
          token.type === "word" &&
          [
            "sqrt",
            "frac",
            this.variable
          ].includes(
            token.value
          )
        )
      );
    }

    parse() {
      const ast =
        this.parseExpression();

      if (
        this.peek().type !==
        "eof"
      ) {
        throw new Error(
          "答案後方還有無法辨識的內容。"
        );
      }

      return ast;
    }

    parseExpression() {
      let node =
        this.parseTerm();

      while (
        this.peek().type === "+" ||
        this.peek().type === "-" ||
        this.peek().type === "±"
      ) {
        const op =
          this.consume().type;

        const right =
          this.parseTerm();

        node = {
          type: "binary",
          op,
          left: node,
          right
        };
      }

      return node;
    }

    parseTerm() {
      let node =
        this.parseUnary();

      while (true) {
        if (
          this.peek().type === "*" ||
          this.peek().type === "/"
        ) {
          const op =
            this.consume().type;

          const right =
            this.parseUnary();

          node = {
            type: "binary",
            op,
            left: node,
            right
          };

          continue;
        }

        if (
          this.isFactorStart(
            this.peek()
          )
        ) {
          const right =
            this.parseUnary();

          node = {
            type: "binary",
            op: "*",
            implicit: true,
            left: node,
            right
          };

          continue;
        }

        break;
      }

      return node;
    }

    parseUnary() {
      if (
        this.match("+")
      ) {
        return {
          type: "unary",
          op: "+",
          value:
            this.parseUnary()
        };
      }

      if (
        this.match("-")
      ) {
        return {
          type: "unary",
          op: "-",
          value:
            this.parseUnary()
        };
      }

      return this.parsePower();
    }

    parsePower() {
      let node =
        this.parsePrimary();

      while (
        this.match("^")
      ) {
        let exponent;

        if (
          this.match("(")
        ) {
          exponent =
            this.parseExpression();

          this.consume(")");
        } else {
          exponent =
            this.parsePrimary();
        }

        node = {
          type: "power",
          base: node,
          exponent
        };
      }

      return node;
    }

    parsePrimary() {
      const token =
        this.peek();

      if (
        token.type ===
        "number"
      ) {
        this.consume();

        return {
          type: "number",
          value:
            token.value
        };
      }

      if (
        token.type ===
        "placeholder"
      ) {
        this.consume();

        return {
          type: "placeholder"
        };
      }

      if (
        token.type ===
        "sqrtSymbol"
      ) {
        this.consume();

        let value;

        if (
          this.match("(")
        ) {
          value =
            this.parseExpression();

          this.consume(")");
        } else {
          value =
            this.parsePrimary();
        }

        return {
          type: "sqrt",
          value
        };
      }

      if (
        token.type ===
        "word"
      ) {
        if (
          token.value ===
          this.variable
        ) {
          this.consume();

          return {
            type: "variable",
            name:
              this.variable
          };
        }

        if (
          token.value ===
          "sqrt"
        ) {
          this.consume();
          this.consume("(");

          const value =
            this.parseExpression();

          this.consume(")");

          return {
            type: "sqrt",
            value
          };
        }

        if (
          token.value ===
          "frac"
        ) {
          this.consume();
          this.consume("(");

          const numerator =
            this.parseExpression();

          this.consume(",");

          const denominator =
            this.parseExpression();

          this.consume(")");

          return {
            type: "fraction",
            numerator,
            denominator
          };
        }

        throw new Error(
          `不支援的文字：${token.value}`
        );
      }

      if (
        this.match("(")
      ) {
        const value =
          this.parseExpression();

        this.consume(")");

        return {
          type: "group",
          value
        };
      }

      throw new Error(
        "答案尚未輸入完整。"
      );
    }
  }


  function containsPlusMinus(
    ast
  ) {

    if (!ast) {
      return false;
    }

    if (
      ast.type === "binary" &&
      ast.op === "±"
    ) {
      return true;
    }

    switch (
      ast.type
    ) {

      case "group":
      case "sqrt":
      case "unary":

        return containsPlusMinus(
          ast.value
        );

      case "power":

        return (
          containsPlusMinus(
            ast.base
          ) ||
          containsPlusMinus(
            ast.exponent
          )
        );

      case "fraction":

        return (
          containsPlusMinus(
            ast.numerator
          ) ||
          containsPlusMinus(
            ast.denominator
          )
        );

      case "binary":

        return (
          containsPlusMinus(
            ast.left
          ) ||
          containsPlusMinus(
            ast.right
          )
        );

      default:

        return false;
    }
  }


  function cloneAst(
    ast
  ) {

    if (
      typeof structuredClone ===
      "function"
    ) {
      return structuredClone(
        ast
      );
    }

    return JSON.parse(
      JSON.stringify(
        ast
      )
    );
  }


  function expandPlusMinusAst(
    ast
  ) {

    if (!ast) {
      return [];
    }

    if (
      ast.type === "binary" &&
      ast.op === "±"
    ) {

      const leftBranches =
        expandPlusMinusAst(
          ast.left
        );

      const rightBranches =
        expandPlusMinusAst(
          ast.right
        );

      const results =
        [];

      for (
        const left of
        leftBranches
      ) {

        for (
          const right of
          rightBranches
        ) {

          results.push({
            type:
              "binary",
            op:
              "+",
            left:
              cloneAst(
                left
              ),
            right:
              cloneAst(
                right
              )
          });

          results.push({
            type:
              "binary",
            op:
              "-",
            left:
              cloneAst(
                left
              ),
            right:
              cloneAst(
                right
              )
          });
        }
      }

      return results;
    }


    const expandChild =
      child =>
        expandPlusMinusAst(
          child
        );


    switch (
      ast.type
    ) {

      case "group":
      case "sqrt":
      case "unary": {

        return expandChild(
          ast.value
        )
          .map(
            value => ({
              ...cloneAst(
                ast
              ),
              value
            })
          );
      }


      case "power": {

        const bases =
          expandChild(
            ast.base
          );

        const exponents =
          expandChild(
            ast.exponent
          );

        const result =
          [];

        for (
          const base of
          bases
        ) {

          for (
            const exponent of
            exponents
          ) {

            result.push({
              ...cloneAst(
                ast
              ),
              base,
              exponent
            });
          }
        }

        return result;
      }


      case "fraction": {

        const numerators =
          expandChild(
            ast.numerator
          );

        const denominators =
          expandChild(
            ast.denominator
          );

        const result =
          [];

        for (
          const numerator of
          numerators
        ) {

          for (
            const denominator of
            denominators
          ) {

            result.push({
              ...cloneAst(
                ast
              ),
              numerator,
              denominator
            });
          }
        }

        return result;
      }


      case "binary": {

        const lefts =
          expandChild(
            ast.left
          );

        const rights =
          expandChild(
            ast.right
          );

        const result =
          [];

        for (
          const left of
          lefts
        ) {

          for (
            const right of
            rights
          ) {

            result.push({
              ...cloneAst(
                ast
              ),
              left,
              right
            });
          }
        }

        return result;
      }


      default:

        return [
          cloneAst(
            ast
          )
        ];
    }
  }


  function containsPlaceholder(ast) {
    if (!ast) {
      return true;
    }

    switch (ast.type) {
      case "placeholder":
        return true;

      case "number":
      case "variable":
        return false;

      case "group":
      case "sqrt":
      case "unary":
        return containsPlaceholder(
          ast.value
        );

      case "power":
        return (
          containsPlaceholder(
            ast.base
          ) ||
          containsPlaceholder(
            ast.exponent
          )
        );

      case "fraction":
        return (
          containsPlaceholder(
            ast.numerator
          ) ||
          containsPlaceholder(
            ast.denominator
          )
        );

      case "binary":
        return (
          containsPlaceholder(
            ast.left
          ) ||
          containsPlaceholder(
            ast.right
          )
        );

      default:
        return true;
    }
  }

  function renderFraction(top, bottom) {
    if (
      window.RadicalDisplay?.fraction
    ) {
      return window.RadicalDisplay.fraction(
        top,
        bottom
      );
    }

    return `
      <span class="mei-fraction">
        <span class="mei-fraction-top">${top}</span>
        <span class="mei-fraction-bottom">${bottom}</span>
      </span>
    `;
  }

  function renderSqrt(content) {
    if (
      window.RadicalDisplay?.sqrt
    ) {
      return window.RadicalDisplay.sqrt(
        content
      );
    }

    return `
      <span class="mei-fallback-root">
        <span class="mei-fallback-root-sign">√</span>
        <span class="mei-fallback-root-content">${content}</span>
      </span>
    `;
  }

  function renderAst(ast, parentPrecedence = 0) {
    if (!ast) {
      return "";
    }

    switch (ast.type) {
      case "number":
        return escapeHTML(
          ast.value
        );

      case "placeholder":
        return `<span class="mei-slot" aria-label="待輸入"></span>`;

      case "variable":
        return `<span class="mei-variable">${escapeHTML(ast.name)}</span>`;

      case "group":
        return `(${renderAst(ast.value, 0)})`;

      case "sqrt":
        return renderSqrt(
          renderAst(
            ast.value,
            0
          )
        );

      case "fraction":
        return renderFraction(
          renderAst(
            ast.numerator,
            0
          ),
          renderAst(
            ast.denominator,
            0
          )
        );

      case "unary": {
        const body =
          renderAst(
            ast.value,
            4
          );

        return (
          ast.op === "-"
            ? `−${body}`
            : body
        );
      }

      case "power": {
        const base =
          renderAst(
            ast.base,
            4
          );

        const exponent =
          renderAst(
            ast.exponent,
            0
          );

        return `${base}<sup>${exponent}</sup>`;
      }

      case "binary": {
        const precedence =
          ast.op === "+" ||
          ast.op === "-" ||
          ast.op === "±"
            ? 1
            : 2;

        const left =
          renderAst(
            ast.left,
            precedence
          );

        const right =
          renderAst(
            ast.right,
            precedence + (
              ast.op === "-" ||
              ast.op === "/"
                ? 1
                : 0
            )
          );

        let html;

        if (
          ast.op === "+"
        ) {
          html =
            `${left}<span class="mei-op">＋</span>${right}`;
        } else if (
          ast.op === "-"
        ) {
          html =
            `${left}<span class="mei-op">−</span>${right}`;
        } else if (
          ast.op === "±"
        ) {
          html =
            `${left}<span class="mei-op mei-op--plus-minus">±</span>${right}`;
        } else if (
          ast.op === "/"
        ) {
          html =
            renderFraction(
              left,
              right
            );
        } else {
          const showMultiply =
            !ast.implicit ||
            (
              ast.left?.type === "sqrt" &&
              ast.right?.type === "sqrt"
            ) ||
            ast.left?.type === "fraction" ||
            ast.right?.type === "fraction";

          html =
            `${left}${showMultiply ? '<span class="mei-op">×</span>' : ""}${right}`;
        }

        if (
          precedence <
          parentPrecedence
        ) {
          return `(${html})`;
        }

        return html;
      }

      default:
        return "";
    }
  }

  function cloneLinear(linear) {
    const result =
      new Map();

    linear.forEach(
      (coefficient, radicand) => {
        result.set(
          Number(radicand),
          new Fraction(
            coefficient.numerator,
            coefficient.denominator
          )
        );
      }
    );

    return result;
  }

  function addTerm(
    target,
    radicand,
    coefficient
  ) {
    radicand =
      Number(radicand);

    coefficient =
      Fraction.from(
        coefficient
      );

    const old =
      target.get(radicand) ||
      new Fraction(0, 1);

    const next =
      old.add(
        coefficient
      );

    if (
      next.isZero()
    ) {
      target.delete(
        radicand
      );
    } else {
      target.set(
        radicand,
        next
      );
    }
  }

  function addLinear(a, b, sign = 1) {
    const result =
      cloneLinear(a);

    b.forEach(
      (coefficient, radicand) => {
        addTerm(
          result,
          radicand,
          sign === 1
            ? coefficient
            : coefficient.negate()
        );
      }
    );

    return result;
  }

  function multiplyLinear(a, b) {
    const result =
      new Map();

    a.forEach(
      (ca, ra) => {
        b.forEach(
          (cb, rb) => {
            const productRadicand =
              Number(ra) *
              Number(rb);

            const simplified =
              simplifySquareRoot(
                productRadicand
              );

            if (!simplified) {
              throw new Error(
                "目前不支援負數根號。"
              );
            }

            const coefficient =
              ca
                .multiply(cb)
                .multiply(
                  new Fraction(
                    simplified.coefficient,
                    1
                  )
                );

            addTerm(
              result,
              simplified.radicand,
              coefficient
            );
          }
        );
      }
    );

    return result;
  }

  function scalarFromLinear(linear) {
    if (
      linear.size !== 1 ||
      !linear.has(1)
    ) {
      return null;
    }

    return linear.get(1);
  }


  /*
  ==================================================
  Polynomial mode
  ==================================================
  Map<exponent, Fraction>
  ==================================================
  */

  function normalizePolynomialMap(poly) {
    const result =
      new Map();

    poly.forEach(
      (coefficient, exponent) => {
        coefficient =
          Fraction.from(
            coefficient
          );

        exponent =
          Number(
            exponent
          );

        if (
          !coefficient.isZero()
        ) {
          result.set(
            exponent,
            coefficient
          );
        }
      }
    );

    return result;
  }


  function polynomialConstant(value) {
    const result =
      new Map();

    const coefficient =
      Fraction.from(
        value
      );

    if (
      !coefficient.isZero()
    ) {
      result.set(
        0,
        coefficient
      );
    }

    return result;
  }


  function polynomialVariable() {
    return new Map([
      [
        1,
        new Fraction(
          1,
          1
        )
      ]
    ]);
  }


  function addPolynomial(
    a,
    b,
    sign = 1
  ) {
    const result =
      new Map();

    a.forEach(
      (coefficient, exponent) => {
        result.set(
          exponent,
          Fraction.from(
            coefficient
          )
        );
      }
    );

    b.forEach(
      (coefficient, exponent) => {
        const old =
          result.get(
            exponent
          ) ||
          new Fraction(
            0,
            1
          );

        const next =
          sign === 1
            ? old.add(
                coefficient
              )
            : old.subtract(
                coefficient
              );

        if (
          next.isZero()
        ) {
          result.delete(
            exponent
          );
        } else {
          result.set(
            exponent,
            next
          );
        }
      }
    );

    return normalizePolynomialMap(
      result
    );
  }


  function multiplyPolynomial(
    a,
    b
  ) {
    const result =
      new Map();

    a.forEach(
      (
        coefficientA,
        exponentA
      ) => {

        b.forEach(
          (
            coefficientB,
            exponentB
          ) => {

            const exponent =
              Number(
                exponentA
              ) +
              Number(
                exponentB
              );

            const old =
              result.get(
                exponent
              ) ||
              new Fraction(
                0,
                1
              );

            const next =
              old.add(
                coefficientA
                  .multiply(
                    coefficientB
                  )
              );

            if (
              next.isZero()
            ) {
              result.delete(
                exponent
              );
            } else {
              result.set(
                exponent,
                next
              );
            }
          }
        );
      }
    );

    return normalizePolynomialMap(
      result
    );
  }


  function dividePolynomialByScalar(
    polynomial,
    scalar
  ) {
    scalar =
      Fraction.from(
        scalar
      );

    if (
      scalar.isZero()
    ) {
      throw new Error(
        "分母不能是 0。"
      );
    }

    const result =
      new Map();

    polynomial.forEach(
      (
        coefficient,
        exponent
      ) => {
        result.set(
          exponent,
          coefficient.divide(
            scalar
          )
        );
      }
    );

    return normalizePolynomialMap(
      result
    );
  }


  function scalarFromPolynomial(
    polynomial
  ) {
    polynomial =
      normalizePolynomialMap(
        polynomial
      );

    if (
      polynomial.size ===
      0
    ) {
      return new Fraction(
        0,
        1
      );
    }

    if (
      polynomial.size !==
      1 ||
      !polynomial.has(
        0
      )
    ) {
      return null;
    }

    return polynomial.get(
      0
    );
  }


  function polynomialPower(
    base,
    exponent
  ) {
    exponent =
      Number(
        exponent
      );

    if (
      !Number.isInteger(
        exponent
      ) ||
      exponent < 0 ||
      exponent > 12
    ) {
      throw new Error(
        "次方目前支援 0～12 的整數。"
      );
    }

    let result =
      polynomialConstant(
        1
      );

    let current =
      normalizePolynomialMap(
        base
      );

    let power =
      exponent;

    while (
      power >
      0
    ) {
      if (
        power %
        2 ===
        1
      ) {
        result =
          multiplyPolynomial(
            result,
            current
          );
      }

      power =
        Math.floor(
          power /
          2
        );

      if (
        power >
        0
      ) {
        current =
          multiplyPolynomial(
            current,
            current
          );
      }
    }

    return result;
  }


  function polynomialize(ast) {
    switch (
      ast.type
    ) {

      case "number":

        return polynomialConstant(
          new Fraction(
            ast.value,
            1
          )
        );


      case "variable":

        return polynomialVariable();


      case "group":

        return polynomialize(
          ast.value
        );


      case "unary": {

        const inner =
          polynomialize(
            ast.value
          );

        if (
          ast.op === "+"
        ) {
          return inner;
        }

        return multiplyPolynomial(
          polynomialConstant(
            new Fraction(
              -1,
              1
            )
          ),
          inner
        );
      }


      case "fraction": {

        const numerator =
          polynomialize(
            ast.numerator
          );

        const denominator =
          polynomialize(
            ast.denominator
          );

        const scalar =
          scalarFromPolynomial(
            denominator
          );

        if (
          !scalar
        ) {
          throw new Error(
            "多項式分母目前只能是數值。"
          );
        }

        return dividePolynomialByScalar(
          numerator,
          scalar
        );
      }


      case "binary": {

        const left =
          polynomialize(
            ast.left
          );

        const right =
          polynomialize(
            ast.right
          );

        if (
          ast.op === "+"
        ) {
          return addPolynomial(
            left,
            right,
            1
          );
        }

        if (
          ast.op === "-"
        ) {
          return addPolynomial(
            left,
            right,
            -1
          );
        }

        if (
          ast.op === "*"
        ) {
          return multiplyPolynomial(
            left,
            right
          );
        }

        if (
          ast.op === "/"
        ) {
          const scalar =
            scalarFromPolynomial(
              right
            );

          if (
            !scalar
          ) {
            throw new Error(
              "多項式分母目前只能是數值。"
            );
          }

          return dividePolynomialByScalar(
            left,
            scalar
          );
        }

        throw new Error(
          "目前不支援這個多項式運算。"
        );
      }


      case "power": {

        const exponentPolynomial =
          polynomialize(
            ast.exponent
          );

        const exponentFraction =
          scalarFromPolynomial(
            exponentPolynomial
          );

        if (
          !exponentFraction ||
          !exponentFraction.isInteger()
        ) {
          throw new Error(
            "次方請輸入整數。"
          );
        }

        return polynomialPower(
          polynomialize(
            ast.base
          ),
          exponentFraction.numerator
        );
      }


      case "sqrt":

        throw new Error(
          "這個題型目前不需要根號。"
        );


      case "placeholder":

        throw new Error(
          "答案尚未輸入完整。"
        );


      default:

        throw new Error(
          "目前無法解析這個多項式答案。"
        );
    }
  }


  function polynomialMapToTerms(
    polynomial
  ) {

    return [
      ...normalizePolynomialMap(
        polynomial
      )
        .entries()
    ]
      .map(
        (
          [
            exponent,
            coefficient
          ]
        ) => ({
          exponent:
            Number(
              exponent
            ),

          numerator:
            coefficient.numerator,

          denominator:
            coefficient.denominator,

          coefficient: {
            numerator:
              coefficient.numerator,
            denominator:
              coefficient.denominator
          }
        })
      )
      .sort(
        (
          a,
          b
        ) =>
          b.exponent -
          a.exponent
      );
  }


  /*
  判斷「有沒有真的寫成乘積／次方形式」。
  防止學生直接把原多項式照抄回去。
  */
  function isFactorizedAst(
    ast
  ) {

    if (!ast) {
      return false;
    }

    if (
      ast.type ===
      "group"
    ) {
      return isFactorizedAst(
        ast.value
      );
    }

    if (
      ast.type ===
      "unary"
    ) {
      return isFactorizedAst(
        ast.value
      );
    }

    if (
      ast.type ===
      "binary" &&
      ast.op === "*"
    ) {
      return true;
    }

    if (
      ast.type ===
      "power"
    ) {
      try {
        const exponentPolynomial =
          polynomialize(
            ast.exponent
          );

        const scalar =
          scalarFromPolynomial(
            exponentPolynomial
          );

        return Boolean(
          scalar &&
          scalar.isInteger() &&
          scalar.numerator >= 2
        );
      } catch (_) {
        return false;
      }
    }

    return false;
  }


  function linearize(ast) {
    switch (ast.type) {
      case "number": {
        const result =
          new Map();

        addTerm(
          result,
          1,
          new Fraction(
            ast.value,
            1
          )
        );

        return result;
      }

      case "group":
        return linearize(
          ast.value
        );

      case "unary": {
        const inner =
          linearize(
            ast.value
          );

        if (
          ast.op === "+"
        ) {
          return inner;
        }

        const result =
          new Map();

        inner.forEach(
          (coefficient, radicand) => {
            addTerm(
              result,
              radicand,
              coefficient.negate()
            );
          }
        );

        return result;
      }

      case "sqrt": {
        const inner =
          linearize(
            ast.value
          );

        const scalar =
          scalarFromLinear(
            inner
          );

        if (
          !scalar ||
          !scalar.isInteger() ||
          scalar.numerator < 0
        ) {
          throw new Error(
            "根號內目前請輸入可判定的非負整數。"
          );
        }

        const simplified =
          simplifySquareRoot(
            scalar.numerator
          );

        const result =
          new Map();

        addTerm(
          result,
          simplified.radicand,
          new Fraction(
            simplified.coefficient,
            1
          )
        );

        return result;
      }

      case "fraction": {
        const numerator =
          linearize(
            ast.numerator
          );

        const denominator =
          linearize(
            ast.denominator
          );

        const scalar =
          scalarFromLinear(
            denominator
          );

        if (
          !scalar
        ) {
          throw new Error(
            "分母仍含根號或多個項，請先完成有理化。"
          );
        }

        if (
          scalar.isZero()
        ) {
          throw new Error(
            "分母不能是 0。"
          );
        }

        const result =
          new Map();

        numerator.forEach(
          (coefficient, radicand) => {
            addTerm(
              result,
              radicand,
              coefficient.divide(
                scalar
              )
            );
          }
        );

        return result;
      }

      case "binary": {
        const left =
          linearize(
            ast.left
          );

        const right =
          linearize(
            ast.right
          );

        if (
          ast.op === "+"
        ) {
          return addLinear(
            left,
            right,
            1
          );
        }

        if (
          ast.op === "-"
        ) {
          return addLinear(
            left,
            right,
            -1
          );
        }

        if (
          ast.op === "*"
        ) {
          return multiplyLinear(
            left,
            right
          );
        }

        if (
          ast.op === "/"
        ) {
          const scalar =
            scalarFromLinear(
              right
            );

          if (!scalar) {
            throw new Error(
              "分母仍含根號或多個項，請先完成有理化。"
            );
          }

          if (
            scalar.isZero()
          ) {
            throw new Error(
              "分母不能是 0。"
            );
          }

          const result =
            new Map();

          left.forEach(
            (coefficient, radicand) => {
              addTerm(
                result,
                radicand,
                coefficient.divide(
                  scalar
                )
              );
            }
          );

          return result;
        }

        throw new Error(
          "目前不支援這個運算。"
        );
      }

      case "power": {
        const exponentLinear =
          linearize(
            ast.exponent
          );

        const exponentFraction =
          scalarFromLinear(
            exponentLinear
          );

        if (
          !exponentFraction ||
          !exponentFraction.isInteger()
        ) {
          throw new Error(
            "次方目前請輸入整數。"
          );
        }

        const exponent =
          exponentFraction.numerator;

        if (
          exponent < 0 ||
          exponent > 8
        ) {
          throw new Error(
            "次方目前支援 0～8。"
          );
        }

        let result =
          new Map();

        addTerm(
          result,
          1,
          new Fraction(1, 1)
        );

        const base =
          linearize(
            ast.base
          );

        for (
          let i = 0;
          i < exponent;
          i++
        ) {
          result =
            multiplyLinear(
              result,
              base
            );
        }

        return result;
      }

      case "variable":
        throw new Error(
          "這個題型目前不需要 x。"
        );

      case "placeholder":
        throw new Error(
          "答案尚未輸入完整。"
        );

      default:
        throw new Error(
          "目前無法判定這個答案。"
        );
    }
  }

  function astIntegerValue(ast) {
    try {
      const linear =
        linearize(ast);

      const scalar =
        scalarFromLinear(
          linear
        );

      if (
        scalar &&
        scalar.isInteger()
      ) {
        return scalar.numerator;
      }
    } catch (_) {
      return null;
    }

    return null;
  }

  function collectSimplificationIssues(
    ast,
    options,
    issues
  ) {
    if (!ast) {
      return;
    }

    if (
      ast.type === "sqrt"
    ) {
      const integer =
        astIntegerValue(
          ast.value
        );

      if (
        options.requireSimplifiedRadical &&
        Number.isInteger(integer) &&
        integer > 0 &&
        largestSquareFactor(integer) > 1
      ) {
        issues.push(
          `√${integer} 還可以化簡。`
        );
      }

      collectSimplificationIssues(
        ast.value,
        options,
        issues
      );

      return;
    }

    if (
      ast.type === "fraction"
    ) {
      if (
        options.requireSimplifiedFraction
      ) {
        try {
          const numerator =
            linearize(
              ast.numerator
            );

          const denominator =
            linearize(
              ast.denominator
            );

          const d =
            scalarFromLinear(
              denominator
            );

          if (
            d &&
            d.isInteger()
          ) {
            const denominatorInteger =
              Math.abs(
                d.numerator
              );

            const integerCoefficients =
              [];

            let allInteger =
              true;

            numerator.forEach(
              coefficient => {
                if (
                  !coefficient.isInteger()
                ) {
                  allInteger =
                    false;
                } else {
                  integerCoefficients.push(
                    coefficient.numerator
                  );
                }
              }
            );

            if (
              allInteger &&
              denominatorInteger > 1
            ) {
              const common =
                gcd(
                  gcdMany(
                    integerCoefficients
                  ),
                  denominatorInteger
                );

              if (
                common > 1
              ) {
                issues.push(
                  `分數還可以約分（公因數 ${common}）。`
                );
              }
            }
          }
        } catch (_) {
          // 真正錯誤由 linearize() 統一回報。
        }
      }

      collectSimplificationIssues(
        ast.numerator,
        options,
        issues
      );

      collectSimplificationIssues(
        ast.denominator,
        options,
        issues
      );

      return;
    }

    if (
      ast.type === "binary"
    ) {
      collectSimplificationIssues(
        ast.left,
        options,
        issues
      );

      collectSimplificationIssues(
        ast.right,
        options,
        issues
      );

      return;
    }

    if (
      ast.type === "unary" ||
      ast.type === "group"
    ) {
      collectSimplificationIssues(
        ast.value,
        options,
        issues
      );

      return;
    }

    if (
      ast.type === "power"
    ) {
      collectSimplificationIssues(
        ast.base,
        options,
        issues
      );

      collectSimplificationIssues(
        ast.exponent,
        options,
        issues
      );
    }
  }

  function linearToTerms(linear) {
    return [
      ...linear.entries()
    ]
      .map(
        ([radicand, coefficient]) => ({
          radicand:
            Number(radicand),

          numerator:
            coefficient.numerator,

          denominator:
            coefficient.denominator
        })
      )
      .sort(
        (a, b) => {
          if (
            a.radicand === 1 &&
            b.radicand !== 1
          ) {
            return -1;
          }

          if (
            b.radicand === 1 &&
            a.radicand !== 1
          ) {
            return 1;
          }

          return (
            a.radicand -
            b.radicand
          );
        }
      );
  }

  function locateFunctionContext(
    source,
    caret
  ) {
    const stack = [];

    for (
      let i = 0;
      i < caret;
      i++
    ) {
      const rest =
        source.slice(i);

      let match =
        rest.match(
          /^(sqrt|frac)\(/
        );

      if (match) {
        stack.push({
          type:
            match[1],
          open:
            i + match[1].length,
          start:
            i,
          commaSeen:
            false
        });

        i +=
          match[0].length -
          1;

        continue;
      }

      if (
        source.startsWith(
          "^(",
          i
        )
      ) {
        stack.push({
          type: "power",
          open:
            i + 1,
          start:
            i,
          commaSeen:
            false
        });

        i += 1;

        continue;
      }

      if (
        source[i] === "," &&
        stack.length &&
        stack[
          stack.length - 1
        ].type === "frac"
      ) {
        stack[
          stack.length - 1
        ].commaSeen =
          true;

        continue;
      }

      if (
        source[i] === ")" &&
        stack.length
      ) {
        stack.pop();
      }
    }

    return (
      stack[
        stack.length - 1
      ] ||
      null
    );
  }


  function hasTopLevelAddSubtract(source) {
    let depth = 0;

    for (
      let i = 0;
      i < source.length;
      i++
    ) {
      const ch =
        source[i];

      if (
        ch === "("
      ) {
        depth++;
        continue;
      }

      if (
        ch === ")"
      ) {
        depth =
          Math.max(
            0,
            depth - 1
          );
        continue;
      }

      if (
        depth === 0 &&
        (
          ch === "+" ||
          (
            ch === "-" &&
            i > 0
          )
        )
      ) {
        return true;
      }
    }

    return false;
  }

  function stripOuterParentheses(source) {
    source =
      String(source ?? "")
        .trim();

    if (
      !source.startsWith("(") ||
      !source.endsWith(")")
    ) {
      return source;
    }

    let depth = 0;

    for (
      let i = 0;
      i < source.length;
      i++
    ) {
      const ch =
        source[i];

      if (
        ch === "("
      ) {
        depth++;
      } else if (
        ch === ")"
      ) {
        depth--;

        if (
          depth === 0 &&
          i <
            source.length - 1
        ) {
          return source;
        }
      }
    }

    return (
      depth === 0
        ? source.slice(
            1,
            -1
          )
        : source
    );
  }

  function cleanupEditableFractionText(source) {
    source =
      String(source ?? "")
        .trim();

    /*
    新版不再產生括號。
    只相容舊版：
    (2√3)/(3) → 2√3/3
    */
    const oldStyle =
      source.match(
        /^\((.+)\)\/\((.+)\)$/
      );

    if (
      oldStyle
    ) {
      return (
        `${oldStyle[1]}/${oldStyle[2]}`
      );
    }

    return source;
  }


  class MathExpressionInput {
    constructor(options = {}) {
      this.options = {
        ...DEFAULTS,
        ...options,
        theme: {
          ...DEFAULTS.theme,
          ...(
            options.theme ||
            {}
          )
        }
      };

      this.mount =
        document.getElementById(
          this.options.mountId
        );

      if (!this.mount) {
        throw new Error(
          `MathExpressionInput 找不到 mountId：${this.options.mountId}`
        );
      }

      this.disabled = false;
      this.lastSelection = {
        start: 0,
        end: 0
      };

      this.render();
      this.bind();
      this.updateEditorLayout();
      this.update();

      if (
        this.options.autoFocus
      ) {
        setTimeout(
          () => this.focus(),
          0
        );
      }
    }

    render() {
      const tools = [];

      if (
        this.options.allowRadical
      ) {
        tools.push(`
          <button
            type="button"
            class="mei-tool-button"
            data-tool="sqrt"
            title="插入根號"
          >
            <span class="mei-tool-symbol">√</span>
            根號
          </button>
        `);
      }

      if (
        this.options.allowFraction
      ) {
        tools.push(`
          <button
            type="button"
            class="mei-tool-button"
            data-tool="fraction"
            title="插入分數"
          >
            <span class="mei-mini-fraction">
              <span>□</span>
              <span>□</span>
            </span>
            分數
          </button>
        `);
      }

      if (
        this.options.allowPlusMinus
      ) {
        tools.push(`
          <button
            type="button"
            class="mei-tool-button"
            data-tool="plusMinus"
            title="插入正負號"
          >
            <span class="mei-tool-symbol">±</span>
            正負號
          </button>
        `);
      }

      if (
        this.options.allowPower
      ) {
        tools.push(`
          <button
            type="button"
            class="mei-tool-button"
            data-tool="power"
            title="在目前底數後插入次方"
          >
            <span class="mei-tool-symbol">
              □<sup>n</sup>
            </span>
            次方
          </button>
        `);
      }

      if (
        this.options.allowVariable
      ) {
        tools.push(`
          <button
            type="button"
            class="mei-tool-button"
            data-tool="variable"
            title="插入 ${escapeHTML(this.options.variable)}"
          >
            <span class="mei-tool-symbol">
              ${escapeHTML(this.options.variable)}
            </span>
          </button>
        `);
      }

      this.mount.innerHTML = `
        <div
          class="mei-shell"
          style="
            --mei-primary:${escapeHTML(this.options.theme.primary)};
            --mei-primary-dark:${escapeHTML(this.options.theme.dark)};
            --mei-primary-light:${escapeHTML(this.options.theme.light)};
            --mei-primary-border:${escapeHTML(this.options.theme.border)};
          "
        >
          <div class="mei-main-row">
            <div class="mei-editor-wrap">
              <div
                class="mei-rich-display mei-rich-display--placeholder"
                aria-hidden="true"
              >
                ${escapeHTML(this.options.placeholder)}
              </div>

              <input
                class="mei-source-input"
                type="text"
                inputmode="text"
                autocomplete="off"
                autocapitalize="off"
                spellcheck="false"
                aria-label="數學答案輸入"
              >
            </div>

            ${
              tools.length
                ? `
                  <div class="mei-toolbar">
                    ${
                      this.options.toolOrder
                        .map(
                          toolName =>
                            tools.find(
                              html =>
                                html.includes(
                                  `data-tool="${toolName === "radical" ? "sqrt" : toolName}"`
                                )
                            ) || ""
                        )
                        .join("")
                    }
                  </div>
                `
                : ""
            }
          </div>

          <div
            class="mei-special-editor mei-special-editor--fraction"
            data-special-editor="fraction"
            hidden
          >
            <div class="mei-special-editor-title">
              分數
            </div>

            <div class="mei-fraction-editor">
              <input
                class="mei-special-input mei-fraction-numerator"
                type="text"
                inputmode="text"
                autocomplete="off"
                placeholder="分子"
                aria-label="分子"
              >
              <span class="mei-fraction-editor-line"></span>
              <input
                class="mei-special-input mei-fraction-denominator"
                type="text"
                inputmode="text"
                autocomplete="off"
                placeholder="分母"
                aria-label="分母"
              >
            </div>

            <div class="mei-special-editor-actions">
              <button
                type="button"
                class="mei-special-confirm"
                data-special-confirm="fraction"
              >
                插入
              </button>

              <button
                type="button"
                class="mei-special-cancel"
                data-special-cancel
              >
                取消
              </button>
            </div>
          </div>

          <div
            class="mei-special-editor mei-special-editor--power"
            data-special-editor="power"
            hidden
          >
            <div class="mei-special-editor-title">
              次方
            </div>

            <div class="mei-power-editor-preview">
              □<sup>
                <input
                  class="mei-special-input mei-power-value"
                  type="text"
                  inputmode="numeric"
                  autocomplete="off"
                  placeholder="n"
                  aria-label="次方"
                >
              </sup>
            </div>

            <div class="mei-special-editor-actions">
              <button
                type="button"
                class="mei-special-confirm"
                data-special-confirm="power"
              >
                插入
              </button>

              <button
                type="button"
                class="mei-special-cancel"
                data-special-cancel
              >
                取消
              </button>
            </div>
          </div>

          <div class="mei-hint">
            數字、＋、−、括號可直接輸入；需要特殊符號時再按功能鍵。
          </div>

          <div
            class="mei-preview mei-preview--empty"
          >
            系統判斷：目前尚未完成答案。
          </div>
        </div>
      `;

      this.shell =
        this.mount.querySelector(
          ".mei-shell"
        );

      this.input =
        this.mount.querySelector(
          ".mei-source-input"
        );

      this.display =
        this.mount.querySelector(
          ".mei-rich-display"
        );

      this.preview =
        this.mount.querySelector(
          ".mei-preview"
        );

      this.toolButtons =
        [
          ...this.mount.querySelectorAll(
            ".mei-tool-button"
          )
        ];

      this.fractionEditor =
        this.mount.querySelector(
          '[data-special-editor="fraction"]'
        );

      this.powerEditor =
        this.mount.querySelector(
          '[data-special-editor="power"]'
        );

      this.fractionNumerator =
        this.mount.querySelector(
          ".mei-fraction-numerator"
        );

      this.fractionDenominator =
        this.mount.querySelector(
          ".mei-fraction-denominator"
        );

      this.powerValueInput =
        this.mount.querySelector(
          ".mei-power-value"
        );

      this.activeFractionInput =
        null;
    }

    bind() {
      const rememberSelection =
        () => {
          if (!this.input) {
            return;
          }

          this.lastSelection = {
            start:
              this.input.selectionStart ??
              this.input.value.length,

            end:
              this.input.selectionEnd ??
              this.input.value.length
          };
        };

      [
        "click",
        "keyup",
        "select"
      ].forEach(
        eventName => {
          this.input.addEventListener(
            eventName,
            rememberSelection
          );
        }
      );

      this.input.addEventListener(
        "focus",
        () => {
          rememberSelection();

          this.shell
            ?.classList
            .add(
              "mei-shell--editing"
            );
        }
      );

      this.input.addEventListener(
        "blur",
        () => {
          this.shell
            ?.classList
            .remove(
              "mei-shell--editing"
            );

          const cleaned =
            cleanupEditableFractionText(
              this.input.value
            );

          if (
            cleaned !==
            this.input.value
          ) {
            this.input.value =
              cleaned;

            const caret =
              this.input.value.length;

            this.lastSelection = {
              start: caret,
              end: caret
            };
          }

          this.updateEditorLayout();

          this.update();
        }
      );

      this.input.addEventListener(
        "input",
        () => {
          let value =
            normalizeSource(
              this.input.value
            );

          /*
          v1.3：
          分子／分母框框只做「待輸入提示」。
          一旦旁邊已經出現數字、x 或根號內容，
          自動移除該 □。
          */
          value =
            value
              .replace(
                /□(?=[0-9x√])/gi,
                ""
              )
              .replace(
                /(?<=[0-9x√])□/gi,
                ""
              );

          this.input.value =
            value;

          rememberSelection();

          this.updateEditorLayout();

          this.update();
        }
      );

      this.input.addEventListener(
        "keydown",
        () => {}
      );


      this.toolButtons.forEach(
        button => {
          button.addEventListener(
            "pointerdown",
            event => {
              event.preventDefault();
            }
          );

          button.addEventListener(
            "click",
            () => {
              const tool =
                button.dataset.tool;

              if (
                tool === "sqrt"
              ) {

                if (
                  this.fractionEditor &&
                  !this.fractionEditor.hidden
                ) {

                  this.insertIntoFractionField(
                    "√□",
                    1
                  );

                } else {

                  this.insertTemplate(
                    "√□",
                    1
                  );
                }

              } else if (
                tool === "fraction"
              ) {
                this.openFractionEditor();
              } else if (
                tool === "plusMinus"
              ) {

                if (
                  this.fractionEditor &&
                  !this.fractionEditor.hidden
                ) {

                  this.insertIntoFractionField(
                    "±",
                    0
                  );

                } else {

                  this.insertText(
                    "±",
                    {
                      selectPlaceholder:
                        false
                    }
                  );
                }

              } else if (
                tool === "power"
              ) {
                this.openPowerEditor();
              } else if (
                tool === "variable"
              ) {
                this.insertText(
                  this.options.variable,
                  {
                    selectPlaceholder:
                      false
                  }
                );
              }
            }
          );
        }
      );


      this.mount
        .querySelectorAll(
          "[data-special-cancel]"
        )
        .forEach(
          button => {
            button.addEventListener(
              "click",
              () =>
                this.closeSpecialEditors()
            );
          }
        );

      this.mount
        .querySelector(
          '[data-special-confirm="fraction"]'
        )
        ?.addEventListener(
          "click",
          () =>
            this.confirmFractionEditor()
        );

      this.mount
        .querySelector(
          '[data-special-confirm="power"]'
        )
        ?.addEventListener(
          "click",
          () =>
            this.confirmPowerEditor()
        );

      [
        this.fractionNumerator,
        this.fractionDenominator
      ]
        .filter(Boolean)
        .forEach(
          input => {

            input.addEventListener(
              "focus",
              () => {
                this.activeFractionInput =
                  input;
              }
            );

            input.addEventListener(
              "click",
              () => {
                this.activeFractionInput =
                  input;
              }
            );
          }
        );


      this.fractionNumerator
        ?.addEventListener(
          "keydown",
          event => {
            if (
              event.key === "Enter" ||
              event.key === "ArrowDown"
            ) {
              event.preventDefault();

              this.fractionDenominator
                ?.focus();
            }
          }
        );

      this.fractionDenominator
        ?.addEventListener(
          "keydown",
          event => {
            if (
              event.key === "Enter"
            ) {
              event.preventDefault();

              this.confirmFractionEditor();
            }
          }
        );

      this.powerValueInput
        ?.addEventListener(
          "keydown",
          event => {
            if (
              event.key === "Enter"
            ) {
              event.preventDefault();

              this.confirmPowerEditor();
            }
          }
        );
    }

    getSelection() {
      let start =
        this.input.selectionStart;

      let end =
        this.input.selectionEnd;

      if (
        start == null ||
        end == null
      ) {
        start =
          this.lastSelection.start;

        end =
          this.lastSelection.end;
      }

      return {
        start:
          Math.max(
            0,
            Number(start) || 0
          ),

        end:
          Math.max(
            0,
            Number(end) || 0
          )
      };
    }

    insertText(
      text,
      options = {}
    ) {
      if (
        this.disabled
      ) {
        return;
      }

      const {
        start,
        end
      } =
        this.getSelection();

      const current =
        this.input.value;

      const next =
        current.slice(
          0,
          start
        ) +
        text +
        current.slice(
          end
        );

      this.input.value =
        next;

      const caret =
        start +
        text.length;

      this.input.focus();

      this.input.setSelectionRange(
        caret,
        caret
      );

      this.lastSelection = {
        start: caret,
        end: caret
      };

      this.update();
    }

    insertIntoFractionField(
      template,
      placeholderOffset = 0
    ) {

      const input =
        this.activeFractionInput ||
        this.fractionNumerator;

      if (
        !input
      ) {
        return;
      }

      const start =
        input.selectionStart ??
        input.value.length;

      const end =
        input.selectionEnd ??
        start;

      const current =
        input.value;

      const next =
        current.slice(
          0,
          start
        ) +
        template +
        current.slice(
          end
        );

      input.value =
        next;

      const placeholderIndex =
        next.indexOf(
          PLACEHOLDER,
          start
        );

      input.focus();

      if (
        placeholderIndex >=
        0
      ) {

        input.setSelectionRange(
          placeholderIndex,
          placeholderIndex + 1
        );

      } else {

        const caret =
          start +
          template.length +
          placeholderOffset;

        input.setSelectionRange(
          caret,
          caret
        );
      }

      this.activeFractionInput =
        input;
    }


    closeSpecialEditors() {

      if (
        this.fractionEditor
      ) {
        this.fractionEditor.hidden =
          true;
      }

      if (
        this.powerEditor
      ) {
        this.powerEditor.hidden =
          true;
      }

      this.shell
        ?.classList
        .remove(
          "mei-shell--special-open"
        );
    }


    openFractionEditor() {

      if (
        this.disabled
      ) {
        return;
      }

      this.lastSelection =
        this.getSelection();

      this.closeSpecialEditors();

      if (
        !this.fractionEditor
      ) {
        return;
      }

      const {
        start,
        end
      } =
        this.lastSelection;

      const selected =
        end > start
          ? this.input.value.slice(
              start,
              end
            )
          : "";

      this.fractionNumerator.value =
        selected;

      this.fractionDenominator.value =
        "";

      this.activeFractionInput =
        selected
          ? this.fractionDenominator
          : this.fractionNumerator;

      this.fractionEditor.hidden =
        false;

      this.shell
        ?.classList
        .add(
          "mei-shell--special-open"
        );

      window.setTimeout(
        () => {
          if (
            selected
          ) {
            this.fractionDenominator
              ?.focus();
          } else {
            this.fractionNumerator
              ?.focus();
          }
        },
        0
      );
    }


    confirmFractionEditor() {

      const numerator =
        normalizeSource(
          (
            this.fractionNumerator
              ?.value ||
            ""
          )
            .replaceAll(
              PLACEHOLDER,
              ""
            )
        );

      const denominator =
        normalizeSource(
          (
            this.fractionDenominator
              ?.value ||
            ""
          )
            .replaceAll(
              PLACEHOLDER,
              ""
            )
        );

      if (
        !numerator ||
        !denominator
      ) {
        return;
      }

      const safeNumerator =
        needsGrouping(
          numerator
        )
          ? `(${numerator})`
          : numerator;

      const safeDenominator =
        needsGrouping(
          denominator
        )
          ? `(${denominator})`
          : denominator;

      const {
        start,
        end
      } =
        this.lastSelection;

      const current =
        this.input.value;

      const insertion =
        `${safeNumerator}/${safeDenominator}`;

      this.input.value =
        current.slice(
          0,
          start
        ) +
        insertion +
        current.slice(
          end
        );

      const caret =
        start +
        insertion.length;

      this.lastSelection = {
        start: caret,
        end: caret
      };

      this.closeSpecialEditors();

      this.input.focus();

      this.input.setSelectionRange(
        caret,
        caret
      );

      this.updateEditorLayout();
      this.update();
    }


    openPowerEditor() {

      if (
        this.disabled
      ) {
        return;
      }

      this.lastSelection =
        this.getSelection();

      this.closeSpecialEditors();

      if (
        !this.powerEditor
      ) {
        return;
      }

      this.powerValueInput.value =
        "";

      this.powerEditor.hidden =
        false;

      this.shell
        ?.classList
        .add(
          "mei-shell--special-open"
        );

      window.setTimeout(
        () =>
          this.powerValueInput
            ?.focus(),
        0
      );
    }


    confirmPowerEditor() {

      const raw =
        String(
          this.powerValueInput
            ?.value ||
          ""
        )
          .trim();

      if (
        !/^\d+$/.test(
          raw
        )
      ) {
        return;
      }

      const superscript =
        toSuperscriptDigits(
          raw
        );

      if (
        !superscript
      ) {
        return;
      }

      const {
        start,
        end
      } =
        this.lastSelection;

      const current =
        this.input.value;

      let insertion =
        superscript;

      if (
        end >
        start
      ) {

        const selected =
          current.slice(
            start,
            end
          );

        insertion =
          `(${selected})${superscript}`;
      }

      this.input.value =
        current.slice(
          0,
          start
        ) +
        insertion +
        current.slice(
          end
        );

      const caret =
        start +
        insertion.length;

      this.lastSelection = {
        start: caret,
        end: caret
      };

      this.closeSpecialEditors();

      this.input.focus();

      this.input.setSelectionRange(
        caret,
        caret
      );

      this.update();
    }


    insertTemplate(
      template,
      placeholderOffset
    ) {
      if (
        this.disabled
      ) {
        return;
      }

      const {
        start,
        end
      } =
        this.getSelection();

      const current =
        this.input.value;

      let insertion =
        template;

      if (
        end >
        start
      ) {
        const selected =
          current.slice(
            start,
            end
          );

        insertion =
          template.replace(
            PLACEHOLDER,
            selected
          );
      }

      const next =
        current.slice(
          0,
          start
        ) +
        insertion +
        current.slice(
          end
        );

      this.input.value =
        next;

      const placeholderIndex =
        next.indexOf(
          PLACEHOLDER,
          start
        );

      this.input.focus();

      if (
        placeholderIndex >= 0
      ) {
        this.input.setSelectionRange(
          placeholderIndex,
          placeholderIndex + 1
        );

        this.lastSelection = {
          start:
            placeholderIndex,
          end:
            placeholderIndex + 1
        };
      } else {
        const caret =
          start +
          insertion.length;

        this.input.setSelectionRange(
          caret,
          caret
        );

        this.lastSelection = {
          start: caret,
          end: caret
        };
      }

      this.update();
    }

    moveToFractionDenominator() {
      return false;
    }


    parse() {
      const raw =
        normalizeSource(
          this.input?.value ||
          ""
        );

      if (!raw) {
        return {
          valid: false,
          empty: true,
          message:
            "目前尚未完成答案。"
        };
      }

      let ast;

      try {
        ast =
          new Parser(
            raw,
            this.options.variable
          )
            .parse();
      } catch (error) {
        return {
          valid: false,
          message:
            error.message ||
            "答案格式尚未完成。"
        };
      }

      const display =
        renderAst(ast);

      if (
        containsPlaceholder(
          ast
        )
      ) {
        return {
          valid: false,
          incomplete: true,
          ast,
          display,
          message:
            "答案尚未輸入完整。"
        };
      }

      return {
        valid: true,
        ast,
        display,
        raw
      };
    }

    validate() {
      const parsed =
        this.parse();

      if (
        !parsed.valid
      ) {
        return parsed;
      }

      const issues =
        [];

      collectSimplificationIssues(
        parsed.ast,
        this.options,
        issues
      );

      if (
        issues.length
      ) {
        return {
          valid: false,
          ast:
            parsed.ast,
          display:
            parsed.display,
          message:
            `⚠️ ${issues[0]}`
        };
      }

      if (
        this.options.validationMode !==
          "polynomial" &&
        containsPlusMinus(
          parsed.ast
        )
      ) {

        try {

          const expandedAsts =
            expandPlusMinusAst(
              parsed.ast
            );

          const branches =
            expandedAsts.map(
              branchAst => {

                const linear =
                  linearize(
                    branchAst
                  );

                const terms =
                  linearToTerms(
                    linear
                  );

                return {
                  ast:
                    branchAst,
                  display:
                    renderAst(
                      branchAst
                    ),
                  terms,
                  value: {
                    terms,
                    display:
                      renderAst(
                        branchAst
                      )
                  }
                };
              }
            );


          return {
            valid: true,
            ast:
              parsed.ast,
            raw:
              parsed.raw,
            display:
              parsed.display,
            plusMinus:
              true,
            branches,
            values:
              branches
                .map(
                  branch =>
                    branch.value
                )
          };

        } catch (
          error
        ) {

          return {
            valid: false,
            ast:
              parsed.ast,
            display:
              parsed.display,
            message:
              error.message ||
              "正負號答案目前無法判定。"
          };
        }
      }


      if (
        this.options.validationMode ===
        "polynomial"
      ) {

        try {

          const polynomial =
            polynomialize(
              parsed.ast
            );

          const polynomialTerms =
            polynomialMapToTerms(
              polynomial
            );

          return {
            valid: true,
            ast:
              parsed.ast,
            raw:
              parsed.raw,
            display:
              parsed.display,
            polynomialTerms,
            terms:
              polynomialTerms,
            factorized:
              isFactorizedAst(
                parsed.ast
              ),
            value: {
              polynomialTerms,
              terms:
                polynomialTerms,
              factorized:
                isFactorizedAst(
                  parsed.ast
                ),
              display:
                parsed.display
            }
          };

        } catch (
          error
        ) {

          return {
            valid: false,
            ast:
              parsed.ast,
            display:
              parsed.display,
            message:
              error.message ||
              "目前無法判定這個多項式答案。"
          };
        }
      }


      let linear;

      try {
        linear =
          linearize(
            parsed.ast
          );
      } catch (error) {
        return {
          valid: false,
          ast:
            parsed.ast,
          display:
            parsed.display,
          message:
            error.message ||
            "目前無法判定這個答案。"
        };
      }

      const terms =
        linearToTerms(
          linear
        );

      return {
        valid: true,
        ast:
          parsed.ast,
        raw:
          parsed.raw,
        display:
          parsed.display,
        terms,
        value: {
          terms,
          display:
            parsed.display
        }
      };
    }

    updateEditorLayout() {
      if (
        !this.shell ||
        !this.input
      ) {
        return;
      }

      const hasFraction =
        this.input.value
          .includes("/");

      this.shell
        .classList
        .toggle(
          "mei-shell--has-fraction",
          hasFraction
        );
    }

    update() {
      const parsed =
        this.parse();

      const raw =
        this.input.value;

      if (!raw) {
        this.display.classList.add(
          "mei-rich-display--placeholder"
        );

        this.display.textContent =
          this.options.placeholder;

        this.preview.className =
          "mei-preview mei-preview--empty";

        this.preview.textContent =
          "系統判斷：目前尚未完成答案。";

        return;
      }

      this.display.classList.remove(
        "mei-rich-display--placeholder"
      );

      if (
        parsed.display
      ) {
        this.display.innerHTML =
          parsed.display;

        window.RadicalDisplay
          ?.mount(
            this.display
          );
      } else {
        this.display.textContent =
          raw;
      }

      const validation =
        this.validate();

      if (
        validation.valid
      ) {
        this.preview.className =
          "mei-preview mei-preview--valid";

        this.preview.innerHTML =
          `
            系統判斷目前填入的答案：
            <span class="mei-preview-value">
              ${validation.display}
            </span>
          `;

        window.RadicalDisplay
          ?.mount(
            this.preview
          );

        return;
      }

      this.preview.className =
        "mei-preview mei-preview--incomplete";

      this.preview.innerHTML =
        parsed.display
          ? `
              目前答案：
              <span class="mei-preview-value">
                ${parsed.display}
              </span>
              <span class="mei-preview-message">
                ${escapeHTML(validation.message || parsed.message || "")}
              </span>
            `
          : escapeHTML(
              validation.message ||
              parsed.message ||
              "答案尚未完成。"
            );

      window.RadicalDisplay
        ?.mount(
          this.preview
        );
    }

    focus() {
      this.input
        ?.focus();
    }

    reset() {
      if (!this.input) {
        return;
      }

      this.input.value = "";
      this.lastSelection = {
        start: 0,
        end: 0
      };

      this.updateEditorLayout();

      this.update();
    }

    setDisabled(disabled) {
      this.disabled =
        Boolean(disabled);

      if (this.input) {
        this.input.disabled =
          this.disabled;
      }

      this.toolButtons
        ?.forEach(
          button => {
            button.disabled =
              this.disabled;
          }
        );

      this.shell
        ?.classList
        .toggle(
          "mei-shell--disabled",
          this.disabled
        );
    }

    getRawValue() {
      return (
        this.input?.value ||
        ""
      );
    }

    setRawValue(value) {
      if (!this.input) {
        return;
      }

      this.input.value =
        normalizeSource(
          value
        );

      const caret =
        this.input.value.length;

      this.input.setSelectionRange(
        caret,
        caret
      );

      this.lastSelection = {
        start: caret,
        end: caret
      };

      this.updateEditorLayout();

      this.update();
    }

    destroy() {
      if (this.mount) {
        this.mount.innerHTML = "";
      }

      this.shell = null;
      this.input = null;
      this.display = null;
      this.preview = null;
      this.toolButtons = [];
    }
  }

  window.MathExpressionInput =
    MathExpressionInput;

  window.MathExpressionInputUtils = {
    Fraction,
    Parser,
    normalizeSource,
    renderAst,
    linearize,
    linearToTerms,
    largestSquareFactor,
    simplifySquareRoot,
    cleanupEditableFractionText,
    polynomialize,
    polynomialMapToTerms,
    isFactorizedAst,
    containsPlusMinus,
    expandPlusMinusAst
  };
})();
