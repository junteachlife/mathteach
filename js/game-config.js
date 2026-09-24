/*
==================================================
數學遊戲樂園：遊戲共用設定
檔案位置：js/game-config.js

版本：6.8
八年級上學期 9 款遊戲正式啟用版
＋一元二次方程式
＋排行榜 / 我的成績相容修正版
＋九上 1-2／1-3／1-4 正式上線
==================================================

功能：
1. 集中管理所有遊戲名稱
2. 集中管理遊戲排列順序
3. 集中管理遊戲路徑
4. 集中管理遊戲介紹
5. 集中管理開發狀態
6. 集中管理各遊戲模式
7. 集中管理排行榜類型
8. 集中管理首頁卡片配色
9. 集中管理遊戲難度與標籤
10. 相容排行榜新版 getFinishedGamesBySemester
11. 相容我的成績 getGameOrder

注意：

modes 的 key
必須與各遊戲實際存入 Firestore 的 mode
完全一致。
==================================================
*/


export const GAME_CONFIG = {
  "continued-ratio": {id:"continued-ratio",name:"1-1 連比大挑戰",shortName:"連比",semester:"grade9-first",grade:9,order:1,icon:"🔗",file:"games/continued-ratio.html",description:"九上第1章：連比",finished:true,difficulty:2,recommended:false,isNew:true,ranking:{type:"speed"},modes:{merge:"連比合併",parts:"按比例分配",inverse:"反比例與幾何",mixed:"綜合挑戰"},theme:{primary:"#205d9b",dark:"#163f70",light:"#e8f2ff",border:"#91b8e1"}},
  "proportional-segments": {id:"proportional-segments",name:"1-2 比例線段大挑戰",shortName:"比例線段",semester:"grade9-first",grade:9,order:2,icon:"📐",file:"games/proportional-segments.html",description:"九上 1-2：等高三角形面積比、平行線截比例線段、平行判別與中點連線段。",finished:true,difficulty:2,recommended:false,isNew:true,ranking:{type:"speed"},modes:{areaRatio:"等高三角形面積比",parallelSegments:"平行線截比例線段",parallelJudge:"比例線段判別平行",midpoint:"中點連線段",comprehensive:"1-2 綜合挑戰"},theme:{primary:"#0f766e",dark:"#115e59",light:"#ecfdf5",border:"#5eead4"}},
  "similar-polygons": {id:"similar-polygons",name:"1-3 相似多邊形大挑戰",shortName:"相似多邊形",semester:"grade9-first",grade:9,order:3,icon:"🔷",file:"games/similar-polygons.html",description:"九上 1-3：圖形縮放、相似多邊形，以及 AA／SAS／SSS 三角形相似性質。",finished:true,difficulty:2,recommended:false,isNew:true,ranking:{type:"speed"},modes:{scaling:"圖形縮放",polygonSimilarity:"相似多邊形",aaSimilarity:"AA 相似",sasSimilarity:"SAS 相似",sssSimilarity:"SSS 相似",comprehensive:"1-3 綜合挑戰"},theme:{primary:"#7c3aed",dark:"#5b21b6",light:"#f5f3ff",border:"#c4b5fd"}},
  "similar-triangle-trig": {id:"similar-triangle-trig",name:"1-4 相似三角形應用與三角比大挑戰",shortName:"相似三角形與三角比",semester:"grade9-first",grade:9,order:4,icon:"📐",file:"games/similar-triangle-trig.html",description:"九上 1-4：相似三角形比例、簡易測量、特殊直角三角形與 sin／cos／tan 應用。",finished:true,difficulty:3,recommended:false,isNew:true,ranking:{type:"speed"},modes:{similarityRelations:"相似三角形比例關係",measurement:"簡易測量",specialRight:"特殊直角三角形",trigRatio:"三角比",trigApplication:"三角比應用",comprehensive:"1-4 綜合挑戰"},theme:{primary:"#c2410c",dark:"#9a3412",light:"#fff7ed",border:"#fdba74"}},
  "point-line-circle": {id:"point-line-circle",name:"2-1 點、線、圓大挑戰",shortName:"點、線、圓",semester:"grade9-first",grade:9,order:5,icon:"⭕",file:"games/point-line-circle.html",description:"九上第2章：點、線、圓",finished:true,difficulty:3,recommended:false,isNew:true,ranking:{type:"speed"},modes:{sector:"弧長與扇形面積",point:"點與圓的位置",line:"直線與圓的位置",chord:"弦心距與切線",mixed:"綜合挑戰"},theme:{primary:"#205d9b",dark:"#163f70",light:"#e8f2ff",border:"#91b8e1"}},
  "central-inscribed-angle": {id:"central-inscribed-angle",name:"2-2 圓心角與圓周角大挑戰",shortName:"圓心角與圓周角",semester:"grade9-first",grade:9,order:6,icon:"🟠",file:"games/central-inscribed-angle.html",description:"九上第2章：圓心角與圓周角",finished:true,difficulty:3,recommended:false,isNew:true,ranking:{type:"speed"},modes:{arc:"弧與圓心角",inscribed:"圓周角",diameter:"半圓與直角",cyclic:"圓內接四邊形",mixed:"綜合挑戰"},theme:{primary:"#205d9b",dark:"#163f70",light:"#e8f2ff",border:"#91b8e1"}},





  /*
  ==================================================
  七年級上學期
  ==================================================
  */


  integer: {

    id:
      "integer",

    name:
      "正負整數大挑戰",

    shortName:
      "正負整數",

    semester:
      "grade7-first",

    grade:
      7,

    order:
      1,

    icon:
      "🎮",

    file:
      "games/integer.html",

    description:
      "七年級正負整數加減法，挑戰計算速度與正確率。",

    finished:
      true,

    difficulty:
      1,

    recommended:
      true,

    isNew:
      false,

    ranking: {

      type:
        "timed"

    },

    modes:
      {},

    theme: {

      primary:
        "#1976D2",

      dark:
        "#125CA6",

      light:
        "#E3F2FD",

      border:
        "#90CAF9"

    }

  },



  compare: {

    id:
      "compare",

    name:
      "數的大小比較王",

    shortName:
      "數的大小比較",

    semester:
      "grade7-first",

    grade:
      7,

    order:
      2,

    icon:
      "⚖️",

    file:
      "games/compare.html",

    description:
      "挑戰整數、分數與小數的大小比較，選出正確的 ＞、＝或＜。",

    finished:
      true,

    difficulty:
      1,

    recommended:
      false,

    isNew:
      false,

    ranking: {

      type:
        "timed"

    },

    modes: {

      easy:
        "初級｜整數比較",

      medium:
        "中級｜整數與分數",

      hard:
        "高級｜混合比較"

    },

    theme: {

      primary:
        "#F57C00",

      dark:
        "#D86600",

      light:
        "#FFF3E0",

      border:
        "#FFCC80"

    }

  },



  fraction: {

    id:
      "fraction",

    name:
      "正負分數加減大挑戰",

    shortName:
      "正負分數加減",

    semester:
      "grade7-first",

    grade:
      7,

    order:
      3,

    icon:
      "➗",

    file:
      "games/fraction.html",

    description:
      "先複習最小公倍數，再挑戰正負分數的同分母與異分母加減。",

    finished:
      true,

    difficulty:
      2,

    recommended:
      false,

    isNew:
      false,

    ranking: {

      type:
        "timed"

    },

    modes: {

      lcm:
        "最小公倍數複習",

      fraction:
        "正負分數加減"

    },

    theme: {

      primary:
        "#2E7D32",

      dark:
        "#1B5E20",

      light:
        "#E8F5E9",

      border:
        "#A5D6A7"

    }

  },



  exponent: {

    id:
      "exponent",

    name:
      "指數律大挑戰",

    shortName:
      "指數律",

    semester:
      "grade7-first",

    grade:
      7,

    order:
      4,

    icon:
      "🔢",

    file:
      "games/exponent.html",

    description:
      "練習同底數相乘、相除、冪的乘方、零次方與綜合指數律。",

    finished:
      true,

    difficulty:
      2,

    recommended:
      false,

    isNew:
      true,

    ranking: {

      type:
        "speed"

    },

    modes: {

      multiplication:
        "同底數相乘",

      division:
        "同底數相除",

      powerOfPower:
        "冪的乘方",

      zeroExponent:
        "零次方",

      mixed:
        "綜合指數律"

    },

    theme: {

      primary:
        "#5E35B1",

      dark:
        "#4527A0",

      light:
        "#EDE7F6",

      border:
        "#B39DDB"

    }

  },



  "integer-operations": {

    id:
      "integer-operations",

    name:
      "正負數四則運算大挑戰",

    shortName:
      "正負數四則運算",

    semester:
      "grade7-first",

    grade:
      7,

    order:
      5,

    icon:
      "➕",

    file:
      "games/integer-operations.html",

    description:
      "練習正負數乘除、絕對值、乘方，以及整數與分數混合四則運算。",

    finished:
      true,

    difficulty:
      3,

    recommended:
      true,

    isNew:
      true,

    ranking: {

      type:
        "timed"

    },

    modes: {

      muldiv:
        "正負數的乘除",

      absolute:
        "絕對值運算",

      power:
        "乘方計算",

      mixed:
        "四則運算",

      advanced:
        "四則運算進階挑戰"

    },

    theme: {

      primary:
        "#8E24AA",

      dark:
        "#6A1B9A",

      light:
        "#F3E5F5",

      border:
        "#CE93D8"

    }

  },



  factor: {

    id:
      "factor",

    name:
      "2-1 質因數分解大挑戰",

    shortName:
      "2-1 質因數分解",

    semester:
      "grade7-first",

    grade:
      7,

    order:
      6,

    icon:
      "🧩",

    file:
      "games/factor.html",

    description:
      "練習因數與倍數、2／3／4／5／9／11 倍數判別、質數與合數、埃拉托賽尼篩法、質因數、標準分解式，以及利用標準分解式判斷因數與倍數。",

    finished:
      true,

    difficulty:
      2,

    recommended:
      false,

    isNew:
      false,

    ranking: {

      type:
        "timed"

    },

    modes: {

      factorMultiple:
        "因數、倍數與倍數判別",

      primeComposite:
        "質數、合數與篩法",

      primeFactor:
        "因數與質因數",

      standardForm:
        "質因數分解與標準分解式",

      standardJudge:
        "標準分解式判別因數倍數",

      speed:
        "質因數快手",

      comprehensive:
        "2-1 綜合挑戰"

    },

    theme: {

      primary:
        "#00897B",

      dark:
        "#00695C",

      light:
        "#E0F2F1",

      border:
        "#80CBC4"

    }

  },



  equation: {

    id:
      "equation",

    name:
      "一元一次方程式",

    shortName:
      "一元一次方程式",

    semester:
      "grade7-first",

    grade:
      7,

    order:
      7,

    icon:
      "🧮",

    file:
      "games/equation.html",

    description:
      "解方程式闖關，練習移項、等量公理與分數方程式。",

    finished:
      true,

    difficulty:
      3,

    recommended:
      false,

    isNew:
      false,

    ranking: {

      type:
        "timed"

    },

    modes: {

      "1":
        "模式一",

      "2":
        "模式二",

      "3":
        "模式三",

      "4":
        "模式四"

    },

    theme: {

      primary:
        "#E53935",

      dark:
        "#C62828",

      light:
        "#FFEBEE",

      border:
        "#EF9A9A"

    }

  },



  /*
  ==================================================
  七年級下學期
  ==================================================
  */


  simultaneousEquation: {

    id:
      "simultaneousEquation",

    name:
      "二元一次聯立方程式",

    shortName:
      "二元一次聯立方程式",

    semester:
      "grade7-second",

    grade:
      7,

    order:
      1,

    icon:
      "🔢",

    file:
      "games/simultaneous-equation.html",

    description:
      "練習代入消去法與加減消去法，解出兩個未知數。",

    finished:
      false,

    difficulty:
      3,

    recommended:
      false,

    isNew:
      false,

    ranking: {

      type:
        "timed"

    },

    modes:
      {},

    theme: {

      primary:
        "#3949AB",

      dark:
        "#283593",

      light:
        "#E8EAF6",

      border:
        "#9FA8DA"

    }

  },



  coordinate: {

    id:
      "coordinate",

    name:
      "直角坐標與方程式圖形",

    shortName:
      "直角坐標與方程式圖形",

    semester:
      "grade7-second",

    grade:
      7,

    order:
      2,

    icon:
      "📍",

    file:
      "games/coordinate.html",

    description:
      "認識坐標平面，練習描點與判讀二元一次方程式圖形。",

    finished:
      false,

    difficulty:
      2,

    recommended:
      false,

    isNew:
      false,

    ranking: {

      type:
        "timed"

    },

    modes:
      {},

    theme: {

      primary:
        "#039BE5",

      dark:
        "#0277BD",

      light:
        "#E1F5FE",

      border:
        "#81D4FA"

    }

  },



  ratio: {

    id:
      "ratio",

    name:
      "比例式、正比與反比",

    shortName:
      "比例式、正比與反比",

    semester:
      "grade7-second",

    grade:
      7,

    order:
      3,

    icon:
      "📏",

    file:
      "games/ratio.html",

    description:
      "練習比例式、正比、反比與實際應用題。",

    finished:
      false,

    difficulty:
      2,

    recommended:
      false,

    isNew:
      false,

    ranking: {

      type:
        "timed"

    },

    modes:
      {},

    theme: {

      primary:
        "#F4511E",

      dark:
        "#D84315",

      light:
        "#FBE9E7",

      border:
        "#FFAB91"

    }

  },



  statistics: {

    id:
      "statistics",

    name:
      "統計圖表",

    shortName:
      "統計圖表",

    semester:
      "grade7-second",

    grade:
      7,

    order:
      4,

    icon:
      "📊",

    file:
      "games/statistics.html",

    description:
      "練習次數分配、統計圖表與資料判讀。",

    finished:
      false,

    difficulty:
      2,

    recommended:
      false,

    isNew:
      false,

    ranking: {

      type:
        "timed"

    },

    modes:
      {},

    theme: {

      primary:
        "#00838F",

      dark:
        "#006064",

      light:
        "#E0F7FA",

      border:
        "#80DEEA"

    }

  },



  /*
  ==================================================
  八年級上學期
  ==================================================
  */


  multiplicationFormula: {

    id:
      "multiplicationFormula",

    name:
      "乘法公式大挑戰",

    shortName:
      "乘法公式",

    semester:
      "grade8-first",

    grade:
      8,

    order:
      1,

    icon:
      "🧩",

    file:
      "games/multiplication-formula.html",

    description:
      "練習平方公式、平方差公式，以及乘法公式的展開與判讀。",

    finished:
      true,

    difficulty:
      2,

    recommended:
      false,

    isNew:
      true,

    ranking: {

      type:
        "speed"

    },

    modes: {

      numberBasic:
        "數字乘法公式",

      numberMixed:
        "數字變化計算",

      polynomial:
        "多項式與公式判讀",

      mixed:
        "乘法公式綜合挑戰"

    },

    theme: {

      primary:
        "#3F51B5",

      dark:
        "#303F9F",

      light:
        "#E8EAF6",

      border:
        "#9FA8DA"

    }

  },



  polynomialAddSubtract: {

    id:
      "polynomialAddSubtract",

    name:
      "多項式加減大挑戰",

    shortName:
      "多項式加減",

    semester:
      "grade8-first",

    grade:
      8,

    order:
      2,

    icon:
      "➕",

    file:
      "games/polynomial-add-subtract.html",

    description:
      "練習同類項合併、去括號，以及多項式的加法與減法。",

    finished:
      true,

    difficulty:
      2,

    recommended:
      false,

    isNew:
      true,

    ranking: {

      type:
        "speed"

    },

    modes: {

      combine:
        "同類項合併",

      addSubtract:
        "多項式加減",

      advanced:
        "綜合加減",

      mixed:
        "進階挑戰"

    },

    theme: {

      primary:
        "#00897B",

      dark:
        "#00695C",

      light:
        "#E0F2F1",

      border:
        "#80CBC4"

    }

  },



  polynomialMultiplyDivide: {

    id:
      "polynomialMultiplyDivide",

    name:
      "多項式乘除大挑戰",

    shortName:
      "多項式乘除",

    semester:
      "grade8-first",

    grade:
      8,

    order:
      3,

    icon:
      "✖️",

    file:
      "games/polynomial-multiply-divide.html",

    description:
      "練習單項式乘除、分配律、乘法公式、多項式乘法與多項式除法。",

    finished:
      true,

    difficulty:
      3,

    recommended:
      false,

    isNew:
      true,

    ranking: {

      type:
        "speed"

    },

    modes: {

      monomial:
        "單項式乘除",

      multiply:
        "多項式乘法",

      divide:
        "多項式除法",

      mixed:
        "乘除綜合挑戰"

    },

    theme: {

      primary:
        "#7B1FA2",

      dark:
        "#6A1B9A",

      light:
        "#F3E5F5",

      border:
        "#CE93D8"

    }

  },



  squareRoot: {

    id:
      "squareRoot",

    name:
      "平方根概念大挑戰",

    shortName:
      "平方根",

    semester:
      "grade8-first",

    grade:
      8,

    order:
      4,

    icon:
      "√",

    file:
      "games/square-root.html",

    description:
      "認識平方根、根號表示，以及平方與平方根之間的關係。",

    finished:
      true,

    difficulty:
      2,

    recommended:
      false,

    isNew:
      true,

    ranking: {

      type:
        "speed"

    },

    modes: {

      squarePractice:
        "平方數熟練場",

      simplify:
        "根式化簡訓練",

      approximation:
        "根號值與十分逼近",

      meaning:
        "平方根觀念應用"

    },

    theme: {

      primary:
        "#0288D1",

      dark:
        "#0277BD",

      light:
        "#E1F5FE",

      border:
        "#81D4FA"

    }

  },



  radicalOperation: {

    id:
      "radicalOperation",

    name:
      "根式運算大挑戰",

    shortName:
      "根式運算",

    semester:
      "grade8-first",

    grade:
      8,

    order:
      5,

    icon:
      "🌱",

    file:
      "games/radical-operation.html",

    description:
      "練習根式化簡、根式乘除，以及同類方根的加減運算。",

    finished:
      true,

    difficulty:
      3,

    recommended:
      false,

    isNew:
      true,

    ranking: {

      type:
        "speed"

    },

    modes: {

      multiply:
        "根式乘法",

      divide:
        "除法與有理化",

      addSubtract:
        "根式加減",

      mixed:
        "根式四則綜合"

    },

    theme: {

      primary:
        "#43A047",

      dark:
        "#2E7D32",

      light:
        "#E8F5E9",

      border:
        "#A5D6A7"

    }

  },



  pythagorean: {

    id:
      "pythagorean",

    name:
      "畢氏定理大挑戰",

    shortName:
      "畢氏定理",

    semester:
      "grade8-first",

    grade:
      8,

    order:
      6,

    icon:
      "📐",

    file:
      "games/pythagorean.html",

    description:
      "利用畢氏定理求邊長，並挑戰直角三角形、生活應用與兩點間距離。",

    finished:
      true,

    difficulty:
      2,

    recommended:
      false,

    isNew:
      true,

    ranking: {

      type:
        "speed"

    },

    modes: {

      basic:
        "基本直角三角形",

      application:
        "生活應用與斜邊上的高",

      distance:
        "兩點間的距離"

    },

    theme: {

      primary:
        "#F57C00",

      dark:
        "#E65100",

      light:
        "#FFF3E0",

      border:
        "#FFCC80"

    }

  },



  factorization: {

    id:
      "factorization",

    name:
      "因式分解大挑戰",

    shortName:
      "因式分解",

    semester:
      "grade8-first",

    grade:
      8,

    order:
      7,

    icon:
      "🧩",

    file:
      "games/factorization-challenge.html",

    description:
      "練習提單項公因式、提兩項公因式、變號後提公因式，以及利用乘法公式進行因式分解。",

    finished:
      true,

    difficulty:
      3,

    recommended:
      false,

    isNew:
      true,

    ranking: {

      type:
        "speed"

    },

    modes: {

      monomial:
        "提單項公因式",

      grouping:
        "提兩項或變號提公因式",

      formula:
        "乘法公式因式分解"

    },

    theme: {

      primary:
        "#00897B",

      dark:
        "#00695C",

      light:
        "#E0F2F1",

      border:
        "#80CBC4"

    }

  },



  crossMultiplication: {

    id:
      "crossMultiplication",

    name:
      "十字交乘因式分解大挑戰",

    shortName:
      "十字交乘",

    semester:
      "grade8-first",

    grade:
      8,

    order:
      8,

    icon:
      "❌",

    file:
      "games/cross-factorization.html",

    description:
      "練習二次項係數為 1、一般十字交乘，以及先提公因式、乘法公式與分數型態的綜合因式分解。",

    finished:
      true,

    difficulty:
      3,

    recommended:
      false,

    isNew:
      true,

    ranking: {

      type:
        "speed"

    },

    modes: {

      leadingOne:
        "平方項係數為 1",

      general:
        "平方項係數不為 1",

      mixed:
        "進階綜合"

    },

    theme: {

      primary:
        "#D81B60",

      dark:
        "#AD1457",

      light:
        "#FCE4EC",

      border:
        "#F48FB1"

    }

  },



  /*
  ==================================================
  一元二次方程式大挑戰

  ★ 正式上架
  ★ GAME_ID 必須為 quadraticEquation
  ★ mode 必須與 quadratic-equation.html 完全一致：

  basic
  factor
  completeSquare
  formula
  application
  mixed
  ==================================================
  */


  quadraticEquation: {

    id:
      "quadraticEquation",

    name:
      "一元二次方程式大挑戰",

    shortName:
      "一元二次方程式",

    semester:
      "grade8-first",

    grade:
      8,

    order:
      9,

    icon:
      "x²",

    file:
      "games/quadratic-equation.html",

    description:
      "練習基礎概念、因式分解法、平方根與配方法、公式解與判別式、一元二次方程式應用問題，以及全章綜合挑戰。",

    finished:
      true,

    difficulty:
      3,

    recommended:
      true,

    isNew:
      true,

    ranking: {

      type:
        "speed"

    },

    modes: {

      basic:
        "模式一｜基礎概念",

      factor:
        "模式二｜因式分解法",

      completeSquare:
        "模式三｜平方根與配方法",

      formula:
        "模式四｜公式解與判別式",

      application:
        "模式五｜一元二次應用問題",

      mixed:
        "模式六｜全章綜合挑戰"

    },

    theme: {

      primary:
        "#1565C0",

      dark:
        "#0D47A1",

      light:
        "#E3F2FD",

      border:
        "#90CAF9"

    }

  }

};



/*
==================================================
取得單一遊戲設定
==================================================
*/


export function getGameConfig(
  gameId
) {

  return (
    GAME_CONFIG[
      gameId
    ] ||
    null
  );

}



/*
==================================================
取得遊戲中文名稱
==================================================
*/


export function getGameName(
  gameId
) {

  return (
    GAME_CONFIG[
      gameId
    ]?.name ||
    gameId ||
    "數學遊戲"
  );

}



/*
==================================================
取得遊戲模式
==================================================
*/


export function getGameModes(
  gameId
) {

  const modes =
    GAME_CONFIG[
      gameId
    ]?.modes;


  if (
    !modes ||
    typeof modes !==
      "object"
  ) {

    return {};

  }


  return modes;

}



/*
==================================================
取得遊戲模式數量
==================================================
*/


export function getGameModeCount(
  gameId
) {

  return Object.keys(
    getGameModes(
      gameId
    )
  ).length;

}



/*
==================================================
取得遊戲模式中文名稱
==================================================
*/


export function getModeName(
  gameId,
  mode
) {

  if (
    mode === undefined ||
    mode === null ||
    mode === ""
  ) {

    return "";

  }


  const modeKey =
    String(
      mode
    );


  return (
    GAME_CONFIG[
      gameId
    ]?.modes?.[
      modeKey
    ] ||
    modeKey
  );

}



/*
==================================================
取得遊戲主題配色
==================================================
*/


export function getGameTheme(
  gameId
) {

  return (
    GAME_CONFIG[
      gameId
    ]?.theme ||
    {

      primary:
        "#1976D2",

      dark:
        "#125CA6",

      light:
        "#E3F2FD",

      border:
        "#90CAF9"

    }
  );

}



/*
==================================================
取得遊戲難度
==================================================
*/


export function getGameDifficulty(
  gameId
) {

  const difficulty =
    Number(
      GAME_CONFIG[
        gameId
      ]?.difficulty
    );


  if (
    !Number.isFinite(
      difficulty
    )
  ) {

    return 1;

  }


  return Math.min(
    3,
    Math.max(
      1,
      Math.round(
        difficulty
      )
    )
  );

}



/*
==================================================
取得難度星號
==================================================
*/


export function getDifficultyStars(
  gameId
) {

  return "⭐".repeat(
    getGameDifficulty(
      gameId
    )
  );

}



/*
==================================================
依學期取得所有遊戲
首頁使用

包含：
finished true
finished false
==================================================
*/


export function getGamesBySemester(
  semester
) {

  return Object.values(
    GAME_CONFIG
  )
    .filter(
      game =>
        game.semester ===
        semester
    )
    .sort(
      (
        gameA,
        gameB
      ) =>
        gameA.order -
        gameB.order
    );

}



/*
==================================================
取得所有已完成遊戲

我的成績、
舊版排行榜等功能使用
==================================================
*/


export function getFinishedGames() {

  return Object.values(
    GAME_CONFIG
  )
    .filter(
      game =>
        game.finished ===
        true
    )
    .sort(
      (
        gameA,
        gameB
      ) => {

        if (
          gameA.semester ===
          gameB.semester
        ) {

          return (
            gameA.order -
            gameB.order
          );

        }


        return gameA.semester
          .localeCompare(
            gameB.semester
          );

      }
    );

}



/*
==================================================
★ 新增
取得指定學期「已完成」遊戲

leaderboard.js v8.1 使用：

getFinishedGamesBySemester(
  selectedSemester
)

原本 v6.6 缺少這個 export，
會造成排行榜 JS 模組載入直接失敗，
畫面永久停在「載入中」。
==================================================
*/


export function getFinishedGamesBySemester(
  semester
) {

  return Object.values(
    GAME_CONFIG
  )
    .filter(
      game => {

        return (

          game.semester ===
            semester &&

          game.finished ===
            true

        );

      }
    )
    .sort(
      (
        gameA,
        gameB
      ) =>
        gameA.order -
        gameB.order
    );

}



/*
==================================================
取得推薦遊戲
==================================================
*/


export function getRecommendedGames() {

  return Object.values(
    GAME_CONFIG
  )
    .filter(
      game =>
        game.finished ===
          true &&
        game.recommended ===
          true
    )
    .sort(
      (
        gameA,
        gameB
      ) => {

        if (
          gameA.semester ===
          gameB.semester
        ) {

          return (
            gameA.order -
            gameB.order
          );

        }


        return gameA.semester
          .localeCompare(
            gameB.semester
          );

      }
    );

}



/*
==================================================
取得新遊戲
==================================================
*/


export function getNewGames() {

  return Object.values(
    GAME_CONFIG
  )
    .filter(
      game =>
        game.finished ===
          true &&
        game.isNew ===
          true
    )
    .sort(
      (
        gameA,
        gameB
      ) => {

        if (
          gameA.semester ===
          gameB.semester
        ) {

          return (
            gameA.order -
            gameB.order
          );

        }


        return gameA.semester
          .localeCompare(
            gameB.semester
          );

      }
    );

}



/*
==================================================
取得遊戲排列順序

★ my-scores.js 使用
==================================================
*/


export function getGameOrder() {

  return getFinishedGames()
    .map(
      game =>
        game.id
    );

}



/*
==================================================
檢查遊戲是否完成
==================================================
*/


export function isGameFinished(
  gameId
) {

  return (
    GAME_CONFIG[
      gameId
    ]?.finished ===
    true
  );

}



/*
==================================================
取得排行榜類型
==================================================
*/


export function getGameRankingType(
  gameId
) {

  const type =
    GAME_CONFIG[
      gameId
    ]?.ranking?.type;


  return (
    type ===
    "timed"

      ? "timed"

      : "speed"
  );

}



/*
==================================================
是否為固定時間排行榜
==================================================
*/


export function isTimedRankingGame(
  gameId
) {

  return (
    getGameRankingType(
      gameId
    ) ===
    "timed"
  );

}



/*
==================================================
是否為多模式遊戲
==================================================
*/


export function isMultiModeGame(
  gameId
) {

  return (
    getGameModeCount(
      gameId
    ) >
    1
  );

}



/*
==================================================
完整顯示名稱
==================================================
*/


export function getGameDisplayName(
  gameId,
  mode
) {

  const gameName =
    getGameName(
      gameId
    );


  if (
    !isMultiModeGame(
      gameId
    )
  ) {

    return gameName;

  }


  const modeName =
    getModeName(
      gameId,
      mode
    );


  if (
    !modeName
  ) {

    return gameName;

  }


  return (
    `${gameName}｜${modeName}`
  );

}



/*
==================================================
確認設定檔成功載入
==================================================
*/


console.log(
  "game-config.js 九上六遊戲整合版已成功載入"
);


console.log(
  "正式上架遊戲數：",
  getFinishedGames().length
);


console.log(
  "八年級上學期正式遊戲：",
  getFinishedGamesBySemester(
    "grade8-first"
  ).map(
    game =>
      game.name
  )
);
