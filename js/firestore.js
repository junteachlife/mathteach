/*
==================================================
數學遊戲樂園：玩家資料／公開暱稱
檔案位置：js/firestore.js

版本：1.3
2026-10-06 暱稱 7 天修改冷卻版
==================================================

users/{uid}
- 私人帳號資料
- 可保留 Google displayName / email / photoURL
- 只有本人需要讀寫

publicProfiles/{uid}
- 排行榜公開資料
- 只存 uid / nickname / nicknameSet / updatedAt
- 不存真實姓名與 Email
==================================================
*/

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  writeBatch
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  db
} from "./firebase-config.js";

const USERS_COLLECTION = "users";
const PUBLIC_PROFILES_COLLECTION = "publicProfiles";

const NICKNAME_MIN_LENGTH = 2;
const NICKNAME_MAX_LENGTH = 12;

// 學生自行修改暱稱的冷卻時間：7 天（168 小時）。
const NICKNAME_CHANGE_COOLDOWN_DAYS = 7;
const NICKNAME_CHANGE_COOLDOWN_MS =
  NICKNAME_CHANGE_COOLDOWN_DAYS *
  24 *
  60 *
  60 *
  1000;

function normalizeNickname(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function getNicknameLength(value) {
  return Array.from(
    normalizeNickname(value)
  ).length;
}

function validateNickname(value) {
  const nickname =
    normalizeNickname(value);

  const length =
    getNicknameLength(nickname);

  if (
    length < NICKNAME_MIN_LENGTH
  ) {
    return {
      valid: false,
      nickname,
      message:
        `暱稱至少需要 ${NICKNAME_MIN_LENGTH} 個字。`
    };
  }

  if (
    length > NICKNAME_MAX_LENGTH
  ) {
    return {
      valid: false,
      nickname,
      message:
        `暱稱最多 ${NICKNAME_MAX_LENGTH} 個字。`
    };
  }

  if (
    /[\u0000-\u001F\u007F]/.test(
      nickname
    )
  ) {
    return {
      valid: false,
      nickname,
      message:
        "暱稱不能包含控制字元。"
    };
  }

  if (
    /[<>]/.test(
      nickname
    )
  ) {
    return {
      valid: false,
      nickname,
      message:
        "暱稱不能包含 < 或 >。"
    };
  }

  return {
    valid: true,
    nickname,
    message: ""
  };
}

function createAnonymousPlayerName(
  uid
) {
  const safeUid =
    String(uid || "")
      .replace(
        /[^a-zA-Z0-9]/g,
        ""
      )
      .toUpperCase();

  const suffix =
    safeUid.slice(0, 4) ||
    "0000";

  return `玩家-${suffix}`;
}

function needsNickname(
  profile
) {
  if (
    !profile ||
    profile.nicknameSet !== true
  ) {
    return true;
  }

  return !validateNickname(
    profile.nickname
  ).valid;
}

function getPublicPlayerName(
  profile,
  uid = ""
) {
  if (
    profile &&
    profile.nicknameSet === true
  ) {
    const result =
      validateNickname(
        profile.nickname
      );

    if (
      result.valid
    ) {
      return result.nickname;
    }
  }

  return createAnonymousPlayerName(
    uid ||
    profile?.uid ||
    ""
  );
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
      Number(value.seconds) * 1000 +
      Math.floor(
        Number(
          value.nanoseconds ||
          0
        ) / 1000000
      )
    );
  }

  if (
    value instanceof Date
  ) {
    return value.getTime();
  }

  const parsed =
    new Date(value).getTime();

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

function formatNicknameAvailableAt(
  milliseconds
) {
  if (
    !milliseconds
  ) {
    return "";
  }

  return new Date(
    milliseconds
  ).toLocaleString(
    "zh-TW",
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }
  );
}

/*
==================================================
學生暱稱修改冷卻判斷
==================================================

規則：
1. 第一次設定：立即允許。
2. 管理員要求重新設定（nicknameSet:false）：立即允許。
3. 舊玩家沒有 nicknameUpdatedAt：允許修改一次，之後開始計時。
4. 一般自行修改：上次設定滿 7 天後才能再次修改。
==================================================
*/
function getNicknameChangeState(
  profile,
  nowMilliseconds = Date.now()
) {
  if (
    !profile ||
    profile.nicknameSet !== true
  ) {
    return {
      allowed: true,
      reason: "first-or-reset",
      nextChangeAt: 0,
      remainingMilliseconds: 0,
      remainingDays: 0,
      message: ""
    };
  }

  const lastChangedAt =
    timestampToMilliseconds(
      profile.nicknameUpdatedAt
    );

  if (
    !lastChangedAt
  ) {
    return {
      allowed: true,
      reason: "legacy-no-timestamp",
      nextChangeAt: 0,
      remainingMilliseconds: 0,
      remainingDays: 0,
      message: ""
    };
  }

  const nextChangeAt =
    lastChangedAt +
    NICKNAME_CHANGE_COOLDOWN_MS;

  const remainingMilliseconds =
    Math.max(
      0,
      nextChangeAt -
      Number(nowMilliseconds)
    );

  if (
    remainingMilliseconds <= 0
  ) {
    return {
      allowed: true,
      reason: "cooldown-finished",
      nextChangeAt,
      remainingMilliseconds: 0,
      remainingDays: 0,
      message: ""
    };
  }

  const remainingDays =
    Math.ceil(
      remainingMilliseconds /
      (24 * 60 * 60 * 1000)
    );

  const availableText =
    formatNicknameAvailableAt(
      nextChangeAt
    );

  return {
    allowed: false,
    reason: "cooldown",
    nextChangeAt,
    remainingMilliseconds,
    remainingDays,
    message:
      `暱稱設定後需滿 ${NICKNAME_CHANGE_COOLDOWN_DAYS} 天才能再次自行修改。` +
      `下次可修改時間：${availableText}。`
  };
}

async function getPlayerProfile(
  uid
) {
  if (
    !uid
  ) {
    return null;
  }

  const reference =
    doc(
      db,
      USERS_COLLECTION,
      uid
    );

  const snapshot =
    await getDoc(
      reference
    );

  if (
    !snapshot.exists()
  ) {
    return null;
  }

  return {
    id:
      snapshot.id,
    ...snapshot.data()
  };
}

async function getPublicPlayerProfile(
  uid
) {
  if (
    !uid
  ) {
    return null;
  }

  const reference =
    doc(
      db,
      PUBLIC_PROFILES_COLLECTION,
      uid
    );

  const snapshot =
    await getDoc(
      reference
    );

  if (
    !snapshot.exists()
  ) {
    return null;
  }

  return {
    id:
      snapshot.id,
    ...snapshot.data()
  };
}

async function createOrUpdatePlayer(
  user
) {
  if (
    !user
  ) {
    throw new Error(
      "沒有登入中的使用者"
    );
  }

  const playerRef =
    doc(
      db,
      USERS_COLLECTION,
      user.uid
    );

  const playerSnapshot =
    await getDoc(
      playerRef
    );

  if (
    !playerSnapshot.exists()
  ) {
    await setDoc(
      playerRef,
      {
        uid:
          user.uid,

        nickname:
          "",

        nicknameSet:
          false,

        nicknameResetReason:
          "",

        nicknameModerationStatus:
          "active",

        displayName:
          user.displayName ||
          "",

        email:
          user.email ||
          "",

        photoURL:
          user.photoURL ||
          "",

        level:
          1,

        exp:
          0,

        totalGames:
          0,

        totalCorrect:
          0,

        totalWrong:
          0,

        createdAt:
          serverTimestamp(),

        lastLoginAt:
          serverTimestamp()
      }
    );

    console.log(
      "玩家資料建立成功"
    );
  } else {
    const oldData =
      playerSnapshot.data() ||
      {};

    const updateData = {
      displayName:
        user.displayName ||
        "",

      email:
        user.email ||
        "",

      photoURL:
        user.photoURL ||
        "",

      lastLoginAt:
        serverTimestamp()
    };

    if (
      typeof oldData.nicknameSet !==
      "boolean"
    ) {
      updateData.nicknameSet =
        false;
    }

    await setDoc(
      playerRef,
      updateData,
      {
        merge:
          true
      }
    );

    console.log(
      "玩家資料更新成功"
    );
  }

  const profile =
    await getPlayerProfile(
      user.uid
    );

  const publicRef =
    doc(
      db,
      PUBLIC_PROFILES_COLLECTION,
      user.uid
    );

  const hasNickname =
    Boolean(
      profile &&
      profile.nicknameSet === true &&
      validateNickname(
        profile.nickname
      ).valid
    );

  await setDoc(
    publicRef,
    {
      uid:
        user.uid,

      nickname:
        hasNickname
          ? normalizeNickname(
              profile.nickname
            )
          : "",

      nicknameSet:
        hasNickname,

      updatedAt:
        serverTimestamp()
    },
    {
      merge:
        true
    }
  );

  return profile;
}

async function setPlayerNickname(
  user,
  value
) {
  if (
    !user
  ) {
    throw new Error(
      "請先登入後再設定暱稱。"
    );
  }

  const result =
    validateNickname(
      value
    );

  if (
    !result.valid
  ) {
    const error =
      new Error(
        result.message
      );

    error.code =
      "invalid-nickname";

    throw error;
  }

  const latestProfile =
    await getPlayerProfile(
      user.uid
    );

  const changeState =
    getNicknameChangeState(
      latestProfile
    );

  if (
    !changeState.allowed
  ) {
    const error =
      new Error(
        changeState.message
      );

    error.code =
      "nickname-cooldown";

    error.nextChangeAt =
      changeState.nextChangeAt;

    throw error;
  }

  const nickname =
    result.nickname;

  const privateRef =
    doc(
      db,
      USERS_COLLECTION,
      user.uid
    );

  const publicRef =
    doc(
      db,
      PUBLIC_PROFILES_COLLECTION,
      user.uid
    );

  const batch =
    writeBatch(db);

  batch.set(
    privateRef,
    {
      uid:
        user.uid,

      nickname,

      nicknameSet:
        true,

      nicknameUpdatedAt:
        serverTimestamp(),

      nicknameResetReason:
        "",

      nicknameModerationStatus:
        "active",

      displayName:
        user.displayName ||
        "",

      email:
        user.email ||
        "",

      photoURL:
        user.photoURL ||
        ""
    },
    {
      merge:
        true
    }
  );

  batch.set(
    publicRef,
    {
      uid:
        user.uid,

      nickname,

      nicknameSet:
        true,

      updatedAt:
        serverTimestamp()
    },
    {
      merge:
        true
    }
  );

  await batch.commit();

  const savedProfile =
    await getPlayerProfile(
      user.uid
    );

  return savedProfile || {
    uid:
      user.uid,
    nickname,
    nicknameSet:
      true
  };
}

console.log(
  "firestore.js v1.3 暱稱 7 天修改冷卻版已成功載入"
);

export {
  NICKNAME_MIN_LENGTH,
  NICKNAME_MAX_LENGTH,
  NICKNAME_CHANGE_COOLDOWN_DAYS,
  NICKNAME_CHANGE_COOLDOWN_MS,
  normalizeNickname,
  validateNickname,
  createAnonymousPlayerName,
  needsNickname,
  getPublicPlayerName,
  getNicknameChangeState,
  formatNicknameAvailableAt,
  getPlayerProfile,
  getPublicPlayerProfile,
  createOrUpdatePlayer,
  setPlayerNickname
};
