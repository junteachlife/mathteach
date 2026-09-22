/*
==================================================
生活有解．心中有數｜我的成績
檔案位置：js/my-scores.js

版本：3.1
九上正式遊戲同步版
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


function getGameModeCount(
  gameId
){

  const config =
    getGameConfig(
      gameId
    );

  if (
    !config ||
    !config.modes ||
    typeof config.modes !==
      "object"
  ){
    return 0;
  }

  return Object.keys(
    config.modes
  ).length;
}


function isMultiModeGame(
  gameId
){

  return (
    getGameModeCount(
      gameId
    ) > 1
  );
}


function getHistoryModeText(
  gameId,
  mode
){

  if (
    !isMultiModeGame(
      gameId
    )
  ){
    return "";
  }

  return (
    getModeName(
      gameId,
      mode
    ) || ""
  );
}


function toSafeNumber(
  value
){

  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}


function getPlayTime(
  record
){

  const value =
    Number(
      record?.playTime
    );

  if (
    Number.isFinite(value) &&
    value >= 0
  ){
    return value;
  }

  return Number.POSITIVE_INFINITY;
}


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
    safeSeconds < 60
  ){
    return `${safeSeconds} 秒`;
  }

  const minutes =
    Math.floor(
      safeSeconds / 60
    );

  const remain =
    safeSeconds % 60;

  if (remain === 0){
    return `${minutes} 分`;
  }

  return (
    `${minutes} 分 ${remain} 秒`
  );
}


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

    return (
      new Date(
        timestamp
      ).getTime() || 0
    );

  }catch(error){

    console.warn(
      "時間轉換失敗：",
      error
    );

    return 0;
  }
}


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
        new Date(timestamp);
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
    ).format(date);

  }catch(error){

    console.warn(
      "日期格式轉換失敗：",
      error
    );

    return "時間格式錯誤";
  }
}


onAuthStateChanged(

  auth,

  async user => {

    if (!user){

      showLoginRequiredMessage();

      return;
    }

    renderUser(user);

    await loadMyScores(
      user.uid
    );
  },

  error => {

    console.error(
      "確認登入狀態失敗：",
      error
    );

    showError(error);
  }
);


function renderUser(
  user
){

  if (!userStatus){
    return;
  }

  userStatus.innerHTML =
    "";

  if (user.photoURL){

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
      snapshot.docs
        .map(
          doc => ({
            id:doc.id,
            ...doc.data()
          })
        );

    records.sort(
      (a,b) =>
        getTimestampMilliseconds(
          b.createdAt
        ) -
        getTimestampMilliseconds(
          a.createdAt
        )
    );

    renderMyScores(
      records
    );

  }catch(error){

    console.error(
      "讀取個人成績失敗：",
      error
    );

    showError(error);
  }
}


function renderMyScores(
  records
){

  if (loadingMessage){
    loadingMessage.hidden =
      true;
  }

  if (errorMessage){
    errorMessage.hidden =
      true;
  }

  if (!records.length){

    if (emptyMessage){
      emptyMessage.hidden =
        false;
    }

    if (statsSection){
      statsSection.style.display =
        "none";
    }

    return;
  }

  if (emptyMessage){
    emptyMessage.hidden =
      true;
  }

  if (statsSection){
    statsSection.style.display =
      "block";
  }

  const statistics =
    calculateStatistics(
      records
    );

  if (totalGamesElement){
    totalGamesElement.textContent =
      statistics.totalGames;
  }

  if (highestScoreElement){
    highestScoreElement.textContent =
      statistics.highestScore;
  }

  if (averageScoreElement){
    averageScoreElement.textContent =
      statistics.averageScore;
  }

  if (highestComboElement){
    highestComboElement.textContent =
      statistics.highestCombo;
  }

  if (totalCorrectElement){
    totalCorrectElement.textContent =
      statistics.totalCorrect;
  }

  if (totalWrongElement){
    totalWrongElement.textContent =
      statistics.totalWrong;
  }

  renderGameSummary(
    records
  );

  renderHistory(
    records
  );
}


function calculateStatistics(
  records
){

  const totalGames =
    records.length;

  const totalScore =
    records.reduce(
      (sum,record) =>
        sum +
        toSafeNumber(
          record.score
        ),
      0
    );

  const highestScore =
    records.reduce(
      (highest,record) =>
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
      (highest,record) =>
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
      (sum,record) =>
        sum +
        toSafeNumber(
          record.correctCount
        ),
      0
    );

  const totalWrong =
    records.reduce(
      (sum,record) =>
        sum +
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
    value;

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


function renderGameSummary(
  records
){

  if (!gameSummaryList){
    return;
  }

  gameSummaryList.innerHTML =
    "";

  const groupedGames =
    {};

  records.forEach(
    record => {

      const gameKey =
        record.game ||
        "unknown";

      if (!groupedGames[gameKey]){
        groupedGames[gameKey] =
          [];
      }

      groupedGames[gameKey]
        .push(record);
    }
  );

  const gameOrder =
    getGameOrder();

  const knownGames =
    gameOrder.filter(
      game =>
        Boolean(
          groupedGames[game]
        )
    );

  const unknownGames =
    Object.keys(
      groupedGames
    ).filter(
      game =>
        !gameOrder.includes(
          game
        )
    );

  const orderedGames = [
    ...knownGames,
    ...unknownGames
  ];

  orderedGames.forEach(
    gameKey => {

      const gameRecords =
        groupedGames[
          gameKey
        ];

      const total =
        gameRecords.length;

      const highest =
        gameRecords.reduce(
          (best,record) =>
            Math.max(
              best,
              toSafeNumber(
                record.score
              )
            ),
          0
        );

      const totalScore =
        gameRecords.reduce(
          (sum,record) =>
            sum +
            toSafeNumber(
              record.score
            ),
          0
        );

      const average =
        total
          ? Math.round(
              totalScore /
              total
            )
          : 0;

      const card =
        document.createElement(
          "article"
        );

      card.className =
        "game-card";

      const title =
        document.createElement(
          "div"
        );

      title.className =
        "game-title";

      title.textContent =
        getGameName(
          gameKey
        );

      card.append(
        title,
        createGameStatistic(
          total,
          "遊玩次數"
        ),
        createGameStatistic(
          highest,
          "最高分"
        ),
        createGameStatistic(
          average,
          "平均分"
        )
      );

      gameSummaryList
        .appendChild(card);
    }
  );
}


function renderHistory(
  records
){

  if (!historyList){
    return;
  }

  historyList.innerHTML =
    "";

  records
    .slice(0,10)
    .forEach(
      record => {

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

        const gameName =
          document.createElement(
            "div"
          );

        gameName.className =
          "history-game";

        gameName.textContent =
          getGameName(
            record.game
          );

        information.appendChild(
          gameName
        );

        const details =
          document.createElement(
            "div"
          );

        details.className =
          "history-detail";

        const modeText =
          getHistoryModeText(
            record.game,
            record.mode
          );

        details.textContent =
          `${formatDate(
            record.createdAt
          )}${
            modeText
              ? `｜${modeText}`
              : ""
          }`;

        information.appendChild(
          details
        );

        if (
          getRankingType(
            record.game
          ) === "timed"
        ){

          const performance =
            document.createElement(
              "div"
            );

          performance.className =
            "history-detail";

          performance.textContent =
            `✅ 答對 ${
              toSafeNumber(
                record.correctCount
              )
            } 題` +
            `｜❌ 答錯 ${
              toSafeNumber(
                record.wrongCount
              )
            } 題` +
            `｜🔥 最高連擊 ${
              toSafeNumber(
                record.maxCombo
              )
            }`;

          information.appendChild(
            performance
          );

        }else{

          const playTime =
            getPlayTime(
              record
            );

          const performance =
            document.createElement(
              "div"
            );

          performance.className =
            "history-detail";

          performance.textContent =
            Number.isFinite(
              playTime
            )
              ? `⏱ 完成時間：${
                  formatPlayTime(
                    playTime
                  )
                }`
              : "⏱ 完成時間：未記錄";

          information.appendChild(
            performance
          );

          const answers =
            document.createElement(
              "div"
            );

          answers.className =
            "history-detail";

          answers.textContent =
            `✅ 答對 ${
              toSafeNumber(
                record.correctCount
              )
            } 題` +
            `｜❌ 答錯 ${
              toSafeNumber(
                record.wrongCount
              )
            } 題`;

          information.appendChild(
            answers
          );
        }

        const score =
          document.createElement(
            "div"
          );

        score.className =
          "history-score";

        score.innerHTML =
          `<div>${
            toSafeNumber(
              record.score
            )
          }</div>
          <div class="history-score-label">
            分
          </div>`;

        item.append(
          information,
          score
        );

        historyList.appendChild(
          item
        );
      }
    );
}


function setLoadingState(){

  if (loadingMessage){
    loadingMessage.hidden =
      false;
  }

  if (errorMessage){
    errorMessage.hidden =
      true;
  }

  if (emptyMessage){
    emptyMessage.hidden =
      true;
  }

  if (statsSection){
    statsSection.style.display =
      "none";
  }
}


function showLoginRequiredMessage(){

  if (userStatus){
    userStatus.textContent =
      "目前尚未登入，請先回到首頁登入 Google 帳號。";
  }

  if (loadingMessage){
    loadingMessage.hidden =
      true;
  }

  if (emptyMessage){
    emptyMessage.hidden =
      true;
  }

  if (statsSection){
    statsSection.style.display =
      "none";
  }

  if (errorMessage){
    errorMessage.hidden =
      false;

    errorMessage.textContent =
      "請先登入 Google 帳號，才能查看自己的成績。";
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

  if (statsSection){
    statsSection.style.display =
      "none";
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
  "my-scores.js v3.1 已成功載入"
);
