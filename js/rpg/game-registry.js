/*
==================================================
學習型 RPG 成長系統
中央遊戲／模式登錄表
Version 1.1
==================================================

本版重點：

1. 鎖定已核對完成的：
   - 舊七上
   - 新版七上 1-1 ～ 1-4
   - 八上

2. 保留原本 game + mode 成績格式。
   不要求舊遊戲重新改 GAME_ID。

3. 新增 SPEED 模式類型。
   避免競速分數被誤當一般百分制。

4. 舊版 integer 沒有 mode。
   僅這支遊戲允許：
   空白 mode → default。

5. Registry 只管理：
   - gameId
   - modeId
   - 名稱
   - 類型
   - 難度
   - 是否可計入各種 RPG 統計

6. XP、任務、成就、商店
   暫時都不在這裡執行。
==================================================
*/

"use strict";


import {

  RPG_CONFIG,

  rpgDebug

} from "./rpg-config.js";


/*
==================================================
模式類型
==================================================
*/

const RPG_MODE_TYPES =
  Object.freeze({

    STANDARD:
      "standard",

    MIXED:
      "mixed",

    SPEED:
      "speed",

    BOSS:
      "boss",

    REMEDIAL:
      "remedial",

    SPECIAL:
      "special"

  });


/*
==================================================
難度等級與 XP 權重
==================================================

目前 XP 尚未正式接入。

這裡先完成難度結構，
之後正式接 XP 前還會再核對一次。

難度 1：基礎
難度 2：一般
難度 3：進階
難度 4：高難度
難度 5：Boss
==================================================
*/

const RPG_DIFFICULTY =
  Object.freeze({

    1:
      Object.freeze({

        label:
          "基礎",

        xpWeight:
          1.00

      }),


    2:
      Object.freeze({

        label:
          "一般",

        xpWeight:
          1.10

      }),


    3:
      Object.freeze({

        label:
          "進階",

        xpWeight:
          1.20

      }),


    4:
      Object.freeze({

        label:
          "高難度",

        xpWeight:
          1.35

      }),


    5:
      Object.freeze({

        label:
          "Boss",

        xpWeight:
          1.50

      })

  });


/*
==================================================
建立模式
==================================================
*/

function createMode({

  modeId,

  name,

  difficultyLevel = 1,

  modeType =
    RPG_MODE_TYPES.STANDARD,

  active = true,

  countsForCompletion = true,

  countsForMastery = true,

  countsForAchievements = true,

  countsForDailyMission = true,

  countsForWeeklyMission = true

}) {

  return Object.freeze({

    modeId,

    name,

    difficultyLevel,

    modeType,

    active,

    countsForCompletion,

    countsForMastery,

    countsForAchievements,

    countsForDailyMission,

    countsForWeeklyMission

  });

}


/*
==================================================
建立遊戲
==================================================
*/

function createGame({

  gameId,

  name,

  category,

  active = true,

  /*
  只有非常確定的舊版單模式遊戲
  才可以設成 true。
  */
  legacyBlankModeId = false,

  modes = {}

}) {

  return Object.freeze({

    gameId,

    name,

    category,

    active,

    legacyBlankModeId,

    modes:
      Object.freeze(
        modes
      )

  });

}


/*
==================================================
模式快速建立工具
==================================================
*/

function standardMode(

  modeId,

  name,

  difficultyLevel = 1,

  extra = {}

) {

  return createMode({

    modeId,

    name,

    difficultyLevel,

    modeType:
      RPG_MODE_TYPES.STANDARD,

    ...extra

  });

}


function mixedMode(

  modeId,

  name,

  difficultyLevel = 3,

  extra = {}

) {

  return createMode({

    modeId,

    name,

    difficultyLevel,

    modeType:
      RPG_MODE_TYPES.MIXED,

    /*
    綜合挑戰不列入
    「核心模式是否全部完成」
    的判定。
    */
    countsForCompletion:
      false,

    ...extra

  });

}


function speedMode(

  modeId,

  name,

  difficultyLevel = 1,

  extra = {}

) {

  return createMode({

    modeId,

    name,

    difficultyLevel,

    modeType:
      RPG_MODE_TYPES.SPEED,

    /*
    競速模式可以：

    ✓ 保存遊玩紀錄
    ✓ 計入答對題數
    ✓ 計入競速相關成就
    ✓ 計入允許的每日／每週任務

    但不拿來當：
    ✗ 一般核心模式完成
    ✗ 一般百分制熟練度
    */
    countsForCompletion:
      false,

    countsForMastery:
      false,

    ...extra

  });

}


/*
==================================================
中央遊戲登錄表
==================================================

非常重要：

以下 gameId 與 modeId
是 RPG 的永久識別碼。

未來可以改：

✓ 中文名稱
✓ 圖示
✓ 顏色
✓ 題目內容
✓ 難度

但是不要隨便改：

✗ gameId
✗ modeId
==================================================
*/

const GAME_REGISTRY =
  Object.freeze({


    /*
    ==================================================
    舊七上
    ==================================================
    */


    /*
    正負整數大挑戰

    舊版只有單一模式，
    Firestore 舊資料可能沒有 mode。
    */
    integer:
      createGame({

        gameId:
          "integer",

        name:
          "正負整數大挑戰",

        category:
          "七上｜正負數",

        legacyBlankModeId:
          true,

        modes: {

          default:
            speedMode(

              "default",

              "60 秒正負整數挑戰",

              1

            )

        }

      }),


    /*
    一元一次方程式
    */
    equation:
      createGame({

        gameId:
          "equation",

        name:
          "一元一次方程式挑戰賽",

        category:
          "七上｜一元一次方程式",

        modes: {

          "1":
            standardMode(

              "1",

              "模式一",

              1

            ),


          "2":
            standardMode(

              "2",

              "模式二",

              2

            ),


          "3":
            standardMode(

              "3",

              "模式三",

              2

            ),


          "4":
            standardMode(

              "4",

              "模式四",

              3

            )

        }

      }),


    /*
    正負分數加減
    */
    fraction:
      createGame({

        gameId:
          "fraction",

        name:
          "正負分數加減大挑戰",

        category:
          "七上｜正負數",

        modes: {

          lcm:
            standardMode(

              "lcm",

              "最小公倍數複習",

              1

            ),


          fraction:
            standardMode(

              "fraction",

              "正負分數加減",

              2

            )

        }

      }),


    /*
    正負數四則運算
    */
    "integer-operations":
      createGame({

        gameId:
          "integer-operations",

        name:
          "正負數四則運算大挑戰",

        category:
          "七上｜正負數",

        modes: {

          muldiv:
            standardMode(

              "muldiv",

              "正負數的乘除",

              1

            ),


          absolute:
            standardMode(

              "absolute",

              "絕對值運算",

              2

            ),


          power:
            standardMode(

              "power",

              "乘方計算",

              2

            ),


          mixed:
            standardMode(

              "mixed",

              "四則運算",

              2

            ),


          advanced:
            standardMode(

              "advanced",

              "四則運算進階挑戰",

              3

            )

        }

      }),


    /*
    數的大小比較
    */
    compare:
      createGame({

        gameId:
          "compare",

        name:
          "數的大小比較王",

        category:
          "七上｜數與數線",

        modes: {

          easy:
            standardMode(

              "easy",

              "初級｜整數比較",

              1

            ),


          medium:
            standardMode(

              "medium",

              "中級｜整數與分數",

              2

            ),


          hard:
            standardMode(

              "hard",

              "高級｜混合比較",

              3

            )

        }

      }),


    /*
    指數律
    */
    exponent:
      createGame({

        gameId:
          "exponent",

        name:
          "指數律大挑戰",

        category:
          "七上｜指數律",

        modes: {

          multiplication:
            standardMode(

              "multiplication",

              "同底數相乘",

              1

            ),


          division:
            standardMode(

              "division",

              "同底數相除",

              1

            ),


          powerOfPower:
            standardMode(

              "powerOfPower",

              "冪的乘方",

              2

            ),


          zeroExponent:
            standardMode(

              "zeroExponent",

              "零次方",

              1

            ),


          mixed:
            mixedMode(

              "mixed",

              "綜合指數律",

              3

            )

        }

      }),


    /*
    質因數分解、公因數公倍數
    */
    factor:
      createGame({

        gameId:
          "factor",

        name:
          "質因數分解、公因數公倍數大挑戰",

        category:
          "七上｜因數與倍數",

        modes: {

          primeFactorization:
            standardMode(

              "primeFactorization",

              "質因數分解",

              1

            ),


          gcd:
            standardMode(

              "gcd",

              "最大公因數",

              2

            ),


          lcm:
            standardMode(

              "lcm",

              "最小公倍數",

              2

            ),


          mixed:
            mixedMode(

              "mixed",

              "綜合挑戰",

              3

            )

        }

      }),



    /*
    ==================================================
    新版七上 1-1 ～ 1-4
    ==================================================
    */


    /*
    1-1 正數與負數
    */
    positiveNegative115:
      createGame({

        gameId:
          "positiveNegative115",

        name:
          "正數與負數大挑戰",

        category:
          "七上新版｜1-1 正數與負數",

        modes: {

          context:
            standardMode(

              "context",

              "🌡️ 正負數情境判讀",

              1

            ),


          numberline:
            standardMode(

              "numberline",

              "📍 數線定位挑戰",

              2

            ),


          compare:
            standardMode(

              "compare",

              "⚖️ 數的大小比較",

              1

            ),


          opposite:
            standardMode(

              "opposite",

              "🔄 相反數挑戰",

              1

            ),


          absolute:
            standardMode(

              "absolute",

              "📏 絕對值挑戰",

              2

            ),


          mixed:
            mixedMode(

              "mixed",

              "🏆 1-1 綜合挑戰",

              3

            )

        }

      }),


    /*
    1-2 正負數加減
    */
    positiveNegativeAddSubtract:
      createGame({

        gameId:
          "positiveNegativeAddSubtract",

        name:
          "正負數加減大挑戰",

        category:
          "七上新版｜1-2 正負數加減",

        modes: {

          addition:
            standardMode(

              "addition",

              "➕ 正負數加法挑戰",

              1

            ),


          subtraction:
            standardMode(

              "subtraction",

              "➖ 正負數減法挑戰",

              1

            ),


          mixed:
            standardMode(

              "mixed",

              "🔢 加減混合運算",

              2

            ),


          smart:
            standardMode(

              "smart",

              "🧠 巧算與括號挑戰",

              3

            ),


          distance:
            standardMode(

              "distance",

              "📏 數線距離挑戰",

              2

            ),


          speed:
            speedMode(

              "speed",

              "⚡ 正負數加減快手",

              2

            ),


          comprehensive:
            mixedMode(

              "comprehensive",

              "🏆 1-2 綜合挑戰",

              3

            )

        }

      }),


    /*
    1-3 正負數乘除
    */
    positiveNegativeMultiplyDivide:
      createGame({

        gameId:
          "positiveNegativeMultiplyDivide",

        name:
          "正負數乘除大挑戰",

        category:
          "七上新版｜1-3 正負數乘除",

        modes: {

          multiplication:
            standardMode(

              "multiplication",

              "✖️ 正負數乘法挑戰",

              1

            ),


          chain:
            standardMode(

              "chain",

              "🔗 連乘與乘法規律",

              2

            ),


          division:
            standardMode(

              "division",

              "➗ 正負數除法挑戰",

              1

            ),


          operations:
            standardMode(

              "operations",

              "🧮 正負數四則運算",

              2

            ),


          distributive:
            standardMode(

              "distributive",

              "🧠 分配律與巧算",

              3

            ),


          speed:
            speedMode(

              "speed",

              "⚡ 乘除快手",

              2

            ),


          comprehensive:
            mixedMode(

              "comprehensive",

              "🏆 1-3 綜合挑戰",

              3

            )

        }

      }),


    /*
    1-4 指數與科學記號
    */
    exponentScientificNotation:
      createGame({

        gameId:
          "exponentScientificNotation",

        name:
          "指數與科學記號大挑戰",

        category:
          "七上新版｜1-4 指數記法與科學記號",

        modes: {

          notation:
            standardMode(

              "notation",

              "🔢 指數記法基礎",

              1

            ),


          negativePower:
            standardMode(

              "negativePower",

              "➖ 負數次方與符號",

              2

            ),


          operations:
            standardMode(

              "operations",

              "🧮 含指數四則運算",

              3

            ),


          tenPower:
            standardMode(

              "tenPower",

              "🔟 10 的次方與位值",

              1

            ),


          scientific:
            standardMode(

              "scientific",

              "🔬 科學記號轉換",

              2

            ),


          scientificCompare:
            standardMode(

              "scientificCompare",

              "⚖️ 科學記號判讀比較",

              3

            ),


          speed:
            speedMode(

              "speed",

              "⚡ 指數快手",

              2

            ),


          comprehensive:
            mixedMode(

              "comprehensive",

              "🏆 1-4 綜合挑戰",

              4

            )

        }

      }),



    /*
    ==================================================
    八上
    ==================================================
    */


    /*
    多項式加減
    */
    polynomialAddSubtract:
      createGame({

        gameId:
          "polynomialAddSubtract",

        name:
          "多項式加減大挑戰",

        category:
          "八上｜多項式",

        modes: {

          likeTerms:
            standardMode(

              "likeTerms",

              "同類項加減",

              1

            ),


          addSubtract:
            standardMode(

              "addSubtract",

              "多項式加減法",

              2

            ),


          mixed:
            mixedMode(

              "mixed",

              "多項式綜合挑戰",

              3

            ),


          advanced:
            mixedMode(

              "advanced",

              "進階綜合挑戰",

              4

            )

        }

      }),


    /*
    多項式乘除
    */
    polynomialMultiplyDivide:
      createGame({

        gameId:
          "polynomialMultiplyDivide",

        name:
          "多項式乘除大挑戰",

        category:
          "八上｜多項式",

        modes: {

          monomial:
            standardMode(

              "monomial",

              "單項式乘除",

              1

            ),


          multiply:
            standardMode(

              "multiply",

              "多項式乘法",

              2

            ),


          divide:
            standardMode(

              "divide",

              "多項式除法",

              2

            ),


          mixed:
            mixedMode(

              "mixed",

              "乘除綜合挑戰",

              3

            )

        }

      }),


    /*
    乘法公式
    */
    multiplicationFormula:
      createGame({

        gameId:
          "multiplicationFormula",

        name:
          "乘法公式大挑戰",

        category:
          "八上｜乘法公式",

        modes: {

          numberBasic:
            standardMode(

              "numberBasic",

              "數字乘法公式",

              1

            ),


          numberMixed:
            standardMode(

              "numberMixed",

              "數字變化計算",

              2

            ),


          polynomial:
            standardMode(

              "polynomial",

              "多項式與公式判讀",

              2

            ),


          mixed:
            mixedMode(

              "mixed",

              "乘法公式綜合挑戰",

              3

            )

        }

      }),


    /*
    平方根
    */
    squareRoot:
      createGame({

        gameId:
          "squareRoot",

        name:
          "平方根大挑戰",

        category:
          "八上｜平方根",

        modes: {

          squarePractice:
            standardMode(

              "squarePractice",

              "平方數熟練場",

              1

            ),


          simplify:
            standardMode(

              "simplify",

              "根式化簡訓練",

              2

            ),


          approximation:
            standardMode(

              "approximation",

              "根號值與十分逼近",

              2

            ),


          meaning:
            standardMode(

              "meaning",

              "平方根觀念應用",

              2

            )

        }

      }),


    /*
    根式運算
    */
    radicalOperations:
      createGame({

        gameId:
          "radicalOperations",

        name:
          "根式運算大挑戰",

        category:
          "八上｜根式運算",

        modes: {

          multiply:
            standardMode(

              "multiply",

              "根式乘法",

              1

            ),


          divide:
            standardMode(

              "divide",

              "除法與有理化",

              2

            ),


          addSubtract:
            standardMode(

              "addSubtract",

              "根式加減",

              2

            ),


          mixed:
            mixedMode(

              "mixed",

              "根式四則綜合",

              3

            )

        }

      }),


    /*
    因式分解
    */
    factorizationChallenge:
      createGame({

        gameId:
          "factorizationChallenge",

        name:
          "因式分解大挑戰",

        category:
          "八上｜因式分解",

        modes: {

          monomial:
            standardMode(

              "monomial",

              "提單項公因式",

              1

            ),


          common:
            standardMode(

              "common",

              "提兩項／變號提公因式",

              2

            ),


          formula:
            standardMode(

              "formula",

              "乘法公式因式分解",

              2

            )

        }

      }),


    /*
    十字交乘
    */
    crossMultiplication:
      createGame({

        gameId:
          "crossMultiplication",

        name:
          "十字交乘因式分解大挑戰",

        category:
          "八上｜因式分解",

        modes: {

          leadingOne:
            standardMode(

              "leadingOne",

              "平方項係數為 1",

              1

            ),


          general:
            standardMode(

              "general",

              "平方項係數不為 1",

              2

            ),


          mixed:
            mixedMode(

              "mixed",

              "進階綜合",

              3

            )

        }

      }),


    /*
    一元二次方程式
    */
    quadraticEquation:
      createGame({

        gameId:
          "quadraticEquation",

        name:
          "一元二次方程式大挑戰",

        category:
          "八上｜一元二次方程式",

        modes: {

          basic:
            standardMode(

              "basic",

              "基礎概念",

              1

            ),


          factor:
            standardMode(

              "factor",

              "因式分解法",

              2

            ),


          completeSquare:
            standardMode(

              "completeSquare",

              "平方根與配方法",

              3

            ),


          formula:
            standardMode(

              "formula",

              "公式解與判別式",

              3

            ),


          application:
            standardMode(

              "application",

              "一元二次應用問題",

              3

            ),


          mixed:
            mixedMode(

              "mixed",

              "全章綜合挑戰",

              4

            )

        }

      }),


    /*
    畢氏定理
    */
    pythagorean:
      createGame({

        gameId:
          "pythagorean",

        name:
          "畢氏定理大挑戰",

        category:
          "八上｜畢氏定理",

        modes: {

          basic:
            standardMode(

              "basic",

              "畢氏定理基礎",

              1

            ),


          application:
            standardMode(

              "application",

              "生活應用與斜邊上的高",

              2

            ),


          distance:
            standardMode(

              "distance",

              "平面上兩點的距離",

              2

            )

        }

      })


  });


/*
==================================================
取得遊戲設定
==================================================
*/

function getGameConfig(
  gameId
) {

  return (

    GAME_REGISTRY[
      gameId
    ] ||

    null

  );

}


/*
==================================================
舊資料 modeId 正規化
==================================================

目前只有 integer
是明確的舊版單模式遊戲。

舊紀錄可能是：

game = "integer"
mode = ""

這時才允許：

modeId = "default"

其他多模式遊戲如果 mode 空白，
不會偷偷補成 default。

這樣可以避免把真正的程式錯誤藏起來。
==================================================
*/

function resolveModeId(

  gameId,

  rawModeId

) {

  const game =
    getGameConfig(
      gameId
    );


  if (
    !game
  ) {

    return null;

  }


  if (
    rawModeId !==
      undefined &&

    rawModeId !==
      null &&

    String(
      rawModeId
    ).trim() !==
      ""
  ) {

    return String(
      rawModeId
    );

  }


  if (
    game.legacyBlankModeId ===
      true &&

    game.modes.default
  ) {

    return "default";

  }


  return null;

}


/*
==================================================
取得模式設定
==================================================
*/

function getModeConfig(

  gameId,

  modeId

) {

  const game =
    getGameConfig(
      gameId
    );


  if (
    !game
  ) {

    return null;

  }


  const resolvedModeId =
    resolveModeId(

      gameId,

      modeId

    );


  if (
    !resolvedModeId
  ) {

    return null;

  }


  return (

    game.modes[
      resolvedModeId
    ] ||

    null

  );

}


/*
==================================================
取得難度設定
==================================================
*/

function getDifficultyConfig(
  difficultyLevel
) {

  return (

    RPG_DIFFICULTY[
      difficultyLevel
    ] ||

    null

  );

}


/*
==================================================
取得模式 XP 權重
==================================================
*/

function getModeXpWeight(

  gameId,

  modeId

) {

  const mode =
    getModeConfig(

      gameId,

      modeId

    );


  if (
    !mode
  ) {

    rpgDebug(

      "找不到模式設定，暫時使用 XP 權重 1：",

      {
        gameId,
        modeId
      }

    );


    return 1;

  }


  const difficulty =
    getDifficultyConfig(
      mode.difficultyLevel
    );


  if (
    !difficulty
  ) {

    rpgDebug(

      "找不到難度設定，暫時使用 XP 權重 1：",

      {
        gameId,

        modeId,

        difficultyLevel:
          mode.difficultyLevel
      }

    );


    return 1;

  }


  return difficulty.xpWeight;

}


/*
==================================================
取得所有遊戲
==================================================
*/

function getAllGames() {

  return Object.values(
    GAME_REGISTRY
  );

}


/*
==================================================
取得所有啟用中的遊戲
==================================================
*/

function getActiveGames() {

  return getAllGames()
    .filter(

      game =>

        game.active ===
        true

    );

}


/*
==================================================
取得某遊戲所有模式
==================================================
*/

function getAllModes(
  gameId
) {

  const game =
    getGameConfig(
      gameId
    );


  if (
    !game
  ) {

    return [];

  }


  return Object.values(
    game.modes
  );

}


/*
==================================================
取得啟用中的模式
==================================================
*/

function getActiveModes(
  gameId
) {

  return getAllModes(
    gameId
  )
    .filter(

      mode =>

        mode.active ===
        true

    );

}


/*
==================================================
取得核心完成模式
==================================================
*/

function getCompletionModes(
  gameId
) {

  return getActiveModes(
    gameId
  )
    .filter(

      mode =>

        mode.countsForCompletion ===
        true

    );

}


/*
==================================================
取得可計入熟練度的模式
==================================================
*/

function getMasteryModes(
  gameId
) {

  return getActiveModes(
    gameId
  )
    .filter(

      mode =>

        mode.countsForMastery ===
        true

    );

}


/*
==================================================
取得可計入每日任務的模式
==================================================
*/

function getDailyMissionModes(
  gameId
) {

  return getActiveModes(
    gameId
  )
    .filter(

      mode =>

        mode.countsForDailyMission ===
        true

    );

}


/*
==================================================
取得可計入每週任務的模式
==================================================
*/

function getWeeklyMissionModes(
  gameId
) {

  return getActiveModes(
    gameId
  )
    .filter(

      mode =>

        mode.countsForWeeklyMission ===
        true

    );

}


/*
==================================================
是否為已登錄遊戲
==================================================
*/

function isRegisteredGame(
  gameId
) {

  return Boolean(

    getGameConfig(
      gameId
    )

  );

}


/*
==================================================
是否為已登錄模式
==================================================
*/

function isRegisteredMode(

  gameId,

  modeId

) {

  return Boolean(

    getModeConfig(

      gameId,

      modeId

    )

  );

}


/*
==================================================
取得遊戲顯示名稱
==================================================
*/

function getGameName(
  gameId
) {

  return (

    getGameConfig(
      gameId
    )
      ?.name ||

    gameId

  );

}


/*
==================================================
取得模式顯示名稱
==================================================
*/

function getModeName(

  gameId,

  modeId

) {

  return (

    getModeConfig(

      gameId,

      modeId

    )
      ?.name ||

    modeId

  );

}


/*
==================================================
取得難度文字
==================================================
*/

function getDifficultyLabel(

  gameId,

  modeId

) {

  const mode =
    getModeConfig(

      gameId,

      modeId

    );


  if (
    !mode
  ) {

    return "未設定";

  }


  return (

    getDifficultyConfig(
      mode.difficultyLevel
    )
      ?.label ||

    "未設定"

  );

}


/*
==================================================
是否為競速模式
==================================================
*/

function isSpeedMode(

  gameId,

  modeId

) {

  return (

    getModeConfig(

      gameId,

      modeId

    )
      ?.modeType ===

    RPG_MODE_TYPES.SPEED

  );

}


/*
==================================================
Registry 自我檢查
==================================================

會檢查：

1. Registry key 與 gameId 是否一致
2. gameId 是否重複
3. 是否至少有一個模式
4. mode key 與 modeId 是否一致
5. modeId 是否重複
6. difficultyLevel 是否存在
7. modeType 是否合法
8. legacyBlankModeId 是否真的有 default
==================================================
*/

function validateGameRegistry() {

  const errors =
    [];


  const validModeTypes =
    new Set(

      Object.values(
        RPG_MODE_TYPES
      )

    );


  const seenGameIds =
    new Set();


  Object.entries(
    GAME_REGISTRY
  )
    .forEach(

      ([
        registryGameId,
        game
      ]) => {


        /*
        gameId 格式
        */

        if (
          !game.gameId ||

          typeof game.gameId !==
            "string"
        ) {

          errors.push(

            `遊戲 gameId 無效：${registryGameId}`

          );

        }


        /*
        Registry key
        */

        if (
          registryGameId !==
          game.gameId
        ) {

          errors.push(

            `遊戲 ID 不一致：` +
            `${registryGameId} / ${game.gameId}`

          );

        }


        /*
        重複 gameId
        */

        if (
          seenGameIds.has(
            game.gameId
          )
        ) {

          errors.push(

            `遊戲 ID 重複：${game.gameId}`

          );

        }


        seenGameIds.add(
          game.gameId
        );


        /*
        模式
        */

        const modeEntries =
          Object.entries(
            game.modes
          );


        if (
          modeEntries.length ===
          0
        ) {

          errors.push(

            `遊戲沒有任何模式：${game.gameId}`

          );

        }


        /*
        舊版空白 mode
        */

        if (
          game.legacyBlankModeId ===
            true &&

          !game.modes.default
        ) {

          errors.push(

            `legacyBlankModeId=true ` +
            `但沒有 default 模式：${game.gameId}`

          );

        }


        const seenModeIds =
          new Set();


        modeEntries
          .forEach(

            ([
              registryModeId,
              mode
            ]) => {


              /*
              modeId 格式
              */

              if (
                !mode.modeId ||

                typeof mode.modeId !==
                  "string"
              ) {

                errors.push(

                  `模式 modeId 無效：` +
                  `${game.gameId}/${registryModeId}`

                );

              }


              /*
              Registry mode key
              */

              if (
                registryModeId !==
                mode.modeId
              ) {

                errors.push(

                  `模式 ID 不一致：` +
                  `${game.gameId}/` +
                  `${registryModeId} / ` +
                  `${mode.modeId}`

                );

              }


              /*
              重複 modeId
              */

              if (
                seenModeIds.has(
                  mode.modeId
                )
              ) {

                errors.push(

                  `模式 ID 重複：` +
                  `${game.gameId}/${mode.modeId}`

                );

              }


              seenModeIds.add(
                mode.modeId
              );


              /*
              難度
              */

              if (
                !RPG_DIFFICULTY[
                  mode.difficultyLevel
                ]
              ) {

                errors.push(

                  `無效難度：` +
                  `${game.gameId}/${mode.modeId}` +
                  ` → ${mode.difficultyLevel}`

                );

              }


              /*
              模式類型
              */

              if (
                !validModeTypes.has(
                  mode.modeType
                )
              ) {

                errors.push(

                  `無效模式類型：` +
                  `${game.gameId}/${mode.modeId}` +
                  ` → ${mode.modeType}`

                );

              }

            }

          );

      }

    );


  /*
  有錯誤
  */

  if (
    errors.length >
    0
  ) {

    console.error(

      "[RPG] Game Registry 檢查失敗：",

      errors

    );


    return {

      valid:
        false,

      errors

    };

  }


  /*
  通過
  */

  rpgDebug(

    "Game Registry 檢查完成",

    {

      configVersion:
        RPG_CONFIG.version,

      gameCount:
        Object.keys(
          GAME_REGISTRY
        ).length,

      modeCount:
        getActiveGames()
          .reduce(

            (
              total,
              game
            ) =>

              total +
              Object.keys(
                game.modes
              ).length,

            0

          ),

      games:
        getActiveGames()
          .map(

            game => ({

              gameId:
                game.gameId,

              name:
                game.name,

              modeCount:
                Object.keys(
                  game.modes
                ).length

            })

          )

    }

  );


  return {

    valid:
      true,

    errors:
      []

  };

}


/*
==================================================
初始化檢查
==================================================
*/

validateGameRegistry();


/*
==================================================
Export
==================================================
*/

export {

  RPG_MODE_TYPES,

  RPG_DIFFICULTY,

  GAME_REGISTRY,


  getGameConfig,

  resolveModeId,

  getModeConfig,

  getDifficultyConfig,

  getModeXpWeight,


  getAllGames,

  getActiveGames,

  getAllModes,

  getActiveModes,


  getCompletionModes,

  getMasteryModes,

  getDailyMissionModes,

  getWeeklyMissionModes,


  isRegisteredGame,

  isRegisteredMode,

  isSpeedMode,


  getGameName,

  getModeName,

  getDifficultyLabel,


  validateGameRegistry

};
