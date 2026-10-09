/*
==================================================
數學遊戲樂園：遊戲共用設定
檔案位置：js/game-config.js

版本：9.9
七年級下學期 1-1～3-2 正式上線同步版
＋八年級下學期第 1 章 1-1／1-2／1-3 正式上線同步版
＋一元二次方程式
＋排行榜 / 我的成績相容修正版
＋九上 1-2／1-3／1-4 正式上線
＋首頁卡片章節編號 section 欄位
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
  "continued-ratio": {id:"continued-ratio",section:"1-1",name:"1-1 連比大挑戰",shortName:"連比",semester:"grade9-first",grade:9,order:1,icon:"🔗",file:"games/continued-ratio.html",description:"九上第1章：連比",finished:true,difficulty:2,recommended:false,isNew:true,ranking:{type:"speed"},modes:{merge:"連比合併",parts:"按比例分配",inverse:"反比例與幾何",mixed:"綜合挑戰"},theme:{primary:"#205d9b",dark:"#163f70",light:"#e8f2ff",border:"#91b8e1"}},
  "proportional-segments": {id:"proportional-segments",section:"1-2",name:"1-2 比例線段大挑戰",shortName:"比例線段",semester:"grade9-first",grade:9,order:2,icon:"📐",file:"games/proportional-segments.html",description:"九上 1-2：等高三角形面積比、平行線截比例線段、平行判別與中點連線段。",finished:true,difficulty:2,recommended:false,isNew:true,ranking:{type:"speed"},modes:{areaRatio:"等高三角形面積比",parallelSegments:"平行線截比例線段",parallelJudge:"比例線段判別平行",midpoint:"中點連線段",comprehensive:"1-2 綜合挑戰"},theme:{primary:"#0f766e",dark:"#115e59",light:"#ecfdf5",border:"#5eead4"}},
  "similar-polygons": {id:"similar-polygons",section:"1-3",name:"1-3 相似多邊形大挑戰",shortName:"相似多邊形",semester:"grade9-first",grade:9,order:3,icon:"🔷",file:"games/similar-polygons.html",description:"九上 1-3：圖形縮放、相似多邊形，以及 AA／SAS／SSS 三角形相似性質。",finished:true,difficulty:2,recommended:false,isNew:true,ranking:{type:"speed"},modes:{scaling:"圖形縮放",polygonSimilarity:"相似多邊形",aaSimilarity:"AA 相似",sasSimilarity:"SAS 相似",sssSimilarity:"SSS 相似",comprehensive:"1-3 綜合挑戰"},theme:{primary:"#7c3aed",dark:"#5b21b6",light:"#f5f3ff",border:"#c4b5fd"}},
  "similar-triangle-trig": {id:"similar-triangle-trig",section:"1-4",name:"1-4 相似三角形應用與三角比大挑戰",shortName:"相似三角形與三角比",semester:"grade9-first",grade:9,order:4,icon:"📐",file:"games/similar-triangle-trig.html",description:"九上 1-4：相似三角形比例、簡易測量、特殊直角三角形與 sin／cos／tan 應用。",finished:true,difficulty:3,recommended:false,isNew:true,ranking:{type:"speed"},modes:{similarityRelations:"相似三角形比例關係",measurement:"簡易測量",specialRight:"特殊直角三角形",trigRatio:"三角比",trigApplication:"三角比應用",comprehensive:"1-4 綜合挑戰"},theme:{primary:"#c2410c",dark:"#9a3412",light:"#fff7ed",border:"#fdba74"}},
  "point-line-circle": {id:"point-line-circle",section:"2-1",name:"2-1 點、線、圓大挑戰",shortName:"點、線、圓",semester:"grade9-first",grade:9,order:5,icon:"⭕",file:"games/point-line-circle.html",description:"九上 2-1：圓弧長與扇形、點與圓、直線與圓、切線與切線段、弦與弦心距。",finished:true,difficulty:3,recommended:false,isNew:true,ranking:{type:"speed"},modes:{sectorArc:"圓弧長與扇形",pointCircle:"點與圓的位置",lineCircle:"直線與圓的位置",tangent:"切線與切線段",chordDistance:"弦與弦心距",comprehensive:"2-1 綜合挑戰"},theme:{primary:"#205d9b",dark:"#163f70",light:"#e8f2ff",border:"#91b8e1"}},
  "central-inscribed-angle": {id:"central-inscribed-angle",section:"2-2",name:"2-2 圓心角與圓周角大挑戰",shortName:"圓心角與圓周角",semester:"grade9-first",grade:9,order:6,icon:"🟠",file:"games/central-inscribed-angle.html",description:"九上 2-2：圓心角、弧與弦、半徑與弧長、圓周角、直徑與平行線截弧、圓內接四邊形。",finished:true,difficulty:3,recommended:false,isNew:true,ranking:{type:"speed"},modes:{centralArc:"圓心角、弧與弦",arcRadius:"半徑、弧長與弦",inscribedAngle:"圓周角與弧",diameterParallel:"直徑與平行線截弧",cyclicQuadrilateral:"圓內接四邊形",comprehensive:"2-2 綜合挑戰"},theme:{primary:"#c2410c",dark:"#9a3412",light:"#fff7ed",border:"#fdba74"}},
  "geometric-proof": {id:"geometric-proof",section:"3-1",name:"3-1 推理證明大挑戰",shortName:"推理證明",semester:"grade9-first",grade:9,order:7,icon:"🧠",file:"games/geometric-proof.html",description:"九上 3-1：證明結構、幾何推理、輔助線、奇偶數與代數證明。",finished:true,difficulty:3,recommended:false,isNew:true,ranking:{type:"speed"},modes:{proofStructure:"證明結構與理由",geometryProof:"幾何推理證明",auxiliaryLine:"輔助線與思路分析",parityProof:"奇偶數證明",algebraProof:"代數推理與因數倍數",comprehensive:"3-1 綜合挑戰"},theme:{primary:"#7c3aed",dark:"#5b21b6",light:"#f5f3ff",border:"#c4b5fd"}},
  "triangle-centers": {id:"triangle-centers",section:"3-2",name:"3-2 三角形的外心、內心與重心大挑戰",shortName:"三角形三心",semester:"grade9-first",grade:9,order:8,icon:"🎯",file:"games/triangle-centers.html",description:"九上 3-2：外心與外接圓、內心與內切圓、重心比例與重心面積應用。",finished:true,difficulty:3,recommended:false,isNew:true,ranking:{type:"speed"},modes:{circumcenter:"外心與外接圓",incenter:"內心與角度",incircle:"內切圓半徑與面積",centroidRatio:"重心比例",centroidArea:"重心與面積",comprehensive:"3-2 綜合挑戰"},theme:{primary:"#0f766e",dark:"#115e59",light:"#ecfdf5",border:"#5eead4"}},





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

  "two-variable-linear-equation": {
    id:"two-variable-linear-equation", section:"1-1",
    name:"1-1 二元一次方程式大挑戰", shortName:"二元一次方程式",
    semester:"grade7-second", grade:7, order:1, icon:"🧮",
    file:"games/two-variable-linear-equation.html",
    description:"練習二元一次式、代入求值、同類項化簡、二元一次方程式與解，以及正整數解的合理性。",
    finished:true, difficulty:2, recommended:true, isNew:true, ranking:{type:"speed"},
    modes:{
      expressionBasics:"二元一次式與求值",
      simplify:"二元一次式化簡",
      equationSolution:"方程式與解",
      integerSolutions:"正整數解與合理性",
      comprehensive:"1-1 綜合挑戰"
    },
    theme:{primary:"#2563EB",dark:"#1D4ED8",light:"#EFF6FF",border:"#93C5FD"}
  },

  "linear-system-solve": {
    id:"linear-system-solve", section:"1-2",
    name:"1-2 解二元一次聯立方程式大挑戰", shortName:"解二元一次聯立方程式",
    semester:"grade7-second", grade:7, order:2, icon:"🔁",
    file:"games/linear-system-solve.html",
    description:"練習聯立方程式共同解、代入消去法、加減消去法，以及調整係數與先化簡再求解。",
    finished:true, difficulty:3, recommended:false, isNew:true, ranking:{type:"speed"},
    modes:{
      systemMeaning:"聯立方程式與共同解",
      substitution:"代入消去法",
      elimination:"加減消去法",
      coefficientAdjust:"調整係數與化簡",
      comprehensive:"1-2 綜合挑戰"
    },
    theme:{primary:"#7C3AED",dark:"#5B21B6",light:"#F5F3FF",border:"#C4B5FD"}
  },

  "linear-system-applications": {
    id:"linear-system-applications", section:"1-3",
    name:"1-3 二元一次聯立方程式應用大挑戰", shortName:"聯立方程式應用",
    semester:"grade7-second", grade:7, order:3, icon:"💡",
    file:"games/linear-system-applications.html",
    description:"練習總和、價格數量、年齡倍數、分組配置與合理性問題，依課本四步驟建立並解聯立方程式。",
    finished:true, difficulty:3, recommended:false, isNew:true, ranking:{type:"speed"},
    modes:{
      directTotal:"直接列式與總和問題",
      priceQuantity:"價格與數量問題",
      multipleAge:"倍數、年齡與數字問題",
      grouping:"分組與配置問題",
      reasonableness:"合理性與無解判斷",
      comprehensive:"1-3 綜合挑戰"
    },
    theme:{primary:"#0F766E",dark:"#115E59",light:"#ECFDF5",border:"#5EEAD4"}
  },

  /* 舊版七下聯立方程式 GAME_ID：僅保留舊 Firestore 紀錄辨識，不顯示在首頁。 */
  simultaneousEquation: {
    id:"simultaneousEquation", section:"1",
    name:"舊版 二元一次聯立方程式", shortName:"舊版聯立方程式",
    semester:"grade7-second", grade:7, order:99, icon:"🔢",
    file:"games/simultaneous-equation.html",
    description:"舊版歷史成績相容用。",
    finished:false, archived:true, difficulty:3, recommended:false, isNew:false, ranking:{type:"timed"},
    modes:{},
    theme:{primary:"#64748B",dark:"#475569",light:"#F1F5F9",border:"#CBD5E1"}
  },


  "coordinate-plane": {
    id:"coordinate-plane", section:"2-1",
    name:"2-1 直角坐標平面大挑戰", shortName:"直角坐標平面",
    semester:"grade7-second", grade:7, order:4, icon:"📍",
    file:"games/coordinate-plane.html",
    description:"練習坐標與描點、坐標軸與象限、點到兩軸的距離、坐標反推，以及移動與圖形位置判讀。",
    finished:true, difficulty:2, recommended:false, isNew:true, ranking:{type:"speed"},
    modes:{
      coordinateBasics:"坐標與描點",
      axesQuadrants:"坐標軸與象限",
      distancePosition:"距離與坐標反推",
      movementGeometry:"移動與圖形位置",
      comprehensive:"2-1 綜合挑戰"
    },
    theme:{primary:"#0284C7",dark:"#0369A1",light:"#F0F9FF",border:"#7DD3FC"}
  },

  "linear-equation-graph": {
    id:"linear-equation-graph", section:"2-2",
    name:"2-2 二元一次方程式的圖形大挑戰", shortName:"二元一次方程式圖形",
    semester:"grade7-second", grade:7, order:5, icon:"📈",
    file:"games/linear-equation-graph.html",
    description:"練習方程式的解與點、畫直線與兩軸交點、水平線與鉛垂線、由點求方程式，以及聯立方程式與交點。",
    finished:true, difficulty:3, recommended:false, isNew:true, ranking:{type:"speed"},
    modes:{
      solutionPoints:"方程式的解與點",
      lineGraphIntercepts:"畫線與兩軸交點",
      horizontalVertical:"水平線與鉛垂線",
      equationFromGraph:"由點求直線方程式",
      systemIntersection:"聯立方程式與交點",
      comprehensive:"2-2 綜合挑戰"
    },
    theme:{primary:"#0F766E",dark:"#115E59",light:"#ECFDF5",border:"#5EEAD4"}
  },

  "proportion-equation": {
    id:"proportion-equation", section:"3-1",
    name:"3-1 比例式大挑戰", shortName:"比例式",
    semester:"grade7-second", grade:7, order:6, icon:"⚖️",
    file:"games/proportion-equation.html",
    description:"練習比與比值、最簡整數比、比例式求未知數、比例關係與倍數，以及比例的生活應用。",
    finished:true, difficulty:2, recommended:false, isNew:true, ranking:{type:"speed"},
    modes:{
      ratioValue:"比與比值",
      simplifyRatio:"最簡整數比",
      proportionSolve:"比例式求未知數",
      ratioRelation:"比例關係與倍數",
      proportionApplication:"比例應用",
      comprehensive:"3-1 綜合挑戰"
    },
    theme:{primary:"#EA580C",dark:"#C2410C",light:"#FFF7ED",border:"#FDBA74"}
  },

  "direct-inverse-proportion": {
    id:"direct-inverse-proportion", section:"3-2",
    name:"3-2 正比與反比大挑戰", shortName:"正比與反比",
    semester:"grade7-second", grade:7, order:7, icon:"🔄",
    file:"games/direct-inverse-proportion.html",
    description:"練習正比與反比判別、正比關係、反比關係與生活應用，並能由已知條件求關係式與未知量。",
    finished:true, difficulty:3, recommended:false, isNew:true, ranking:{type:"speed"},
    modes:{
      relationJudge:"正比／反比判別",
      directProportion:"正比關係",
      inverseProportion:"反比關係",
      proportionApplication:"正反比生活應用",
      comprehensive:"3-2 綜合挑戰"
    },
    theme:{primary:"#7C3AED",dark:"#5B21B6",light:"#F5F3FF",border:"#C4B5FD"}
  },

  coordinate: {
    id:"coordinate", section:"2",
    name:"舊版 直角坐標與方程式圖形", shortName:"舊版直角坐標與方程式圖形",
    semester:"grade7-second", grade:7, order:98, icon:"📍",
    file:"games/coordinate.html",
    description:"舊版歷史相容用。",
    finished:false, archived:true, difficulty:2, recommended:false, isNew:false, ranking:{type:"timed"},
    modes:{},
    theme:{primary:"#64748B",dark:"#475569",light:"#F1F5F9",border:"#CBD5E1"}
  },

  ratio: {
    id:"ratio", section:"3",
    name:"舊版 比例式、正比與反比", shortName:"舊版比例",
    semester:"grade7-second", grade:7, order:99, icon:"📏",
    file:"games/ratio.html",
    description:"舊版歷史相容用。",
    finished:false, archived:true, difficulty:2, recommended:false, isNew:false, ranking:{type:"timed"},
    modes:{},
    theme:{primary:"#64748B",dark:"#475569",light:"#F1F5F9",border:"#CBD5E1"}
  },

  statistics: {
    id:"statistics", section:"5",
    name:"統計圖表", shortName:"統計圖表",
    semester:"grade7-second", grade:7, order:10, icon:"📊",
    file:"games/statistics.html",
    description:"練習次數分配、統計圖表與資料判讀。",
    finished:false, difficulty:2, recommended:false, isNew:false, ranking:{type:"timed"},
    modes:{},
    theme:{primary:"#00838F",dark:"#006064",light:"#E0F7FA",border:"#80DEEA"}
  },


  /*
  ==================================================
  八年級上學期
  ==================================================
  */


  multiplicationFormula: {

    id:
      "multiplicationFormula",section:"1-1",

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
      "polynomialAddSubtract",section:"1-2",

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
      "polynomialMultiplyDivide",section:"1-3",

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
      "squareRoot",section:"2-1",

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
      "radicalOperation",section:"2-2",

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
      "pythagorean",section:"2-3",

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
      "factorization",section:"3-1",

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
      "crossMultiplication",section:"3-2",

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



  /* ==================================================
  八上 4-1～第 5 章重製遊戲
  ================================================== */

  "quadratic-factorization": {
    id:"quadratic-factorization", section:"4-1",
    name:"4-1 因式分解法解一元二次方程式大挑戰", shortName:"因式分解法解一元二次方程式", cardTitleLines:["4-1 因式分解法","解一元二次方程式大挑戰"],
    semester:"grade8-first", grade:8, order:9, icon:"✂️",
    file:"games/quadratic-factorization.html",
    description:"練習一元二次方程式的意義與根、零乘積性質、提公因式、乘法公式與十字交乘求解。",
    finished:true, difficulty:3, recommended:false, isNew:true, ranking:{type:"speed"},
    modes:{equationRoot:"標準式與根",zeroProduct:"零乘積與已分解方程式",commonFactor:"提公因式求解",identityFactor:"乘法公式因式分解",crossFactor:"十字交乘求解",comprehensive:"4-1 綜合挑戰"},
    theme:{primary:"#00897B",dark:"#00695C",light:"#E0F2F1",border:"#80CBC4"}
  },

  "quadratic-completing-formula": {
    id:"quadratic-completing-formula", section:"4-2",
    name:"4-2 配方法與公式解大挑戰", shortName:"配方法與公式解",
    semester:"grade8-first", grade:8, order:10, icon:"🧮",
    file:"games/quadratic-completing-formula.html",
    description:"練習平方根解法、配成完全平方式、配方法、一元二次方程式公式解與判別式。",
    finished:true, difficulty:3, recommended:true, isNew:true, ranking:{type:"speed"},
    modes:{squareRoot:"平方根解法",completeSquareForm:"配成完全平方式",completeSquareSolve:"配方法解方程式",formulaSolve:"一元二次方程式公式解",discriminant:"判別式與根的情形",comprehensive:"4-2 綜合挑戰"},
    theme:{primary:"#1565C0",dark:"#0D47A1",light:"#E3F2FD",border:"#90CAF9"}
  },

  "quadratic-applications": {
    id:"quadratic-applications", section:"4-3",
    name:"4-3 一元二次方程式應用問題", shortName:"一元二次方程式應用", cardTitleLines:["4-3 一元二次方程式應用問題"],
    semester:"grade8-first", grade:8, order:11, icon:"🌍",
    file:"games/quadratic-applications.html",
    description:"練習由題意列方程式、整數與年齡、面積與路寬、售價收入，以及合理根與近似值。",
    finished:true, difficulty:3, recommended:false, isNew:true, ranking:{type:"speed"},
    modes:{equationModel:"由題意列方程式",integerAge:"整數與年齡問題",geometry:"面積與路寬問題",priceRevenue:"售價、數量與收入",validityApprox:"合理根與近似值",comprehensive:"4-3 綜合挑戰"},
    theme:{primary:"#C2410C",dark:"#9A3412",light:"#FFF7ED",border:"#FDBA74"}
  },

  "statistics-data-processing": {
    id:"statistics-data-processing", section:"5",
    name:"5 統計資料處理大挑戰", shortName:"統計資料處理",
    semester:"grade8-first", grade:8, order:12, icon:"📊",
    file:"games/statistics-data-processing.html",
    description:"練習相對次數分配、組中點、累積次數、累積相對次數，以及折線圖判讀與比較。",
    finished:true, difficulty:3, recommended:false, isNew:true, ranking:{type:"speed"},
    modes:{relativeFrequency:"相對次數分配表",relativeGraph:"相對次數折線圖",cumulativeFrequency:"累積次數分配",cumulativeRelative:"累積相對次數分配",graphInterpretation:"統計圖表判讀與比較",comprehensive:"第 5 章綜合挑戰"},
    theme:{primary:"#00838F",dark:"#006064",light:"#E0F7FA",border:"#80DEEA"}
  },


  /* ==================================================
  八下第 1 章｜數列與級數
  ================================================== */

  "sequence-arithmetic": {
    id:"sequence-arithmetic", section:"1-1",
    name:"1-1 認識數列與等差數列大挑戰", shortName:"數列與等差數列",
    semester:"grade8-second", grade:8, order:1, icon:"🔢",
    file:"games/sequence-arithmetic.html",
    description:"練習數列與一般項、等差數列、公差、第 n 項、等差中項與規律生活應用。",
    finished:true, difficulty:2, recommended:true, isNew:true, ranking:{type:"speed"},
    modes:{sequenceBasics:"數列與一般項",arithmeticJudge:"等差數列與公差",arithmeticNth:"第 n 項與反推",arithmeticMean:"等差中項",arithmeticApplication:"規律與生活應用",comprehensive:"1-1 綜合挑戰"},
    theme:{primary:"#1565C0",dark:"#0D47A1",light:"#E3F2FD",border:"#90CAF9"}
  },

  "arithmetic-series": {
    id:"arithmetic-series", section:"1-2",
    name:"1-2 等差級數大挑戰", shortName:"等差級數",
    semester:"grade8-second", grade:8, order:2, icon:"➕",
    file:"games/arithmetic-series.html",
    description:"練習級數觀念、等差級數兩種求和公式、未知量反推與生活情境應用。",
    finished:true, difficulty:2, recommended:false, isNew:true, ranking:{type:"speed"},
    modes:{seriesConcept:"級數觀念與高斯配對",sumFirstLast:"首項、末項與項數求和",sumFirstDiff:"首項、公差與項數求和",findUnknown:"反求項數與公差",seriesApplication:"等差級數應用",comprehensive:"1-2 綜合挑戰"},
    theme:{primary:"#00897B",dark:"#00695C",light:"#E0F2F1",border:"#80CBC4"}
  },

  "geometric-sequence": {
    id:"geometric-sequence", section:"1-3",
    name:"1-3 等比數列大挑戰", shortName:"等比數列",
    semester:"grade8-second", grade:8, order:3, icon:"✖️",
    file:"games/geometric-sequence.html",
    description:"練習等比數列、公比、第 n 項、缺項與條件反推、等比中項，以及生活應用。",
    finished:true, difficulty:2, recommended:false, isNew:true, ranking:{type:"speed"},
    modes:{geometricJudge:"等比數列與公比",geometricNth:"第 n 項與項數",geometricComplete:"缺項與條件反推",geometricMean:"等比中項",geometricApplication:"等比數列應用",comprehensive:"1-3 綜合挑戰"},
    theme:{primary:"#7B1FA2",dark:"#6A1B9A",light:"#F3E5F5",border:"#CE93D8"}
  },

  /* 舊版一元二次方程式 GAME_ID：僅保留舊 Firestore 紀錄辨識，不顯示在首頁。 */
  quadraticEquation: {
    id:"quadraticEquation", section:"4",
    name:"舊版 一元二次方程式大挑戰", shortName:"舊版一元二次方程式",
    semester:"grade8-first", grade:8, order:99, icon:"x²",
    file:"games/quadratic-equation.html", description:"舊版歷史成績相容用。",
    finished:false, archived:true, difficulty:3, recommended:false, isNew:false, ranking:{type:"speed"},
    modes:{basic:"基礎概念",factor:"因式分解法",completeSquare:"平方根與配方法",formula:"公式解與判別式",application:"一元二次應用問題",mixed:"全章綜合挑戰"},
    theme:{primary:"#64748B",dark:"#475569",light:"#F1F5F9",border:"#CBD5E1"}
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
取得首頁卡片標題分行
==================================================

若有 cardTitleLines：
首頁卡片可依指定行數呈現，
但正式遊戲名稱 name 仍可供排行榜／成績頁使用。
==================================================
*/


export function getGameCardTitleLines(
  gameId
) {

  const lines =
    GAME_CONFIG[
      gameId
    ]?.cardTitleLines;


  if (
    Array.isArray(
      lines
    ) &&
    lines.length >
      0
  ) {

    return lines
      .map(
        line =>
          String(
            line
          )
      );
  }


  const name =
    GAME_CONFIG[
      gameId
    ]?.name;


  return name
    ? [
        String(
          name
        )
      ]
    : [];
}



/*
==================================================
取得首頁卡片標題 HTML
==================================================
*/

export function getGameCardTitleHTML(
  gameId
) {

  return getGameCardTitleLines(
    gameId
  )
    .map(
      line =>
        line
          .replaceAll(
            "&",
            "&amp;"
          )
          .replaceAll(
            "<",
            "&lt;"
          )
          .replaceAll(
            ">",
            "&gt;"
          )
          .replaceAll(
            '"',
            "&quot;"
          )
          .replaceAll(
            "'",
            "&#039;"
          )
    )
    .join(
      "<br>"
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
          semester &&
        game.archived !==
          true
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
          true &&
        game.archived !==
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
  "game-config.js v9.9 卡片標題分行版已成功載入"
);


console.log(
  "正式上架遊戲數：",
  getFinishedGames().length
);


console.log(
  "七年級下學期正式遊戲：",
  getFinishedGamesBySemester(
    "grade7-second"
  ).map(
    game =>
      game.name
  )
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

console.log(
  "八年級下學期正式遊戲：",
  getFinishedGamesBySemester(
    "grade8-second"
  ).map(
    game =>
      game.name
  )
);
