/*
==================================================
生活有解．心中有數｜遊戲排行榜
檔案位置：js/leaderboard.js

版本：9.5｜七上 3-2 新版五模式及歷史四模式相容
2026-10-15 章節名稱顯示＋公開暱稱同步版
==================================================

本版重點：

1. 不使用 getFinishedGamesBySemester
2. 改用 game-config.js 既有的 getGamesBySemester
3. 依學期顯示排行榜
4. 只顯示 finished:true 的正式遊戲
5. 多模式遊戲可切換模式
6. 同一玩家、同一遊戲、同一模式只保留最佳紀錄
7. 一元一次方程式：新版 v2-1～v2-5 與舊版 1～4 分別排名，名稱統一來自共用設定
8. 每個排行榜最多 20 名
9. Firestore 讀取失敗時不會再被後續畫面覆蓋
10. 九上 1-2／1-3／1-4／2-1／2-2／3-1／3-2 直接依 game-config.js 的正式 GAME_ID / modeId 建榜
11. 八下 1-1 sequence-arithmetic、1-2 arithmetic-series、1-3 geometric-sequence 依 game-config.js 正式 GAME_ID / modeId 建榜
12. 九上 3-1 geometric-proof、3-2 triangle-centers 不新增硬編碼，完全沿用 game-config.js 模式設定
13. 七下 1-1～3-2 全部正式遊戲完全依 game-config.js 的 GAME_ID / modeId 自動建榜
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
} from "./game-config.js?v=20261028-equation5";


import {
  getPublicPlayerProfile,
  getPublicPlayerName
} from "./firestore.js?v=1.3";


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


const publicProfileCache =
  new Map();


/*
==================================================
七上 3-2：歷史成績與新版五模式共存
舊版：1 / 2 / 3 / 4
新版：v2-1 / v2-2 / v2-3 / v2-4 / v2-5
名稱統一讀取 game-config.js，避免硬編碼覆蓋新版名稱。
==================================================
*/

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

  const uid =
    String(
      record?.uid ||
      ""
    );


  const publicProfile =
    uid
      ? publicProfileCache.get(
          uid
        )
      : null;


  if (
    publicProfile
  ) {

    return getPublicPlayerName(
      publicProfile,
      uid
    );
  }


  if (
    record?.nickname
  ) {

    return getPublicPlayerName(
      {
        uid,
        nickname:
          record.nickname,
        nicknameSet:
          true
      },
      uid
    );
  }


  /*
  公開排行榜不再使用：
  displayName / playerName / name / email。
  舊紀錄沒有暱稱時一律改用匿名代號。
  */
  return getPublicPlayerName(
    null,
    uid
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
舊版遊戲 ID 相容
==================================================

八上 2-2 舊版曾誤用 radicalOperations，
正式 game-config ID 為 radicalOperation。
既有 Firestore 成績不必刪除，排行榜讀取時自動歸回正確遊戲。
==================================================
*/

function normalizeGameId(
  gameId
) {

  const id =
    String(
      gameId ||
      ""
    );


  return (
    id ===
    "radicalOperations"
  )
    ? "radicalOperation"
    : id;
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
      normalizeGameId(
        gameId
      )
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


  const entries = Object.entries(modes);
  if (String(gameId) === "equation") {
    entries.sort(([a], [b]) => {
      const aNew = /^v2-[1-5]$/.test(a);
      const bNew = /^v2-[1-5]$/.test(b);
      if (aNew !== bNew) return aNew ? -1 : 1;
      if (aNew && bNew) return Number(a.slice(3)) - Number(b.slice(3));
      return Number(a) - Number(b);
    });
  }
  return entries
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
排行榜顯示名稱整理
==================================================

原則：
1. 上方已顯示目前學期，所以遊戲按鈕不重複「七上、八上、九上」。
2. game-config.js 有 section 時，顯示「章節 + 遊戲短名」。
3. 沒有 section 時照原名稱顯示，不強行猜章節。
4. 若 shortName/name 已經包含同一章節，不重複。
==================================================
*/

function cleanSemesterPrefix(
  value
) {

  return String(
    value ||
    ""
  )
    .replace(
      /^(七|八|九)年級(上|下)學期\s*[-－—:：]?\s*/,
      ""
    )
    .replace(
      /^(七|八|九)(上|下)\s*[-－—:：]?\s*/,
      ""
    )
    .trim();
}


function getGameDisplayLabel(
  game
) {

  const section =
    String(
      game?.section ||
      ""
    ).trim();


  let baseName =
    cleanSemesterPrefix(
      game?.shortName ||
      game?.name ||
      game?.id ||
      "未知遊戲"
    );


  if (
    !section
  ) {
    return baseName;
  }


  const escapedSection =
    section.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );


  baseName =
    baseName.replace(
      new RegExp(
        `^${escapedSection}\\s*[-－—:：]?\\s*`
      ),
      ""
    ).trim();


  return baseName
    ? `${section} ${baseName}`
    : section;
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
              getGameDisplayLabel(
                game
              )
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
載入公開暱稱
==================================================
*/

async function loadPublicProfiles(
  records
) {

  const uniqueUids =
    Array.from(
      new Set(
        records
          .map(
            record =>
              String(
                record?.uid ||
                ""
              )
          )
          .filter(
            Boolean
          )
      )
    );


  await Promise.all(
    uniqueUids.map(
      async uid => {

        if (
          publicProfileCache.has(
            uid
          )
        ) {
          return;
        }


        try {

          const profile =
            await getPublicPlayerProfile(
              uid
            );


          publicProfileCache.set(
            uid,
            profile
          );


        } catch (
          error
        ) {

          console.warn(
            `讀取公開暱稱失敗：${uid}`,
            error
          );


          /*
          Rules 尚未開放時，
          仍以匿名代號顯示，
          不會退回真實姓名。
          */
          publicProfileCache.set(
            uid,
            null
          );
        }
      }
    )
  );
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
      );allScoreRecords =
      snapshot.docs.map(
        documentSnapshot => ({

          id:
            documentSnapshot.id,

          ...documentSnapshot.data()

        })
      );


    

    await loadPublicProfiles(
      allScoreRecords
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
            normalizeGameId(
              record.game ||
              ""
            ) ===
            String(
              game.id
            )
        );


      leaderboardList.appendChild(

        createGameSection(
          game,
          gameRecords
        )

      );
    }
  );
}


/*
==================================================
建立單一遊戲區塊
==================================================
*/


function createGameSection(
  game,
  records
) {

  const section =
    document.createElement(
      "li"
    );


  section.className =
    "leaderboard-game-section";


  /*
  遊戲名稱
  */


  const title =
    document.createElement(
      "h2"
    );


  title.className =
    "leaderboard-game-title";


  title.innerHTML = `

    <span class="leaderboard-game-icon">
      ${game.icon || "🎮"}
    </span>

    <span>
      ${
        getGameDisplayLabel(
          game
        )
      }
    </span>

  `;


  section.appendChild(
    title
  );


  /*
  模式
  */


  const modes =
    getGameModes(
      game.id
    );


  if (
    modes.length > 0
  ) {

    createModeLeaderboard(

      section,
      game,
      records,
      modes

    );

  } else {

    createSingleLeaderboard(

      section,
      game,
      records

    );
  }


  return section;
}


/*
==================================================
單模式排行榜
==================================================
*/


function createSingleLeaderboard(
  section,
  game,
  records
) {

  const heading =
    document.createElement(
      "h3"
    );


  heading.className =
    "leaderboard-single-title";


  heading.textContent =
    getRankingType(
      game.id
    ) === "speed"

      ? "🏁 成績排行榜"

      : "🏆 分數排行榜";


  section.appendChild(
    heading
  );


  const ranking =
    prepareRanking(
      records,
      game.id
    );


  if (
    ranking.length === 0
  ) {

    section.appendChild(

      createEmptyBox(
        "目前尚無成績紀錄。"
      )

    );


    return;
  }


  section.appendChild(

    createRankingList(
      ranking,
      game.id
    )

  );
}


/*
==================================================
多模式排行榜
==================================================
*/


function createModeLeaderboard(
  section,
  game,
  records,
  modes
) {

  const tabs =
    document.createElement(
      "div"
    );


  tabs.className =
    "leaderboard-mode-tabs";


  const contentContainer =
    document.createElement(
      "div"
    );


  contentContainer.className =
    "leaderboard-mode-content-container";


  modes.forEach(
    (
      modeData,
      modeIndex
    ) => {

      /*
      ==============================================
      模式按鈕
      ==============================================
      */


      const tab =
        document.createElement(
          "button"
        );


      tab.type =
        "button";


      tab.className =
        "leaderboard-mode-tab";


      tab.textContent =
        modeData.name;


      if (
        modeIndex === 0
      ) {

        tab.classList.add(
          "active"
        );
      }


      /*
      ==============================================
      模式內容
      ==============================================
      */


      const content =
        document.createElement(
          "div"
        );


      content.className =
        "leaderboard-mode-content";


      content.hidden =
        modeIndex !== 0;


      /*
      模式排行榜標題
      */


      const heading =
        document.createElement(
          "h3"
        );


      heading.className =
        "leaderboard-mode-heading";


      heading.textContent =
        `${modeData.name}排行榜`;


      content.appendChild(
        heading
      );


      /*
      ==============================================
      找出此模式的成績

      String() 可相容：
      mode: 1
      mode: "1"
      ==============================================
      */


      const modeRecords =
        records.filter(
          record =>
            String(
              record.mode ??
              ""
            ) ===
            String(
              modeData.id
            )
        );


      const ranking =
        prepareRanking(
          modeRecords,
          game.id
        );


      if (
        ranking.length === 0
      ) {

        content.appendChild(

          createEmptyBox(
            `${modeData.name}目前尚無成績紀錄。`
          )

        );

      } else {

        content.appendChild(

          createRankingList(
            ranking,
            game.id
          )

        );
      }


      /*
      ==============================================
      點擊模式
      ==============================================
      */


      tab.addEventListener(
        "click",
        () => {

          tabs
            .querySelectorAll(
              ".leaderboard-mode-tab"
            )
            .forEach(
              item => {

                item.classList.remove(
                  "active"
                );
              }
            );


          tab.classList.add(
            "active"
          );


          contentContainer
            .querySelectorAll(
              ".leaderboard-mode-content"
            )
            .forEach(
              item => {

                item.hidden =
                  true;
              }
            );


          content.hidden =
            false;
        }
      );


      tabs.appendChild(
        tab
      );


      contentContainer.appendChild(
        content
      );
    }
  );


  section.append(
    tabs,
    contentContainer
  );
}


/*
==================================================
空排行榜區塊
==================================================
*/


function createEmptyBox(
  text
) {

  const box =
    document.createElement(
      "div"
    );


  box.className =
    "leaderboard-mode-empty";


  box.textContent =
    text;


  return box;
}


/*
==================================================
整理排行榜

同一玩家只留下最佳紀錄
==================================================
*/


function prepareRanking(
  records,
  gameId
) {

  const comparator =
    getRankingType(
      gameId
    ) === "timed"

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
固定題數排行榜

1. 分數高
2. 時間短
3. 答對多
4. 答錯少
5. 最高連擊高
6. 較早完成
==================================================
*/


function compareSpeed(
  a,
  b
) {

  /*
  1. 分數高
  */


  let difference =
    safeNumber(
      b.score
    ) -
    safeNumber(
      a.score
    );


  if (
    difference !== 0
  ) {

    return difference;
  }


  /*
  2. 完成時間短
  */


  difference =
    safePlayTime(
      a.playTime
    ) -
    safePlayTime(
      b.playTime
    );


  if (
    difference !== 0
  ) {

    return difference;
  }


  /*
  3. 答對多
  */


  difference =
    safeNumber(
      b.correctCount
    ) -
    safeNumber(
      a.correctCount
    );


  if (
    difference !== 0
  ) {

    return difference;
  }


  /*
  4. 答錯少
  */


  difference =
    safeNumber(
      a.wrongCount
    ) -
    safeNumber(
      b.wrongCount
    );


  if (
    difference !== 0
  ) {

    return difference;
  }


  /*
  5. 最高連擊高
  */


  difference =
    safeNumber(
      b.maxCombo
    ) -
    safeNumber(
      a.maxCombo
    );


  if (
    difference !== 0
  ) {

    return difference;
  }


  /*
  6. 較早完成
  */


  return (
    timestampToMilliseconds(
      a.createdAt
    ) -
    timestampToMilliseconds(
      b.createdAt
    )
  );
}


/*
==================================================
固定時間排行榜

1. 分數高
2. 答對多
3. 答錯少
4. 最高連擊高
5. 較早完成
==================================================
*/


function compareTimed(
  a,
  b
) {

  /*
  1. 分數高
  */


  let difference =
    safeNumber(
      b.score
    ) -
    safeNumber(
      a.score
    );


  if (
    difference !== 0
  ) {

    return difference;
  }


  /*
  2. 答對多
  */


  difference =
    safeNumber(
      b.correctCount
    ) -
    safeNumber(
      a.correctCount
    );


  if (
    difference !== 0
  ) {

    return difference;
  }


  /*
  3. 答錯少
  */


  difference =
    safeNumber(
      a.wrongCount
    ) -
    safeNumber(
      b.wrongCount
    );


  if (
    difference !== 0
  ) {

    return difference;
  }


  /*
  4. 最高連擊高
  */


  difference =
    safeNumber(
      b.maxCombo
    ) -
    safeNumber(
      a.maxCombo
    );


  if (
    difference !== 0
  ) {

    return difference;
  }


  /*
  5. 較早完成
  */


  return (
    timestampToMilliseconds(
      a.createdAt
    ) -
    timestampToMilliseconds(
      b.createdAt
    )
  );
}


/*
==================================================
建立排行榜清單
==================================================
*/


function createRankingList(
  ranking,
  gameId
) {

  const list =
    document.createElement(
      "ol"
    );


  list.className =
    "leaderboard-ranking-list";


  ranking.forEach(
    (
      record,
      index
    ) => {

      list.appendChild(

        createRankingItem(
          record,
          index + 1,
          gameId
        )

      );
    }
  );


  return list;
}


/*
==================================================
建立排名項目
==================================================
*/


function createRankingItem(
  record,
  rank,
  gameId
) {

  const item =
    document.createElement(
      "li"
    );item.className =
    "leaderboard-item";


  /*
  目前登入玩家
  */


  if (
    currentUser &&
    record.uid &&
    String(
      record.uid
    ) ===
    String(
      currentUser.uid
    )
  ) {

    item.classList.add(
      "current-user"
    );
  }


  /*
  ==============================================
  名次
  ==============================================
  */


  const rankBox =
    document.createElement(
      "div"
    );


  rankBox.className =
    "rank";


  if (
    rank === 1
  ) {

    rankBox.textContent =
      "🥇";

  } else if (
    rank === 2
  ) {

    rankBox.textContent =
      "🥈";

  } else if (
    rank === 3
  ) {

    rankBox.textContent =
      "🥉";

  } else {

    rankBox.textContent =
      String(
        rank
      );
  }


  /*
  ==============================================
  玩家資料
  ==============================================
  */


  const playerBox =
    document.createElement(
      "div"
    );


  playerBox.className =
    "player-info";


  const playerName =
    document.createElement(
      "div"
    );


  playerName.className =
    "player-name";


  playerName.textContent =
    getPlayerName(
      record
    );


  /*
  ==============================================
  詳細資料
  ==============================================
  */


  const details =
    document.createElement(
      "div"
    );


  details.className =
    "record-detail";


  const rankingType =
    getRankingType(
      gameId
    );


  if (
    rankingType === "speed"
  ) {

    details.innerHTML = `

      答對
      <strong>
        ${safeNumber(
          record.correctCount
        )}
      </strong>
      題

      ・

      答錯
      <strong>
        ${safeNumber(
          record.wrongCount
        )}
      </strong>
      題

      ・

      最高連擊
      <strong>
        ${safeNumber(
          record.maxCombo
        )}
      </strong>

      <br>

      ⏱️ 完成時間：

      <span class="leaderboard-play-duration">
        ${formatTime(
          record.playTime
        )}
      </span>

    `;

  } else {

    details.innerHTML = `

      答對
      <strong>
        ${safeNumber(
          record.correctCount
        )}
      </strong>
      題

      ・

      答錯
      <strong>
        ${safeNumber(
          record.wrongCount
        )}
      </strong>
      題

      ・

      最高連擊
      <strong>
        ${safeNumber(
          record.maxCombo
        )}
      </strong>

    `;
  }


  /*
  ==============================================
  完成日期
  ==============================================
  */


  const date =
    document.createElement(
      "div"
    );


  date.className =
    "record-date";


  const dateText =
    formatDate(
      record.createdAt
    );


  date.textContent =
    dateText

      ? `完成日期：${dateText}`

      : "";


  playerBox.append(
    playerName,
    details,
    date
  );


  /*
  ==============================================
  分數
  ==============================================
  */


  const scoreBox =
    document.createElement(
      "div"
    );


  scoreBox.className =
    "score";


  const score =
    Math.round(
      safeNumber(
        record.score
      )
    );


  scoreBox.innerHTML = `

    ${score}

    <div class="score-label">
      分
    </div>

  `;


  item.append(
    rankBox,
    playerBox,
    scoreBox
  );


  return item;
}


/*
==================================================
載入中
==================================================
*/


function setLoading() {

  if (
    loadingMessage
  ) {

    loadingMessage.hidden =
      false;


    loadingMessage.textContent =
      "排行榜載入中……";
  }


  if (
    errorMessage
  ) {

    errorMessage.hidden =
      true;
  }


  if (
    emptyMessage
  ) {

    emptyMessage.hidden =
      true;
  }


  if (
    leaderboardList
  ) {

    leaderboardList.innerHTML =
      "";
  }
}


/*
==================================================
隱藏訊息
==================================================
*/


function hideMessages() {

  if (
    loadingMessage
  ) {

    loadingMessage.hidden =
      true;
  }


  if (
    errorMessage
  ) {

    errorMessage.hidden =
      true;
  }


  if (
    emptyMessage
  ) {

    emptyMessage.hidden =
      true;
  }
}


/*
==================================================
沒有排行榜
==================================================
*/


function showEmpty(
  message
) {

  if (
    loadingMessage
  ) {

    loadingMessage.hidden =
      true;
  }


  if (
    errorMessage
  ) {

    errorMessage.hidden =
      true;
  }


  if (
    emptyMessage
  ) {

    emptyMessage.hidden =
      false;


    emptyMessage.textContent =
      message;
  }


  if (
    leaderboardList
  ) {

    leaderboardList.innerHTML =
      "";
  }
}


/*
==================================================
未登入
==================================================
*/


function showLoginRequired() {

  if (
    userStatus
  ) {

    userStatus.textContent =
      "目前尚未登入，請先回到首頁登入。";
  }


  if (
    loadingMessage
  ) {

    loadingMessage.hidden =
      true;
  }


  if (
    errorMessage
  ) {

    errorMessage.hidden =
      false;


    errorMessage.textContent =
      "請先登入 Google 帳號，才能查看排行榜。";
  }


  if (
    emptyMessage
  ) {

    emptyMessage.hidden =
      true;
  }


  if (
    leaderboardList
  ) {

    leaderboardList.innerHTML =
      "";
  }
}


/*
==================================================
錯誤
==================================================
*/


function showError(
  error
) {

  if (
    loadingMessage
  ) {

    loadingMessage.hidden =
      true;
  }


  if (
    emptyMessage
  ) {

    emptyMessage.hidden =
      true;
  }


  if (
    leaderboardList
  ) {

    leaderboardList.innerHTML =
      "";
  }


  if (
    !errorMessage
  ) {

    return;
  }


  errorMessage.hidden =
    false;


  if (
    error?.code ===
    "permission-denied"
  ) {

    errorMessage.textContent =
      "排行榜讀取權限不足，請確認 Firestore Rules。";


    return;
  }


  if (
    error?.code ===
    "unavailable"
  ) {

    errorMessage.textContent =
      "目前無法連線到排行榜資料，請稍後再試。";


    return;
  }


  errorMessage.textContent =
    `排行榜載入失敗：${
      error?.message ||
      "未知錯誤"
    }`;
}


/*
==================================================
學期切換
==================================================
*/


semesterSelect
  ?.addEventListener(
    "change",
    () => {

      selectedSemester =
        semesterSelect.value;


      selectedGame =
        "all";


      renderSemesterGames();


      if (
        currentUser
      ) {

        renderLeaderboard();
      }
    }
  );


/*
==================================================
Firebase 登入狀態
==================================================
*/


onAuthStateChanged(

  auth,

  async user => {

    currentUser =
      user;


    if (
      !user
    ) {

      showLoginRequired();

      return;
    }


    if (
      userStatus
    ) {

      try {

        const ownPublicProfile =
          await getPublicPlayerProfile(
            user.uid
          );


        publicProfileCache.set(
          user.uid,
          ownPublicProfile
        );


        userStatus.textContent =
          `目前登入：${
            getPublicPlayerName(
              ownPublicProfile,
              user.uid
            )
          }`;


      } catch (
        error
      ) {

        console.warn(
          "讀取目前玩家公開暱稱失敗：",
          error
        );


        userStatus.textContent =
          `目前登入：${
            getPublicPlayerName(
              null,
              user.uid
            )
          }`;
      }
    }


    /*
    先讀取 Firestore。

    如果失敗，
    不再繼續 renderLeaderboard，
    避免錯誤畫面被覆蓋。
    */


    const loaded =
      await loadAllScores();


    if (
      !loaded
    ) {

      return;
    }


    renderLeaderboard();

  },

  error => {

    console.error(
      "Firebase 登入狀態確認失敗：",
      error
    );


    showError(
      error
    );
  }

);


/*
==================================================
初始化
==================================================
*/


try {

  renderSemesterGames();


  console.log(
    "leaderboard.js v9.5 七上3-2新舊模式相容版已成功載入"
  );


  console.log(
    "目前學期：",
    selectedSemester
  );


  console.log(
    "一元一次方程式排行榜模式：",
    getGameModes("equation")
  );

} catch (
  error
) {

  console.error(
    "排行榜初始化失敗：",
    error
  );


  showError(
    error
  );
}
