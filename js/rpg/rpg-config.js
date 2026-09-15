/*
==================================================
學習型 RPG 成長系統
RPG 全域設定
Version 1.0
==================================================

重要原則：

1. RPG 系統目前採 TEST 測試環境。
2. 不直接接入正式數學遊戲。
3. 不寫入正式 RPG Collection。
4. 所有正式遊戲在我們主動整合之前，
   都不會受到這個檔案影響。
5. 未來若要正式上架，
   必須另外明確切換 environment 與 enabled。
==================================================
*/

"use strict";


/*
==================================================
環境名稱
==================================================
*/

const RPG_ENVIRONMENTS = Object.freeze({

  TEST:
    "test",

  PRODUCTION:
    "production"

});


/*
==================================================
RPG 主設定
==================================================
*/

const RPG_CONFIG = Object.freeze({

  /*
  ----------------------------------------------
  系統版本
  ----------------------------------------------
  */

  version:
    "1.0.0",


  /*
  ----------------------------------------------
  RPG 是否正式啟用
  ----------------------------------------------

  false：
  RPG 系統不對正式玩家生效。

  測試期間先維持 false。

  未來正式上架時，
  我們會另外設計更安全的 rollout 開關，
  不會只是單純改成 true。
  ----------------------------------------------
  */

  enabled:
    false,


  /*
  ----------------------------------------------
  現在使用哪個環境
  ----------------------------------------------
  */

  environment:
    RPG_ENVIRONMENTS.TEST,


  /*
  ----------------------------------------------
  測試模式
  ----------------------------------------------

  true：
  代表目前所有 RPG 操作都屬於測試用途。
  ----------------------------------------------
  */

  testMode:
    true,


  /*
  ----------------------------------------------
  正式玩家是否看得到 RPG
  ----------------------------------------------
  */

  visibleToStudents:
    false,


  /*
  ----------------------------------------------
  是否允許寫入正式 RPG 資料
  ----------------------------------------------

  測試期間一定維持 false。
  ----------------------------------------------
  */

  allowProductionWrites:
    false,


  /*
  ----------------------------------------------
  RPG rollout 狀態

  disabled
  admin-only
  selected-users
  everyone
  ----------------------------------------------
  */

  rolloutMode:
    "disabled",


  /*
  ----------------------------------------------
  XP 規則版本
  ----------------------------------------------

  未來 XP 計算方式若更改，
  不直接覆蓋舊規則。

  例如：

  xpRuleVersion = 1
  xpRuleVersion = 2

  可以避免舊玩家與新玩家
  因公式改變造成資料混亂。
  ----------------------------------------------
  */

  xpRuleVersion:
    1,


  /*
  ----------------------------------------------
  熟練度規則版本
  ----------------------------------------------
  */

  masteryRuleVersion:
    1,


  /*
  ----------------------------------------------
  是否開啟除錯訊息
  ----------------------------------------------

  TEST 階段方便我們檢查。
  ----------------------------------------------
  */

  debug:
    true

});


/*
==================================================
Collection 名稱
==================================================

測試資料與正式資料完全分離。

現在只會使用 test 開頭的 Collection。

等未來正式上架，
才會使用 production 那一組。
==================================================
*/

const RPG_COLLECTIONS = Object.freeze({

  test: Object.freeze({

    playerProgress:
      "rpgTestPlayerProgress",

    playerGameStats:
      "rpgTestPlayerGameStats",

    playerModeStats:
      "rpgTestPlayerModeStats",

    xpTransactions:
      "rpgTestXpTransactions",

    currencyTransactions:
      "rpgTestCurrencyTransactions",

    achievements:
      "rpgTestAchievements",

    dailyMissions:
      "rpgTestDailyMissions",

    weeklyMissions:
      "rpgTestWeeklyMissions",

    monthlyStats:
      "rpgTestMonthlyStats",

    attempts:
      "rpgTestAttempts",

    adminAuditLogs:
      "rpgTestAdminAuditLogs"

  }),


  production: Object.freeze({

    playerProgress:
      "playerProgress",

    playerGameStats:
      "playerGameStats",

    playerModeStats:
      "playerModeStats",

    xpTransactions:
      "xpTransactions",

    currencyTransactions:
      "currencyTransactions",

    achievements:
      "achievements",

    dailyMissions:
      "dailyMissions",

    weeklyMissions:
      "weeklyMissions",

    monthlyStats:
      "monthlyStats",

    attempts:
      "rpgAttempts",

    adminAuditLogs:
      "adminAuditLogs"

  })

});


/*
==================================================
取得目前環境 Collection
==================================================
*/

function getRpgCollections() {

  if (
    RPG_CONFIG.environment ===
    RPG_ENVIRONMENTS.PRODUCTION
  ) {

    /*
    正式環境還要再檢查一次，
    避免未來誤切環境。
    */

    if (
      !RPG_CONFIG.allowProductionWrites
    ) {

      console.warn(
        "[RPG] 已選擇 production，" +
        "但 allowProductionWrites=false。"
      );
    }


    return RPG_COLLECTIONS.production;
  }


  return RPG_COLLECTIONS.test;
}


/*
==================================================
是否允許 RPG 執行
==================================================
*/

function isRpgEnabled() {

  return (
    RPG_CONFIG.enabled ===
    true
  );
}


/*
==================================================
是否為測試環境
==================================================
*/

function isRpgTestEnvironment() {

  return (
    RPG_CONFIG.environment ===
    RPG_ENVIRONMENTS.TEST
  );
}


/*
==================================================
是否允許正式資料寫入
==================================================
*/

function canWriteProductionRpgData() {

  return (

    RPG_CONFIG.environment ===
      RPG_ENVIRONMENTS.PRODUCTION &&

    RPG_CONFIG.enabled ===
      true &&

    RPG_CONFIG.allowProductionWrites ===
      true

  );
}


/*
==================================================
Debug
==================================================
*/

function rpgDebug(
  ...messages
) {

  if (
    !RPG_CONFIG.debug
  ) {

    return;
  }


  console.log(
    "[RPG]",
    ...messages
  );
}


/*
==================================================
初始化檢查
==================================================
*/

function validateRpgConfig() {

  /*
  正式環境卻仍 testMode=true，
  視為危險設定。
  */

  if (

    RPG_CONFIG.environment ===
      RPG_ENVIRONMENTS.PRODUCTION &&

    RPG_CONFIG.testMode ===
      true

  ) {

    console.warn(
      "[RPG] 警告：" +
      "production 環境不應維持 testMode=true。"
    );
  }


  /*
  正式環境寫入雙重保護。
  */

  if (

    RPG_CONFIG.environment ===
      RPG_ENVIRONMENTS.PRODUCTION &&

    RPG_CONFIG.allowProductionWrites !==
      true

  ) {

    console.warn(
      "[RPG] 正式 RPG 寫入目前被鎖定。"
    );
  }


  rpgDebug(
    "Config loaded",
    {
      version:
        RPG_CONFIG.version,

      environment:
        RPG_CONFIG.environment,

      enabled:
        RPG_CONFIG.enabled,

      rolloutMode:
        RPG_CONFIG.rolloutMode,

      collections:
        getRpgCollections()
    }
  );
}


/*
==================================================
啟動檢查
==================================================
*/

validateRpgConfig();


/*
==================================================
Export
==================================================
*/

export {

  RPG_ENVIRONMENTS,

  RPG_CONFIG,

  RPG_COLLECTIONS,

  getRpgCollections,

  isRpgEnabled,

  isRpgTestEnvironment,

  canWriteProductionRpgData,

  rpgDebug

};
