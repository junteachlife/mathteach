/*
 * 生活有解．心中有數｜首頁公告資料
 * 位置：mathteach/js/announcements.js
 * 更新：2026-11-01
 * 此檔只管理公告與最新消息，不影響遊戲、Firebase 或排行。
 */
"use strict";

export const ANNOUNCEMENTS = [
  {
    id: "grade7-2-3-new-20261101",
    date: "2026-11-01",
    type: "new-game",
    typeName: "新遊戲",
    icon: "🧮",
    title: "七上 2-3 分數的四則運算新版登場",
    content: "新版 2-3 整合等值分數、正負分數加減乘除、倒數、括號及分配律；題目採動態數值設計，並導入共用分數輸入介面。舊版遊戲已自首頁下架，歷史成績仍保留。",
    important: true
  },
  {
    id: "grade7-2-2-update-20261101",
    date: "2026-11-01",
    type: "game-update",
    typeName: "遊戲優化",
    icon: "🔢",
    title: "七上 2-2 最大公因數與最小公倍數題庫更新",
    content: "新增更多隨機數值與教材題型；計算題詳解以國中短除法為主，並調整題目對齊、提示文字及返回按鈕。"
  },
  {
    id: "grade8-2-3-update-20261031",
    date: "2026-10-31",
    type: "game-update",
    typeName: "遊戲優化",
    icon: "📐",
    title: "八上 2-3 畢氏定理題目與座標圖優化",
    content: "修正答案提交判斷、減少模式二題目重複，並將座標平面的輔助虛線調整為清楚的直角三角形。"
  },
  {
    id: "grade7-2-1-update-20261031",
    date: "2026-10-31",
    type: "game-update",
    typeName: "遊戲優化",
    icon: "🧩",
    title: "七上 2-1 質因數分解介面統一",
    content: "統一遊戲操作列、返回按鈕及計算紙位置，標準分解式改為共用次方答案輸入，運算符號可用下拉選單選取。"
  },
  {
    id: "grade8-2-2-update-20261029",
    date: "2026-10-29",
    type: "game-update",
    typeName: "遊戲優化",
    icon: "√",
    title: "八上 2-2 根式運算顯示與操作優化",
    content: "複合分子除法題改成容易閱讀的橫式，並統一重新測驗、重選模式按鈕大小。"
  },
  {
    id: "grade8-4-3-update-20261030",
    date: "2026-10-30",
    type: "game-update",
    typeName: "遊戲優化",
    icon: "✏️",
    title: "八上 4-3 應用問題調整為每模式五題",
    content: "六個模式每次各五題，同步更新進度及計分，保留原有詳細解析與錯題回顧。"
  },
  {
    id: "site-launch-20260824",
    date: "2026-08-24",
    type: "system",
    typeName: "網站公告",
    icon: "📌",
    title: "生活有解．心中有數｜數學遊戲平台",
    content: "透過分模式練習、錯題回顧、排行榜與我的成績，逐步累積數學學習成果。"
  }
];

function newestFirst(items) {
  return [...items].sort((a, b) => b.date.localeCompare(a.date));
}

/** 首頁上方的大公告。 */
export function getImportantAnnouncement() {
  return newestFirst(ANNOUNCEMENTS.filter(item => item.important))[0] || null;
}

/** 首頁最新消息區；不重複顯示大公告，避免占掉兩格。 */
export function getLatestAnnouncements(limit = 4) {
  const count = Number.isFinite(Number(limit)) ? Math.max(0, Math.trunc(Number(limit))) : 4;
  const important = getImportantAnnouncement();
  return newestFirst(ANNOUNCEMENTS.filter(item => item.id !== important?.id)).slice(0, count);
}
