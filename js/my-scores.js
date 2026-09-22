/*
==================================================
生活有解．心中有數｜我的成績
檔案位置：js/my-scores.js

版本：3.2
學期分類＋模式統計正式版
==================================================

功能：

1. 顯示目前登入玩家

2. 學期篩選：
   - 全部
   - 七上
   - 七下
   - 八上
   - 八下
   - 九上
   - 九下

3. 六項統計會依目前選擇的學期重新計算

4. 各遊戲表現：
   - 先依學期分類
   - 再依遊戲分類
   - 可展開查看各模式表現

5. 最近遊玩紀錄：
   - 顯示學期 Badge
   - 正式遊戲名稱
   - 正式模式名稱
   - 時間、答對、答錯、連擊

6. 舊 Firestore 資料不用搬家
   依 game-config.js 的 semester 自動判斷

7. 相容新版七上 GAME_ID
==================================================
*/


import {
  auth,
  db
} from "./firebase-config.js";


import {
  getGameConfig,
  getGameName,
  getModeName
} from "./game-config.js?v=6.8";


import {
  collection,
  getDocs,
  query,
  where
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

const $ =
  id =>
    document.getElementById(
      id
    );


const userStatus =
  $("userStatus");

const loadingMessage =
  $("loadingMessage");

const errorMessage =
  $("errorMessage");

const emptyMessage =
  $("emptyMessage");

const statsSection =
  $("statsSection");

const semesterFilterSection =
  $("semesterFilterSection");

const semesterFilterBox =
  $("semesterFilterBox");

const statsScopeTitle =
  $("statsScopeTitle");

const semesterEmptyMessage =
  $("semesterEmptyMessage");

const totalGamesElement =
  $("totalGames");

const highestScoreElement =
  $("highestScore");

const averageScoreElement =
  $("averageScore");

const highestComboElement =
  $("highestCombo");

const totalCorrectElement =
  $("totalCorrect");

const totalWrongElement =
  $("totalWrong");

const gameSummaryList =
  $("gameSummaryList");

const historyList =
  $("historyList");


/*
==================================================
學期
==================================================
*/

const SEMESTER_ORDER = [

  "grade7-first",
  "grade7-second",

  "grade8-first",
  "grade8-second",

  "grade9-first",
  "grade9-second"

];


const SEMESTER_META = {

  "grade7-first": {
    name:"七年級上學期",
    short:"七上",
    icon:"7️⃣"
  },

  "grade7-second": {
    name:"七年級下學期",
    short:"七下",
    icon:"7️⃣"
  },

  "grade8-first": {
    name:"八年級上學期",
    short:"八上",
    icon:"8️⃣"
  },

  "grade8-second": {
    name:"八年級下學期",
    short:"八下",
    icon:"8️⃣"
  },

  "grade9-first": {
    name:"九年級上學期",
    short:"九上",
    icon:"9️⃣"
  },

  "grade9-second": {
    name:"九年級下學期",
    short:"九下",
    icon:"9️⃣"
  },

  unknown: {
    name:"未分類紀錄",
    short:"未分類",
    icon:"📦"
  }

};


/*
==================================================
新版遊戲相容資料

用途：
若目前 game-config.js 尚未登記新版七上 ID，
我的成績仍可正確顯示名稱、學期、模式。

之後 game-config.js 有正式資料時，
會優先使用 game-config.js。
==================================================
*/

const FALLBACK_GAME_META = {

  positiveNegative115: {

    name:
      "1-1 正數與負數大挑戰",

    shortName:
      "正數與負數",

    semester:
      "grade7-first",

    grade:
      7,

    order:
      101,

    icon:
      "➕➖",

    ranking:
      {
        type:"timed"
      },

    modes: {

      context:
        "正負數情境判讀",

      numberline:
        "數線定位挑戰",

      compare:
        "數的大小比較",

      opposite:
        "相反數挑戰",

      absolute:
        "絕對值挑戰",

      mixed:
        "1-1 綜合挑戰"

    }

  },


  positiveNegativeAddSubtract: {

    name:
      "1-2 正負數加減大挑戰",

    shortName:
      "正負數加減",

    semester:
      "grade7-first",

    grade:
      7,

    order:
      102,

    icon:
      "➕",

    ranking:
      {
        type:"timed"
      },

    modes: {

      addition:
        "正負數加法",

      subtraction:
        "正負數減法",

      mixed:
        "加減混合",

      smart:
        "靈活計算",

      distance:
        "數線距離應用",

      speed:
        "正負數快手",

      comprehensive:
        "1-2 綜合挑戰"

    }

  },


  positiveNegativeMultiplyDivide: {

    name:
      "1-3 正負數乘除大挑戰",

    shortName:
      "正負數乘除",

    semester:
      "grade7-first",

    grade:
      7,

    order:
      103,

    icon:
      "✖️",

    ranking:
      {
        type:"timed"
      },

    modes: {

      multiplication:
        "正負數乘法",

      chain:
        "連乘挑戰",

      division:
        "正負數除法",

      operations:
        "乘除混合",

      distributive:
        "分配律應用",

      speed:
        "正負數快手",

      comprehensive:
        "1-3 綜合挑戰"

    }

  },


  exponentScientificNotation: {

    name:
      "1-4 指數與科學記號大挑戰",

    shortName:
      "指數與科學記號",

    semester:
      "grade7-first",

    grade:
      7,

    order:
      104,

    icon:
      "🔢",

    ranking:
      {
        type:"timed"
      },

    modes: {

      notation:
        "指數記法",

      negativePower:
        "負數與乘方",

      operations:
        "含乘方的運算",

      tenPower:
        "10 的次方",

      scientific:
        "科學記號",

      scientificCompare:
        "科學記號大小比較",

      speed:
        "指數快手",

      comprehensive:
        "1-4 綜合挑戰"

    }

  },


  primeFactorization115: {

    name:
      "2-1 質因數分解大挑戰",

    shortName:
      "質因數分解",

    semester:
      "grade7-first",

    grade:
      7,

    order:
      105,

    icon:
      "🧩",

    ranking:
      {
        type:"timed"
      },

    modes: {

      factorMultiple:
        "因數、倍數與倍數判別",

      primeComposite:
        "質數、合數與篩法",

      primeFactor:
        "因數與質因數",

      standardForm:
        "質因數分解與標準分解式",

      standardJudge:
        "標準分解式判別因數倍數",

      speed:
        "質因數快手",

      comprehensive:
        "2-1 綜合挑戰"

    }

  }

};


/*
==================================================
狀態
==================================================
*/

let allRecords =
  [];


let selectedSemester =
  "all";


/*
==================================================
取得遊戲資料
==================================================
*/

function getGameMeta(
  gameId
){

  const id =
    String(
      gameId ||
      ""
    );


  const config =
    getGameConfig(
      id
    );


  const fallback =
    FALLBACK_GAME_META[
      id
    ] ||
    {};


  return {

    id,

    name:
      config?.name ||
      fallback.name ||
      getGameName(id) ||
      id ||
      "未知遊戲",

    shortName:
      config?.shortName ||
      fallback.shortName ||
      "",

    semester:
      config?.semester ||
      fallback.semester ||
      "unknown",

    grade:
      config?.grade ||
      fallback.grade ||
      null,

    order:
      Number(
        config?.order ??
        fallback.order ??
        999
      ),

    icon:
      config?.icon ||
      fallback.icon ||
      "🎮",

    modes:
      (
        config?.modes &&
        typeof config.modes ===
          "object"
      )
        ? config.modes
        : (
            fallback.modes ||
            {}
          ),

    ranking:
      config?.ranking ||
      fallback.ranking ||
      {
        type:"speed"
      }

  };
}


/*
==================================================
取得正式遊戲名稱
==================================================
*/

function getDisplayGameName(
  gameId
){

  return getGameMeta(
    gameId
  ).name;
}


/*
==================================================
取得正式模式名稱
==================================================
*/

function getDisplayModeName(
  gameId,
  mode
){

  if (
    mode === undefined ||
    mode === null ||
    mode === ""
  ){
    return "";
  }


  const meta =
    getGameMeta(
      gameId
    );


  const modeKey =
    String(mode);


  if (
    meta.modes &&
    meta.modes[
      modeKey
    ]
  ){
    return meta.modes[
      modeKey
    ];
  }


  const configName =
    getModeName(
      gameId,
      modeKey
    );


  if (
    configName &&
    configName !==
      modeKey
  ){
    return configName;
  }


  return modeKey;
}


/*
==================================================
是否為多模式遊戲
==================================================
*/

function isMultiModeGame(
  gameId
){

  return (
    Object.keys(
      getGameMeta(
        gameId
      ).modes ||
      {}
    ).length >
    1
  );
}


/*
==================================================
紀錄所屬學期
==================================================
*/

function getRecordSemester(
  record
){

  const storedSemester =
    String(
      record?.semester ||
      ""
    );


  if (
    SEMESTER_META[
      storedSemester
    ]
  ){
    return storedSemester;
  }


  const metaSemester =
    getGameMeta(
      record?.game
    ).semester;


  if (
    SEMESTER_META[
      metaSemester
    ]
  ){
    return metaSemester;
  }


  return "unknown";
}


/*
==================================================
學期名稱
==================================================
*/

function getSemesterName(
  semester
){

  return (
    SEMESTER_META[
      semester
    ]?.name ||
    "未分類紀錄"
  );
}


function getSemesterShortName(
  semester
){

  return (
    SEMESTER_META[
      semester
    ]?.short ||
    "未分類"
  );
}


/*
==================================================
安全數字
==================================================
*/

function toSafeNumber(
  value
){

  const number =
    Number(value);


  return Number.isFinite(
    number
  )
    ? number
    : 0;
}


/*
==================================================
分數顯示
==================================================
*/

function formatScore(
  value
){

  const score =
    toSafeNumber(
      value
    );


  if (
    Number.isInteger(
      score
    )
  ){
    return String(
      score
    );
  }


  return score.toFixed(
    1
  );
}


/*
==================================================
登入
==================================================
*/

onAuthStateChanged(

  auth,

  async user => {

    if (!user){

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


  error => {

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
登入玩家
==================================================
*/

function renderUser(
  user
){

  if (!userStatus){
    return;
  }


  userStatus.innerHTML =
    "";


  if (
    user.photoURL
  ){

    const image =
      document.createElement(
        "img"
      );


    image.className =
      "user-photo";


    image.src =
      user.photoURL;


    image.alt =
      "玩家頭像";


    userStatus.appendChild(
      image
    );
  }


  const name =
    document.createElement(
      "span"
    );


  name.textContent =
    `目前登入：${
      user.displayName ||
      user.email ||
      "玩家"
    }`;


  userStatus.appendChild(
    name
  );
}


/*
==================================================
讀取 Firestore
==================================================
*/

async function loadMyScores(
  uid
){

  setLoadingState();


  try{

    const snapshot =
      await getDocs(

        query(

          collection(
            db,
            "scores"
          ),

          where(
            "uid",
            "==",
            uid
          )

        )

      );


    const records =
      snapshot.docs.map(
        documentSnapshot => ({

          id:
            documentSnapshot.id,

          ...documentSnapshot.data()

        })
      );


    records.sort(
      (
        a,
        b
      ) =>

        getTimestampMilliseconds(
          b.createdAt
        )
        -
        getTimestampMilliseconds(
          a.createdAt
        )
    );


    renderMyScores(
      records
    );


  }catch(
    error
  ){

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
主畫面
==================================================
*/

function renderMyScores(
  records
){

  if (
    loadingMessage
  ){
    loadingMessage.hidden =
      true;
  }


  if (
    errorMessage
  ){
    errorMessage.hidden =
      true;
  }


  if (
    !records.length
  ){

    if (
      emptyMessage
    ){
      emptyMessage.hidden =
        false;
    }


    if (
      semesterFilterSection
    ){
      semesterFilterSection.hidden =
        true;
    }


    if (
      statsSection
    ){
      statsSection.style.display =
        "none";
    }


    return;
  }


  allRecords =
    records;


  if (
    emptyMessage
  ){
    emptyMessage.hidden =
      true;
  }


  if (
    semesterFilterSection
  ){
    semesterFilterSection.hidden =
      false;
  }


  if (
    statsSection
  ){
    statsSection.style.display =
      "block";
  }


  renderSemesterFilters();


  renderDashboard();
}


/*
==================================================
學期篩選
==================================================
*/

function renderSemesterFilters(){

  if (
    !semesterFilterBox
  ){
    return;
  }


  semesterFilterBox.innerHTML =
    "";


  const semesterCounts =
    {};


  SEMESTER_ORDER.forEach(
    semester => {

      semesterCounts[
        semester
      ] =
        allRecords.filter(
          record =>
            getRecordSemester(
              record
            ) ===
            semester
        ).length;
    }
  );


  const filters = [

    {
      id:"all",
      label:"全部",
      count:
        allRecords.length
    },

    ...SEMESTER_ORDER.map(
      semester => ({

        id:
          semester,

        label:
          getSemesterShortName(
            semester
          ),

        count:
          semesterCounts[
            semester
          ] ||
          0

      })
    )

  ];


  filters.forEach(
    filter => {

      const button =
        document.createElement(
          "button"
        );


      button.type =
        "button";


      button.className =
        "semester-filter-button";


      if (
        selectedSemester ===
        filter.id
      ){
        button.classList.add(
          "active"
        );
      }


      button.innerHTML = `

        <span>
          ${filter.label}
        </span>

        <span class="semester-filter-count">
          ${filter.count}
        </span>
      `;


      button.addEventListener(
        "click",
        () => {

          selectedSemester =
            filter.id;


          renderSemesterFilters();


          renderDashboard();
        }
      );


      semesterFilterBox.appendChild(
        button
      );
    }
  );
}


/*
==================================================
依學期篩選紀錄
==================================================
*/

function getFilteredRecords(){

  if (
    selectedSemester ===
    "all"
  ){
    return [
      ...allRecords
    ];
  }


  return allRecords.filter(
    record =>

      getRecordSemester(
        record
      ) ===
      selectedSemester
  );
}


/*
==================================================
重畫目前學期
==================================================
*/

function renderDashboard(){

  const records =
    getFilteredRecords();


  if (
    statsScopeTitle
  ){

    statsScopeTitle.textContent =
      selectedSemester ===
      "all"

        ? "全部學期統計"

        : `${
            getSemesterName(
              selectedSemester
            )
          }統計`;
  }


  if (
    semesterEmptyMessage
  ){

    semesterEmptyMessage.hidden =
      records.length >
      0;


    semesterEmptyMessage.textContent =
      selectedSemester ===
      "all"

        ? "目前尚無成績紀錄。"

        : `${
            getSemesterName(
              selectedSemester
            )
          }目前尚無成績紀錄。`;
  }


  renderStatistics(
    records
  );


  renderGameSummary(
    records
  );


  renderHistory(
    records
  );
}


/*
==================================================
統計
==================================================
*/

function calculateStatistics(
  records
){

  const totalGames =
    records.length;


  const totalScore =
    records.reduce(
      (
        total,
        record
      ) =>

        total +
        toSafeNumber(
          record.score
        ),
      0
    );


  const highestScore =
    records.reduce(
      (
        highest,
        record
      ) =>

        Math.max(
          highest,
          toSafeNumber(
            record.score
          )
        ),
      0
    );


  const highestCombo =
    records.reduce(
      (
        highest,
        record
      ) =>

        Math.max(
          highest,
          toSafeNumber(
            record.maxCombo
          )
        ),
      0
    );


  const totalCorrect =
    records.reduce(
      (
        total,
        record
      ) =>

        total +
        toSafeNumber(
          record.correctCount
        ),
      0
    );


  const totalWrong =
    records.reduce(
      (
        total,
        record
      ) =>

        total +
        toSafeNumber(
          record.wrongCount
        ),
      0
    );


  const averageScore =
    totalGames
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
統計卡
==================================================
*/

function renderStatistics(
  records
){

  const statistics =
    calculateStatistics(
      records
    );


  totalGamesElement.textContent =
    statistics.totalGames;


  highestScoreElement.textContent =
    formatScore(
      statistics.highestScore
    );


  averageScoreElement.textContent =
    formatScore(
      statistics.averageScore
    );


  highestComboElement.textContent =
    statistics.highestCombo;


  totalCorrectElement.textContent =
    statistics.totalCorrect;


  totalWrongElement.textContent =
    statistics.totalWrong;
}


/*
==================================================
各遊戲表現
==================================================
*/

function renderGameSummary(
  records
){

  if (
    !gameSummaryList
  ){
    return;
  }


  gameSummaryList.innerHTML =
    "";


  if (
    !records.length
  ){

    gameSummaryList.innerHTML = `

      <div class="section-empty">
        這個學期目前沒有遊戲成績。
      </div>
    `;

    return;
  }


  const semesterGroups =
    {};


  records.forEach(
    record => {

      const semester =
        getRecordSemester(
          record
        );


      if (
        !semesterGroups[
          semester
        ]
      ){
        semesterGroups[
          semester
        ] =
          [];
      }


      semesterGroups[
        semester
      ].push(
        record
      );
    }
  );


  const semesterOrder =
    selectedSemester ===
    "all"

      ? [
          ...SEMESTER_ORDER,
          "unknown"
        ]

      : [
          selectedSemester
        ];


  semesterOrder.forEach(
    semester => {

      const semesterRecords =
        semesterGroups[
          semester
        ];


      if (
        !semesterRecords?.length
      ){
        return;
      }


      gameSummaryList.appendChild(
        createSemesterGroup(
          semester,
          semesterRecords
        )
      );
    }
  );
}


/*
==================================================
學期群組
==================================================
*/

function createSemesterGroup(
  semester,
  records
){

  const details =
    document.createElement(
      "details"
    );


  details.className =
    "semester-group";


  details.open =
    true;


  const summary =
    document.createElement(
      "summary"
    );


  summary.className =
    "semester-group-header";


  summary.innerHTML = `

    <span
      class="
        semester-badge
        semester-${semester}
      "
    >
      ${getSemesterShortName(
        semester
      )}
    </span>

    <span class="semester-group-title">

      ${getSemesterName(
        semester
      )}

    </span>

    <span class="semester-group-count">

      ${records.length}
      次紀錄

    </span>
  `;


  const body =
    document.createElement(
      "div"
    );


  body.className =
    "semester-group-body";


  const gameGroups =
    {};


  records.forEach(
    record => {

      const gameId =
        String(
          record.game ||
          "unknown"
        );


      if (
        !gameGroups[
          gameId
        ]
      ){
        gameGroups[
          gameId
        ] =
          [];
      }


      gameGroups[
        gameId
      ].push(
        record
      );
    }
  );


  const gameIds =
    Object.keys(
      gameGroups
    );


  gameIds.sort(
    (
      a,
      b
    ) => {

      const metaA =
        getGameMeta(
          a
        );


      const metaB =
        getGameMeta(
          b
        );


      if (
        metaA.order !==
        metaB.order
      ){
        return (
          metaA.order -
          metaB.order
        );
      }


      return metaA.name.localeCompare(
        metaB.name,
        "zh-TW"
      );
    }
  );


  gameIds.forEach(
    gameId => {

      body.appendChild(
        createGameCard(
          gameId,
          gameGroups[
            gameId
          ],
          semester
        )
      );
    }
  );


  details.append(
    summary,
    body
  );


  return details;
}


/*
==================================================
遊戲卡
==================================================
*/

function createGameCard(
  gameId,
  records,
  semester
){

  const meta =
    getGameMeta(
      gameId
    );


  const statistics =
    calculateStatistics(
      records
    );


  const card =
    document.createElement(
      "article"
    );


  card.className =
    "game-performance-card";


  const main =
    document.createElement(
      "div"
    );


  main.className =
    "game-performance-main";


  const titleArea =
    document.createElement(
      "div"
    );


  titleArea.className =
    "game-performance-title-area";


  const badge =
    document.createElement(
      "span"
    );


  badge.className =
    `semester-badge semester-${semester}`;


  badge.textContent =
    getSemesterShortName(
      semester
    );


  const title =
    document.createElement(
      "div"
    );


  title.className =
    "game-title";


  title.textContent =
    `${meta.icon} ${meta.name}`;


  titleArea.append(
    badge,
    title
  );


  main.append(
    titleArea,
    createGameStatistic(
      statistics.totalGames,
      "遊玩次數"
    ),
    createGameStatistic(
      statistics.highestScore,
      "最高分"
    ),
    createGameStatistic(
      statistics.averageScore,
      "平均分"
    )
  );


  card.appendChild(
    main
  );


  if (
    isMultiModeGame(
      gameId
    )
  ){

    const modeDetails =
      createModeDetails(
        gameId,
        records
      );


    if (
      modeDetails
    ){
      card.appendChild(
        modeDetails
      );
    }
  }


  return card;
}


/*
==================================================
遊戲統計欄
==================================================
*/

function createGameStatistic(
  value,
  label
){

  const wrapper =
    document.createElement(
      "div"
    );


  wrapper.className =
    "game-stat";


  const valueElement =
    document.createElement(
      "div"
    );


  valueElement.className =
    "game-stat-value";


  valueElement.textContent =
    formatScore(
      value
    );


  const labelElement =
    document.createElement(
      "div"
    );


  labelElement.className =
    "game-stat-label";


  labelElement.textContent =
    label;


  wrapper.append(
    valueElement,
    labelElement
  );


  return wrapper;
}


/*
==================================================
模式統計
==================================================
*/

function createModeDetails(
  gameId,
  records
){

  const modeGroups =
    {};


  records.forEach(
    record => {

      const mode =
        String(
          record.mode ??
          ""
        );


      if (!mode){
        return;
      }


      if (
        !modeGroups[
          mode
        ]
      ){
        modeGroups[
          mode
        ] =
          [];
      }


      modeGroups[
        mode
      ].push(
        record
      );
    }
  );


  const modeIds =
    Object.keys(
      modeGroups
    );


  if (
    !modeIds.length
  ){
    return null;
  }


  const meta =
    getGameMeta(
      gameId
    );


  const configuredModes =
    Object.keys(
      meta.modes ||
      {}
    );


  const orderedModes = [

    ...configuredModes.filter(
      mode =>
        modeGroups[
          mode
        ]
    ),

    ...modeIds.filter(
      mode =>
        !configuredModes.includes(
          mode
        )
    )

  ];


  const details =
    document.createElement(
      "details"
    );


  details.className =
    "mode-details";


  const summary =
    document.createElement(
      "summary"
    );


  summary.textContent =
    `查看各模式紀錄（${orderedModes.length}）`;


  const list =
    document.createElement(
      "div"
    );


  list.className =
    "mode-stat-list";


  orderedModes.forEach(
    modeId => {

      const modeRecords =
        modeGroups[
          modeId
        ];


      const statistics =
        calculateStatistics(
          modeRecords
        );


      const row =
        document.createElement(
          "div"
        );


      row.className =
        "mode-stat-row";


      row.innerHTML = `

        <div class="mode-stat-name">

          ${
            getDisplayModeName(
              gameId,
              modeId
            )
          }

        </div>


        <div class="mode-stat-data">

          <span>
            ${statistics.totalGames}
            次
          </span>

          <span>
            最高
            <strong>
              ${formatScore(
                statistics.highestScore
              )}
            </strong>
          </span>

          <span>
            平均
            <strong>
              ${formatScore(
                statistics.averageScore
              )}
            </strong>
          </span>

        </div>
      `;


      list.appendChild(
        row
      );
    }
  );


  details.append(
    summary,
    list
  );


  return details;
}


/*
==================================================
最近遊玩紀錄
==================================================
*/

function renderHistory(
  records
){

  if (
    !historyList
  ){
    return;
  }


  historyList.innerHTML =
    "";


  if (
    !records.length
  ){

    historyList.innerHTML = `

      <li class="section-empty">
        這個學期目前沒有最近遊玩紀錄。
      </li>
    `;

    return;
  }


  records
    .slice(
      0,
      10
    )
    .forEach(
      record => {

        historyList.appendChild(
          createHistoryItem(
            record
          )
        );
      }
    );
}


/*
==================================================
單筆歷史紀錄
==================================================
*/

function createHistoryItem(
  record
){

  const semester =
    getRecordSemester(
      record
    );


  const gameId =
    String(
      record.game ||
      ""
    );


  const item =
    document.createElement(
      "li"
    );


  item.className =
    "history-item";


  const information =
    document.createElement(
      "div"
    );


  information.className =
    "history-info";


  const top =
    document.createElement(
      "div"
    );


  top.className =
    "history-title-row";


  const badge =
    document.createElement(
      "span"
    );


  badge.className =
    `semester-badge semester-${semester}`;


  badge.textContent =
    getSemesterShortName(
      semester
    );


  const gameName =
    document.createElement(
      "div"
    );


  gameName.className =
    "history-game";


  gameName.textContent =
    `${
      getGameMeta(
        gameId
      ).icon
    } ${
      getDisplayGameName(
        gameId
      )
    }`;


  top.append(
    badge,
    gameName
  );


  information.appendChild(
    top
  );


  const modeText =
    getDisplayModeName(
      gameId,
      record.mode
    );


  const basicDetails =
    document.createElement(
      "div"
    );


  basicDetails.className =
    "history-detail";


  basicDetails.textContent =
    formatDate(
      record.createdAt
    );


  information.appendChild(
    basicDetails
  );


  if (
    modeText
  ){

    const modeLine =
      document.createElement(
        "div"
      );


    modeLine.className =
      "history-detail history-mode";


    modeLine.textContent =
      `模式：${modeText}`;


    information.appendChild(
      modeLine
    );
  }


  const performance =
    document.createElement(
      "div"
    );


  performance.className =
    "history-detail history-performance";


  const performanceParts = [

    `✅ 答對 ${
      toSafeNumber(
        record.correctCount
      )
    } 題`,

    `❌ 答錯 ${
      toSafeNumber(
        record.wrongCount
      )
    } 題`

  ];


  const combo =
    toSafeNumber(
      record.maxCombo
    );


  if (
    combo >
    0
  ){

    performanceParts.push(
      `🔥 最高連擊 ${combo}`
    );
  }


  performance.textContent =
    performanceParts.join(
      "｜"
    );


  information.appendChild(
    performance
  );


  const playTime =
    getPlayTime(
      record
    );


  if (
    Number.isFinite(
      playTime
    )
  ){

    const time =
      document.createElement(
        "div"
      );


    time.className =
      "history-detail history-time";


    time.textContent =
      `⏱ 完成時間：${
        formatPlayTime(
          playTime
        )
      }`;


    information.appendChild(
      time
    );
  }


  const scoreElement =
    document.createElement(
      "div"
    );


  scoreElement.className =
    "history-score";


  scoreElement.innerHTML = `

    <div>
      ${formatScore(
        record.score
      )}
    </div>

    <div class="history-score-label">
      分
    </div>
  `;


  item.append(
    information,
    scoreElement
  );


  return item;
}


/*
==================================================
playTime
==================================================
*/

function getPlayTime(
  record
){

  const value =
    Number(
      record?.playTime
    );


  if (
    Number.isFinite(
      value
    )
    &&
    value >=
    0
  ){

    return value;
  }


  return Number.POSITIVE_INFINITY;
}


/*
==================================================
時間
==================================================
*/

function formatPlayTime(
  seconds
){

  const safeSeconds =
    Math.max(
      0,
      Math.round(
        toSafeNumber(
          seconds
        )
      )
    );


  if (
    safeSeconds <
    60
  ){

    return `${safeSeconds} 秒`;
  }


  const minutes =
    Math.floor(
      safeSeconds /
      60
    );


  const remainingSeconds =
    safeSeconds %
    60;


  if (
    remainingSeconds ===
    0
  ){

    return `${minutes} 分`;
  }


  return (
    `${minutes} 分 ` +
    `${remainingSeconds} 秒`
  );
}


/*
==================================================
Timestamp
==================================================
*/

function getTimestampMilliseconds(
  timestamp
){

  if (!timestamp){
    return 0;
  }


  try{

    if (
      typeof timestamp.toMillis ===
      "function"
    ){

      return timestamp.toMillis();
    }


    if (
      typeof timestamp.toDate ===
      "function"
    ){

      return timestamp
        .toDate()
        .getTime();
    }


    if (
      timestamp.seconds !==
      undefined
    ){

      return (
        Number(
          timestamp.seconds
        ) *
        1000
      );
    }


    const time =
      new Date(
        timestamp
      ).getTime();


    return Number.isFinite(
      time
    )
      ? time
      : 0;


  }catch(
    error
  ){

    console.warn(
      "時間轉換失敗：",
      error
    );


    return 0;
  }
}


/*
==================================================
日期格式
==================================================
*/

function formatDate(
  timestamp
){

  if (!timestamp){
    return "時間未記錄";
  }


  try{

    let date;


    if (
      typeof timestamp.toDate ===
      "function"
    ){

      date =
        timestamp.toDate();


    }else if (
      timestamp.seconds !==
      undefined
    ){

      date =
        new Date(
          Number(
            timestamp.seconds
          ) *
          1000
        );


    }else{

      date =
        new Date(
          timestamp
        );
    }


    if (
      Number.isNaN(
        date.getTime()
      )
    ){

      return "時間格式錯誤";
    }


    return new Intl.DateTimeFormat(
      "zh-TW",
      {

        year:"numeric",

        month:"2-digit",

        day:"2-digit",

        hour:"2-digit",

        minute:"2-digit",

        hour12:false

      }
    ).format(
      date
    );


  }catch(
    error
  ){

    console.warn(
      "日期格式轉換失敗：",
      error
    );


    return "時間格式錯誤";
  }
}


/*
==================================================
載入狀態
==================================================
*/

function setLoadingState(){

  if (
    loadingMessage
  ){
    loadingMessage.hidden =
      false;
  }


  if (
    errorMessage
  ){
    errorMessage.hidden =
      true;
  }


  if (
    emptyMessage
  ){
    emptyMessage.hidden =
      true;
  }


  if (
    semesterFilterSection
  ){
    semesterFilterSection.hidden =
      true;
  }


  if (
    statsSection
  ){
    statsSection.style.display =
      "none";
  }
}


/*
==================================================
未登入
==================================================
*/

function showLoginRequiredMessage(){

  if (
    userStatus
  ){

    userStatus.textContent =
      "目前尚未登入，請先回到首頁登入 Google 帳號。";
  }


  if (
    loadingMessage
  ){
    loadingMessage.hidden =
      true;
  }


  if (
    emptyMessage
  ){
    emptyMessage.hidden =
      true;
  }


  if (
    semesterFilterSection
  ){
    semesterFilterSection.hidden =
      true;
  }


  if (
    statsSection
  ){
    statsSection.style.display =
      "none";
  }


  if (
    errorMessage
  ){

    errorMessage.hidden =
      false;


    errorMessage.textContent =
      "請先登入 Google 帳號，才能查看自己的成績。";
  }
}


/*
==================================================
錯誤
==================================================
*/

function showError(
  error
){

  if (
    loadingMessage
  ){
    loadingMessage.hidden =
      true;
  }


  if (
    emptyMessage
  ){
    emptyMessage.hidden =
      true;
  }


  if (
    semesterFilterSection
  ){
    semesterFilterSection.hidden =
      true;
  }


  if (
    statsSection
  ){
    statsSection.style.display =
      "none";
  }


  if (
    !errorMessage
  ){
    return;
  }


  errorMessage.hidden =
    false;


  if (
    error?.code ===
    "permission-denied"
  ){

    errorMessage.textContent =
      "目前沒有讀取個人成績的權限，請確認 Firestore Rules。";


    return;
  }


  errorMessage.textContent =
    `個人成績載入失敗：${
      error?.message ||
      "未知錯誤"
    }`;
}


console.log(
  "my-scores.js v3.2 已成功載入"
);
