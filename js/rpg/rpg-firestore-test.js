/*
==================================================
學習型 RPG 成長系統
Firestore TEST 儲存核心
Version 1.0
==================================================

用途：

1. 只處理 RPG TEST 資料。
2. 共用既有 firebase-config.js。
3. 不重新 initializeApp。
4. 使用 Firestore Transaction。
5. 同一 attemptId 只能成功結算一次。
6. 自動判斷：
   - 今日同模式第幾次
   - 首次完成
   - 首次 80 分
   - 首次滿分
7. 更新玩家永久總 XP 與等級。
8. 建立 XP Transaction 紀錄。

重要：
目前仍是 TEST 開發版本。

正式版本未來會把 XP 發放移到
可信任的伺服器端流程。
==================================================
*/

"use strict";


/*
==================================================
共用既有 Firebase
==================================================
*/

import {

  auth,
  db

} from "../firebase-config.js";


/*
==================================================
Firestore SDK
==================================================
*/

import {

  doc,
  runTransaction,
  serverTimestamp

} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


/*
==================================================
RPG Config
==================================================
*/

import {

  RPG_CONFIG,
  getRpgCollections,
  isRpgTestEnvironment,
  rpgDebug

} from "./rpg-config.js";


/*
==================================================
Progress
==================================================
*/

import {

  simulateGameProgress

} from "./progress-system.js";


/*
==================================================
Attempt
==================================================
*/

import {

  isValidAttemptId,
  attemptToGameResult

} from "./attempt-system.js";


/*
==================================================
確認目前真的在 TEST 環境
==================================================
*/

function assertTestEnvironment() {

  if (
    !isRpgTestEnvironment()
  ) {

    throw new Error(
      "[RPG] rpg-firestore-test.js 只能在 TEST 環境使用。"
    );

  }


  if (
    RPG_CONFIG.testMode !==
    true
  ) {

    throw new Error(
      "[RPG] testMode 必須為 true。"
    );

  }


  const collections =
    getRpgCollections();


  /*
  再做一道保護。

  TEST 模組使用的 Collection
  必須全部以 rpgTest 開頭。
  */

  const requiredCollections =
    [

      collections.playerProgress,

      collections.playerModeStats,

      collections.xpTransactions,

      collections.attempts

    ];


  const invalid =
    requiredCollections
      .some(
        name =>
          !String(
            name
          )
            .startsWith(
              "rpgTest"
            )
      );


  if (
    invalid
  ) {

    throw new Error(
      "[RPG] TEST Collection 安全檢查失敗。"
    );

  }


  return true;

}


/*
==================================================
等待 Firebase Auth 初始化完成
==================================================
*/

async function waitForAuthReady() {

  /*
  Firebase 10 Auth 支援 authStateReady。
  */

  if (
    typeof auth.authStateReady ===
    "function"
  ) {

    await auth.authStateReady();

  }


  return auth.currentUser;

}


/*
==================================================
日期 Key
==================================================

依使用者瀏覽器所在時區產生：

2026-09-16

目前學生主要透過台灣學校環境操作，
所以瀏覽器本地日期即可。

==================================================
*/

function getLocalDateKey(
  value = new Date()
) {

  const date =

    value instanceof Date

      ? value

      : new Date(
          value
        );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    throw new Error(
      "[RPG] 無效日期。"
    );

  }


  const pad =
    number =>
      String(
        number
      )
        .padStart(
          2,
          "0"
        );


  return [

    date.getFullYear(),

    pad(
      date.getMonth() +
      1
    ),

    pad(
      date.getDate()
    )

  ]
    .join("-");

}


/*
==================================================
建立安全的 Doc ID
==================================================
*/

function buildModeStatsDocId({

  uid,

  gameId,

  modeId

}) {

  return [

    uid,

    gameId,

    modeId

  ]
    .join("__");

}


/*
==================================================
數值工具
==================================================
*/

function safeNumber(
  value,
  fallback = 0
) {

  const number =
    Number(
      value
    );


  return Number.isFinite(
    number
  )
    ? number
    : fallback;

}


/*
==================================================
Firestore TEST RPG 結算
==================================================

使用方式：

await settleTestAttempt({
  attempt
});

==================================================
*/

async function settleTestAttempt({

  attempt

} = {}) {


  /*
  ----------------------------------------------
  TEST 安全檢查
  ----------------------------------------------
  */

  assertTestEnvironment();


  /*
  ----------------------------------------------
  Attempt 檢查
  ----------------------------------------------
  */

  if (
    !attempt
  ) {

    return {

      success:
        false,

      reason:
        "missing-attempt"

    };

  }


  if (
    !isValidAttemptId(
      attempt.attemptId
    )
  ) {

    return {

      success:
        false,

      reason:
        "invalid-attempt-id"

    };

  }


  /*
  Attempt 本身也必須來自 TEST。
  */

  if (
    attempt.environment !==
    "test"
  ) {

    return {

      success:
        false,

      reason:
        "wrong-environment"

    };

  }


  /*
  ----------------------------------------------
  等待登入狀態
  ----------------------------------------------
  */

  const user =
    await waitForAuthReady();


  if (
    !user
  ) {

    return {

      success:
        false,

      reason:
        "not-logged-in"

    };

  }


  const uid =
    user.uid;


  /*
  ----------------------------------------------
  Collection
  ----------------------------------------------
  */

  const collections =
    getRpgCollections();


  /*
  ----------------------------------------------
  Document References
  ----------------------------------------------
  */

  const attemptRef =
    doc(

      db,

      collections.attempts,

      attempt.attemptId

    );


  /*
  XP Transaction 直接使用 attemptId 當 Doc ID。

  這樣同一局不可能建立第二筆 XP Transaction。
  */

  const xpTransactionRef =
    doc(

      db,

      collections.xpTransactions,

      attempt.attemptId

    );


  /*
  每個玩家只有一份永久 Progress。
  */

  const progressRef =
    doc(

      db,

      collections.playerProgress,

      uid

    );


  /*
  玩家 × 遊戲 × 模式
  各自一份 Mode Stats。
  */

  const modeStatsDocId =
    buildModeStatsDocId({

      uid,

      gameId:
        attempt.gameId,

      modeId:
        attempt.modeId

    });


  const modeStatsRef =
    doc(

      db,

      collections.playerModeStats,

      modeStatsDocId

    );


  /*
  ----------------------------------------------
  Firestore Transaction
  ----------------------------------------------
  */

  try {

    const transactionResult =
      await runTransaction(

        db,

        async (
          transaction
        ) => {


          /*
          ============================================
          所有 Reads 必須先完成
          ============================================
          */


          /*
          是否已經處理過同一 Attempt？
          */

          const existingAttemptSnapshot =
            await transaction.get(
              attemptRef
            );


          /*
          玩家 Progress
          */

          const progressSnapshot =
            await transaction.get(
              progressRef
            );


          /*
          該模式歷史資料
          */

          const modeStatsSnapshot =
            await transaction.get(
              modeStatsRef
            );


          /*
          ============================================
          防重複
          ============================================
          */

          if (
            existingAttemptSnapshot.exists()
          ) {

            const existing =
              existingAttemptSnapshot.data();


            return {

              success:
                false,

              duplicate:
                true,

              reason:
                "duplicate-attempt",

              attemptId:
                attempt.attemptId,

              gainedXp:
                0,

              originalXp:
                safeNumber(
                  existing.finalXp
                ),

              totalXpAfter:
                safeNumber(
                  existing.totalXpAfter
                )

            };

          }


          /*
          ============================================
          目前玩家資料
          ============================================
          */

          const progressData =

            progressSnapshot.exists()

              ? progressSnapshot.data()

              : {};


          const currentTotalXp =
            Math.max(

              0,

              Math.floor(
                safeNumber(
                  progressData.totalXp
                )
              )

            );


          /*
          ============================================
          Mode Stats
          ============================================
          */

          const modeStatsData =

            modeStatsSnapshot.exists()

              ? modeStatsSnapshot.data()

              : {};


          const previousTotalAttempts =
            Math.max(

              0,

              Math.floor(
                safeNumber(
                  modeStatsData.totalAttempts
                )
              )

            );


          /*
          ============================================
          今日同模式第幾次
          ============================================
          */

          const todayKey =
            getLocalDateKey(
              attempt.completedAt
            );


          const previousDateKey =
            modeStatsData
              .lastAttemptDateKey
            ||
            "";


          const previousAttemptsToday =

            previousDateKey ===
              todayKey

              ? Math.max(

                  0,

                  Math.floor(
                    safeNumber(
                      modeStatsData.attemptsToday
                    )
                  )

                )

              : 0;


          const attemptNumberToday =
            previousAttemptsToday +
            1;


          /*
          ============================================
          自動判斷首次里程碑
          ============================================
          */

          const score =
            safeNumber(
              attempt.score
            );


          /*
          首次完成：

          totalAttempts === 0
          */

          const firstCompletion =
            previousTotalAttempts ===
            0;


          /*
          第一次達到 80：

          以前沒有 first80At，
          而且這次 >=80。
          */

          const first80 =

            !modeStatsData.first80At

            &&

            score >=
              80;


          /*
          第一次滿分
          */

          const first100 =

            !modeStatsData.first100At

            &&

            score >=
              100;


          /*
          ============================================
          轉成 Progress System 格式
          ============================================
          */

          const gameResult =
            attemptToGameResult(
              attempt
            );


          gameResult.attemptNumberToday =
            attemptNumberToday;


          /*
          Firestore TEST 開始正式測試：

          重複練習倍率自動生效。
          */

          gameResult.applyRepeatPenalty =
            true;


          gameResult.milestones =
            {

              firstCompletion,

              first80,

              first100

            };


          /*
          ============================================
          XP + 等級
          ============================================
          */

          const progressResult =
            simulateGameProgress({

              currentTotalXp,

              gameResult

            });


          if (
            !progressResult.success
          ) {

            throw new Error(

              "[RPG] XP 計算失敗：" +

              progressResult
                .errors
                .join(
                  " / "
                )

            );

          }


          const xp =
            progressResult.xp;


          const level =
            progressResult.level;


          /*
          ============================================
          Attempt
          ============================================
          */

          transaction.set(

            attemptRef,

            {

              attemptId:
                attempt.attemptId,

              uid,

              gameId:
                attempt.gameId,

              modeId:
                attempt.modeId,

              score:
                attempt.score,

              correctCount:
                attempt.correctCount,

              wrongCount:
                attempt.wrongCount,

              totalQuestions:
                attempt.totalQuestions,

              accuracy:
                attempt.accuracy,

              maxCombo:
                attempt.maxCombo,

              playTime:
                attempt.playTime,

              completedAt:
                attempt.completedAt,


              /*
              RPG 結算資訊
              */

              attemptNumberToday,

              repeatMultiplier:
                xp.repeatMultiplier,

              difficultyMultiplier:
                xp.difficultyMultiplier,

              milestoneFirstCompletion:
                firstCompletion,

              milestoneFirst80:
                first80,

              milestoneFirst100:
                first100,

              finalXp:
                xp.finalXP,

              totalXpBefore:
                currentTotalXp,

              totalXpAfter:
                level.newTotalXp,

              oldLevel:
                level.oldLevel,

              newLevel:
                level.newLevel,

              xpRuleVersion:
                xp.xpRuleVersion,


              /*
              TEST
              */

              environment:
                "test",

              status:
                "processed",

              processedAt:
                serverTimestamp()

            }

          );


          /*
          ============================================
          XP Transaction
          ============================================
          */

          transaction.set(

            xpTransactionRef,

            {

              transactionId:
                attempt.attemptId,

              attemptId:
                attempt.attemptId,

              uid,

              type:
                "game",

              gameId:
                attempt.gameId,

              modeId:
                attempt.modeId,


              /*
              XP
              */

              completionXp:
                xp.completionXP,

              scoreXp:
                xp.scoreXP,

              comboXp:
                xp.comboXP,

              milestoneXp:
                xp.milestoneXP,

              difficultyMultiplier:
                xp.difficultyMultiplier,

              repeatMultiplier:
                xp.repeatMultiplier,

              xpDelta:
                xp.finalXP,


              /*
              Before / After
              */

              totalXpBefore:
                currentTotalXp,

              totalXpAfter:
                level.newTotalXp,

              oldLevel:
                level.oldLevel,

              newLevel:
                level.newLevel,

              levelsGained:
                level.levelsGained,


              /*
              Rule
              */

              xpRuleVersion:
                xp.xpRuleVersion,


              /*
              TEST
              */

              environment:
                "test",

              createdAt:
                serverTimestamp()

            }

          );


          /*
          ============================================
          Player Progress
          ============================================
          */

          const progressWrite =
            {

              uid,

              totalXp:
                level.newTotalXp,

              level:
                level.newLevel,

              levelXp:
                level.after.levelXp,

              nextLevelRequirement:
                level.after.nextRequirement,

              xpToNextLevel:
                level.after.xpToNextLevel,

              totalAttempts:
                Math.max(
                  0,
                  Math.floor(
                    safeNumber(
                      progressData.totalAttempts
                    )
                  )
                )
                +
                1,

              totalCorrect:
                Math.max(
                  0,
                  Math.floor(
                    safeNumber(
                      progressData.totalCorrect
                    )
                  )
                )
                +
                attempt.correctCount,

              totalWrong:
                Math.max(
                  0,
                  Math.floor(
                    safeNumber(
                      progressData.totalWrong
                    )
                  )
                )
                +
                attempt.wrongCount,

              lastGameId:
                attempt.gameId,

              lastModeId:
                attempt.modeId,

              lastAttemptId:
                attempt.attemptId,

              lastPlayedAt:
                serverTimestamp(),

              xpRuleVersion:
                xp.xpRuleVersion,

              environment:
                "test",

              updatedAt:
                serverTimestamp()

            };


          /*
          新玩家才建立 createdAt。
          */

          if (
            !progressSnapshot.exists()
          ) {

            progressWrite.createdAt =
              serverTimestamp();

          }


          transaction.set(

            progressRef,

            progressWrite,

            {
              merge:
                true
            }

          );


          /*
          ============================================
          Mode Stats
          ============================================
          */

          const previousBestScore =
            Math.max(
              0,
              safeNumber(
                modeStatsData.bestScore
              )
            );


          const previousBestCombo =
            Math.max(
              0,
              Math.floor(
                safeNumber(
                  modeStatsData.bestCombo
                )
              )
            );


          const modeWrite =
            {

              uid,

              gameId:
                attempt.gameId,

              modeId:
                attempt.modeId,

              totalAttempts:
                previousTotalAttempts +
                1,

              totalCorrect:
                Math.max(
                  0,
                  Math.floor(
                    safeNumber(
                      modeStatsData.totalCorrect
                    )
                  )
                )
                +
                attempt.correctCount,

              totalWrong:
                Math.max(
                  0,
                  Math.floor(
                    safeNumber(
                      modeStatsData.totalWrong
                    )
                  )
                )
                +
                attempt.wrongCount,

              bestScore:
                Math.max(
                  previousBestScore,
                  attempt.score
                ),

              bestCombo:
                Math.max(
                  previousBestCombo,
                  attempt.maxCombo
                ),

              lastScore:
                attempt.score,

              lastAttemptId:
                attempt.attemptId,

              lastAttemptDateKey:
                todayKey,

              attemptsToday:
                attemptNumberToday,

              lastPlayedAt:
                serverTimestamp(),

              environment:
                "test",

              updatedAt:
                serverTimestamp()

            };


          /*
          第一次建立 Mode Stats。
          */

          if (
            !modeStatsSnapshot.exists()
          ) {

            modeWrite.createdAt =
              serverTimestamp();

          }


          /*
          首次完成時間
          */

          if (
            firstCompletion
          ) {

            modeWrite.firstCompletedAt =
              serverTimestamp();

          }


          /*
          首次達 80
          */

          if (
            first80
          ) {

            modeWrite.first80At =
              serverTimestamp();

          }


          /*
          首次滿分
          */

          if (
            first100
          ) {

            modeWrite.first100At =
              serverTimestamp();

          }


          transaction.set(

            modeStatsRef,

            modeWrite,

            {
              merge:
                true
            }

          );


          /*
          ============================================
          Transaction Result
          ============================================
          */

          return {

            success:
              true,

            duplicate:
              false,

            attemptId:
              attempt.attemptId,

            uid,

            attemptNumberToday,


            /*
            Milestones
            */

            milestones: {

              firstCompletion,

              first80,

              first100

            },


            /*
            XP
            */

            gainedXp:
              xp.finalXP,

            totalXpBefore:
              currentTotalXp,

            totalXpAfter:
              level.newTotalXp,


            /*
            Level
            */

            oldLevel:
              level.oldLevel,

            newLevel:
              level.newLevel,

            levelsGained:
              level.levelsGained,

            leveledUp:
              level.leveledUp,


            /*
            Full Result
            */

            xp,

            level

          };

        }

      );


    rpgDebug(
      "Firestore TEST RPG 結算結果",
      transactionResult
    );


    return transactionResult;

  } catch (
    error
  ) {

    console.error(
      "[RPG] Firestore TEST 結算失敗：",
      error
    );


    return {

      success:
        false,

      duplicate:
        false,

      reason:
        "firestore-error",

      error,

      message:
        error?.message
        ||
        String(
          error
        )

    };

  }

}


/*
==================================================
檢查目前 Firebase 登入狀態
==================================================
*/

async function getTestRpgAuthState() {

  const user =
    await waitForAuthReady();


  if (
    !user
  ) {

    return {

      loggedIn:
        false,

      uid:
        null

    };

  }


  return {

    loggedIn:
      true,

    uid:
      user.uid,

    displayName:
      user.displayName
      ||
      "",

    email:
      user.email
      ||
      ""

  };

}


/*
==================================================
模組初始化安全檢查
==================================================
*/

assertTestEnvironment();


rpgDebug(
  "RPG Firestore TEST Module loaded",
  {

    collections:
      getRpgCollections()

  }
);


/*
==================================================
Export
==================================================
*/

export {

  getLocalDateKey,

  buildModeStatsDocId,

  getTestRpgAuthState,

  settleTestAttempt

};
