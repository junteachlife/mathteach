/*
==================================================
生活有解．心中有數｜遊戲排行榜
檔案位置：js/leaderboard.js

版本：8.4
九上正式排行榜同步版
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
} from "./game-config.js?v=6.8";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


"use strict";


const $ =
  id =>
    document.getElementById(
      id
    );


const userStatus =
  $("userStatus");

const semesterSelect =
  $("semesterSelect");

const filterTitle =
  $("filterTitle");

const filterBox =
  $("filterBox");

const loadingMessage =
  $("loadingMessage");

const errorMessage =
  $("errorMessage");

const emptyMessage =
  $("emptyMessage");

const leaderboardList =
  $("leaderboardList");


const LEADERBOARD_LIMIT =
  20;


const SEMESTER_NAMES = {

  "grade7-first":
    "七年級上學期",

  "grade7-second":
    "七年級下學期",

  "grade8-first":
    "八年級上學期",

  "grade8-second":
    "八年級下學期",

  "grade9-first":
    "九年級上學期",

  "grade9-second":
    "九年級下學期"
};


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


let currentUser =
  null;

let selectedSemester =
  semesterSelect?.value ||
  "grade7-first";

let selectedGame =
  "all";

let allScoreRecords =
  [];


function safeNumber(
  value,
  fallback = 0
){

  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
}


function safePlayTime(
  value
){

  const number =
    Number(value);

  if (
    !Number.isFinite(number) ||
    number < 0
  ){
    return Number.MAX_SAFE_INTEGER;
  }

  return number;
}


function formatTime(
  seconds
){

  const value =
    Math.max(
      0,
      Math.round(
        safeNumber(
          seconds
        )
      )
    );

  const minutes =
    Math.floor(
      value / 60
    );

  const remain =
    value % 60;

  return (
    `${String(minutes).padStart(2,"0")}:` +
    `${String(remain).padStart(2,"0")}`
  );
}


function timestampToMilliseconds(
  value
){

  if (!value){
    return 0;
  }

  if (
    typeof value.toMillis ===
    "function"
  ){
    return value.toMillis();
  }

  if (
    value.seconds !==
    undefined
  ){
    return (
      Number(
        value.seconds
      ) *
      1000
    );
  }

  const time =
    new Date(value)
      .getTime();

  return Number.isFinite(time)
    ? time
    : 0;
}


function formatDate(
  value
){

  const time =
    timestampToMilliseconds(
      value
    );

  if (!time){
    return "";
  }

  try{

    return new Date(time)
      .toLocaleDateString(
        "zh-TW",
        {
          year:"numeric",
          month:"2-digit",
          day:"2-digit"
        }
      );

  }catch(error){

    console.warn(
      "日期格式轉換失敗：",
      error
    );

    return "";
  }
}


function getPlayerName(
  record
){
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
){
  return (
    record.uid ||
    record.email ||
    getPlayerName(record)
  );
}


function getRankingType(
  gameId
){

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


function getCurrentSemesterGames(){

  try{

    return (
      getGamesBySemester(
        selectedSemester
      ) || []
    ).filter(
      game =>
        game &&
        game.finished === true
    );

  }catch(error){

    console.error(
      "取得學期遊戲失敗：",
      error
    );

    return [];
  }
}


function getGameModes(
  gameId
){

  const game =
    getGameConfig(
      gameId
    );

  const modes =
    game?.modes;

  if (
    !modes ||
    typeof modes !==
      "object"
  ){
    return [];
  }

  return Object.entries(
    modes
  )
    .map(
      ([rawId,rawName]) => {

        const modeId =
          String(rawId);

        if (
          String(gameId) ===
          "equation"
        ){
          return {
            id:modeId,
            name:
              EQUATION_MODE_NAMES[
                modeId
              ] ||
              String(rawName)
          };
        }

        return {
          id:modeId,
          name:String(rawName)
        };
      }
    );
}


function createFilterButton({
  gameId,
  label,
  all = false
}){

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

  if (all){
    button.classList.add(
      "all-button"
    );
  }

  if (
    selectedGame ===
    gameId
  ){
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
          item =>
            item.classList.remove(
              "active"
            )
        );

      button.classList.add(
        "active"
      );

      if (currentUser){
        renderLeaderboard();
      }
    }
  );

  return button;
}


function renderSemesterGames(){

  if (!filterBox){
    return;
  }

  filterBox.innerHTML =
    "";

  const semesterName =
    SEMESTER_NAMES[
      selectedSemester
    ] ||
    "數學遊戲";

  if (filterTitle){
    filterTitle.textContent =
      `${semesterName}排行榜`;
  }

  filterBox.appendChild(
    createFilterButton({
      gameId:"all",
      label:
        `📚 ${semesterName}全部遊戲`,
      all:true
    })
  );

  getCurrentSemesterGames()
    .forEach(
      game => {

        filterBox.appendChild(
          createFilterButton({
            gameId:game.id,
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


async function loadAllScores(){

  setLoading();

  try{

    const snapshot =
      await getDocs(
        collection(
          db,
          "scores"
        )
      );

    allScoreRecords =
      snapshot.docs
        .map(
          doc => ({
            id:doc.id,
            ...doc.data()
          })
        );

    console.log(
      "排行榜成績載入完成：",
      allScoreRecords.length
    );

    return true;

  }catch(error){

    console.error(
      "排行榜讀取失敗：",
      error
    );

    allScoreRecords =
      [];

    showError(error);

    return false;
  }
}


function renderLeaderboard(){

  if (!currentUser){

    showLoginRequired();

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
            String(game.id) ===
            String(selectedGame)
        );

  if (!games.length){

    showEmpty(
      "目前沒有已正式開放的排行榜項目。"
    );

    return;
  }

  games.forEach(
    game => {

      const records =
        allScoreRecords.filter(
          record =>
            String(
              record.game || ""
            ) ===
            String(game.id)
        );

      leaderboardList
        .appendChild(
          createGameSection(
            game,
            records
          )
        );
    }
  );
}


function createGameSection(
  game,
  records
){

  const section =
    document.createElement(
      "li"
    );

  section.className =
    "leaderboard-game-section";

  const title =
    document.createElement(
      "h2"
    );

  title.className =
    "leaderboard-game-title";

  title.innerHTML =
    `<span class="leaderboard-game-icon">
      ${game.icon || "🎮"}
    </span>
    <span>
      ${
        game.name ||
        getGameName(game.id)
      }
    </span>`;

  section.appendChild(title);

  const modes =
    getGameModes(
      game.id
    );

  if (modes.length){

    createModeLeaderboard(
      section,
      game,
      records,
      modes
    );

  }else{

    createSingleLeaderboard(
      section,
      game,
      records
    );
  }

  return section;
}


function createSingleLeaderboard(
  section,
  game,
  records
){

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

  if (!ranking.length){

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


function createModeLeaderboard(
  section,
  game,
  records,
  modes
){

  const tabs =
    document.createElement(
      "div"
    );

  tabs.className =
    "leaderboard-mode-tabs";

  const container =
    document.createElement(
      "div"
    );

  container.className =
    "leaderboard-mode-content-container";

  modes.forEach(
    (modeData,index) => {

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

      if (index === 0){
        tab.classList.add(
          "active"
        );
      }

      const content =
        document.createElement(
          "div"
        );

      content.className =
        "leaderboard-mode-content";

      content.hidden =
        index !== 0;

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

      const modeRecords =
        records.filter(
          record =>
            String(
              record.mode ?? ""
            ) ===
            String(modeData.id)
        );

      const ranking =
        prepareRanking(
          modeRecords,
          game.id
        );

      if (!ranking.length){

        content.appendChild(
          createEmptyBox(
            `${modeData.name}目前尚無成績紀錄。`
          )
        );

      }else{

        content.appendChild(
          createRankingList(
            ranking,
            game.id
          )
        );
      }

      tab.addEventListener(
        "click",
        () => {

          tabs
            .querySelectorAll(
              ".leaderboard-mode-tab"
            )
            .forEach(
              item =>
                item.classList.remove(
                  "active"
                )
            );

          tab.classList.add(
            "active"
          );

          container
            .querySelectorAll(
              ".leaderboard-mode-content"
            )
            .forEach(
              item =>
                item.hidden = true
            );

          content.hidden =
            false;
        }
      );

      tabs.appendChild(tab);

      container.appendChild(
        content
      );
    }
  );

  section.append(
    tabs,
    container
  );
}


function createEmptyBox(
  message
){

  const box =
    document.createElement(
      "div"
    );

  box.className =
    "leaderboard-mode-empty";

  box.textContent =
    message;

  return box;
}


function compareSpeed(a,b){

  let difference =
    safeNumber(b.score) -
    safeNumber(a.score);

  if (difference){
    return difference;
  }

  difference =
    safePlayTime(
      a.playTime
    ) -
    safePlayTime(
      b.playTime
    );

  if (difference){
    return difference;
  }

  difference =
    safeNumber(
      b.correctCount
    ) -
    safeNumber(
      a.correctCount
    );

  if (difference){
    return difference;
  }

  difference =
    safeNumber(
      a.wrongCount
    ) -
    safeNumber(
      b.wrongCount
    );

  if (difference){
    return difference;
  }

  difference =
    safeNumber(
      b.maxCombo
    ) -
    safeNumber(
      a.maxCombo
    );

  if (difference){
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


function compareTimed(a,b){

  let difference =
    safeNumber(b.score) -
    safeNumber(a.score);

  if (difference){
    return difference;
  }

  difference =
    safeNumber(
      b.correctCount
    ) -
    safeNumber(
      a.correctCount
    );

  if (difference){
    return difference;
  }

  difference =
    safeNumber(
      a.wrongCount
    ) -
    safeNumber(
      b.wrongCount
    );

  if (difference){
    return difference;
  }

  difference =
    safeNumber(
      b.maxCombo
    ) -
    safeNumber(
      a.maxCombo
    );

  if (difference){
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
){

  const comparator =
    getRankingType(
      gameId
    ) === "timed"
      ? compareTimed
      : compareSpeed;

  const sorted =
    [...records]
      .sort(comparator);

  const players =
    new Map();

  sorted.forEach(
    record => {

      const key =
        getPlayerKey(
          record
        );

      if (!players.has(key)){
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
    .sort(comparator)
    .slice(
      0,
      LEADERBOARD_LIMIT
    );
}


function createRankingList(
  ranking,
  gameId
){

  const list =
    document.createElement(
      "ol"
    );

  list.className =
    "leaderboard-ranking-list";

  ranking.forEach(
    (record,index) => {

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


function createRankingItem(
  record,
  rank,
  gameId
){

  const item =
    document.createElement(
      "li"
    );

  item.className =
    "leaderboard-item";

  if (
    currentUser &&
    record.uid &&
    String(record.uid) ===
    String(currentUser.uid)
  ){
    item.classList.add(
      "current-user"
    );
  }

  const rankBox =
    document.createElement(
      "div"
    );

  rankBox.className =
    "rank";

  rankBox.textContent =
    rank === 1
      ? "🥇"
      : rank === 2
        ? "🥈"
        : rank === 3
          ? "🥉"
          : String(rank);

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
    getPlayerName(record);

  const details =
    document.createElement(
      "div"
    );

  details.className =
    "record-detail";

  if (
    getRankingType(
      gameId
    ) === "speed"
  ){

    details.innerHTML =
      `答對 <strong>${
        safeNumber(
          record.correctCount
        )
      }</strong> 題
      ・答錯 <strong>${
        safeNumber(
          record.wrongCount
        )
      }</strong> 題
      ・最高連擊 <strong>${
        safeNumber(
          record.maxCombo
        )
      }</strong>
      <br>
      ⏱️ 完成時間：
      <span class="leaderboard-play-duration">
        ${formatTime(
          record.playTime
        )}
      </span>`;

  }else{

    details.innerHTML =
      `答對 <strong>${
        safeNumber(
          record.correctCount
        )
      }</strong> 題
      ・答錯 <strong>${
        safeNumber(
          record.wrongCount
        )
      }</strong> 題
      ・最高連擊 <strong>${
        safeNumber(
          record.maxCombo
        )
      }</strong>`;
  }

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

  const scoreBox =
    document.createElement(
      "div"
    );

  scoreBox.className =
    "score";

  scoreBox.innerHTML =
    `${Math.round(
      safeNumber(
        record.score
      )
    )}
    <div class="score-label">
      分
    </div>`;

  item.append(
    rankBox,
    playerBox,
    scoreBox
  );

  return item;
}


function setLoading(){

  if (loadingMessage){
    loadingMessage.hidden =
      false;

    loadingMessage.textContent =
      "排行榜載入中……";
  }

  if (errorMessage){
    errorMessage.hidden =
      true;
  }

  if (emptyMessage){
    emptyMessage.hidden =
      true;
  }

  if (leaderboardList){
    leaderboardList.innerHTML =
      "";
  }
}


function hideMessages(){

  if (loadingMessage){
    loadingMessage.hidden =
      true;
  }

  if (errorMessage){
    errorMessage.hidden =
      true;
  }

  if (emptyMessage){
    emptyMessage.hidden =
      true;
  }
}


function showEmpty(
  message
){

  if (loadingMessage){
    loadingMessage.hidden =
      true;
  }

  if (errorMessage){
    errorMessage.hidden =
      true;
  }

  if (emptyMessage){
    emptyMessage.hidden =
      false;

    emptyMessage.textContent =
      message;
  }

  if (leaderboardList){
    leaderboardList.innerHTML =
      "";
  }
}


function showLoginRequired(){

  if (userStatus){
    userStatus.textContent =
      "目前尚未登入，請先回到首頁登入。";
  }

  if (loadingMessage){
    loadingMessage.hidden =
      true;
  }

  if (errorMessage){
    errorMessage.hidden =
      false;

    errorMessage.textContent =
      "請先登入 Google 帳號，才能查看排行榜。";
  }

  if (emptyMessage){
    emptyMessage.hidden =
      true;
  }

  if (leaderboardList){
    leaderboardList.innerHTML =
      "";
  }
}


function showError(error){

  if (loadingMessage){
    loadingMessage.hidden =
      true;
  }

  if (emptyMessage){
    emptyMessage.hidden =
      true;
  }

  if (leaderboardList){
    leaderboardList.innerHTML =
      "";
  }

  if (!errorMessage){
    return;
  }

  errorMessage.hidden =
    false;

  if (
    error?.code ===
    "permission-denied"
  ){
    errorMessage.textContent =
      "排行榜讀取權限不足，請確認 Firestore Rules。";
    return;
  }

  if (
    error?.code ===
    "unavailable"
  ){
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


semesterSelect
  ?.addEventListener(
    "change",
    () => {

      selectedSemester =
        semesterSelect.value;

      selectedGame =
        "all";

      renderSemesterGames();

      if (currentUser){
        renderLeaderboard();
      }
    }
  );


onAuthStateChanged(

  auth,

  async user => {

    currentUser =
      user;

    if (!user){

      showLoginRequired();

      return;
    }

    if (userStatus){

      userStatus.textContent =
        `目前登入：${
          user.displayName ||
          user.email ||
          "玩家"
        }`;
    }

    const loaded =
      await loadAllScores();

    if (!loaded){
      return;
    }

    renderLeaderboard();
  },

  error => {

    console.error(
      "Firebase 登入狀態確認失敗：",
      error
    );

    showError(error);
  }
);


try{

  renderSemesterGames();

  console.log(
    "leaderboard.js v8.4 已成功載入"
  );

}catch(error){

  console.error(
    "排行榜初始化失敗：",
    error
  );

  showError(error);
}
