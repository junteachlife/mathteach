/*
==================================================
學習型 RPG 成長系統
遊戲局次識別系統
Attempt System
Version 1.0
==================================================

用途：

1. 每完成一局遊戲，產生唯一 attemptId。
2. 未來防止同一局重複領取 XP。
3. 建立統一的 RPG 遊戲結算資料格式。
4. 目前不讀 Firebase、不寫 Firebase。
5. 目前不修改正式遊戲。

==================================================
*/

"use strict";


import {

  RPG_CONFIG,
  rpgDebug

} from "./rpg-config.js";


import {

  isRegisteredGame,
  isRegisteredMode

} from "./game-registry.js";


/*
==================================================
產生安全隨機字串
==================================================
*/

function generateRandomPart(
  length = 12
) {

  const chars =
    "abcdefghijklmnopqrstuvwxyz0123456789";


  /*
  優先使用 crypto
  */

  if (
    typeof crypto !==
      "undefined"

    &&

    typeof crypto.getRandomValues ===
      "function"
  ) {

    const values =
      new Uint32Array(
        length
      );


    crypto.getRandomValues(
      values
    );


    return Array
      .from(
        values,
        value =>
          chars[
            value %
            chars.length
          ]
      )
      .join("");

  }


  /*
  舊瀏覽器 fallback
  */

  let result =
    "";


  for (
    let i = 0;
    i < length;
    i++
  ) {

    result +=
      chars[
        Math.floor(
          Math.random() *
          chars.length
        )
      ];

  }


  return result;

}


/*
==================================================
日期時間字串
==================================================

例如：

20260916T153012456

==================================================
*/

function createTimestampPart(
  date = new Date()
) {

  const pad =
    (
      value,
      length = 2
    ) =>
      String(
        value
      )
        .padStart(
          length,
          "0"
        );


  return (

    date.getFullYear()

    +

    pad(
      date.getMonth() +
      1
    )

    +

    pad(
      date.getDate()
    )

    +

    "T"

    +

    pad(
      date.getHours()
    )

    +

    pad(
      date.getMinutes()
    )

    +

    pad(
      date.getSeconds()
    )

    +

    pad(
      date.getMilliseconds(),
      3
    )

  );

}


/*
==================================================
清理 ID
==================================================

避免 gameId、modeId 裡面未來出現
不適合放在識別字串的特殊符號。
==================================================
*/

function sanitizeIdPart(
  value
) {

  return String(
    value ?? ""
  )
    .trim()
    .replace(
      /[^a-zA-Z0-9_-]/g,
      "-"
    )
    .replace(
      /-+/g,
      "-"
    )
    .replace(
      /^-|-$/g,
      ""
    );

}


/*
==================================================
產生 attemptId
==================================================

格式：

rpg_test_game_mode_timestamp_random

例如：

rpg_test_quadraticEquation_formula_20260916T153012456_a8m3xk92qz1p

==================================================
*/

function createAttemptId({

  gameId,

  modeId,

  date = new Date()

} = {}) {

  const safeGameId =
    sanitizeIdPart(
      gameId
    );


  const safeModeId =
    sanitizeIdPart(
      modeId
    );


  if (
    !safeGameId
    ||
    !safeModeId
  ) {

    throw new Error(
      "[RPG] createAttemptId 缺少 gameId 或 modeId。"
    );

  }


  const environment =
    sanitizeIdPart(
      RPG_CONFIG.environment
    )
    ||
    "unknown";


  const timestamp =
    createTimestampPart(
      date
    );


  const randomPart =
    generateRandomPart(
      12
    );


  const attemptId =
    [

      "rpg",

      environment,

      safeGameId,

      safeModeId,

      timestamp,

      randomPart

    ]
      .join("_");


  rpgDebug(
    "建立 attemptId",
    attemptId
  );


  return attemptId;

}


/*
==================================================
驗證 attemptId
==================================================
*/

function isValidAttemptId(
  attemptId
) {

  if (
    typeof attemptId !==
      "string"
  ) {

    return false;

  }


  const value =
    attemptId.trim();


  if (
    value.length <
      25

    ||

    value.length >
      250
  ) {

    return false;

  }


  return (
    /^rpg_[a-zA-Z0-9_-]+_[a-zA-Z0-9_-]+_[a-zA-Z0-9_-]+_[a-zA-Z0-9_-]+_[a-zA-Z0-9_-]+$/
      .test(
        value
      )
  );

}


/*
==================================================
建立統一遊戲結算資料
==================================================

未來每一個數學遊戲，
完成一局後都統一轉成這個格式。

==================================================
*/

function createGameAttempt({

  attemptId = null,

  gameId,

  modeId,

  score,

  correctCount,

  wrongCount = null,

  totalQuestions,

  maxCombo = 0,

  playTime = 0,

  completedAt = new Date(),

  metadata = {}

} = {}) {


  /*
  ----------------------------------------------
  檢查遊戲
  ----------------------------------------------
  */

  if (
    !isRegisteredGame(
      gameId
    )
  ) {

    throw new Error(
      `[RPG] 尚未登錄的 gameId：${gameId}`
    );

  }


  /*
  ----------------------------------------------
  檢查模式
  ----------------------------------------------
  */

  if (
    !isRegisteredMode(
      gameId,
      modeId
    )
  ) {

    throw new Error(
      `[RPG] 尚未登錄的 modeId：${gameId}/${modeId}`
    );

  }


  /*
  ----------------------------------------------
  數值
  ----------------------------------------------
  */

  const safeScore =
    Number(
      score
    );


  const safeCorrect =
    Number(
      correctCount
    );


  const safeTotal =
    Number(
      totalQuestions
    );


  const safeCombo =
    Number(
      maxCombo
    );


  const safePlayTime =
    Math.max(
      0,
      Math.floor(
        Number(
          playTime
        ) || 0
      )
    );


  /*
  ----------------------------------------------
  分數
  ----------------------------------------------
  */

  if (

    !Number.isFinite(
      safeScore
    )

    ||

    safeScore <
      0

    ||

    safeScore >
      100

  ) {

    throw new Error(
      "[RPG] score 必須介於 0～100。"
    );

  }


  /*
  ----------------------------------------------
  題數
  ----------------------------------------------
  */

  if (

    !Number.isInteger(
      safeCorrect
    )

    ||

    safeCorrect <
      0

  ) {

    throw new Error(
      "[RPG] correctCount 必須是 0 以上整數。"
    );

  }


  if (

    !Number.isInteger(
      safeTotal
    )

    ||

    safeTotal <
      1

  ) {

    throw new Error(
      "[RPG] totalQuestions 必須至少為 1。"
    );

  }


  if (
    safeCorrect >
      safeTotal
  ) {

    throw new Error(
      "[RPG] correctCount 不能超過 totalQuestions。"
    );

  }


  /*
  ----------------------------------------------
  錯題數
  ----------------------------------------------
  */

  let safeWrong;


  if (
    wrongCount ===
      null

    ||

    wrongCount ===
      undefined

  ) {

    safeWrong =
      safeTotal -
      safeCorrect;

  } else {

    safeWrong =
      Number(
        wrongCount
      );


    if (

      !Number.isInteger(
        safeWrong
      )

      ||

      safeWrong <
        0

    ) {

      throw new Error(
        "[RPG] wrongCount 必須是 0 以上整數。"
      );

    }

  }


  /*
  ----------------------------------------------
  連擊
  ----------------------------------------------
  */

  if (

    !Number.isInteger(
      safeCombo
    )

    ||

    safeCombo <
      0

  ) {

    throw new Error(
      "[RPG] maxCombo 必須是 0 以上整數。"
    );

  }


  if (
    safeCombo >
      safeTotal
  ) {

    throw new Error(
      "[RPG] maxCombo 不能超過 totalQuestions。"
    );

  }


  /*
  ----------------------------------------------
  完成時間
  ----------------------------------------------
  */

  const completedDate =

    completedAt instanceof Date

      ? completedAt

      : new Date(
          completedAt
        );


  if (
    Number.isNaN(
      completedDate.getTime()
    )
  ) {

    throw new Error(
      "[RPG] completedAt 不是有效日期。"
    );

  }


  /*
  ----------------------------------------------
  attemptId
  ----------------------------------------------
  */

  const finalAttemptId =

    attemptId

      ? String(
          attemptId
        ).trim()

      : createAttemptId({

          gameId,

          modeId,

          date:
            completedDate

        });


  if (
    !isValidAttemptId(
      finalAttemptId
    )
  ) {

    throw new Error(
      "[RPG] attemptId 格式不正確。"
    );

  }


  /*
  ----------------------------------------------
  Accuracy
  ----------------------------------------------
  */

  const accuracy =
    safeTotal >
      0

      ? Math.round(
          (
            safeCorrect /
            safeTotal
          )
          *
          10000
        )
        /
        100

      : 0;


  /*
  ----------------------------------------------
  Result
  ----------------------------------------------
  */

  const result =
    Object.freeze({

      attemptId:
        finalAttemptId,


      /*
      遊戲
      */

      gameId,

      modeId,


      /*
      表現
      */

      score:
        safeScore,

      correctCount:
        safeCorrect,

      wrongCount:
        safeWrong,

      totalQuestions:
        safeTotal,

      accuracy,

      maxCombo:
        safeCombo,

      playTime:
        safePlayTime,


      /*
      時間
      */

      completedAt:
        completedDate.toISOString(),


      /*
      環境
      */

      environment:
        RPG_CONFIG.environment,

      xpRuleVersion:
        RPG_CONFIG.xpRuleVersion,


      /*
      額外資料

      未來如果某遊戲需要傳：

      questionSet
      difficulty
      source
      examId

      可以先放 metadata。
      */

      metadata:
        Object.freeze({

          ...metadata

        })

    });


  rpgDebug(
    "建立 Game Attempt",
    result
  );


  return result;

}


/*
==================================================
將 Attempt 轉成 XP 計算格式
==================================================

progress-system.js 不需要知道整個 attempt，
只需要它計算 XP 所需要的欄位。

==================================================
*/

function attemptToGameResult(
  attempt
) {

  if (
    !attempt
    ||
    !isValidAttemptId(
      attempt.attemptId
    )
  ) {

    throw new Error(
      "[RPG] 無效的 attempt。"
    );

  }


  return {

    gameId:
      attempt.gameId,

    modeId:
      attempt.modeId,

    score:
      attempt.score,

    correctCount:
      attempt.correctCount,

    totalQuestions:
      attempt.totalQuestions,

    maxCombo:
      attempt.maxCombo

  };

}


/*
==================================================
自我檢查
==================================================
*/

function validateAttemptSystem() {

  const errors =
    [];


  /*
  測試隨機 attemptId 格式。
  這裡不依賴任何特定遊戲。
  */

  try {

    const fakeId =
      createAttemptId({

        gameId:
          "testGame",

        modeId:
          "testMode"

      });


    if (
      !isValidAttemptId(
        fakeId
      )
    ) {

      errors.push(
        "createAttemptId 產生的 ID 無法通過驗證。"
      );

    }

  } catch (
    error
  ) {

    errors.push(
      error.message
    );

  }


  if (
    errors.length >
      0
  ) {

    console.error(
      "[RPG] Attempt System 檢查失敗：",
      errors
    );


    return {

      valid:
        false,

      errors

    };

  }


  rpgDebug(
    "Attempt System 檢查完成"
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

validateAttemptSystem();


/*
==================================================
Export
==================================================
*/

export {

  generateRandomPart,

  createTimestampPart,

  sanitizeIdPart,

  createAttemptId,

  isValidAttemptId,

  createGameAttempt,

  attemptToGameResult,

  validateAttemptSystem

};
