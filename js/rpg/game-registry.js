/*
==================================================
學習型 RPG 成長系統
中央遊戲／模式登錄表
Version 1.0
==================================================

用途：

1. 統一管理所有數學遊戲。
2. 每一個遊戲可以有不同數量的模式。
3. 每一個模式可以有不同難度。
4. RPG、任務、熟練度、成就、排行榜、
   Boss、老師後台未來都讀這份設定。
5. 不把「模式一、模式二、模式三」寫死。

目前仍屬 TEST 開發階段。
不會自動接入任何正式遊戲。
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

    /*
    一般核心學習模式
    */
    STANDARD:
      "standard",


    /*
    綜合挑戰
    */
    MIXED:
      "mixed",


    /*
    Boss／試煉
    */
    BOSS:
      "boss",


    /*
    基礎／補救模式
    */
    REMEDIAL:
      "remedial",


    /*
    特殊活動
    */
    SPECIAL:
      "special"

  });


/*
==================================================
難度等級與 XP 權重
==================================================

目前先採保守倍率。

難度 1：
基礎

難度 2：
一般

難度 3：
進階

難度 4：
高難度

難度 5：
Boss

之後會在 RPG 測試中心實際測試，
再決定倍率是否需要調整。
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
建立模式設定
==================================================

使用函式建立，
避免每個模式重複大量欄位。
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
建立遊戲設定
==================================================
*/

function createGame({

  gameId,

  name,

  category,

  active = true,

  modes = {}

}) {

  return Object.freeze({

    gameId,

    name,

    category,

    active,

    modes:
      Object.freeze(
        modes
      )

  });

}


/*
==================================================
中央遊戲登錄表
==================================================

注意：

目前先放入我們已經比較確定的遊戲。

之後其他數學遊戲會一個一個核對
實際 GAME_ID 與 mode ID 後再加入。

不要靠猜測補齊。
==================================================
*/

const GAME_REGISTRY =
  Object.freeze({


    /*
    ==============================================
    十字交乘因式分解大挑戰
    ==============================================
    */

    crossMultiplication:
      createGame({

        gameId:
          "crossMultiplication",

        name:
          "十字交乘因式分解大挑戰",

        category:
          "因式分解",

        modes: {

          leadingOne:
            createMode({

              modeId:
                "leadingOne",

              name:
                "平方項係數為 1",

              difficultyLevel:
                1

            }),


          general:
            createMode({

              modeId:
                "general",

              name:
                "平方項係數不為 1",

              difficultyLevel:
                2

            }),


          mixed:
            createMode({

              modeId:
                "mixed",

              name:
                "進階綜合",

              difficultyLevel:
                3,

              modeType:
                RPG_MODE_TYPES.MIXED,

              /*
              綜合模式不列入
              「完成所有核心模式」判定。
              */
              countsForCompletion:
                false

            })

        }

      }),


    /*
    ==============================================
    一元二次方程式大挑戰
    ==============================================
    */

    quadraticEquation:
      createGame({

        gameId:
          "quadraticEquation",

        name:
          "一元二次方程式大挑戰",

        category:
          "一元二次方程式",

        modes: {

          basic:
            createMode({

              modeId:
                "basic",

              name:
                "基礎概念",

              difficultyLevel:
                1

            }),


          factor:
            createMode({

              modeId:
                "factor",

              name:
                "因式分解法",

              difficultyLevel:
                2

            }),


          completeSquare:
            createMode({

              modeId:
                "completeSquare",

              name:
                "平方根與配方法",

              difficultyLevel:
                3

            }),


          formula:
            createMode({

              modeId:
                "formula",

              name:
                "公式解與判別式",

              difficultyLevel:
                3

            }),


          application:
            createMode({

              modeId:
                "application",

              name:
                "一元二次應用問題",

              difficultyLevel:
                3

            }),


          mixed:
            createMode({

              modeId:
                "mixed",

              name:
                "全章綜合挑戰",

              difficultyLevel:
                4,

              modeType:
                RPG_MODE_TYPES.MIXED,

              countsForCompletion:
                false

            })

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


  return (

    game.modes[
      modeId
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

例如：

一元二次方程式：

basic
factor
completeSquare
formula
application

mixed 不列入
「全部核心模式完成」。
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
Registry 自我檢查
==================================================

會檢查：

1. Registry key 與 gameId 是否一致
2. Registry mode key 與 modeId 是否一致
3. 難度是否存在
4. 遊戲是否至少有一個模式
5. modeType 是否合法

目前只有真的 import 這個檔案時
才會執行檢查。

正式遊戲現在尚未引用，
所以仍不影響學生。
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


  Object.entries(
    GAME_REGISTRY
  )
    .forEach(
      ([
        registryGameId,
        game
      ]) => {


        /*
        遊戲 ID
        */

        if (
          registryGameId !==
          game.gameId
        ) {

          errors.push(
            `遊戲 ID 不一致：${registryGameId} / ${game.gameId}`
          );

        }


        /*
        至少一個模式
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
        每個模式
        */

        modeEntries.forEach(
          ([
            registryModeId,
            mode
          ]) => {


            if (
              registryModeId !==
              mode.modeId
            ) {

              errors.push(
                `模式 ID 不一致：` +
                `${game.gameId}/${registryModeId} / ${mode.modeId}`
              );

            }


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


  rpgDebug(
    "Game Registry 檢查完成",
    {

      configVersion:
        RPG_CONFIG.version,

      gameCount:
        Object.keys(
          GAME_REGISTRY
        ).length,

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

  getGameName,

  getModeName,

  getDifficultyLabel,

  validateGameRegistry

};
