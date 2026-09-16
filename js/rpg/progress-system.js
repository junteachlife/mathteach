/*
==================================================
學習型 RPG 成長系統
玩家進度／XP／等級核心模組
Version 1.0
==================================================

目前功能：

1. 計算完成一局的基礎 XP。
2. 計算分數獎勵。
3. 計算連擊獎勵。
4. 套用遊戲模式難度倍率。
5. 計算首次完成／首次80／首次滿分。
6. 套用同模式每日重複練習遞減。
7. 計算玩家永久總 XP。
8. 根據總 XP 計算 RPG 等級。
9. 判斷是否升級。
10. 提供統一的結算資料格式。

目前：

- 不讀 Firebase
- 不寫 Firebase
- 不修改正式遊戲
- 純計算模組

==================================================
*/

"use strict";


import {

  RPG_CONFIG,
  rpgDebug

} from "./rpg-config.js";


import {

  getModeConfig,
  getModeXpWeight

} from "./game-registry.js";


/*
==================================================
XP 規則
==================================================
*/

const RPG_XP_RULES =
  Object.freeze({

    /*
    ----------------------------------------------
    完成一局
    ----------------------------------------------
    */

    completion:
      10,


    /*
    ----------------------------------------------
    分數獎勵
    ----------------------------------------------
    */

    scoreBonus:
      Object.freeze({

        below60:
          0,

        score60:
          5,

        score80:
          10,

        score90:
          15,

        score100:
          25

      }),


    /*
    ----------------------------------------------
    連擊獎勵
    ----------------------------------------------
    */

    comboBonus:
      Object.freeze({

        combo5:
          5,

        combo10:
          10

      }),


    /*
    ----------------------------------------------
    首次里程碑
    ----------------------------------------------
    */

    milestoneBonus:
      Object.freeze({

        /*
        首次完成此模式
        */
        firstCompletion:
          5,


        /*
        首次達 80 分
        */
        first80:
          20,


        /*
        首次達滿分
        */
        first100:
          30

      }),


    /*
    ----------------------------------------------
    同模式每日重複練習
    ----------------------------------------------

    第 1～3 次：
    100%

    第 4～6 次：
    70%

    第 7 次以上：
    40%
    ----------------------------------------------
    */

    repeatPractice:
      Object.freeze({

        firstTierMax:
          3,

        secondTierMax:
          6,

        firstTierMultiplier:
          1.00,

        secondTierMultiplier:
          0.70,

        thirdTierMultiplier:
          0.40

      })

  });


/*
==================================================
等級規則
==================================================

Lv.1 → Lv.2：
150 XP

之後每一級：
+20 XP

例如：

Lv.1 → 2
150 XP

Lv.2 → 3
170 XP

Lv.3 → 4
190 XP

==================================================
*/

const RPG_LEVEL_RULES =
  Object.freeze({

    firstLevelRequirement:
      150,

    incrementPerLevel:
      20

  });


/*
==================================================
取得分數獎勵
==================================================
*/

function getScoreBonus(
  score
) {

  const numericScore =
    Number(
      score
    );


  if (
    !Number.isFinite(
      numericScore
    )
  ) {

    return 0;

  }


  if (
    numericScore >=
    100
  ) {

    return (
      RPG_XP_RULES
        .scoreBonus
        .score100
    );

  }


  if (
    numericScore >=
    90
  ) {

    return (
      RPG_XP_RULES
        .scoreBonus
        .score90
    );

  }


  if (
    numericScore >=
    80
  ) {

    return (
      RPG_XP_RULES
        .scoreBonus
        .score80
    );

  }


  if (
    numericScore >=
    60
  ) {

    return (
      RPG_XP_RULES
        .scoreBonus
        .score60
    );

  }


  return (
    RPG_XP_RULES
      .scoreBonus
      .below60
  );

}


/*
==================================================
取得連擊獎勵
==================================================
*/

function getComboBonus(
  maxCombo
) {

  const combo =
    Number(
      maxCombo
    );


  if (
    !Number.isFinite(
      combo
    )
  ) {

    return 0;

  }


  if (
    combo >=
    10
  ) {

    return (
      RPG_XP_RULES
        .comboBonus
        .combo10
    );

  }


  if (
    combo >=
    5
  ) {

    return (
      RPG_XP_RULES
        .comboBonus
        .combo5
    );

  }


  return 0;

}


/*
==================================================
同模式每日重複練習倍率
==================================================
*/

function getRepeatPracticeMultiplier(
  attemptNumber
) {

  const attempt =
    Math.max(
      1,
      Math.floor(
        Number(
          attemptNumber
        ) || 1
      )
    );


  const rule =
    RPG_XP_RULES
      .repeatPractice;


  if (
    attempt <=
    rule.firstTierMax
  ) {

    return (
      rule.firstTierMultiplier
    );

  }


  if (
    attempt <=
    rule.secondTierMax
  ) {

    return (
      rule.secondTierMultiplier
    );

  }


  return (
    rule.thirdTierMultiplier
  );

}


/*
==================================================
取得升下一級所需 XP
==================================================
*/

function getXpNeededForNextLevel(
  level
) {

  const safeLevel =
    Math.max(
      1,
      Math.floor(
        Number(
          level
        ) || 1
      )
    );


  return (

    RPG_LEVEL_RULES
      .firstLevelRequirement

    +

    (
      safeLevel -
      1
    )

    *

    RPG_LEVEL_RULES
      .incrementPerLevel

  );

}


/*
==================================================
計算「到達某等級」所需累積總 XP
==================================================

例如：

Lv.1：
0 XP

Lv.2：
150 XP

Lv.3：
320 XP

==================================================
*/

function getTotalXpRequiredForLevel(
  targetLevel
) {

  const safeLevel =
    Math.max(
      1,
      Math.floor(
        Number(
          targetLevel
        ) || 1
      )
    );


  if (
    safeLevel <=
    1
  ) {

    return 0;

  }


  let total =
    0;


  for (
    let level = 1;
    level < safeLevel;
    level++
  ) {

    total +=
      getXpNeededForNextLevel(
        level
      );

  }


  return total;

}


/*
==================================================
根據永久總 XP 計算目前等級
==================================================
*/

function getLevelProgressFromTotalXp(
  totalXp
) {

  const safeTotalXp =
    Math.max(
      0,
      Math.floor(
        Number(
          totalXp
        ) || 0
      )
    );


  let level =
    1;


  let remainingXp =
    safeTotalXp;


  let consumedXp =
    0;


  /*
  ----------------------------------------------
  不斷檢查是否達到下一級
  ----------------------------------------------
  */

  while (
    remainingXp >=
    getXpNeededForNextLevel(
      level
    )
  ) {

    const required =
      getXpNeededForNextLevel(
        level
      );


    remainingXp -=
      required;


    consumedXp +=
      required;


    level +=
      1;


    /*
    防止異常資料造成無限迴圈。
    */
    if (
      level >
      10000
    ) {

      console.warn(
        "[RPG] 等級計算超過安全上限。"
      );


      break;

    }

  }


  const nextRequirement =
    getXpNeededForNextLevel(
      level
    );


  const xpToNextLevel =
    Math.max(
      0,
      nextRequirement -
      remainingXp
    );


  const progressPercent =
    Math.min(
      100,
      (
        remainingXp /
        nextRequirement
      ) *
      100
    );


  return {

    /*
    玩家目前等級
    */
    level,


    /*
    永久總 XP
    */
    totalXp:
      safeTotalXp,


    /*
    目前這一級已累積多少 XP
    */
    levelXp:
      remainingXp,


    /*
    此等級升下一級需要多少 XP
    */
    nextRequirement,


    /*
    還差多少 XP 升級
    */
    xpToNextLevel,


    /*
    已經被前面等級消耗掉的總 XP
    */
    consumedXp,


    /*
    本級進度百分比
    */
    progressPercent

  };

}


/*
==================================================
計算里程碑 XP
==================================================

milestones：

{
  firstCompletion: true,
  first80: true,
  first100: false
}

==================================================
*/

function calculateMilestoneBonus({

  score = 0,

  milestones = {}

} = {}) {

  let total =
    0;


  const rewards =
    [];


  /*
  ----------------------------------------------
  首次完成
  ----------------------------------------------
  */

  if (
    milestones.firstCompletion ===
    true
  ) {

    const value =
      RPG_XP_RULES
        .milestoneBonus
        .firstCompletion;


    total +=
      value;


    rewards.push({

      type:
        "firstCompletion",

      label:
        "首次完成此模式",

      xp:
        value

    });

  }


  /*
  ----------------------------------------------
  首次 80 分
  ----------------------------------------------
  */

  if (

    milestones.first80 ===
      true

    &&

    Number(
      score
    ) >=
      80

  ) {

    const value =
      RPG_XP_RULES
        .milestoneBonus
        .first80;


    total +=
      value;


    rewards.push({

      type:
        "first80",

      label:
        "首次達到 80 分",

      xp:
        value

    });

  }


  /*
  ----------------------------------------------
  首次滿分
  ----------------------------------------------
  */

  if (

    milestones.first100 ===
      true

    &&

    Number(
      score
    ) >=
      100

  ) {

    const value =
      RPG_XP_RULES
        .milestoneBonus
        .first100;


    total +=
      value;


    rewards.push({

      type:
        "first100",

      label:
        "首次滿分",

      xp:
        value

    });

  }


  return {

    total,

    rewards

  };

}


/*
==================================================
驗證一局遊戲資料
==================================================
*/

function validateGameResult({

  gameId,

  modeId,

  score,

  correctCount,

  totalQuestions,

  maxCombo

} = {}) {

  const errors =
    [];


  if (
    !gameId
  ) {

    errors.push(
      "缺少 gameId"
    );

  }


  if (
    !modeId
  ) {

    errors.push(
      "缺少 modeId"
    );

  }


  const mode =
    getModeConfig(
      gameId,
      modeId
    );


  if (
    !mode
  ) {

    errors.push(
      `找不到模式：${gameId}/${modeId}`
    );

  }


  const numericScore =
    Number(
      score
    );


  if (

    !Number.isFinite(
      numericScore
    )

    ||

    numericScore <
      0

    ||

    numericScore >
      100

  ) {

    errors.push(
      "score 必須介於 0～100"
    );

  }


  const correct =
    Number(
      correctCount
    );


  const total =
    Number(
      totalQuestions
    );


  if (

    !Number.isInteger(
      correct
    )

    ||

    correct <
      0

  ) {

    errors.push(
      "correctCount 必須是 0 以上整數"
    );

  }


  if (

    !Number.isInteger(
      total
    )

    ||

    total <
      1

  ) {

    errors.push(
      "totalQuestions 必須至少為 1"
    );

  }


  if (

    Number.isInteger(
      correct
    )

    &&

    Number.isInteger(
      total
    )

    &&

    correct >
      total

  ) {

    errors.push(
      "correctCount 不能超過 totalQuestions"
    );

  }


  const combo =
    Number(
      maxCombo
    );


  if (

    !Number.isInteger(
      combo
    )

    ||

    combo <
      0

  ) {

    errors.push(
      "maxCombo 必須是 0 以上整數"
    );

  }


  if (

    Number.isInteger(
      combo
    )

    &&

    Number.isInteger(
      total
    )

    &&

    combo >
      total

  ) {

    errors.push(
      "maxCombo 不能超過 totalQuestions"
    );

  }


  return {

    valid:
      errors.length ===
      0,

    errors

  };

}


/*
==================================================
計算一局 RPG XP
==================================================

使用方式：

calculateGameXp({

  gameId:
    "quadraticEquation",

  modeId:
    "formula",

  score:
    90,

  correctCount:
    9,

  totalQuestions:
    10,

  maxCombo:
    6,

  attemptNumberToday:
    1,

  applyRepeatPenalty:
    true,

  milestones: {

    firstCompletion:
      false,

    first80:
      false,

    first100:
      false

  }

});

==================================================
*/

function calculateGameXp({

  gameId,

  modeId,

  score = 0,

  correctCount = 0,

  totalQuestions = 1,

  maxCombo = 0,

  attemptNumberToday = 1,

  applyRepeatPenalty = true,

  milestones = {}

} = {}) {


  /*
  ----------------------------------------------
  先檢查資料
  ----------------------------------------------
  */

  const validation =
    validateGameResult({

      gameId,

      modeId,

      score,

      correctCount,

      totalQuestions,

      maxCombo

    });


  if (
    !validation.valid
  ) {

    return {

      success:
        false,

      errors:
        validation.errors

    };

  }


  /*
  ----------------------------------------------
  完成 XP
  ----------------------------------------------
  */

  const completionXP =
    RPG_XP_RULES
      .completion;


  /*
  ----------------------------------------------
  分數 XP
  ----------------------------------------------
  */

  const scoreXP =
    getScoreBonus(
      score
    );


  /*
  ----------------------------------------------
  連擊 XP
  ----------------------------------------------
  */

  const comboXP =
    getComboBonus(
      maxCombo
    );


  /*
  ----------------------------------------------
  基礎表現小計
  ----------------------------------------------
  */

  const performanceSubtotal =
    completionXP +
    scoreXP +
    comboXP;


  /*
  ----------------------------------------------
  模式難度倍率
  ----------------------------------------------
  */

  const difficultyMultiplier =
    getModeXpWeight(
      gameId,
      modeId
    );


  const weightedPerformanceXP =
    Math.round(

      performanceSubtotal *

      difficultyMultiplier

    );


  /*
  ----------------------------------------------
  每日重複練習倍率
  ----------------------------------------------
  */

  const repeatMultiplier =

    applyRepeatPenalty

      ? getRepeatPracticeMultiplier(
          attemptNumberToday
        )

      : 1;


  /*
  ----------------------------------------------
  重複練習只影響一般表現 XP

  首次里程碑不會被折扣。
  ----------------------------------------------
  */

  const adjustedPerformanceXP =
    Math.round(

      weightedPerformanceXP *

      repeatMultiplier

    );


  /*
  ----------------------------------------------
  里程碑獎勵
  ----------------------------------------------
  */

  const milestone =
    calculateMilestoneBonus({

      score,

      milestones

    });


  /*
  ----------------------------------------------
  最終 XP
  ----------------------------------------------
  */

  const finalXP =
    adjustedPerformanceXP +
    milestone.total;


  const result =
    {

      success:
        true,


      /*
      --------------------------------------------
      規則版本
      --------------------------------------------
      */

      xpRuleVersion:
        RPG_CONFIG
          .xpRuleVersion,


      /*
      --------------------------------------------
      遊戲
      --------------------------------------------
      */

      gameId,

      modeId,


      /*
      --------------------------------------------
      本局資料
      --------------------------------------------
      */

      score:
        Number(
          score
        ),

      correctCount:
        Number(
          correctCount
        ),

      totalQuestions:
        Number(
          totalQuestions
        ),

      maxCombo:
        Number(
          maxCombo
        ),


      /*
      --------------------------------------------
      XP 明細
      --------------------------------------------
      */

      completionXP,

      scoreXP,

      comboXP,

      performanceSubtotal,


      difficultyMultiplier,

      weightedPerformanceXP,


      attemptNumberToday:
        Math.max(
          1,
          Math.floor(
            Number(
              attemptNumberToday
            ) || 1
          )
        ),

      repeatMultiplier,

      adjustedPerformanceXP,


      milestoneXP:
        milestone.total,

      milestoneRewards:
        milestone.rewards,


      /*
      --------------------------------------------
      最終 XP
      --------------------------------------------
      */

      finalXP

    };


  rpgDebug(
    "XP 計算完成",
    result
  );


  return result;

}


/*
==================================================
計算玩家獲得 XP 後的等級變化
==================================================
*/

function calculateLevelChange({

  currentTotalXp = 0,

  gainedXp = 0

} = {}) {

  const safeCurrent =
    Math.max(
      0,
      Math.floor(
        Number(
          currentTotalXp
        ) || 0
      )
    );


  const safeGain =
    Math.max(
      0,
      Math.floor(
        Number(
          gainedXp
        ) || 0
      )
    );


  const before =
    getLevelProgressFromTotalXp(
      safeCurrent
    );


  const newTotalXp =
    safeCurrent +
    safeGain;


  const after =
    getLevelProgressFromTotalXp(
      newTotalXp
    );


  return {

    currentTotalXp:
      safeCurrent,

    gainedXp:
      safeGain,

    newTotalXp,


    oldLevel:
      before.level,

    newLevel:
      after.level,


    levelsGained:
      Math.max(
        0,
        after.level -
        before.level
      ),


    leveledUp:
      after.level >
      before.level,


    before,

    after

  };

}


/*
==================================================
完整模擬一局
==================================================

一次完成：

1. XP 計算
2. 新總 XP
3. 等級變化

==================================================
*/

function simulateGameProgress({

  currentTotalXp = 0,

  gameResult = {}

} = {}) {

  const xpResult =
    calculateGameXp(
      gameResult
    );


  if (
    !xpResult.success
  ) {

    return {

      success:
        false,

      errors:
        xpResult.errors

    };

  }


  const levelResult =
    calculateLevelChange({

      currentTotalXp,

      gainedXp:
        xpResult.finalXP

    });


  return {

    success:
      true,

    xp:
      xpResult,

    level:
      levelResult

  };

}


/*
==================================================
模組自我檢查
==================================================
*/

function validateProgressSystem() {

  const errors =
    [];


  /*
  ----------------------------------------------
  XP 規則
  ----------------------------------------------
  */

  if (
    RPG_XP_RULES
      .completion <
    0
  ) {

    errors.push(
      "completion XP 不可小於 0"
    );

  }


  /*
  ----------------------------------------------
  等級規則
  ----------------------------------------------
  */

  if (
    RPG_LEVEL_RULES
      .firstLevelRequirement <=
    0
  ) {

    errors.push(
      "firstLevelRequirement 必須大於 0"
    );

  }


  if (
    RPG_LEVEL_RULES
      .incrementPerLevel <
    0
  ) {

    errors.push(
      "incrementPerLevel 不可小於 0"
    );

  }


  /*
  ----------------------------------------------
  基本等級測試
  ----------------------------------------------
  */

  if (
    getLevelProgressFromTotalXp(
      0
    ).level !==
    1
  ) {

    errors.push(
      "0 XP 應該為 Lv.1"
    );

  }


  if (
    getLevelProgressFromTotalXp(
      150
    ).level !==
    2
  ) {

    errors.push(
      "150 XP 應該為 Lv.2"
    );

  }


  if (
    getLevelProgressFromTotalXp(
      320
    ).level !==
    3
  ) {

    errors.push(
      "320 XP 應該為 Lv.3"
    );

  }


  if (
    errors.length >
    0
  ) {

    console.error(
      "[RPG] Progress System 檢查失敗：",
      errors
    );


    return {

      valid:
        false,

      errors

    };

  }


  rpgDebug(
    "Progress System 檢查完成",
    {

      xpRuleVersion:
        RPG_CONFIG
          .xpRuleVersion,

      level1Requirement:
        getXpNeededForNextLevel(
          1
        ),

      level2Requirement:
        getXpNeededForNextLevel(
          2
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

validateProgressSystem();


/*
==================================================
Export
==================================================
*/

export {

  /*
  規則
  */
  RPG_XP_RULES,

  RPG_LEVEL_RULES,


  /*
  XP
  */
  getScoreBonus,

  getComboBonus,

  getRepeatPracticeMultiplier,

  calculateMilestoneBonus,

  calculateGameXp,


  /*
  等級
  */
  getXpNeededForNextLevel,

  getTotalXpRequiredForLevel,

  getLevelProgressFromTotalXp,

  calculateLevelChange,


  /*
  整體模擬
  */
  simulateGameProgress,


  /*
  驗證
  */
  validateGameResult,

  validateProgressSystem

};
