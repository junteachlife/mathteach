/*
==================================================
數學遊戲樂園：我的成績
檔案位置：js/my-scores.js

版本：3.1
排行榜規則同步版
==================================================

功能：

1. 顯示目前登入玩家

2. 顯示整體統計：
   - 累積遊玩次數
   - 最高分
   - 平均分數
   - 最高連續答對
   - 累積答對
   - 累積答錯

3. 顯示各遊戲表現

4. 顯示最近 10 筆紀錄

5. 單模式遊戲：
   不顯示舊 mode

6. 多模式遊戲：
   顯示 game-config.js 正式模式名稱

7. timed 固定時間型：
   顯示
   ✅ 答對
   ❌ 答錯
   🔥 最高連擊

8. speed 完成速度型：
   顯示
   ⏱ 完成時間

==================================================
*/

import {
  auth,
  db
} from "./firebase-config.js";

import {
  getGameConfig,
  getGameName,
  getModeName,
  getGameOrder
} from "./game-config.js?v=10.0";

import {
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


/*
==================================================
DOM
==================================================
*/

const userStatus =
  document.getElementById(
    "userStatus"
  );

const loadingMessage =
  document.getElementById(
    "loadingMessage"
  );

const errorMessage =
  document.getElementById(
    "errorMessage"
  );

const emptyMessage =
  document.getElementById(
    "emptyMessage"
  );

const statsSection =
  document.getElementById(
    "statsSection"
  );

const totalGamesElement =
  document.getElementById(
    "totalGames"
  );

const highestScoreElement =
  document.getElementById(
    "highestScore"
  );

const averageScoreElement =
  document.getElementById(
    "averageScore"
  );

const highestComboElement =
  document.getElementById(
    "highestCombo"
  );

const totalCorrectElement =
  document.getElementById(
    "totalCorrect"
  );

const totalWrongElement =
  document.getElementById(
    "totalWrong"
  );

const gameSummaryList =
  document.getElementById(
    "gameSummaryList"
  );

const historyList =
  document.getElementById(
    "historyList"
  );


/*
==================================================
排行榜類型
==================================================
*/

function getRankingType(
  gameId
) {
  const type =
    getGameConfig(
      gameId
    )?.ranking?.type;

  if (
    type === "timed"
  ) {
    return "timed";
  }

  return "speed";
}


/*
==================================================
取得正式模式數量
==================================================
*/

function getGameModeCount(
  gameId
) {
  const config =
    getGameConfig(
      gameId
    );

  if (
    !config ||
    !config.modes ||
    typeof config.modes !==
      "object"
  ) {
    return 0;
  }

  return Object.keys(
    config.modes
  ).length;
}


/*
==================================================
判斷是否為多模式
==================================================
*/

function isMultiModeGame(
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
取得歷史紀錄模式名稱
==================================================

單模式：
完全忽略 Firestore 舊 mode。

多模式：
才顯示正式模式名稱。
==================================================
*/

function getHistoryModeText(
  gameId,
  mode
) {
  if (
    !isMultiModeGame(
      gameId
    )
  ) {
    return "";
  }

  return (
    getModeName(
      gameId,
      mode
    ) ||
    ""
  );
}


/*
==================================================
監聽登入狀態
==================================================
*/

onAuthStateChanged(
  auth,

  async (user) => {

    if (!user) {

      showLoginRequiredMessage();

      return;
    }

    renderUser(
      user
    );

    await loadMyScores(
      user.uid
    );
  },

  (error) => {

    console.error(
      "確認登入狀態失敗：",
      error
    );

    showError(
      error
    );
  }
);


/*
==================================================
顯示目前登入玩家
==================================================
*/

function renderUser(
  user
) {
  if (!userStatus) {
    return;
  }

  userStatus.innerHTML =
    "";


  /*
  玩家頭像
  */

  if (
    user.photoURL
  ) {

    const userPhoto =
      document.createElement(
        "img"
      );

    userPhoto.className =
      "user-photo";

    userPhoto.src =
      user.photoURL;

    userPhoto.alt =
      "玩家頭像";

    userStatus.appendChild(
      userPhoto
    );
  }


  /*
  玩家名稱
  */

  const userName =
    document.createElement(
      "span"
    );

  userName.textContent =
    `目前登入：${
      user.displayName ||
      user.email ||
      "玩家"
    }`;

  userStatus.appendChild(
    userName
  );
}


/*
==================================================
讀取個人成績
==================================================
*/

async function loadMyScores(
  uid
) {
  setLoadingState();

  try {

    const scoresReference =
      collection(
        db,
        "scores"
      );


    const myScoresQuery =
      query(
        scoresReference,

        where(
          "uid",
          "==",
          uid
        )
      );


    const snapshot =
      await getDocs(
        myScoresQuery
      );


    const records =
      snapshot.docs.map(
        (
          documentSnapshot
        ) => ({

          id:
            documentSnapshot.id,

          ...documentSnapshot.data()
        })
      );


    /*
    最新紀錄排最前面
    */

    records.sort(
      (
        recordA,
        recordB
      ) => {

        return (
          getTimestampMilliseconds(
            recordB.createdAt
          ) -
          getTimestampMilliseconds(
            recordA.createdAt
          )
        );
      }
    );


    renderMyScores(
      records
    );

  } catch (error) {

    console.error(
      "讀取個人成績失敗：",
      error
    );

    showError(
      error
    );
  }
}


/*
==================================================
顯示個人成績
==================================================
*/

function renderMyScores(
  records
) {

  if (loadingMessage) {
    loadingMessage.hidden =
      true;
  }


  if (errorMessage) {
    errorMessage.hidden =
      true;
  }


  /*
  沒有任何成績
  */

  if (
    records.length ===
    0
  ) {

    if (emptyMessage) {

      emptyMessage.hidden =
        false;
    }

    if (statsSection) {

      statsSection.style.display =
        "none";
    }

    return;
  }


  if (emptyMessage) {

    emptyMessage.hidden =
      true;
  }


  if (statsSection) {

    statsSection.style.display =
      "block";
  }


  /*
  整體統計
  */

  const statistics =
    calculateStatistics(
      records
    );


  if (totalGamesElement) {

    totalGamesElement.textContent =
      statistics.totalGames;
  }


  if (highestScoreElement) {

    highestScoreElement.textContent =
      statistics.highestScore;
  }


  if (averageScoreElement) {

    averageScoreElement.textContent =
      statistics.averageScore;
  }


  if (highestComboElement) {

    highestComboElement.textContent =
      statistics.highestCombo;
  }


  if (totalCorrectElement) {

    totalCorrectElement.textContent =
      statistics.totalCorrect;
  }


  if (totalWrongElement) {

    totalWrongElement.textContent =
      statistics.totalWrong;
  }


  /*
  各遊戲表現
  */

  renderGameSummary(
    records
  );


  /*
  最近遊玩紀錄
  */

  renderHistory(
    records
  );
}


/*
==================================================
計算整體統計資料
==================================================
*/

function calculateStatistics(
  records
) {

  const totalGames =
    records.length;


  /*
  總分
  */

  const totalScore =
    records.reduce(
      (
        total,
        record
      ) => {

        return (
          total +
          toSafeNumber(
            record.score
          )
        );
      },
      0
    );


  /*
  最高分
  */

  const highestScore =
    records.reduce(
      (
        highest,
        record
      ) => {

        return Math.max(
          highest,

          toSafeNumber(
            record.score
          )
        );
      },
      0
    );


  /*
  最高連擊
  */

  const highestCombo =
    records.reduce(
      (
        highest,
        record
      ) => {

        return Math.max(
          highest,

          toSafeNumber(
            record.maxCombo
          )
        );
      },
      0
    );


  /*
  累積答對
  */

  const totalCorrect =
    records.reduce(
      (
        total,
        record
      ) => {

        return (
          total +
          toSafeNumber(
            record.correctCount
          )
        );
      },
      0
    );


  /*
  累積答錯
  */

  const totalWrong =
    records.reduce(
      (
        total,
        record
      ) => {

        return (
          total +
          toSafeNumber(
            record.wrongCount
          )
        );
      },
      0
    );


  /*
  平均分
  */

  const averageScore =
    totalGames >
    0
      ? Math.round(
          totalScore /
          totalGames
        )
      : 0;


  return {
    totalGames,
    highestScore,
    averageScore,
    highestCombo,
    totalCorrect,
    totalWrong
  };
}


/*
==================================================
顯示各遊戲統計
==================================================
*/

function renderGameSummary(
  records
) {

  if (!gameSummaryList) {
    return;
  }


  gameSummaryList.innerHTML =
    "";


  /*
  將紀錄依遊戲分類
  */

  const groupedGames =
    {};


  records.forEach(
    (record) => {

      const gameKey =
        record.game ||
        "unknown";


      if (
        !groupedGames[
          gameKey
        ]
      ) {

        groupedGames[
          gameKey
        ] = [];
      }


      groupedGames[
        gameKey
      ].push(
        record
      );
    }
  );


  /*
  正式遊戲順序
  */

  const gameOrder =
    getGameOrder();


  const knownGames =
    gameOrder.filter(
      (gameKey) => {

        return Boolean(
          groupedGames[
            gameKey
          ]
        );
      }
    );


  /*
  保留舊資料
  */

  const unknownGames =
    Object.keys(
      groupedGames
    ).filter(
      (gameKey) => {

        return (
          !gameOrder.includes(
            gameKey
          )
        );
      }
    );


  const orderedGames = [
    ...knownGames,
    ...unknownGames
  ];


  /*
  建立各遊戲統計卡
  */

  orderedGames.forEach(
    (gameKey) => {

      const gameRecords =
        groupedGames[
          gameKey
        ];


      const totalGames =
        gameRecords.length;


      /*
      最高分
      */

      const highestScore =
        gameRecords.reduce(
          (
            highest,
            record
          ) => {

            return Math.max(
              highest,

              toSafeNumber(
                record.score
              )
            );
          },
          0
        );


      /*
      總分
      */

      const totalScore =
        gameRecords.reduce(
          (
            total,
            record
          ) => {

            return (
              total +
              toSafeNumber(
                record.score
              )
            );
          },
          0
        );


      /*
      平均分
      */

      const averageScore =
        totalGames >
        0
          ? Math.round(
              totalScore /
              totalGames
            )
          : 0;


      /*
      卡片
      */

      const gameCard =
        document.createElement(
          "article"
        );

      gameCard.className =
        "game-card";


      /*
      遊戲名稱
      */

      const gameTitle =
        document.createElement(
          "div"
        );

      gameTitle.className =
        "game-title";

      gameTitle.textContent =
        getGameName(
          gameKey
        );


      /*
      三項統計
      */

      const playCount =
        createGameStatistic(
          totalGames,
          "遊玩次數"
        );


      const bestScore =
        createGameStatistic(
          highestScore,
          "最高分"
        );


      const average =
        createGameStatistic(
          averageScore,
          "平均分"
        );


      gameCard.appendChild(
        gameTitle
      );

      gameCard.appendChild(
        playCount
      );

      gameCard.appendChild(
        bestScore
      );

      gameCard.appendChild(
        average
      );


      gameSummaryList.appendChild(
        gameCard
      );
    }
  );
}


/*
==================================================
建立統計欄位
==================================================
*/

function createGameStatistic(
  value,
  label
) {

  const wrapper =
