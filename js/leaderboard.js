/*
==================================================
生活有解．心中有數｜遊戲排行榜
檔案位置：js/leaderboard.js

版本：8.5
2026-09-24 九上 1-2／1-3／1-4 模式同步版
==================================================

本版重點：

1. 不使用 getFinishedGamesBySemester
2. 改用 game-config.js 既有的 getGamesBySemester
3. 依學期顯示排行榜
4. 只顯示 finished:true 的正式遊戲
5. 多模式遊戲可切換模式
6. 同一玩家、同一遊戲、同一模式只保留最佳紀錄
7. 一元一次方程式：
   mode "1"～"4" 保持不變
   只修改排行榜中文名稱
8. 每個排行榜最多 20 名
9. Firestore 讀取失敗時不會再被後續畫面覆蓋
10. 九上 1-2／1-3／1-4 直接依 game-config.js 的正式 GAME_ID / modeId 建榜
==================================================
*/


import {
  auth,
  db
} from "./firebase-config.js";


import {
  getGamesBySemester,
  getGameConfig,
  getGameName
} from "./game-config.js?v=10.0";


import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


"use strict";


/*
==================================================
DOM
==================================================
*/


const userStatus =
  document.getElementById(
    "userStatus"
  );


const semesterSelect =
  document.getElementById(
    "semesterSelect"
  );


const filterTitle =
  document.getElementById(
    "filterTitle"
  );


const filterBox =
  document.getElementById(
    "filterBox"
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


const leaderboardList =
  document.getElementById(
    "leaderboardList"
  );


/*
==================================================
基本設定
==================================================
*/


const LEADERBOARD_LIMIT =
  20;


const SEMESTER_NAMES = {

  "grade7-first":
    "七年級上學期",

  "grade7-second":
    "七年級下學期",

  "grade8-first":
    "八年級上學期",

  "grade8-second": "八年級下學期",
  "grade9-first": "九年級上學期",
  "grade9-second": "九年級下學期"

};


let currentUser =
  null;


let selectedSemester =
  semesterSelect?.value ||
  "grade7-first";


let selectedGame =
  "all";


let allScoreRecords =
  [];


/*
==================================================
一元一次方程式模式正式名稱

重要：

Firestore 中仍然使用：
1
2
3
4

這裡只負責「顯示中文名稱」。
==================================================
*/


const EQUATION_MODE_NAMES = {

  "1":
    "基本一元一次方程式",

  "2":
    "移項與合併同類項",

  "3":
    "括號、負號與化簡",

  "4":
    "分數係數方程式"

};


/*
==================================================
安全數字
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
安全遊戲時間
==================================================
*/


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


/*
==================================================
時間格式
==================================================
*/


function formatTime(
  seconds
) {

  const value =
    Math.max(
      0,
      Math.round(
        safeNumber(
          seconds,
          0
        )
      )
    );


  const minutes =
    Math.floor(
      value / 60
    );


  const remainingSeconds =
    value % 60;


  return (
    `${String(minutes).padStart(2, "0")}:` +
    `${String(remainingSeconds).padStart(2, "0")}`
  );
}


/*
==================================================
Firestore Timestamp → 毫秒
==================================================
*/


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


/*
==================================================
日期格式
==================================================
*/


function formatDate(
  value
) {

  const time =
    timestampToMilliseconds(
      value
    );


  if (
    !time
  ) {

    return "";
  }


  try {

    const date =
      new Date(
        time
      );


    return date.toLocaleDateString(
      "zh-TW",
      {
        year:
          "numeric",

        month:
          "2-digit",

        day:
          "2-digit"
      }
    );

  } catch (
    error
  ) {

    console.warn(
      "日期格式轉換失敗：",
      error
    );


    return "";
  }
}


/*
==================================================
取得玩家名稱
==================================================
*/


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


/*
==================================================
玩家唯一識別
==================================================
*/


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


  return (
    type === "timed"

      ? "timed"

      : "speed"
  );
}


/*
==================================================
取得目前學期遊戲

注意：

使用 getGamesBySemester，
避免引用不存在的 getFinishedGamesBySemester。
==================================================
*/


function getCurrentSemesterGames() {

  let games =
    [];


  try {

    games =
      getGamesBySemester(
        selectedSemester
      ) || [];

  } catch (
    error
  ) {

    console.error(
      "取得學期遊戲失敗：",
      error
    );


    return [];
  }


  /*
  即使 game-config.js 本身已經有過濾，
  這裡仍再保險一次。
  */


  return games.filter(
    game =>
      game &&
      game.finished === true
  );
}


/*
==================================================
取得模式
==================================================
*/


function getGameModes(
  gameId
) {

  const game =
    getGameConfig(
      gameId
    );


  const modes =
    game?.modes;


  if (
    !modes ||
    typeof modes !== "object"
  ) {

    return [];
  }


  return Object.entries(
    modes
  )
    .map(
      (
        [
          rawId,
          rawName
        ]
      ) => {

        const modeId =
          String(
            rawId
          );


        /*
        ==============================================
        一元一次方程式

        遊戲 ID：
        equation

        Firestore：
        1 / 2 / 3 / 4

        只更換顯示名稱。
        ==============================================
        */


        if (
          String(
            gameId
          ) === "equation"
        ) {

          return {

            id:
              modeId,

            name:
              EQUATION_MODE_NAMES[
                modeId
              ] ||
              String(
                rawName
              )

          };
        }


        /*
        其他遊戲完全依 game-config.js。
        */


        return {

          id:
            modeId,

          name:
            String(
              rawName
            )

        };
      }
    );
}


/*
==================================================
建立遊戲篩選列
==================================================
*/


function renderSemesterGames() {

  if (
    !filterBox
  ) {

    return;
  }


  filterBox.innerHTML =
    "";


  const semesterName =
    SEMESTER_NAMES[
      selectedSemester
    ] ||
    "數學遊戲";


  if (
    filterTitle
  ) {

    filterTitle.textContent =
      `${semesterName}排行榜`;
  }


  /*
  全部遊戲
  */


  filterBox.appendChild(

    createFilterButton({

      gameId:
        "all",

      label:
        `📚 ${semesterName}全部遊戲`,

      all:
        true

    })

  );


  /*
  各遊戲
  */


  const games =
    getCurrentSemesterGames();


  games.forEach(
    game => {

      filterBox.appendChild(

        createFilterButton({

          gameId:
            game.id,

          label:
            `${game.icon || "🎮"} ${
              game.shortName ||
              game.name ||
              game.id
            }`

        })

      );
    }
  );
}


/*
==================================================
建立篩選按鈕
==================================================
*/


function createFilterButton({

  gameId,
  label,
  all = false

}) {

  const button =
    document.createElement(
      "button"
    );


  button.type =
    "button";


  button.className =
    "filter-button";


  button.dataset.game =
    gameId;


  button.textContent =
    label;


  if (
    all
  ) {

    button.classList.add(
      "all-button"
    );
  }


  if (
    selectedGame === gameId
  ) {

    button.classList.add(
      "active"
    );
  }


  button.addEventListener(
    "click",
    () => {

      selectedGame =
        gameId;


      filterBox
        ?.querySelectorAll(
          ".filter-button"
        )
        .forEach(
          item => {

            item.classList.remove(
              "active"
            );
          }
        );


      button.classList.add(
        "active"
      );


      if (
        currentUser
      ) {

        renderLeaderboard();
      }
    }
  );


  return button;
}


/*
==================================================
載入 Firestore 成績
==================================================
*/


async function loadAllScores() {

  setLoading();


  try {

    const scoresCollection =
      collection(
        db,
        "scores"
      );


    const snapshot =
      await getDocs(
        scoresCollection
      );


    allScoreRecords =
      snapshot.docs.map(
        documentSnapshot => ({

          id:
            documentSnapshot.id,

          ...documentSnapshot.data()

        })
      );


    console.log(
      "排行榜成績載入完成：",
      allScoreRecords.length
    );


    return true;

  } catch (
    error
  ) {

    console.error(
      "排行榜讀取失敗：",
      error
    );


    allScoreRecords =
      [];


    showError(
      error
    );


    return false;
  }
}


/*
==================================================
顯示排行榜
==================================================
*/


function renderLeaderboard() {

  if (
    !currentUser
  ) {

    showLoginRequired();

    return;
  }


  if (
    !leaderboardList
  ) {

    console.error(
      "找不到 leaderboardList。"
    );


    return;
  }


  hideMessages();


  leaderboardList.innerHTML =
    "";


  const semesterGames =
    getCurrentSemesterGames();


  const games =
    selectedGame === "all"

      ? semesterGames

      : semesterGames.filter(
          game =>
            String(
              game.id
            ) ===
            String(
              selectedGame
            )
        );


  if (
    games.length === 0
  ) {

    showEmpty(
      "目前沒有已正式開放的排行榜項目。"
    );


    return;
  }


  games.forEach(
    game => {

      const gameRecords =
        allScoreRecords.filter(
          record =>
            String(
              record.game ||
              ""
            ) ===
            String(
              game.id
            )
        );
