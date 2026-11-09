/* 七上 3-2｜從 games/grade7-1/equation.html 擷取原始出題函式。
   原檔不修改。本模組是競賽用的獨立副本。 */
(()=>{
"use strict";

const GAME_ID =
  "equation";

const MODE_NAMES = {
  1:"模式一｜認識方程式與解的檢驗",
  2:"模式二｜基本一元一次方程式",
  3:"模式三｜移項與合併同類項",
  4:"模式四｜括號、負號與化簡",
  5:"模式五｜分數係數方程式"
};

const $ =
  id =>
    document.getElementById(id);

let mode = 1;
let questions = [];
let index = 0;
let correct = 0;
let wrong = 0;

let startTime = 0;
let timer = null;

let locked = false;
let nextReady = false;
let nextTimer = null;

let records = [];

let scoreSaved = false;
let finalElapsed = 0;

let equationAudioContext =
  null;


/*
==================================================
基本工具
==================================================
*/

function totalQuestions() {
  return (
    mode === 5
      ? 6
      : 10
  );
}

function rand(
  min,
  max
) {
  return (
    Math.floor(
      Math.random() *
      (
        max -
        min +
        1
      )
    ) +
    min
  );
}

function nz(
  min,
  max
) {
  let n = 0;

  while (!n) {
    n =
      rand(
        min,
        max
      );
  }

  return n;
}

function shuffle(array) {
  const result = [
    ...array
  ];

  for (
    let i =
      result.length - 1;
    i > 0;
    i--
  ) {
    const j =
      rand(
        0,
        i
      );

    [
      result[i],
      result[j]
    ] = [
      result[j],
      result[i]
    ];
  }

  return result;
}

function gcd(
  a,
  b
) {
  a =
    Math.abs(a);

  b =
    Math.abs(b);

  while (b) {
    const temp =
      a % b;

    a = b;

    b = temp;
  }

  return (
    a || 1
  );
}

/*
==================================================
分式題目最簡檢查

用途：
若題目顯示為

(ax + b) / m

則要求 a、b、m 沒有共同因數，
避免出現：

(4x − 6) / 12
5x / 5
4(3x − 5) / 8

這類可以先約分的分式。
==================================================
*/

function linearFractionIsSimplest(
  a,
  b,
  denominator
) {
  const common =
    gcd(
      gcd(
        Math.abs(a),
        Math.abs(b)
      ),
      Math.abs(denominator)
    );

  return common === 1;
}

function factorizedFractionIsSimplest(
  outsideCoefficient,
  denominator
) {
  return (
    gcd(
      Math.abs(
        outsideCoefficient
      ),
      Math.abs(
        denominator
      )
    ) === 1
  );
}


function rat(
  n,
  d = 1
) {
  if (
    d === 0
  ) {
    throw new Error(
      "分母不可為 0"
    );
  }

  if (
    d < 0
  ) {
    n =
      -n;

    d =
      -d;
  }

  const g =
    gcd(
      n,
      d
    );

  return {
    n:
      n / g,

    d:
      d / g
  };
}

function ratEq(
  a,
  b
) {
  return (
    a.n === b.n &&
    a.d === b.d
  );
}

function ratAbs(a) {
  return rat(
    Math.abs(a.n),
    a.d
  );
}

function ratAdd(
  a,
  b
) {
  return rat(
    a.n * b.d +
    b.n * a.d,
    a.d * b.d
  );
}

function ratSub(
  a,
  b
) {
  return rat(
    a.n * b.d -
    b.n * a.d,
    a.d * b.d
  );
}

function ratMul(
  a,
  b
) {
  return rat(
    a.n * b.n,
    a.d * b.d
  );
}

function ratDiv(
  a,
  b
) {
  if (
    b.n === 0
  ) {
    throw new Error(
      "不可除以 0"
    );
  }

  return rat(
    a.n * b.d,
    a.d * b.n
  );
}

function ratIsInteger(a) {
  return (
    a.d === 1
  );
}

function ratWithin(
  a,
  maxAbs = 80,
  maxDen = 12
) {
  return (
    Math.abs(a.n) <=
      maxAbs * a.d &&
    a.d <=
      maxDen
  );
}


/*
==================================================
數學格式
==================================================
*/

function integerText(n) {
  return String(n)
    .replace(
      "-",
      "−"
    );
}

function fx(n) {
  if (
    n === 1
  ) {
    return "x";
  }

  if (
    n === -1
  ) {
    return "−x";
  }

  return (
    (
      n < 0
        ? "−" +
          Math.abs(n)
        : n
    ) +
    "x"
  );
}

function linear(
  a,
  b
) {
  let text = "";

  if (a) {
    text =
      fx(a);
  }

  if (b) {
    if (!text) {
      text =
        integerText(b);
    } else {
      text +=
        b > 0
          ? ` + ${b}`
          : ` − ${Math.abs(b)}`;
    }
  }

  return (
    text || "0"
  );
}

function mathFracHTML(
  value,
  showSign = true
) {
  const negative =
    value.n < 0;

  const absolute =
    Math.abs(
      value.n
    );

  const sign =
    showSign &&
    negative
      ? "−"
      : "";

  if (
    value.d === 1
  ) {
    return (
      sign +
      absolute
    );
  }

  return (
    `${sign}` +
    `<span class="math-frac">` +
      `<span class="top">${absolute}</span>` +
      `<span class="bar"></span>` +
      `<span class="bottom">${value.d}</span>` +
    `</span>`
  );
}

function stackedFractionHTML(
  top,
  bottom
) {
  return (
    `<span class="math-frac">` +
      `<span class="top">${top}</span>` +
      `<span class="bar"></span>` +
      `<span class="bottom">${bottom}</span>` +
    `</span>`
  );
}

function signedHTML(
  value,
  first = false
) {
  const r =
    rat(
      value.n,
      value.d
    );

  if (first) {
    return mathFracHTML(
      r,
      true
    );
  }

  return (
    r.n < 0
      ? ` − ${mathFracHTML(
          ratAbs(r),
          false
        )}`
      : ` + ${mathFracHTML(
          r,
          false
        )}`
  );
}

function coefficientXHTML(
  value
) {
  const r =
    rat(
      value.n,
      value.d
    );

  if (
    r.n === 0
  ) {
    return "";
  }

  const negative =
    r.n < 0;

  const absolute =
    ratAbs(r);

  const sign =
    negative
      ? "−"
      : "";

  if (
    absolute.n ===
    absolute.d
  ) {
    return (
      `${sign}x`
    );
  }

  return (
    `${sign}` +
    `${mathFracHTML(
      absolute,
      false
    )}x`
  );
}

function rationalLinearHTML(
  a,
  b
) {
  let text = "";

  if (
    a.n !== 0
  ) {
    text =
      coefficientXHTML(a);
  }

  if (
    b.n !== 0
  ) {
    text +=
      signedHTML(
        b,
        !text
      );
  }

  return (
    text || "0"
  );
}


/*
==================================================
括號前係數
==================================================
*/

function bracketCoefficientText(
  coefficient,
  inside
) {
  if (
    coefficient === 1
  ) {
    return (
      `(${inside})`
    );
  }

  if (
    coefficient === -1
  ) {
    return (
      `−(${inside})`
    );
  }

  return (
    `${integerText(
      coefficient
    )}(${inside})`
  );
}


/*
==================================================
★ 本次重要修正

專門處理：

第一組括號 − 第二組括號

若第二組係數為：

1
→ − (...)

−1
→ + (...)

3
→ − 3(...)

−3
→ + 3(...)

因此永遠不會再出現：

− −(...)
==================================================
*/

function signedSubtractedBracketText(
  coefficient,
  inside
) {
  if (
    coefficient === 1
  ) {
    return (
      ` − (${inside})`
    );
  }

  if (
    coefficient === -1
  ) {
    return (
      ` + (${inside})`
    );
  }

  if (
    coefficient > 1
  ) {
    return (
      ` − ${coefficient}(${inside})`
    );
  }

  return (
    ` + ${Math.abs(
      coefficient
    )}(${inside})`
  );
}


/*
==================================================
顯示前最後一道保護

即使其他地方意外產生：

− −(...)
也會整理成：
+ (...)

+ −(...)
也會整理成：
− (...)
==================================================
*/

function normalizeUnitBracketCoefficients(
  value
) {
  return String(value)

    .replace(
      /(^|[\s=+−\-])[-−]1(?=\s*\()/g,
      "$1−"
    )

    .replace(
      /(^|[\s=+−\-])1(?=\s*\()/g,
      "$1"
    )

    .replace(
      /\s*−\s*−\s*(?=\()/g,
      " + "
    )

    .replace(
      /\s*\+\s*−\s*(?=\()/g,
      " − "
    );
}

function normalizeSingleTermParentheses(
  value
) {
  let result = String(value);

  /*
  單一正的 x 項不需要括號：
  − (x)  → − x
  + (x)  → + x
  − (2x) → − 2x
  + (2x) → + 2x

  單一負的 x 項仍保留括號：
  − (−x)、+ (−x)、− (−2x)。
  */
  result = result.replace(
    /([+−])\s*\(\s*(x|[2-9]\d*x)\s*\)/g,
    "$1 $2"
  );

  return result;
}

function questionHTML(q) {
  if(q.kind==='choice')return `<span class="math-expression">${q.prompt}</span>`;
  return (
    `<span class="math-expression">` +
      `${normalizeSingleTermParentheses(
        normalizeUnitBracketCoefficients(
          q.qStr
        )
      )}` +
    `</span>`
  );
}


/*
==================================================
答案產生
==================================================
*/

function makeAnswerByRatio() {
  if (
    Math.random() <
    .7
  ) {
    return rat(
      nz(
        -9,
        9
      )
    );
  }

  let n;
  let d;

  do {
    d =
      rand(
        2,
        7
      );

    n =
      nz(
        -15,
        15
      );

  } while (
    gcd(
      n,
      d
    ) !== 1 ||
    Math.abs(n) ===
      d
  );

  return rat(
    n,
    d
  );
}


/*
==================================================
模式四類型
==================================================
*/

function makeMode4TypeSchedule(
  target
) {
  const base = [
    "A",
    "B",
    "C",
    "D",
    "E"
  ];

  const schedule = [
    ...base
  ];

  while (
    schedule.length <
    target
  ) {
    schedule.push(
      base[
        rand(
          0,
          base.length - 1
        )
      ]
    );
  }

  return shuffle(
    schedule
  );
}


/*
==================================================
模式四
==================================================
*/

function makeMode4Question(
  type,
  ansRat
) {
  const x =
    ansRat;

  for (
    let attempt = 0;
    attempt < 800;
    attempt++
  ) {

    if (
      type === "A"
    ) {
      const a =
        rat(
          nz(-5,5),
          rand(2,7)
        );

      const b =
        rat(
          nz(-5,5),
          rand(2,7)
        );

      if (
        ratEq(
          a,
          b
        )
      ) {
        continue;
      }

      const leftB =
        rat(
          nz(-8,8)
        );

      const rightB =
        ratAdd(
          ratMul(
            ratSub(
              a,
              b
            ),
            x
          ),
          leftB
        );

      if (
        !ratWithin(
          rightB,
          35,
          8
        )
      ) {
        continue;
      }

      return {
        qStr:
          `${rationalLinearHTML(
            a,
            leftB
          )} = ` +
          `${rationalLinearHTML(
            b,
            rightB
          )}`,

        ans:
          ansRat
      };
    }


    if (
      type === "B"
    ) {
      const alpha =
        rat(
          nz(-5,5),
          rand(2,6)
        );

      const beta =
        rat(
          nz(1,5),
          rand(2,6)
        );

      // 排除 alpha = beta 造成 x 係數抵消、方程式有無限多解的無效題。
      if (ratEq(alpha, beta)) continue;

      const inside =
        rand(
          -15,
          15
        );

      const rhs =
        ratAdd(
          ratMul(
            ratSub(
              alpha,
              beta
            ),
            x
          ),
          ratMul(
            beta,
            rat(
              inside
            )
          )
        );

      if (
        !ratIsInteger(
          rhs
        )
      ) {
        continue;
      }

      const bracket =
        inside === 0
          ? "x"
          : inside > 0
            ? `x − ${inside}`
            : `x + ${Math.abs(
                inside
              )}`;

      return {
        qStr:
          `${coefficientXHTML(
            alpha
          )} − ` +
          `${mathFracHTML(
            beta,
            false
          )}` +
          `(${bracket}) = ` +
          `${integerText(
            rhs.n
          )}`,

        ans:
          ansRat
      };
    }


    if (
      type === "C"
    ) {
      const m =
        rand(
          2,
          7
        );

      const n =
        rand(
          2,
          7
        );

      // 兩邊分母相同只需合併分子，失去消去不同分母的練習意義。
      if (m === n) continue;

      const a =
        nz(
          -8,
          8
        );

      const b =
        rand(
          -12,
          12
        );

      const c =
        nz(
          -8,
          8
        );

      const leftAtX =
        ratAdd(
          ratMul(
            rat(a),
            x
          ),
          rat(b)
        );

      const d =
        ratSub(
          ratMul(
            rat(
              n,
              m
            ),
            leftAtX
          ),
          ratMul(
            rat(c),
            x
          )
        );

      if (
        !ratIsInteger(
          d
        )
      ) {
        continue;
      }

      /*
      分子／分母必須已是最簡形式。

      避免：
      (4x − 6) / 12
      5x / 5
      */

      if (
        !linearFractionIsSimplest(
          a,
          b,
          m
        ) ||
        !linearFractionIsSimplest(
          c,
          d.n,
          n
        )
      ) {
        continue;
      }

      return {
        qStr:
          `${stackedFractionHTML(
            linear(
              a,
              b
            ),
            m
          )} = ` +
          `${stackedFractionHTML(
            linear(
              c,
              d.n
            ),
            n
          )}`,

        ans:
          ansRat
      };
    }


    if (
      type === "D"
    ) {
      const m =
        rand(
          2,
          8
        );

      const rhs =
        rand(
          -10,
          10
        );

      const A =
        ratSub(
          ratMul(
            rat(
              m + 1
            ),
            x
          ),
          rat(
            m *
            rhs
          )
        );

      if (
        !ratIsInteger(
          A
        )
      ) {
        continue;
      }

      const numerator =
        A.n === 0
          ? "−x"
          : A.n > 0
            ? `${A.n} − x`
            : `−${Math.abs(
                A.n
              )} − x`;

      return {
        qStr:
          `x − ` +
          `${stackedFractionHTML(
            numerator,
            m
          )} = ` +
          `${integerText(
            rhs
          )}`,

        ans:
          ansRat
      };
    }


    const m =
      rand(
        2,
        6
      );

    const n =
      rand(
        2,
        6
      );

    const r =
      rand(
        2,
        6
      );

    // 三個分式的分母須互不相同，確保需要真正找最小公倍數。
    if (m === n || m === r || n === r) continue;

    const a =
      nz(
        -5,
        5
      );

    const b =
      rand(
        -7,
        7
      );

    const c =
      nz(
        -5,
        5
      );

    const d =
      rand(
        -8,
        8
      );

    const e =
      nz(
        -5,
        5
      );

    const operation =
      Math.random() <
      .5
        ? 1
        : -1;

    const left1 =
      ratDiv(
        ratMul(
          rat(a),
          ratAdd(
            x,
            rat(b)
          )
        ),
        rat(m)
      );

    const left2 =
      ratDiv(
        ratAdd(
          ratMul(
            rat(c),
            x
          ),
          rat(d)
        ),
        rat(n)
      );

    const left =
      operation === 1
        ? ratAdd(
            left1,
            left2
          )
        : ratSub(
            left1,
            left2
          );

    const f =
      ratSub(
        ratMul(
          rat(r),
          left
        ),
        ratMul(
          rat(e),
          x
        )
      );

    if (
      !ratIsInteger(
        f
      )
    ) {
      continue;
    }

    /*
    三個分式都必須先是最簡形式。

    第一個：
    a(x ± b) / m
    只要 a 與 m 有公因數，就能先約分，
    因此直接排除。

    第二、三個：
    (cx + d) / n
    (ex + f) / r
    要求分子所有係數與分母沒有共同因數。
    */

    if (
      !factorizedFractionIsSimplest(
        a,
        m
      ) ||
      !linearFractionIsSimplest(
        c,
        d,
        n
      ) ||
      !linearFractionIsSimplest(
        e,
        f.n,
        r
      )
    ) {
      continue;
    }

    const firstTop =
      b === 0
        ? fx(a)
        : `${
            a === 1
              ? ""
              : a === -1
                ? "−"
                : integerText(
                    a
                  )
          }(x ${
            b > 0
              ? "+"
              : "−"
          } ${Math.abs(
            b
          )})`;

    const secondTop =
      linear(
        c,
        d
      );

    return {
      qStr:
        `${stackedFractionHTML(
          firstTop,
          m
        )}` +
        `${
          operation === 1
            ? " + "
            : " − "
        }` +
        `${stackedFractionHTML(
          secondTop,
          n
        )}` +
        ` = ` +
        `${stackedFractionHTML(
          linear(
            e,
            f.n
          ),
          r
        )}`,

      ans:
        ansRat
    };
  }

  throw new Error(
    `模式四 ${type} 類題型產生失敗`
  );
}


/*
==================================================
所有模式題目
==================================================
*/


/* 主題 1：以符號列出方程式、解的檢驗。依 PDF 概念設計同型隨機類題，非直接照搬。 */
let chosenConceptIndex = -1;
function makeWordingQuestion(){
  const x=rand(2,14), b=rand(2,11), a=rand(2,9), t=rand(2,5);
  const kind=rand(0,7);
  let statement, correctEquation, wrong;
  if(kind===0){statement=`x 加 ${b} 是 ${x+b}。`;correctEquation=`x + ${b} = ${x+b}`;wrong=[`x − ${b} = ${x+b}`,`${b}x = ${x+b}`,`x + ${x+b} = ${b}`];}
  else if(kind===1){statement=`x 減 ${b} 等於 ${x-b}。`;correctEquation=`x − ${b} = ${x-b}`;wrong=[`x + ${b} = ${x-b}`,`${b} − x = ${x-b}`,`x ÷ ${b} = ${x-b}`];}
  else if(kind===2){statement=`x 的 ${a} 倍再加 ${b} 是 ${a*x+b}。`;correctEquation=`${a}x + ${b} = ${a*x+b}`;wrong=[`${a}(x + ${b}) = ${a*x+b}`,`${a}x − ${b} = ${a*x+b}`,`x + ${a} + ${b} = ${a*x+b}`];}
  else if(kind===3){statement=`${a*x-b} 等於 x 的 ${a} 倍少 ${b}。`;correctEquation=`${a*x-b} = ${a}x − ${b}`;wrong=[`${a*x-b} = ${a}x + ${b}`,`${a*x-b} = ${a}(x − ${b})`,`${a*x-b} = x − ${a*b}`];}
  else if(kind===4){statement=`把 x 平均分成 ${a} 等分，每一等分等於 ${t}。`;correctEquation=`x ÷ ${a} = ${t}`;wrong=[`x × ${a} = ${t}`,`x − ${a} = ${t}`,`${a} ÷ x = ${t}`];}
  else if(kind===5){statement=`x 加 ${b} 之後的 ${a} 倍是 ${a*(x+b)}。`;correctEquation=`${a}(x + ${b}) = ${a*(x+b)}`;wrong=[`${a}x + ${b} = ${a*(x+b)}`,`${a}(x − ${b}) = ${a*(x+b)}`,`x + ${a*b} = ${a*(x+b)}`];}
  else if(kind===6){statement=`x 減 ${b} 之後的 ${a} 倍是 ${a*(x-b)}。`;correctEquation=`${a}(x − ${b}) = ${a*(x-b)}`;wrong=[`${a}x − ${b} = ${a*(x-b)}`,`${a}(x + ${b}) = ${a*(x-b)}`,`x − ${a*b} = ${a*(x-b)}`];}
  else{statement=`x 的三分之二等於 ${2*t}。`;correctEquation=`2x ÷ 3 = ${2*t}`;wrong=[`3x ÷ 2 = ${2*t}`,`2x − 3 = ${2*t}`,`x + 2 ÷ 3 = ${2*t}`];}
  const options=shuffle([correctEquation,...wrong]);
  return {kind:'choice',subtype:'word',prompt:`依照下列文字敘述，選出正確的一元一次方程式：<div class="concept-statement">${statement}</div>`,options,correctIndex:options.indexOf(correctEquation),answerLabel:correctEquation,solutionNotes:[['找出未知數','用 x 表示題目中不知道的數。'],['將文字逐段翻譯成算式',`「${statement}」表示 ${correctEquation}。要注意「之後的倍數」應將整個括號一起相乘。`],['核對等號兩邊','等號代表兩個數量相等；請檢查倍數、加減順序與括號範圍。']]};
}
function makeVerificationQuestion(){
  const root=rand(-9,9),a=rand(2,7),c=rand(-5,5),b=rand(-15,15);
  if(a===c)return makeVerificationQuestion();
  const d=(a-c)*root+b;
  const eq=`${linear(a,b)} = ${linear(c,d)}`;
  const choices=shuffle([root,root+rand(1,4),root-rand(1,4),root+rand(5,9)]);
  const options=choices.map(v=>`x = ${integerText(v)}`);
  const steps=choices.map(v=>{
    const l=a*v+b,r=c*v+d;
    return `將 x = ${integerText(v)} 代入：左邊 = ${integerText(a)} × (${integerText(v)}) ${b<0?'−':'+'} ${Math.abs(b)} = ${integerText(l)}；右邊 = ${integerText(c)} × (${integerText(v)}) ${d<0?'−':'+'} ${Math.abs(d)} = ${integerText(r)}；${l===r?'左右相等，是方程式的解。':'左右不相等，不是方程式的解。'}`;
  });
  return {kind:'choice',subtype:'verify',prompt:`下列哪一個數是方程式 <strong>${eq}</strong> 的解？<div class="concept-statement">請將候選值代入等號左右兩邊比較。</div>`,options,correctIndex:options.indexOf(`x = ${integerText(root)}`),answerLabel:`x = ${integerText(root)}`,solutionNotes:[['解的意義','只有代入後讓等號左邊與右邊數值相同的 x，才是方程式的解。'],['逐一代入檢查',steps.join('<hr style="border:0;border-top:1px solid #e5e7eb;margin:9px 0">')],['最後判定',`只有 x = ${integerText(root)} 使兩邊相等，所以選這個答案。`]]};
}
function makeConceptQuestions(){
  const out=[],used=new Set();
  for(let i=0;i<10;i++){
    for(let attempt=0;attempt<200;attempt++){
      const q=i<5?makeWordingQuestion():makeVerificationQuestion();
      const key=q.prompt;
      if(used.has(key))continue;
      used.add(key);out.push(q);break;
    }
  }
  if(out.length!==10)throw Error('概念題目不足');
  return shuffle(out);
}
function makeQuestions(selectedMode){
  if(selectedMode===1)return makeConceptQuestions();
  return makeLegacyQuestions(selectedMode-1);
}

function equationHTMLToSource(html){
  const root=document.createElement("div");root.innerHTML=html;
  function recur(node){
    if(node.nodeType===Node.TEXT_NODE)return node.nodeValue;
    if(node.nodeType!==Node.ELEMENT_NODE)return "";
    if(node.classList?.contains("math-frac")){
      const top=node.querySelector(":scope > .top");
      const bottom=node.querySelector(":scope > .bottom");
      return "(("+recur(top)+")/("+recur(bottom)+"))";
    }
    return Array.from(node.childNodes).map(recur).join("");
  }
  return recur(root).replace(/−/g,"-").replace(/×/g,"*").replace(/÷/g,"/").replace(/＝/g,"=");
}

function equationEval(expr,x){
  let s=expr.replace(/\s/g,"").replace(/(\d)(x|\()/gi,"$1*$2").replace(/(x|\))(\()/gi,"$1*$2").replace(/\)(x|\d)/gi,")*$1");
  const tokens=s.match(/\d+|x|[()+*\/-]/g)||[];
  if(tokens.join("")!==s)throw Error("無法辨識方程式格式："+s);
  let k=0;
  function atom(){
    const z=tokens[k++];
    if(z==="+")return atom();
    if(z==="-")return ratMul(rat(-1),atom());
    if(z==="("){const a=add();if(tokens[k++]!==")")throw Error("括號不完整");return a;}
    if(z==="x")return rat(x);
    if(/^\d+$/.test(z||""))return rat(Number(z));
    throw Error("算式項目錯誤："+z);
  }
  function mul(){let v=atom();while(tokens[k]==="*"||tokens[k]==="/"){const op=tokens[k++],b=atom();v=op==="*"?ratMul(v,b):ratDiv(v,b);}return v;}
  function add(){let v=mul();while(tokens[k]==="+"||tokens[k]==="-"){const op=tokens[k++],b=mul();v=op==="+"?ratAdd(v,b):ratSub(v,b);}return v;}
  const result=add();if(k!==tokens.length)throw Error("算式尚有未處理部分");return result;
}

function equationCoefficients(q){
  const source=equationHTMLToSource(q.qStr);
  const parts=source.split("=");if(parts.length!==2)throw Error("缺少等號");
  const left0=equationEval(parts[0],0),left1=equationEval(parts[0],1);
  const right0=equationEval(parts[1],0),right1=equationEval(parts[1],1);
  return {a:ratSub(left1,left0),b:left0,c:ratSub(right1,right0),d:right0};
}

function makeLegacyQuestions(
  selectedMode
) {
  const output = [];

  const used =
    new Set();

  const target =
    selectedMode === 4
      ? 6
      : 10;


  /*
  模式四
  */

  if (
    selectedMode === 4
  ) {
    const schedule =
      makeMode4TypeSchedule(
        target
      );

    schedule.forEach(
      type => {
        for (
          let retry = 0;
          retry < 150;
          retry++
        ) {
          const question =
            makeMode4Question(
              type,
              makeAnswerByRatio()
            );

          // 所有模式四題目都重新由題目本身計算一次，
          // 必須有唯一解，且與產題器給定的答案一致，否則重抽。
          try {
            const {a,b,c,d}=equationCoefficients(question);
            const coefficient=ratSub(a,c);
            if(coefficient.n===0 || !ratEq(ratDiv(ratSub(d,b),coefficient),question.ans)) continue;
          } catch(error) {
            console.warn("忽略無效分式方程式題目", error);
            continue;
          }

          const key =
            question.qStr
              .replace(
                /<[^>]+>/g,
                ""
              );

          if (
            used.has(
              key
            )
          ) {
            continue;
          }

          used.add(
            key
          );

          output.push(
            question
          );

          break;
        }
      }
    );

    if(output.length!==target)throw new Error("模式四有效題目不足，請重新開始測驗");
    return shuffle(
      output
    );
  }


  /*
  模式一
  */

  if (
    selectedMode === 1
  ) {
    while (
      output.length <
      target
    ) {
      const ans =
        makeAnswerByRatio();

      const p =
        ans.n;

      const q =
        ans.d;

      const k =
        nz(
          -5,
          5
        );

      const a =
        k *
        q;

      // 排除 x＝常數、−x＝常數等不需計算的題目；不改答案生成規則。
      if(Math.abs(a)===1) continue;

      const b =
        k *
        p;

      if (
        Math.abs(a) >
          35 ||
        Math.abs(b) >
          60
      ) {
        continue;
      }

      const qStr =
        `${fx(
          a
        )} = ${integerText(
          b
        )}`;

      if (
        used.has(
          qStr
        )
      ) {
        continue;
      }

      used.add(
        qStr
      );

      output.push({
        qStr,
        ans
      });
    }

    return shuffle(
      output
    );
  }


  /*
  模式二
  */

  if (
    selectedMode === 2
  ) {
    while (
      output.length <
      target
    ) {
      const ans =
        makeAnswerByRatio();

      const p =
        ans.n;

      const q =
        ans.d;

      const k =
        nz(
          -4,
          4
        );

      const c =
        nz(
          -7,
          7
        );

      const a =
        c +
        k *
        q;

      const b =
        nz(
          -15,
          15
        );

      const d =
        b +
        k *
        p;

      if (
        a === 0 ||
        a === c
      ) {
        continue;
      }

      const qStr =
        `${linear(
          a,
          b
        )} = ` +
        `${linear(
          c,
          d
        )}`;

      if (
        used.has(
          qStr
        )
      ) {
        continue;
      }

      used.add(
        qStr
      );

      output.push({
        qStr,
        ans
      });
    }

    return shuffle(
      output
    );
  }


  /*
  ==================================================
  模式三
  ==================================================
  */

  while (
    output.length <
    target
  ) {
    const ans =
      makeAnswerByRatio();


    /*
    題型 A：
    單一括號
    */

    if (
      Math.random() <
      .5
    ) {
      const outer =
        nz(
          -4,
          4
        );

      const innerA =
        nz(
          -5,
          5
        );

      const innerB =
        nz(
          -8,
          8
        );

      const t =
        nz(
          -3,
          3
        );

      const c =
        outer *
        innerA -
        t *
        ans.d;

      const d =
        outer *
        innerB +
        t *
        ans.n;

      if (
        c === 0 ||
        Math.abs(c) >
          32 ||
        Math.abs(d) >
          50
      ) {
        continue;
      }

      const inside =
        linear(
          innerA,
          innerB
        );

      const leftBracket =
        bracketCoefficientText(
          outer,
          inside
        );

      const qStr =
        `${leftBracket} = ` +
        `${linear(
          c,
          d
        )}`;

      if (
        used.has(
          qStr
        )
      ) {
        continue;
      }

      used.add(
        qStr
      );

      output.push({
        qStr,
        ans
      });

      continue;
    }


    /*
    ==================================================
    題型 B：
    兩組括號相減

    這裡就是本次修正重點。
    ==================================================
    */

    const firstOuter =
      nz(
        -4,
        4
      );

    const secondOuter =
      nz(
        -4,
        4
      );

    const firstX =
      nz(
        -5,
        5
      );

    const firstConst =
      rand(
        -8,
        8
      );

    const secondX =
      nz(
        -5,
        5
      );

    const secondConst =
      rand(
        -8,
        8
      );

    const leftA =
      firstOuter *
      firstX -
      secondOuter *
      secondX;

    const leftB =
      firstOuter *
      firstConst -
      secondOuter *
      secondConst;

    if (
      leftA === 0
    ) {
      continue;
    }

    const rhs =
      ratAdd(
        ratMul(
          rat(
            leftA
          ),
          ans
        ),
        rat(
          leftB
        )
      );

    if (
      !ratIsInteger(
        rhs
      ) ||
      Math.abs(
        rhs.n
      ) >
      80
    ) {
      continue;
    }

    const firstInside =
      linear(
        firstX,
        firstConst
      );

    const secondInside =
      linear(
        secondX,
        secondConst
      );

    const firstPart =
      bracketCoefficientText(
        firstOuter,
        firstInside
      );


    /*
    ★ 注意：

    不再寫：

    firstPart + " − " + secondPart

    因為這會造成：

    − −(...)

    現在由：
    signedSubtractedBracketText()

    自己決定要顯示 + 或 −。
    */

    const secondPart =
      signedSubtractedBracketText(
        secondOuter,
        secondInside
      );

    const qStr =
      `${firstPart}` +
      `${secondPart}` +
      ` = ` +
      `${integerText(
        rhs.n
      )}`;


    if (
      used.has(
        qStr
      )
    ) {
      continue;
    }

    used.add(
      qStr
    );

    output.push({
      qStr,
      ans
    });
  }

  return shuffle(
    output
  );
}
const originalModes=[
 {id:'1',name:MODE_NAMES[1]},
 {id:'2',name:MODE_NAMES[2]},
 {id:'3',name:MODE_NAMES[3]},
 {id:'4',name:MODE_NAMES[4]},
 {id:'5',name:MODE_NAMES[5]}
];
let queue=[];let queueMode='';
function rawNext(modeId){
 if(queueMode!==modeId){queue=[];queueMode=modeId;}
 if(!queue.length) queue=makeQuestions(Number(modeId));
 return queue.pop();
}
function describe(q){
 if(q.kind==='choice'){
  const options=q.options.map((opt,i)=>({label:String.fromCharCode(65+i),text:opt}));
  return {question:q.prompt,questionHTML:q.prompt,kind:'choice',options,correct:String.fromCharCode(65+q.correctIndex),inputType:'choice',difficulty: q.subtype||'choice'};
 }
 const html=normalizeSingleTermParentheses(normalizeUnitBracketCoefficients(q.qStr));
 return {question:q.qStr.replace(/<[^>]+>/g,''),questionHTML:html,kind:'number',numerator:q.ans.n,denominator:q.ans.d,inputType:'number',difficulty:Math.min(9,Math.floor(q.qStr.length/18))};
}
const adapter={
 id:'original-g7-equation',semester:'七上',title:'3-2 一元一次方程式（原遊戲題型）',
 description:'已接入 games/grade7-1/equation.html 的原始五種模式出題函式；原遊戲檔案保持不變。',
 modes:originalModes,
 generatePair(modeId){
  let left=describe(rawNext(modeId)),right=describe(rawNext(modeId));
  for(let i=0;left.question===right.question&&i<15;i++)right=describe(rawNext(modeId));
  return [left,right];
 },
 validate(q,answer){
  if(q.inputType==='choice')return String(answer).trim().toUpperCase()===q.correct;
  const raw=String(answer).replace(/\s/g,'').replace(/−/g,'-');
  const m=raw.match(/^([+-]?\d+)(?:\/([1-9]\d*))?$/);
  if(!m)return false;
  const n=Number(m[1]),d=m[2]?Number(m[2]):1;
  return n*q.denominator===q.numerator*d;
 }
};
window.TugWar.register(adapter);
})();
