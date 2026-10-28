/*
==================================================
數學遊戲樂園：遊戲共用設定
檔案位置：js/game-config.js

版本：11.0（六學期單一資料來源）
七年級下學期 1-1～6 正式上線同步版
＋七下 4-1／4-2／第 5 章／第 6 章
＋八年級上學期完整遊戲設定
＋八年級下學期第 1 章 1-1／1-2／1-3 正式上線同步版
＋九年級上學期正式遊戲設定
＋排行榜 / 我的成績相容設定
＋首頁卡片章節編號 section 欄位
＋舊版 GAME_ID 歷史成績相容
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


  "linear-inequality-basics": {
    id:"linear-inequality-basics", section:"4-1",
    name:"4-1 一元一次不等式的解及圖示大挑戰", shortName:"一元一次不等式的解及圖示",
    semester:"grade7-second", grade:7, order:8, icon:"🚦",
    file:"games/linear-inequality-basics.html",
    description:"練習不等式語句、解的檢驗，以及空心點／實心點和數線圖示的判讀。",
    finished:true, difficulty:2, recommended:false, isNew:true, ranking:{type:"speed"},
    modes:{
      meaning:"不等式與語句",
      solutionCheck:"代入檢驗解",
      numberLineRead:"數線判讀",
      numberLineChoose:"不等式圖示",
      comprehensive:"4-1 綜合挑戰"
    },
    theme:{primary:"#0F766E",dark:"#115E59",light:"#ECFDF5",border:"#5EEAD4"}
  },

  "linear-inequality-solve": {
    id:"linear-inequality-solve", section:"4-2",
    name:"4-2 解一元一次不等式及其應用大挑戰", shortName:"解一元一次不等式及其應用",
    semester:"grade7-second", grade:7, order:9, icon:"⚖️",
    file:"games/linear-inequality-solve.html",
    description:"練習移項、正負數乘除、不等號反向、多步驟不等式、整數邊界與生活應用。",
    finished:true, difficulty:3, recommended:true, isNew:true, ranking:{type:"speed"},
    modes:{
      addSubtract:"加減與移項",
      multiplyDivide:"乘除與反向",
      multiStep:"多步驟不等式",
      integerBoundary:"整數邊界與圖示",
      application:"生活應用",
      comprehensive:"4-2 綜合挑戰"
    },
    theme:{primary:"#2563EB",dark:"#1D4ED8",light:"#EFF6FF",border:"#93C5FD"}
  },

  "statistics-data": {
    id:"statistics-data", section:"5",
    name:"5 統計圖表與統計數據大挑戰", shortName:"統計圖表與統計數據",
    semester:"grade7-second", grade:7, order:10, icon:"📊",
    file:"games/statistics-data.html",
    description:"練習生活統計圖表、圓形圖、列聯表、次數分配，以及平均數、中位數與眾數。",
    finished:true, difficulty:2, recommended:false, isNew:true, ranking:{type:"speed"},
    modes:{
      chartsRead:"生活統計圖表",
      contingency:"列聯表",
      frequency:"次數分配與圖形",
      center:"平均數・中位數・眾數",
      comprehensive:"第 5 章綜合挑戰"
    },
    theme:{primary:"#0891B2",dark:"#0E7490",light:"#ECFEFF",border:"#67E8F9"}
  },

  "symmetry-three-views": {
    id:"symmetry-three-views", section:"6",
    name:"6 線對稱與三視圖大挑戰", shortName:"線對稱與三視圖",
    semester:"grade7-second", grade:7, order:11, icon:"🪞",
    file:"games/symmetry-three-views.html",
    description:"練習點線角與垂直平分、線對稱、對稱點，以及正方體積木的前視圖、上視圖與右視圖。",
    finished:true, difficulty:3, recommended:false, isNew:true, ranking:{type:"speed"},
    modes:{
      geometryBasics:"簡單圖形與垂直平分",
      symmetryJudge:"線對稱判斷",
      reflection:"對稱點與完成圖形",
      threeViews:"三視圖",
      comprehensive:"第 6 章綜合挑戰"
    },
    theme:{primary:"#7C3AED",dark:"#5B21B6",light:"#F5F3FF",border:"#C4B5FD"}
  },

  /* 舊版第 5 章 GAME_ID，僅保留歷史資料辨識，不顯示在首頁。 */
  statistics: {
    id:"statistics", section:"5",
    name:"舊版 統計圖表", shortName:"舊版統計圖表",
    semester:"grade7-second", grade:7, order:97, icon:"📊",
    file:"games/statistics.html",
    description:"舊版歷史成績相容用。",
    finished:false, archived:true, difficulty:2, recommended:false, isNew:false, ranking:{type:"timed"},
    modes:{},
    theme:{primary:"#64748B",dark:"#475569",light:"#F1F5F9",border:"#CBD5E1"}
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
        "平方根觀念應用",

      comprehensive:
        "全單元綜合挑戰"

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
      "六模式隨機練習根式乘除、大小比較、同類方根、四則運算與乘法公式。",

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

      formula:
        "根式的乘法公式",

      mixed:
        "根式四則運算",

      comprehensive:
        "全單元綜合挑戰"

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
,
  /* 八下及九下：由首頁搬移至單一設定檔；保留既有遊戲識別碼與檔名 */
  "linear-function": {
    id: "linear-function",
    name: "線型函數與圖形大挑戰",
    shortName: "線型函數與圖形",
    semester: "grade8-second",
    grade: 8,
    order: 4,
    icon: "📈",
    file: "games/linear-function.html",
    description: "練習線型函數、座標代入與圖形判讀。",
    finished: false,
    difficulty: 2,
    ranking: {"type":"speed"},
    modes: {},
    theme: {"primary":"#F57C00","dark":"#E65100","light":"#FFF3E0","border":"#FFCC80"}
  },
  "triangle-angles": {
    id: "triangle-angles",
    name: "三角形內角與外角大挑戰",
    shortName: "三角形內角與外角",
    semester: "grade8-second",
    grade: 8,
    order: 5,
    icon: "📐",
    file: "games/triangle-angles.html",
    description: "運用內角和與外角性質進行角度計算。",
    finished: false,
    difficulty: 2,
    ranking: {"type":"speed"},
    modes: {},
    theme: {"primary":"#D81B60","dark":"#AD1457","light":"#FCE4EC","border":"#F48FB1"}
  },
  "compass-straightedge": {
    id: "compass-straightedge",
    name: "基本尺規作圖大挑戰",
    shortName: "基本尺規作圖",
    semester: "grade8-second",
    grade: 8,
    order: 6,
    icon: "📏",
    file: "games/compass-straightedge.html",
    description: "練習垂直平分線、角平分線與基本尺規作圖。",
    finished: false,
    difficulty: 2,
    ranking: {"type":"speed"},
    modes: {},
    theme: {"primary":"#3949AB","dark":"#283593","light":"#E8EAF6","border":"#9FA8DA"}
  },
  "triangle-congruence": {
    id: "triangle-congruence",
    name: "三角形全等大挑戰",
    shortName: "三角形全等",
    semester: "grade8-second",
    grade: 8,
    order: 7,
    icon: "🔺",
    file: "games/triangle-congruence.html",
    description: "練習三角形全等性質與判別條件。",
    finished: false,
    difficulty: 3,
    ranking: {"type":"speed"},
    modes: {},
    theme: {"primary":"#00838F","dark":"#006064","light":"#E0F7FA","border":"#80DEEA"}
  },
  "bisector-perpendicular": {
    id: "bisector-perpendicular",
    name: "中垂線與角平分線大挑戰",
    shortName: "中垂線與角平分線",
    semester: "grade8-second",
    grade: 8,
    order: 8,
    icon: "🎯",
    file: "games/bisector-perpendicular.html",
    description: "練習中垂線、角平分線與等距性質。",
    finished: false,
    difficulty: 3,
    ranking: {"type":"speed"},
    modes: {},
    theme: {"primary":"#43A047","dark":"#2E7D32","light":"#E8F5E9","border":"#A5D6A7"}
  },
  "triangle-side-angle": {
    id: "triangle-side-angle",
    name: "三角形邊角關係大挑戰",
    shortName: "三角形邊角關係",
    semester: "grade8-second",
    grade: 8,
    order: 9,
    icon: "📐",
    file: "games/triangle-side-angle.html",
    description: "練習三角形邊長、角度大小與三角形不等式。",
    finished: false,
    difficulty: 3,
    ranking: {"type":"speed"},
    modes: {},
    theme: {"primary":"#EF6C00","dark":"#E65100","light":"#FFF3E0","border":"#FFB74D"}
  },
  "parallel-transversal": {
    id: "parallel-transversal",
    name: "平行線與截角大挑戰",
    shortName: "平行線與截角",
    semester: "grade8-second",
    grade: 8,
    order: 10,
    icon: "∥",
    file: "games/parallel-transversal.html",
    description: "練習同位角、內錯角、同側內角與平行線判別。",
    finished: false,
    difficulty: 2,
    ranking: {"type":"speed"},
    modes: {},
    theme: {"primary":"#1976D2","dark":"#125CA6","light":"#E3F2FD","border":"#90CAF9"}
  },
  "parallelogram": {
    id: "parallelogram",
    name: "平行四邊形大挑戰",
    shortName: "平行四邊形",
    semester: "grade8-second",
    grade: 8,
    order: 11,
    icon: "▱",
    file: "games/parallelogram.html",
    description: "練習平行四邊形的性質與判別。",
    finished: false,
    difficulty: 2,
    ranking: {"type":"speed"},
    modes: {},
    theme: {"primary":"#5E35B1","dark":"#4527A0","light":"#EDE7F6","border":"#B39DDB"}
  },
  "special-quadrilateral": {
    id: "special-quadrilateral",
    name: "特殊四邊形大挑戰",
    shortName: "特殊四邊形",
    semester: "grade8-second",
    grade: 8,
    order: 12,
    icon: "◇",
    file: "games/special-quadrilateral.html",
    description: "練習長方形、菱形與正方形的性質與判別。",
    finished: false,
    difficulty: 3,
    ranking: {"type":"speed"},
    modes: {},
    theme: {"primary":"#C2185B","dark":"#880E4F","light":"#FCE4EC","border":"#F48FB1"}
  },
  "quadratic-function-graph": {
    id: "quadratic-function-graph",
    name: "二次函數圖形大挑戰",
    shortName: "二次函數圖形",
    semester: "grade9-second",
    grade: 9,
    order: 1,
    icon: "📈",
    file: "games/quadratic-function-graph.html",
    description: "認識基本二次函數圖形、開口方向、頂點與對稱軸。",
    finished: false,
    difficulty: 2,
    ranking: {"type":"speed"},
    modes: {},
    theme: {"primary":"#1565C0","dark":"#0D47A1","light":"#E3F2FD","border":"#90CAF9"}
  },
  "quadratic-function-extrema": {
    id: "quadratic-function-extrema",
    name: "二次函數最值大挑戰",
    shortName: "二次函數最值",
    semester: "grade9-second",
    grade: 9,
    order: 2,
    icon: "🎢",
    file: "games/quadratic-function-extrema.html",
    description: "練習二次函數圖形與最大值、最小值。",
    finished: false,
    difficulty: 3,
    ranking: {"type":"speed"},
    modes: {},
    theme: {"primary":"#7B1FA2","dark":"#6A1B9A","light":"#F3E5F5","border":"#CE93D8"}
  },
  "quartile-boxplot": {
    id: "quartile-boxplot",
    name: "四分位數與盒狀圖大挑戰",
    shortName: "四分位數與盒狀圖",
    semester: "grade9-second",
    grade: 9,
    order: 3,
    icon: "📊",
    file: "games/quartile-boxplot.html",
    description: "練習四分位數、四分位距以及盒狀圖判讀。",
    finished: false,
    difficulty: 2,
    ranking: {"type":"speed"},
    modes: {},
    theme: {"primary":"#D81B60","dark":"#AD1457","light":"#FCE4EC","border":"#F48FB1"}
  },
  "probability": {
    id: "probability",
    name: "機率大挑戰",
    shortName: "機率",
    semester: "grade9-second",
    grade: 9,
    order: 4,
    icon: "🎲",
    file: "games/probability.html",
    description: "練習樣本空間、事件與基本機率計算。",
    finished: false,
    difficulty: 2,
    ranking: {"type":"speed"},
    modes: {},
    theme: {"primary":"#F57C00","dark":"#E65100","light":"#FFF3E0","border":"#FFCC80"}
  },
  "prism-cylinder": {
    id: "prism-cylinder",
    name: "角柱與圓柱大挑戰",
    shortName: "角柱與圓柱",
    semester: "grade9-second",
    grade: 9,
    order: 5,
    icon: "🥫",
    file: "games/prism-cylinder.html",
    description: "練習角柱、圓柱的展開圖、表面積與體積。",
    finished: false,
    difficulty: 2,
    ranking: {"type":"speed"},
    modes: {},
    theme: {"primary":"#0288D1","dark":"#0277BD","light":"#E1F5FE","border":"#81D4FA"}
  },
  "pyramid-cone": {
    id: "pyramid-cone",
    name: "角錐與圓錐大挑戰",
    shortName: "角錐與圓錐",
    semester: "grade9-second",
    grade: 9,
    order: 6,
    icon: "🔺",
    file: "games/pyramid-cone.html",
    description: "練習角錐、圓錐的展開圖、表面積與體積。",
    finished: false,
    difficulty: 3,
    ranking: {"type":"speed"},
    modes: {},
    theme: {"primary":"#E53935","dark":"#C62828","light":"#FFEBEE","border":"#EF9A9A"}
  },

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
            true &&
          game.archived !== true

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
  "game-config.js v11.0 已成功載入"
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
