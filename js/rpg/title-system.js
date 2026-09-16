/*
==================================================
學習型 RPG 成長系統
永久等級稱號系統
Title System
Version 1.0
==================================================

設計原則：

1. 稱號依「永久 RPG 等級」決定。
2. 不需要另外儲存在 Firestore。
3. XP / Level 才是資料來源。
4. 稱號只是由 Level 推算出的顯示結果。
5. 未來修改稱號名稱時，不會影響玩家 XP。
6. Lv.50 不是滿級。
==================================================
*/

"use strict";


/*
==================================================
稱號階段
==================================================

minLevel：
進入該稱號所需最低等級。

例如：

Lv.1～4
→ 數學初心者

Lv.5～9
→ 解題見習生

==================================================
*/

const RPG_TITLE_TIERS =
  Object.freeze([

    Object.freeze({

      id:
        "beginner",

      minLevel:
        1,

      name:
        "數學初心者",

      icon:
        "🌱",

      description:
        "踏上數學冒險旅程，開始累積自己的解題經驗。"

    }),


    Object.freeze({

      id:
        "apprentice",

      minLevel:
        5,

      name:
        "解題見習生",

      icon:
        "✏️",

      description:
        "已累積不少練習經驗，逐漸熟悉各種解題方法。"

    }),


    Object.freeze({

      id:
        "explorer",

      minLevel:
        10,

      name:
        "思考探索者",

      icon:
        "🧭",

      description:
        "願意探索不同方法，開始建立自己的數學思考路線。"

    }),


    Object.freeze({

      id:
        "adventurer",

      minLevel:
        15,

      name:
        "算式冒險家",

      icon:
        "⚔️",

      description:
        "能面對更具挑戰的題目，持續累積解題實力。"

    }),


    Object.freeze({

      id:
        "challenger",

      minLevel:
        20,

      name:
        "邏輯挑戰者",

      icon:
        "🔥",

      description:
        "已具備穩定的解題能力，勇於挑戰較複雜的數學問題。"

    }),


    Object.freeze({

      id:
        "solver",

      minLevel:
        25,

      name:
        "解題高手",

      icon:
        "🎯",

      description:
        "解題經驗更加成熟，能掌握問題中的重要線索。"

    }),


    Object.freeze({

      id:
        "numberMaster",

      minLevel:
        30,

      name:
        "數感達人",

      icon:
        "💡",

      description:
        "對數字與算式更加敏銳，能靈活運用不同策略。"

    }),


    Object.freeze({

      id:
        "reasoningExpert",

      minLevel:
        35,

      name:
        "推理專家",

      icon:
        "🧠",

      description:
        "能運用邏輯與推理處理更複雜的數學挑戰。"

    }),


    Object.freeze({

      id:
        "mathWarrior",

      minLevel:
        40,

      name:
        "數學戰將",

      icon:
        "🏅",

      description:
        "擁有豐富的數學練習經驗，面對挑戰更加沉著。"

    }),


    Object.freeze({

      id:
        "thinkingMaster",

      minLevel:
        45,

      name:
        "思維大師",

      icon:
        "👑",

      description:
        "已累積大量數學經驗，展現成熟而靈活的思考能力。"

    }),


    Object.freeze({

      id:
        "legend",

      minLevel:
        50,

      name:
        "數學傳說",

      icon:
        "🌟",

      description:
        "長期累積解題與學習經驗，踏入數學冒險的傳說階段。"

    })

  ]);


/*
==================================================
整理稱號資料
==================================================
*/

function normalizeLevel(
  level
) {

  const value =
    Math.floor(
      Number(
        level
      )
    );


  if (
    !Number.isFinite(
      value
    )
  ) {

    return 1;

  }


  return Math.max(
    1,
    value
  );

}


/*
==================================================
取得目前稱號
==================================================
*/

function getTitleForLevel(
  level
) {

  const safeLevel =
    normalizeLevel(
      level
    );


  /*
  從最高稱號往下找。
  */

  for (
    let i =
      RPG_TITLE_TIERS.length - 1;

    i >= 0;

    i--
  ) {

    const title =
      RPG_TITLE_TIERS[i];


    if (
      safeLevel >=
      title.minLevel
    ) {

      return title;

    }

  }


  /*
  理論上不會走到這裡。
  */

  return RPG_TITLE_TIERS[0];

}


/*
==================================================
取得下一個稱號
==================================================
*/

function getNextTitleForLevel(
  level
) {

  const safeLevel =
    normalizeLevel(
      level
    );


  const next =
    RPG_TITLE_TIERS
      .find(
        title =>
          title.minLevel >
          safeLevel
      );


  return next
    ||
    null;

}


/*
==================================================
取得稱號成長狀態
==================================================

例如：

Lv.12

目前：
🧭 思考探索者

下一稱號：
⚔️ 算式冒險家

Lv.15 解鎖
還差 3 級

==================================================
*/

function getTitleProgress(
  level
) {

  const safeLevel =
    normalizeLevel(
      level
    );


  const currentTitle =
    getTitleForLevel(
      safeLevel
    );


  const nextTitle =
    getNextTitleForLevel(
      safeLevel
    );


  if (
    !nextTitle
  ) {

    return {

      level:
        safeLevel,

      currentTitle,

      nextTitle:
        null,

      levelsToNextTitle:
        0,

      isHighestTitleTier:
        true

    };

  }


  return {

    level:
      safeLevel,

    currentTitle,

    nextTitle,

    levelsToNextTitle:
      Math.max(
        0,
        nextTitle.minLevel -
        safeLevel
      ),

    isHighestTitleTier:
      false

  };

}


/*
==================================================
是否剛解鎖新稱號
==================================================

輸入升級前、升級後等級。

例如：

Lv.4 → Lv.5
會解鎖「解題見習生」。

Lv.5 → Lv.6
沒有新稱號。

==================================================
*/

function getUnlockedTitlesBetweenLevels(
  oldLevel,
  newLevel
) {

  const safeOldLevel =
    normalizeLevel(
      oldLevel
    );


  const safeNewLevel =
    normalizeLevel(
      newLevel
    );


  if (
    safeNewLevel <=
    safeOldLevel
  ) {

    return [];

  }


  return RPG_TITLE_TIERS
    .filter(
      title =>

        title.minLevel >
          safeOldLevel

        &&

        title.minLevel <=
          safeNewLevel
    );

}


/*
==================================================
判斷某一級是不是稱號里程碑
==================================================
*/

function isTitleMilestoneLevel(
  level
) {

  const safeLevel =
    normalizeLevel(
      level
    );


  return RPG_TITLE_TIERS
    .some(
      title =>
        title.minLevel ===
        safeLevel
    );

}


/*
==================================================
取得所有稱號
==================================================
*/

function getAllTitles() {

  return [
    ...RPG_TITLE_TIERS
  ];

}


/*
==================================================
簡易自我檢查
==================================================
*/

function validateTitleSystem() {

  const errors =
    [];


  /*
  Lv.1
  */

  if (
    getTitleForLevel(
      1
    ).id !==
    "beginner"
  ) {

    errors.push(
      "Lv.1 稱號錯誤。"
    );

  }


  /*
  Lv.5
  */

  if (
    getTitleForLevel(
      5
    ).id !==
    "apprentice"
  ) {

    errors.push(
      "Lv.5 稱號錯誤。"
    );

  }


  /*
  Lv.49
  */

  if (
    getTitleForLevel(
      49
    ).id !==
    "thinkingMaster"
  ) {

    errors.push(
      "Lv.49 稱號錯誤。"
    );

  }


  /*
  Lv.50+
  */

  if (
    getTitleForLevel(
      100
    ).id !==
    "legend"
  ) {

    errors.push(
      "Lv.50 以上最高稱號判定錯誤。"
    );

  }


  /*
  Lv.4 → 5
  */

  const unlocked =
    getUnlockedTitlesBetweenLevels(
      4,
      5
    );


  if (
    unlocked.length !==
      1

    ||

    unlocked[0].id !==
      "apprentice"
  ) {

    errors.push(
      "Lv.4 → Lv.5 稱號解鎖判定錯誤。"
    );

  }


  if (
    errors.length >
      0
  ) {

    console.error(
      "[RPG] Title System 檢查失敗：",
      errors
    );


    return {

      valid:
        false,

      errors

    };

  }


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

validateTitleSystem();


/*
==================================================
Export
==================================================
*/

export {

  RPG_TITLE_TIERS,

  getTitleForLevel,

  getNextTitleForLevel,

  getTitleProgress,

  getUnlockedTitlesBetweenLevels,

  isTitleMilestoneLevel,

  getAllTitles,

  validateTitleSystem

};
