/*
==================================================
數學遊戲樂園：共用成績儲存
檔案位置：js/scores.js

版本：9.0
==================================================

功能：

1. 儲存所有遊戲成績
2. 自動確認 Firebase 登入狀態
3. 避免 auth.currentUser 尚未同步完成
4. 自動整理數字格式
5. 儲存遊戲模式
6. 儲存答對、答錯、最高連擊
7. 儲存遊戲完成時間
8. Firestore 錯誤完整顯示
9. 儲存完成後自動確認目前玩家是否進入排行榜
10. 結果頁自動顯示排行榜名次／尚未入榜提醒
==================================================
*/

import {
  auth,
  db
} from "./firebase-config.js";

import {
  addDoc,
  collection,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getGameConfig
} from "./game-config.js";


/*
==================================================
等待 Firebase 登入狀態完成
==================================================

有時候進入遊戲頁面時：

auth.currentUser

還沒來得及恢復登入狀態。

這個函式會稍微等待 Firebase
確認目前登入者。
==================================================
*/

function waitForAuthUser(
  timeout = 3000
) {

  return new Promise(
    (resolve) => {

      /*
      已經有登入者，
      直接回傳。
      */

      if (
        auth.currentUser
      ) {

        resolve(
          auth.currentUser
        );

        return;
      }


      let finished =
        false;


      const finish =
        (user) => {

          if (
            finished
          ) {
            return;
          }

          finished =
            true;

          window.clearTimeout(
            timeoutId
          );

          if (
            typeof unsubscribe ===
            "function"
          ) {

            unsubscribe();
          }

          resolve(
            user || null
          );
        };


      /*
      監聽 Firebase
      登入狀態。
      */

      const unsubscribe =
        onAuthStateChanged(
          auth,

          (user) => {

            finish(
              user
            );
          },

          (error) => {

            console.error(
              "Firebase 登入狀態確認失敗：",
              error
            );

            finish(
              null
            );
          }
        );


      /*
      最多等 3 秒。

      避免 Firebase 發生異常時
      一直卡住。
      */

      const timeoutId =
        window.setTimeout(
          () => {

            finish(
              auth.currentUser
            );
          },

          timeout
        );
    }
  );
}


/*
==================================================
安全轉換數字
==================================================
*/

function toSafeNumber(
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
安全轉換非負整數
==================================================
*/

function toSafeCount(
  value
) {

  return Math.max(
    0,

    Math.round(
      toSafeNumber(
        value,
        0
      )
    )
  );
}


/*
==================================================
整理遊戲代號
==================================================
*/

function normalizeGameId(
  game
) {

  if (
    typeof game !==
    "string"
  ) {

    return "";
  }

  return game.trim();
}


/*
==================================================
整理模式
==================================================
*/

function normalizeMode(
  mode
) {

  if (
    mode === undefined ||
    mode === null
  ) {

    return "";
  }

  return String(
    mode
  ).trim();
}



/*
==================================================
排行榜即時狀態
==================================================

正式排行榜目前規則：
- 每個排行榜最多 20 名
- 同一玩家、同一遊戲、同一模式只保留最佳紀錄
- speed：
  1. 分數高
  2. 時間短
  3. 答對多
  4. 答錯少
  5. 最高連擊高
  6. 較早完成
- timed：
  1. 分數高
  2. 答對多
  3. 答錯少
  4. 最高連擊高
  5. 較早完成

這裡與 leaderboard.js v8.3 使用相同排序邏輯。
==================================================
*/

const LEADERBOARD_LIMIT =
  20;


function safePlayTime(
  value
) {

  const number =
    Number(
      value
    );


  if (
    !Number.isFinite(
      number
    ) ||
    number < 0
  ) {

    return Number.MAX_SAFE_INTEGER;
  }


  return number;
}


function timestampToMilliseconds(
  value
) {

  if (
    !value
  ) {

    return 0;
  }


  if (
    typeof value.toMillis ===
    "function"
  ) {

    return value.toMillis();
  }


  if (
    value.seconds !==
    undefined
  ) {

    return (
      Number(
        value.seconds
      ) *
      1000
    );
  }


  const date =
    new Date(
      value
    );


  const time =
    date.getTime();


  return Number.isFinite(
    time
  )
    ? time
    : 0;
}


function getPlayerName(
  record
) {

  return (

    record.nickname ||

    record.displayName ||

    record.playerName ||

    record.name ||

    record.email ||

    "玩家"

  );
}


function getPlayerKey(
  record
) {

  return (

    record.uid ||

    record.email ||

    getPlayerName(
      record
    )

  );
}


function getRankingType(
  gameId
) {

  try {

    const type =
      getGameConfig(
        gameId
      )?.ranking?.type;


    return (
      type ===
      "timed"
    )
      ? "timed"
      : "speed";

  } catch (
    error
  ) {

    console.warn(
      "讀取排行榜類型失敗，改用 speed：",
      error
    );


    return "speed";
  }
}


function compareSpeed(
  a,
  b
) {

  let difference =
    toSafeNumber(
      b.score
    ) -
    toSafeNumber(
      a.score
    );


  if (
    difference !==
    0
  ) {

    return difference;
  }


  difference =
    safePlayTime(
      a.playTime
    ) -
    safePlayTime(
      b.playTime
    );


  if (
    difference !==
    0
  ) {

    return difference;
  }


  difference =
    toSafeNumber(
      b.correctCount
    ) -
    toSafeNumber(
      a.correctCount
    );


  if (
    difference !==
    0
  ) {

    return difference;
  }


  difference =
    toSafeNumber(
      a.wrongCount
    ) -
    toSafeNumber(
      b.wrongCount
    );


  if (
    difference !==
    0
  ) {

    return difference;
  }


  difference =
    toSafeNumber(
      b.maxCombo
    ) -
    toSafeNumber(
      a.maxCombo
    );


  if (
    difference !==
    0
  ) {

    return difference;
  }


  return (
    timestampToMilliseconds(
      a.createdAt
    ) -
    timestampToMilliseconds(
      b.createdAt
    )
  );
}


function compareTimed(
  a,
  b
) {

  let difference =
    toSafeNumber(
      b.score
    ) -
    toSafeNumber(
      a.score
    );


  if (
    difference !==
    0
  ) {

    return difference;
  }


  difference =
    toSafeNumber(
      b.correctCount
    ) -
    toSafeNumber(
      a.correctCount
    );


  if (
    difference !==
    0
  ) {

    return difference;
  }


  difference =
    toSafeNumber(
      a.wrongCount
    ) -
    toSafeNumber(
      b.wrongCount
    );


  if (
    difference !==
    0
  ) {

    return difference;
  }


  difference =
    toSafeNumber(
      b.maxCombo
    ) -
    toSafeNumber(
      a.maxCombo
    );


  if (
    difference !==
    0
  ) {

    return difference;
  }


  return (
    timestampToMilliseconds(
      a.createdAt
    ) -
    timestampToMilliseconds(
      b.createdAt
    )
  );
}


function prepareRanking(
  records,
  gameId
) {

  const comparator =
    getRankingType(
      gameId
    ) ===
    "timed"

      ? compareTimed

      : compareSpeed;


  const sorted =
    [
      ...records
    ]
      .sort(
        comparator
      );


  const players =
    new Map();


  sorted.forEach(
    record => {

      const key =
        getPlayerKey(
          record
        );


      if (
        !players.has(
          key
        )
      ) {

        players.set(
          key,
          record
        );
      }
    }
  );


  return Array.from(
    players.values()
  )
    .sort(
      comparator
    )
    .slice(
      0,
      LEADERBOARD_LIMIT
    );
}


/*
==================================================
取得目前玩家排行榜狀態
==================================================
*/

export async function getGameLeaderboardStatus({
  game,
  mode = "",
  uid = "",
  currentDocumentId = ""
} = {}) {

  const safeGame =
    normalizeGameId(
      game
    );


  const safeMode =
    normalizeMode(
      mode
    );


  if (
    !safeGame ||
    !uid
  ) {

    return {
      available: false,
      ranked: false,
      reason:
        "invalid-arguments",
      limit:
        LEADERBOARD_LIMIT
    };
  }


  try {

    const snapshot =
      await getDocs(
        collection(
          db,
          "scores"
        )
      );


    const records =
      snapshot.docs
        .map(
          documentSnapshot => ({

            id:
              documentSnapshot.id,

            ...documentSnapshot.data()

          })
        )
        .filter(
          record =>

            String(
              record.game ||
              ""
            ) ===
            String(
              safeGame
            ) &&

            String(
              record.mode ??
              ""
            ) ===
            String(
              safeMode
            )
        );


    const ranking =
      prepareRanking(
        records,
        safeGame
      );


    const playerIndex =
      ranking.findIndex(
        record =>

          String(
            record.uid ||
            ""
          ) ===
          String(
            uid
          )
      );


    if (
      playerIndex <
      0
    ) {

      return {
        available: true,
        ranked: false,
        rank: null,
        limit:
          LEADERBOARD_LIMIT,
        totalRanked:
          ranking.length,
        currentScoreIsBest:
          false
      };
    }


    const bestRecord =
      ranking[
        playerIndex
      ];


    return {
      available: true,
      ranked: true,
      rank:
        playerIndex + 1,
      limit:
        LEADERBOARD_LIMIT,
      totalRanked:
        ranking.length,
      currentScoreIsBest:
        Boolean(
          currentDocumentId &&
          String(
            bestRecord.id
          ) ===
          String(
            currentDocumentId
          )
        ),
      bestRecord
    };


  } catch (
    error
  ) {

    console.error(
      "排行榜狀態讀取失敗：",
      error
    );


    return {
      available: false,
      ranked: false,
      reason:
        "leaderboard-read-error",
      limit:
        LEADERBOARD_LIMIT,
      error
    };
  }
}


/*
==================================================
結果頁排行榜提示
==================================================
*/

function ensureLeaderboardResultStyles() {

  if (
    document.getElementById(
      "game-leaderboard-result-style"
    )
  ) {

    return;
  }


  const style =
    document.createElement(
      "style"
    );


  style.id =
    "game-leaderboard-result-style";


  style.textContent = `
    .game-leaderboard-result{
      width:min(100%,720px);
      margin:12px auto 0;
      padding:13px 16px;
      border:2px solid #cbd5e1;
      border-radius:14px;
      background:#f8fafc;
      color:#334155;
      text-align:center;
      font-size:16px;
      font-weight:900;
      line-height:1.7;
    }

    .game-leaderboard-result--ranked{
      border-color:#f6c453;
      background:#fffbeb;
      color:#92400e;
    }

    .game-leaderboard-result--not-ranked{
      border-color:#bfdbfe;
      background:#eff6ff;
      color:#1e40af;
    }

    .game-leaderboard-result--unavailable{
      border-color:#e2e8f0;
      background:#f8fafc;
      color:#64748b;
    }

    .game-leaderboard-rank{
      display:inline-block;
      margin:0 .16em;
      color:#b45309;
      font-size:1.18em;
    }

    .game-leaderboard-result-note{
      display:block;
      margin-top:2px;
      font-size:13px;
      font-weight:800;
      opacity:.86;
    }
  `;


  document.head.appendChild(
    style
  );
}


export function renderGameLeaderboardStatus(
  status,
  {
    anchorId =
      "save-status"
  } = {}
) {

  ensureLeaderboardResultStyles();


  const anchor =
    document.getElementById(
      anchorId
    );


  if (
    !anchor ||
    !anchor.parentElement
  ) {

    return null;
  }


  let box =
    document.getElementById(
      "game-leaderboard-result"
    );


  if (
    !box
  ) {

    box =
      document.createElement(
        "div"
      );


    box.id =
      "game-leaderboard-result";


    anchor.insertAdjacentElement(
      "afterend",
      box
    );
  }


  box.className =
    "game-leaderboard-result";


  if (
    !status?.available
  ) {

    box.classList.add(
      "game-leaderboard-result--unavailable"
    );


    box.innerHTML = `
      ℹ️ 成績已儲存，但目前無法確認排行榜名次。
      <span class="game-leaderboard-result-note">
        你仍可稍後到排行榜查看正式名次。
      </span>
    `;


    return box;
  }


  if (
    status.ranked
  ) {

    box.classList.add(
      "game-leaderboard-result--ranked"
    );


    const medal =
      status.rank === 1
        ? "🥇"
        : status.rank === 2
          ? "🥈"
          : status.rank === 3
            ? "🥉"
            : "🏆";


    if (
      status.currentScoreIsBest
    ) {

      box.innerHTML = `
        ${medal}
        恭喜！本次成績進入排行榜
        <span class="game-leaderboard-rank">
          第 ${status.rank} 名
        </span>
        ！
      `;

    } else {

      box.innerHTML = `
        ${medal}
        你目前仍在排行榜
        <span class="game-leaderboard-rank">
          第 ${status.rank} 名
        </span>
        。
        <span class="game-leaderboard-result-note">
          本次成績已儲存，但目前排行榜仍採用你先前更好的紀錄。
        </span>
      `;
    }


    return box;
  }


  box.classList.add(
    "game-leaderboard-result--not-ranked"
  );


  box.innerHTML = `
    📈 本次成績已儲存，目前尚未進入排行榜前
    ${status.limit || LEADERBOARD_LIMIT}
    名。
    <span class="game-leaderboard-result-note">
      再挑戰一次，刷新自己的最佳成績吧！
    </span>
  `;


  return box;
}


function clearGameLeaderboardStatus() {

  document
    .getElementById(
      "game-leaderboard-result"
    )
    ?.remove();
}


/*
==================================================
儲存一次遊戲成績
==================================================

使用方式：

await saveGameScore({
  game: "compare",
  mode: "easy",
  score: 120,
  correctCount: 10,
  wrongCount: 2,
  maxCombo: 6,
  playTime: 60
});
==================================================
*/

export async function saveGameScore({
  game,
  mode = "",
  score,
  correctCount = 0,
  wrongCount = 0,
  maxCombo = 0,
  playTime = 0
} = {}) {

  clearGameLeaderboardStatus();


  /*
  ==============================================
  1. 檢查遊戲代號
  ==============================================
  */

  const safeGame =
    normalizeGameId(
      game
    );

  if (
    !safeGame
  ) {

    console.error(
      "儲存成績失敗：缺少遊戲代號。",
      {
        game,
        mode,
        score
      }
    );

    return {
      success: false,
      reason: "invalid-game"
    };
  }


  /*
  ==============================================
  2. 檢查分數
  ==============================================
  */

  const safeScore =
    Number(
      score
    );

  if (
    !Number.isFinite(
      safeScore
    )
  ) {

    console.error(
      "儲存成績失敗：分數不是有效數字。",
      {
        score
      }
    );

    return {
      success: false,
      reason: "invalid-score"
    };
  }


  /*
  ==============================================
  3. 確認登入者
  ==============================================
  */

  let user =
    auth.currentUser;


  /*
  auth.currentUser 尚未恢復時，
  等待 Firebase 一下。
  */

  if (
    !user
  ) {

    user =
      await waitForAuthUser();
  }


  if (
    !user
  ) {

    console.warn(
      "玩家尚未登入，因此這次成績不會儲存。"
    );

    return {
      success: false,
      reason: "not-logged-in"
    };
  }


  /*
  ==============================================
  4. 整理成績資料
  ==============================================
  */

  const safeMode =
    normalizeMode(
      mode
    );

  const safeCorrectCount =
    toSafeCount(
      correctCount
    );

  const safeWrongCount =
    toSafeCount(
      wrongCount
    );

  const safeMaxCombo =
    toSafeCount(
      maxCombo
    );

  const safePlayTime =
    Math.max(
      0,

      toSafeNumber(
        playTime,
        0
      )
    );


  /*
  ==============================================
  5. 建立 Firestore 紀錄
  ==============================================
  */

  const scoreRecord = {

    /*
    玩家
    */

    uid:
      user.uid,

    playerName:
      user.displayName ||
      user.email ||
      "未命名玩家",

    displayName:
      user.displayName ||
      "",

    playerEmail:
      user.email ||
      "",


    /*
    遊戲
    */

    game:
      safeGame,

    mode:
      safeMode,


    /*
    成績
    */

    score:
      safeScore,

    correctCount:
      safeCorrectCount,

    wrongCount:
      safeWrongCount,

    maxCombo:
      safeMaxCombo,

    playTime:
      safePlayTime,


    /*
    建立時間
    */

    createdAt:
      serverTimestamp()
  };


  /*
  ==============================================
  6. 寫入 Firestore
  ==============================================
  */

  try {

    console.log(
      "準備儲存遊戲成績：",
      scoreRecord
    );


    const scoresCollection =
      collection(
        db,
        "scores"
      );


    const documentReference =
      await addDoc(
        scoresCollection,
        scoreRecord
      );


    console.log(
      "✅ 成績已成功儲存"
    );

    console.log(
      "Firestore 文件 ID：",
      documentReference.id
    );

    console.log(
      "遊戲：",
      safeGame
    );

    console.log(
      "模式：",
      safeMode ||
      "單模式"
    );

    console.log(
      "分數：",
      safeScore
    );


    const leaderboardStatus =
      await getGameLeaderboardStatus({

        game:
          safeGame,

        mode:
          safeMode,

        uid:
          user.uid,

        currentDocumentId:
          documentReference.id

      });


    renderGameLeaderboardStatus(
      leaderboardStatus
    );


    return {
      success: true,

      documentId:
        documentReference.id,

      record:
        scoreRecord,

      leaderboard:
        leaderboardStatus
    };


  } catch (
    error
  ) {

    /*
    ==============================================
    7. 完整錯誤資訊
    ==============================================
    */

    console.error(
      "========================================"
    );

    console.error(
      "❌ Firestore 成績儲存失敗"
    );

    console.error(
      "錯誤物件：",
      error
    );

    console.error(
      "錯誤代碼：",
      error?.code
    );

    console.error(
      "錯誤訊息：",
      error?.message
    );

    console.error(
      "玩家 UID：",
      user.uid
    );

    console.error(
      "玩家 Email：",
      user.email
    );

    console.error(
      "遊戲代號：",
      safeGame
    );

    console.error(
      "遊戲模式：",
      safeMode
    );

    console.error(
      "分數：",
      safeScore
    );

    console.error(
      "答對：",
      safeCorrectCount
    );

    console.error(
      "答錯：",
      safeWrongCount
    );

    console.error(
      "最高連擊：",
      safeMaxCombo
    );

    console.error(
      "遊戲時間：",
      safePlayTime
    );

    console.error(
      "準備寫入的完整資料：",
      scoreRecord
    );

    console.error(
      "========================================"
    );


    /*
    permission-denied
    通常代表 Firestore Rules。
    */

    if (
      error?.code ===
      "permission-denied"
    ) {

      return {
        success: false,

        reason:
          "permission-denied",

        error
      };
    }


    /*
    unavailable
    通常代表網路或 Firebase
    暫時無法連線。
    */

    if (
      error?.code ===
      "unavailable"
    ) {

      return {
        success: false,

        reason:
          "network-unavailable",

        error
      };
    }


    return {
      success: false,

      reason:
        "firestore-error",

      error
    };
  }
}


/*
==================================================
確認成績系統已載入
==================================================
*/

console.log(
  "scores.js v9.0 已成功載入"
);
